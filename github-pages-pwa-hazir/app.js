const APP_URL='https://script.google.com/macros/s/AKfycbzODsdn99mhtCfgIuWqnwpqHqFYHv3sP0W1XlZ7JCnOgrkvT8by43Tjz1UDxTA4G9En/exec';
const VALID_VIEWS=['dashboard','pledges','collections','references','approvals','cash','students','accounting','debts','staff','teacher','users'];
const requestedView=new URLSearchParams(location.search).get('view');
const initialView=VALID_VIEWS.includes(requestedView)?requestedView:'dashboard';
const FRAME_URL=`${APP_URL}?v=45#${initialView}`;
const frame=document.querySelector('#appFrame');
const loadingView=document.querySelector('#loadingView');
const offlineView=document.querySelector('#offlineView');
const connectionStatus=document.querySelector('#connectionStatus');
const installButton=document.querySelector('#installButton');
let installPrompt=null;
let sharedSessionToken='';
const waitingSessionFrames=[];
const sessionChannel='BroadcastChannel' in window?new BroadcastChannel('tahsilat-session-v1'):null;
frame.src=FRAME_URL;

function trustedAppOrigin(origin){return origin==='https://script.google.com'||/^https:\/\/[a-z0-9-]+-script\.googleusercontent\.com$/i.test(origin)}
function validSessionToken(token){return typeof token==='string'&&token.length>=12&&token.length<=500}
function sendSessionToken(target,origin){if(sharedSessionToken&&target)target.postMessage({type:'TAHSILAT_SESSION_TOKEN',token:sharedSessionToken},origin)}
function flushWaitingFrames(){while(waitingSessionFrames.length){const item=waitingSessionFrames.shift();sendSessionToken(item.source,item.origin)}}
window.addEventListener('message',event=>{
  const data=event.data||{};
  if(!trustedAppOrigin(event.origin))return;
  if(data.type==='TAHSILAT_SESSION_STORE'&&validSessionToken(data.token)){
    sharedSessionToken=data.token;flushWaitingFrames();sessionChannel?.postMessage({type:'TOKEN',token:data.token});return;
  }
  if(data.type==='TAHSILAT_SESSION_REQUEST'){
    if(sharedSessionToken)sendSessionToken(event.source,event.origin);
    else{waitingSessionFrames.push({source:event.source,origin:event.origin});sessionChannel?.postMessage({type:'REQUEST'});}
    return;
  }
  if(data.type==='TAHSILAT_SESSION_CLEAR'){
    sharedSessionToken='';waitingSessionFrames.length=0;sessionChannel?.postMessage({type:'CLEAR'});
  }
});
if(sessionChannel)sessionChannel.onmessage=event=>{
  const data=event.data||{};
  if(data.type==='REQUEST'&&sharedSessionToken)sessionChannel.postMessage({type:'TOKEN',token:sharedSessionToken});
  else if(data.type==='TOKEN'&&validSessionToken(data.token)){sharedSessionToken=data.token;flushWaitingFrames();}
  else if(data.type==='CLEAR'){sharedSessionToken='';waitingSessionFrames.length=0;}
};

function showOnlineState(){
  const online=navigator.onLine;
  connectionStatus.textContent=online?'Çevrimiçi':'Çevrimdışı';
  connectionStatus.className='connection '+(online?'online':'offline');
  offlineView.hidden=online;
  if(!online){loadingView.hidden=true;frame.hidden=true;return;}
  if(!frame.src)frame.src=FRAME_URL;
  if(frame.dataset.loaded==='true'){frame.hidden=false;loadingView.hidden=true}else{loadingView.hidden=false;frame.hidden=true}
}

frame.addEventListener('load',()=>{
  frame.dataset.loaded='true';
  if(navigator.onLine){loadingView.hidden=true;offlineView.hidden=true;frame.hidden=false;}
});
window.addEventListener('online',()=>{frame.src=FRAME_URL;delete frame.dataset.loaded;showOnlineState()});
window.addEventListener('offline',showOnlineState);
document.querySelector('#retryButton').addEventListener('click',()=>{frame.src=FRAME_URL;delete frame.dataset.loaded;showOnlineState()});

window.addEventListener('beforeinstallprompt',event=>{
  event.preventDefault();installPrompt=event;installButton.hidden=false;
});
installButton.addEventListener('click',async()=>{
  if(!installPrompt)return;installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;installButton.hidden=true;
});
window.addEventListener('appinstalled',()=>{installPrompt=null;installButton.hidden=true});

if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));}
showOnlineState();
