create table if not exists public.tahsilat_meta (
  id integer primary key check (id = 1),
  revision bigint not null default 0,
  props jsonb not null default '{}'::jsonb,
  sizes jsonb not null default '{}'::jsonb,
  initialized boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.tahsilat_rows (
  sheet text not null,
  row_number integer not null check (row_number > 0),
  cells jsonb not null,
  primary key (sheet, row_number)
);

create table if not exists public.tahsilat_cache (
  key text primary key,
  value text not null,
  expires_at timestamptz not null
);

create table if not exists public.tahsilat_requests (
  id uuid primary key,
  fingerprint text not null,
  owner text not null,
  response jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.tahsilat_backups (
  id bigint generated always as identity primary key,
  request_id uuid not null,
  revision bigint not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.tahsilat_secrets (
  name text primary key,
  hash text not null
);

create table if not exists public.tahsilat_import_jobs (
  id uuid primary key,
  manifest jsonb not null,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.tahsilat_import_rows (
  job uuid not null references public.tahsilat_import_jobs(id) on delete cascade,
  sheet text not null,
  row_number integer not null check (row_number > 0),
  cells jsonb not null,
  primary key (job, sheet, row_number)
);

insert into public.tahsilat_meta(id) values (1) on conflict (id) do nothing;

alter table public.tahsilat_meta enable row level security;
alter table public.tahsilat_rows enable row level security;
alter table public.tahsilat_cache enable row level security;
alter table public.tahsilat_requests enable row level security;
alter table public.tahsilat_backups enable row level security;
alter table public.tahsilat_secrets enable row level security;
alter table public.tahsilat_import_jobs enable row level security;
alter table public.tahsilat_import_rows enable row level security;

revoke all on public.tahsilat_meta, public.tahsilat_rows, public.tahsilat_cache,
  public.tahsilat_requests, public.tahsilat_backups, public.tahsilat_secrets,
  public.tahsilat_import_jobs, public.tahsilat_import_rows from anon, authenticated;
grant select, insert, update, delete on public.tahsilat_meta, public.tahsilat_rows,
  public.tahsilat_cache, public.tahsilat_requests, public.tahsilat_backups,
  public.tahsilat_secrets, public.tahsilat_import_jobs, public.tahsilat_import_rows to service_role;
grant usage, select on sequence public.tahsilat_backups_id_seq to service_role;

create or replace function public.tahsilat_load(p_keys text[], p_sheets text[] default null)
returns jsonb
language sql stable
set search_path = ''
as $$
  select jsonb_build_object(
    'revision', m.revision,
    'props', m.props,
    'sizes', m.sizes,
    'initialized', m.initialized,
    'sheets', coalesce((
      select jsonb_object_agg(sheet, rows)
      from (
        select sheet, jsonb_agg(cells order by row_number) rows
        from public.tahsilat_rows
        where p_sheets is null or sheet = any(p_sheets)
        group by sheet
      ) s
    ), '{}'::jsonb),
    'cache', coalesce((
      select jsonb_object_agg(key, jsonb_build_object('value', value, 'expires_at', expires_at))
      from public.tahsilat_cache
      where key = any(p_keys) and expires_at > now()
    ), '{}'::jsonb)
  )
  from public.tahsilat_meta m
  where m.id = 1;
$$;

create or replace function public.tahsilat_commit(
  p_revision bigint,
  p_patch jsonb,
  p_id uuid,
  p_fingerprint text,
  p_owner text,
  p_response jsonb,
  p_method text
)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  m public.tahsilat_meta;
  previous public.tahsilat_requests;
  entry jsonb;
  item record;
  business boolean;
  new_sizes jsonb;
begin
  select * into m from public.tahsilat_meta where id = 1 for update;
  select * into previous from public.tahsilat_requests where id = p_id;
  if found then
    if previous.owner <> p_owner or previous.fingerprint <> p_fingerprint then
      raise exception 'REQUEST_CONFLICT';
    end if;
    return jsonb_build_object('committed', true, 'response', previous.response, 'duplicate', true);
  end if;
  if m.revision <> p_revision then return jsonb_build_object('committed', false); end if;
  if not m.initialized then raise exception 'NOT_READY'; end if;

  new_sizes := m.sizes;
  for entry in select value from jsonb_array_elements(coalesce(p_patch->'rows', '[]'::jsonb)) loop
    insert into public.tahsilat_rows(sheet, row_number, cells)
    values (entry->>'sheet', (entry->>'row_number')::integer, entry->'cells')
    on conflict(sheet, row_number) do update set cells = excluded.cells;
    new_sizes := jsonb_set(
      new_sizes,
      array[entry->>'sheet'],
      to_jsonb(greatest(coalesce((new_sizes->>(entry->>'sheet'))::integer, 0), (entry->>'row_number')::integer))
    );
  end loop;

  for item in select key, value from jsonb_each(coalesce(p_patch->'truncate', '{}'::jsonb)) loop
    delete from public.tahsilat_rows where sheet = item.key and row_number > (item.value::text)::integer;
    new_sizes := jsonb_set(new_sizes, array[item.key], item.value);
  end loop;

  for item in select * from jsonb_to_recordset(coalesce(p_patch->'cache', '[]'::jsonb))
    as c(key text, value text, expires_at timestamptz)
  loop
    if item.value is null then
      delete from public.tahsilat_cache where key = item.key;
    else
      insert into public.tahsilat_cache(key, value, expires_at)
      values(item.key, item.value, item.expires_at)
      on conflict(key) do update set value = excluded.value, expires_at = excluded.expires_at;
    end if;
  end loop;

  business := jsonb_array_length(coalesce(p_patch->'rows', '[]'::jsonb)) > 0
    or coalesce(p_patch->'truncate', '{}'::jsonb) <> '{}'::jsonb
    or coalesce(p_patch->'props', 'null'::jsonb) <> 'null'::jsonb;

  update public.tahsilat_meta
  set revision = revision + 1,
      props = case when coalesce(p_patch->'props', 'null'::jsonb) = 'null'::jsonb then props else p_patch->'props' end,
      sizes = new_sizes,
      updated_at = now()
  where id = 1;

  if business then
    insert into public.tahsilat_backups(request_id, revision, payload)
    values (p_id, m.revision + 1, jsonb_build_object(
      'version', 1, 'revision', m.revision + 1, 'method', p_method,
      'rows', coalesce(p_patch->'rows', '[]'::jsonb),
      'truncate', coalesce(p_patch->'truncate', '{}'::jsonb),
      'props', coalesce(p_patch->'props', 'null'::jsonb)
    ));
  end if;

  insert into public.tahsilat_requests(id, fingerprint, owner, response)
  values (p_id, p_fingerprint, p_owner, p_response);
  delete from public.tahsilat_requests where created_at < now() - interval '7 days';
  delete from public.tahsilat_cache where expires_at < now();
  return jsonb_build_object('committed', true, 'response', p_response);
end;
$$;

create or replace function public.tahsilat_import_finish(p_job uuid)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  m public.tahsilat_meta;
  import_job public.tahsilat_import_jobs;
  item record;
  actual integer;
begin
  select * into m from public.tahsilat_meta where id = 1 for update;
  if m.initialized then raise exception 'ALREADY_IMPORTED'; end if;
  select * into import_job from public.tahsilat_import_jobs where id = p_job;
  if not found then raise exception 'JOB_MISSING'; end if;
  for item in select key, value from jsonb_each(import_job.manifest->'sizes') loop
    select count(*) into actual from public.tahsilat_import_rows
    where job = p_job and sheet = item.key;
    if actual <> (item.value::text)::integer then raise exception 'COUNT_MISMATCH %', item.key; end if;
  end loop;
  if coalesce(import_job.manifest->'props'->>'TAHSILAT_DB_ID', '') = '' then
    raise exception 'CONFIGURATION_MISSING';
  end if;
  insert into public.tahsilat_rows(sheet, row_number, cells)
  select sheet, row_number, cells from public.tahsilat_import_rows where job = p_job;
  update public.tahsilat_meta
  set initialized = true,
      props = import_job.manifest->'props',
      sizes = import_job.manifest->'sizes',
      revision = 1,
      updated_at = now()
  where id = 1;
  update public.tahsilat_import_jobs set completed_at = now() where id = p_job;
  delete from public.tahsilat_import_rows where job = p_job;
  delete from public.tahsilat_secrets where name = 'import';
  return jsonb_build_object('ready', true, 'rows', (select count(*) from public.tahsilat_rows), 'revision', 1);
end;
$$;

revoke all on function public.tahsilat_load(text[], text[]) from public, anon, authenticated;
revoke all on function public.tahsilat_commit(bigint, jsonb, uuid, text, text, jsonb, text) from public, anon, authenticated;
revoke all on function public.tahsilat_import_finish(uuid) from public, anon, authenticated;
grant execute on function public.tahsilat_load(text[], text[]) to service_role;
grant execute on function public.tahsilat_commit(bigint, jsonb, uuid, text, text, jsonb, text) to service_role;
grant execute on function public.tahsilat_import_finish(uuid) to service_role;
