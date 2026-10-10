const APP_URL='https://script.google.com/macros/s/AKfycbzODsdn99mhtCfgIuWqnwpqHqFYHv3sP0W1XlZ7JCnOgrkvT8by43Tjz1UDxTA4G9En/exec';
const frame=document.querySelector('#appFrame');
const loadingView=document.querySelector('#loadingView');
const offlineView=document.querySelector('#offlineView');
const connectionStatus=document.querySelector('#connectionStatus');
const installButton=document.querySelector('#installButton');
let installPrompt=null;

function showOnlineState(){
  const online=navigator.onLine;
  connectionStatus.textContent=online?'Çevrimiçi':'Çevrimdışı';
  connectionStatus.className='connection '+(online?'online':'offline');
  offlineView.hidden=online;
  if(!online){loadingView.hidden=true;frame.hidden=true;return;}
  if(!frame.src)frame.src=APP_URL;
  if(frame.dataset.loaded==='true'){frame.hidden=false;loadingView.hidden=true}else{loadingView.hidden=false;frame.hidden=true}
}

frame.addEventListener('load',()=>{
  frame.dataset.loaded='true';
  if(navigator.onLine){loadingView.hidden=true;offlineView.hidden=true;frame.hidden=false;}
});
window.addEventListener('online',()=>{frame.src=APP_URL;delete frame.dataset.loaded;showOnlineState()});
window.addEventListener('offline',showOnlineState);
document.querySelector('#retryButton').addEventListener('click',()=>{frame.src=APP_URL;delete frame.dataset.loaded;showOnlineState()});

window.addEventListener('beforeinstallprompt',event=>{
  event.preventDefault();installPrompt=event;installButton.hidden=false;
});
installButton.addEventListener('click',async()=>{
  if(!installPrompt)return;installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;installButton.hidden=true;
});
window.addEventListener('appinstalled',()=>{installPrompt=null;installButton.hidden=true});

if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));}
showOnlineState();
