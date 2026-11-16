
/* ========== INIT ========== */
async function init(){
 if(window.IJMMS_SERVER){try{await SRV.boot();}catch(e){document.body.insertAdjacentHTML('afterbegin','<div style="padding:14px;background:#fee;color:#900;font:14px sans-serif">The server is not reachable. Please try again shortly.</div>');}
  var pm=location.pathname.match(/^\/article\/([^\/]+)\/?$/);if(pm)history.replaceState(null,'','/#/article/'+pm[1]);
  renderChrome();route();return;}
 loadSettings();loadUsers();loadOut();
 try{await DB.open();ARTS=await DB.all();SUBS=await DB.allSubs();}catch(e){DB.fail=true;}
 renderChrome();route();
}
window.addEventListener('hashchange',route);
init();
