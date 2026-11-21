/* ========== SERVER MODE: connects the website to the Node.js / PostgreSQL server ==========
   Loaded only in the server build. It replaces the browser-storage layer (IndexedDB / localStorage)
   and the client-side login with real API calls; all page, form and PDF code is unchanged. */
var SRV={ME:null,visits:0,flags:{},last:0,chain:Promise.resolve()};
function api(method,url,body){var o={method:method,credentials:'same-origin',headers:{'X-Requested-With':'ijmms'}};if(body!==undefined){o.headers['Content-Type']='application/json';o.body=JSON.stringify(body);}
 return fetch(url,o).then(function(r){return r.json().catch(function(){return {};}).then(function(j){if(!r.ok)throw new Error(j.error||('Request failed ('+r.status+')'));return j;});});}
function srvQ(fn){var p=SRV.chain.then(fn);SRV.chain=p.catch(function(){});return p;}
SRV.boot=async function(){var r=await api('GET','/api/bootstrap');SRV.ME=r.me;SRV.visits=r.visits;SRV.flags=r.flags||{};var o=r.settings||{};S={};for(var k in DEFAULTS)S[k]=(o[k]!==undefined)?o[k]:DEFAULTS[k];
 ARTS=r.articles||[];SUBS=r.subs||[];USERS=r.users||[];OUT=r.outbox||[];REVAPPS=r.revapps||[];SRV.revSnap=snapRev();SRV.last=Date.now();};
SRV.ensureFull=async function(id){var a=findArt(id);if(a&&a._light){try{var f=await api('GET','/api/articles/'+encodeURIComponent(id));f.views=Math.max(f.views||0,a.views||0);ARTS[ARTS.indexOf(a)]=f;}catch(e){}}};

/* ----- session ----- */
curUser=function(){var m=SRV.ME;return m?{id:m.id,name:m.name,email:m.email,aff:m.aff||'',role:m.role,expertise:m.expertise}:null;};
setSession=function(){};
loadSettings=loadUsers=loadOut=loadRev=function(){};saveUsers=saveOut=function(){};
saveSettings=function(){if(!isFullAdmin())return;var o={};for(var k in S){var v=S[k];if(k==='pwHash'||k==='defaultPw')continue;if(typeof v==='string'||typeof v==='boolean'||typeof v==='number')o[k]=v;}
 srvQ(function(){return api('PUT','/api/settings',o);}).catch(function(e){toast('Settings not saved: '+e.message);});};

/* ----- router: refresh data now and then; load full article text on demand ----- */
var _routeSrv=route;
route=function(){var m=(location.hash||'').match(/^#\/(?:article|admin\/edit)\/([^\/?]+)/),chain=Promise.resolve();
 if(Date.now()-SRV.last>(SRV.ME?30000:180000))chain=chain.then(function(){return SRV.boot().catch(function(){});});
 if(m)chain=chain.then(function(){return SRV.ensureFull(m[1]);});
 return chain.then(function(){_routeSrv();});};

/* ----- storage layer ----- */
DB.fail=false;
DB.open=function(){return Promise.resolve();};DB.all=function(){return Promise.resolve(ARTS);};DB.allSubs=function(){return Promise.resolve(SUBS);};
DB.put=function(a){if(isAdmin())return api('PUT','/api/articles/'+encodeURIComponent(a.id),a).then(function(r){if(!a._light&&r.figures&&a.figures)r.figures.forEach(function(f,i){if(a.figures[i])a.figures[i].data=f.data;});return r;});
 if(a.status==='published')return api('POST','/api/articles/'+encodeURIComponent(a.id)+'/view').catch(function(){});return Promise.resolve();};
DB.del=function(id){return api('DELETE','/api/articles/'+encodeURIComponent(id));};
DB.putMany=async function(arr){for(var i=0;i<arr.length;i+=25)await api('POST','/api/articles/bulk',{articles:arr.slice(i,i+25)});};
DB.delMany=function(ids){return api('POST','/api/articles/bulk-delete',{ids:ids});};
DB.putSub=function(s){return api('PUT','/api/subs/'+encodeURIComponent(s.id),s).then(function(r){if(r&&r.sub)Object.keys(r.sub).forEach(function(k){s[k]=r.sub[k];});return r;});};
DB.delSub=function(id){return api('DELETE','/api/subs/'+encodeURIComponent(id));};
DB.putFile=function(key,blob){return fetch('/api/files/'+encodeURIComponent(key),{method:'PUT',credentials:'same-origin',headers:{'X-Requested-With':'ijmms','X-Filename':encodeURIComponent(blob.name||(key+'.pdf')),'Content-Type':blob.type||'application/octet-stream'},body:blob}).then(function(r){return r.json().catch(function(){return {};}).then(function(j){if(!r.ok)throw new Error(j.error||'Upload failed');});});};
DB.getFile=function(key){return fetch('/api/files/'+encodeURIComponent(key),{credentials:'same-origin'}).then(function(r){return r.ok?r.blob():null;}).catch(function(){return null;});};
DB.delFile=function(key){return api('DELETE','/api/files/'+encodeURIComponent(key)).catch(function(){});};
DB.allFileKeys=function(){return Promise.resolve([]);};

/* ----- e-mail: the server stores and sends it (SMTP) ----- */
queueMail=function(to,toName,subject,body,att,subId){var m={id:uid(),to:to,toName:toName,subject:subject,body:body,att:att||'',subId:subId||'',date:new Date().toISOString(),sent:false,auto:false,status:'queued'};OUT.push(m);
 srvQ(function(){return api('POST','/api/outbox',m).then(function(r){if(r&&r.mail)m.status=r.mail.status;});}).catch(function(e){m.status='failed';m.error=e.message;});return m;};
var _omail0=ACT.omail;
Object.assign(ACT,{
 omail:async function(t){var m=omOf(t);if(!m)return;if(!SRV.flags.smtp)return _omail0(t);try{var r=await api('POST','/api/outbox/'+encodeURIComponent(m.id)+'/send');if(r.mail)Object.assign(m,r.mail);toast(r.ok?'Email sent.':'Sending failed: '+((r.mail&&r.mail.error)||'unknown error'));}catch(e){toast(e.message);}route();},
 osent:function(t){var m=omOf(t);if(!m)return;m.sent=true;m.status='sent';api('POST','/api/outbox/'+encodeURIComponent(m.id)+'/mark').catch(function(){});route();},
 odel:function(t){OUT=OUT.filter(function(m){return m.id!==t.dataset.id;});api('DELETE','/api/outbox/'+encodeURIComponent(t.dataset.id)).catch(function(){});route();},
 mailtest:async function(){try{await api('POST','/api/mail-test');toast('Test e-mail sent to '+S.email+'.');}catch(e){toast(e.message);}},
 /* ----- accounts ----- */
 login:async function(){var e=($('le').value||'').trim(),pw=$('lp').value;try{await api('POST','/api/login',{email:e,password:pw});await SRV.boot();toast('Logged in.');renderChrome();location.hash=isAdmin()?'#/admin':'#/dash';}catch(x){toast(x.message);}},
 logout:async function(){try{await api('POST','/api/logout');}catch(e){}await SRV.boot().catch(function(){});location.hash='#/home';renderChrome();route();},
 register:async function(){var n=$('rg-n').value.trim(),e=$('rg-e').value.trim(),a=$('rg-a').value.trim(),p=$('rg-p').value;if(!n||!/^\S+@\S+\.\S+$/.test(e)){toast('Enter your name and a valid email.');return;}if(p&&p.length<6){toast('Password must be at least 6 characters.');return;}
  try{var r=await api('POST','/api/register',{name:n,email:e,aff:a,password:p});await SRV.boot();mWelcome(r.user,r.tmp||'');toast(r.tmp?'Account created. Your temporary password: '+r.tmp+' (also emailed).':'Account created. Welcome email sent.');renderChrome();location.hash='#/submit';}catch(x){toast(x.message);}},
 adduser:async function(){var n=$('nu-n').value.trim(),e=$('nu-e').value.trim(),p=$('nu-p').value;if(!n||!/^\S+@\S+\.\S+$/.test(e)){toast('Name and valid email required.');return;}
  try{var r=await api('POST','/api/users',{name:n,email:e,role:$('nu-r').value,password:p});USERS.push(r.user);mWelcome(r.user,r.tmp||p);toast('User added. Login email queued.');route();}catch(x){toast(x.message);}},
 deluser:async function(t){if(!confirm('Delete this user?'))return;try{await api('DELETE','/api/users/'+encodeURIComponent(t.dataset.id));USERS=USERS.filter(function(u){return u.id!==t.dataset.id;});route();}catch(x){toast(x.message);}},
 resetpw:async function(t){var u=userById(t.dataset.id);if(!u||!confirm('Generate a new temporary password for '+u.name+' and email it?'))return;try{var r=await api('POST','/api/users/'+encodeURIComponent(u.id)+'/reset');mWelcome(u,r.tmp);toast('Password reset. Email queued.');}catch(x){toast(x.message);}},
 chpw:async function(){var o=$('cp-o').value,n=$('cp-n').value;if(n.length<6){toast('New password needs 6+ characters.');return;}try{await api('POST','/api/password',{old:o,new:n});toast('Password changed.');route();}catch(x){toast(x.message);}},
 /* ----- reviewers ----- */
 rvapprove:async function(t){var r=findRev(t.dataset.id);if(!r)return;if(USERS.some(function(u){return u.email.toLowerCase()===r.email.toLowerCase();})&&!confirm('An account with this e-mail exists. Change its role to reviewer?'))return;
  try{var x=await api('POST','/api/revapps/'+encodeURIComponent(r.id)+'/approve');Object.assign(r,x.app);var i=USERS.map(function(u){return u.id;}).indexOf(x.user.id);if(i>-1)USERS[i]=x.user;else USERS.push(x.user);
   if(x.tmp)mWelcome(x.user,x.tmp);rvApprovedMail(r,x.tmp);toast('Approved. Reviewer account ready; e-mails queued.');route();}catch(e){toast(e.message);}},
 pdf:function(t){window.open('/article/'+encodeURIComponent(t.dataset.id)+'/pdf','_blank');},
 jpdf:function(t){window.open('/article/'+encodeURIComponent(t.dataset.id)+'/pdf','_blank');}
});
var _saveSet=ACT.savesettings;
ACT.savesettings=async function(t){var e=$('s-pw'),pw=e?e.value:'';if(pw){if(pw.length<8){toast('Password must be at least 8 characters.');return;}try{await api('POST','/api/admin/password',{password:pw});e.value='';}catch(x){toast(x.message);return;}}return _saveSet(t);};

/* ----- reviewer applications: stored on the server ----- */
function snapRev(){var o={};REVAPPS.forEach(function(r){o[r.id]=JSON.stringify(r);});return o;}
saveRev=function(){return srvQ(async function(){var snap=SRV.revSnap||{};for(var i=0;i<REVAPPS.length;i++){var r=REVAPPS[i];if(!snap[r.id]){var x=await api('POST','/api/revapps',r);Object.assign(r,x.app);}else if(snap[r.id]!==JSON.stringify(r)&&isAdmin())await api('PUT','/api/revapps/'+encodeURIComponent(r.id),r);}
  if(isAdmin())for(var id in snap)if(!REVAPPS.some(function(r){return r.id===id;}))await api('DELETE','/api/revapps/'+encodeURIComponent(id));SRV.revSnap=snapRev();});};
rvStore=async function(r,f,ex){try{if(f){await DB.putFile('rv_'+r.id,f);r.hasCv=true;}}catch(e){toast(e.message);return;}
 try{var x=await api('POST','/api/revapps',r);Object.assign(r,x.app);}catch(e){toast(e.message);return;}
 REVAPPS.push(r);SRV.revSnap=snapRev();rvEmails(r,'ack');
 queueMail(S.email,S.short+' editorial office','New reviewer application: '+r.name+' ['+r.ref+']','A new reviewer application was received.\n\nName: '+r.name+'\nE-mail: '+r.email+'\nAffiliation: '+r.aff+'\nExpertise: '+ex.join('; ')+'\n\nReview it in Admin panel > Reviewer applications.\n');
 window._rvdone=r.id;route();toast('Application submitted.');};
/* the duplicate-email check in the form only sees admin data; the server enforces it */

/* ----- visitors, backup page, server tools ----- */
visitors=function(){VC=SRV.visits;vcShow();};
vBackup=function(){return '<div class="card"><h3>Backup</h3><p>Data is stored in the server&rsquo;s PostgreSQL database and uploaded files in the server data folder. Back them up with the <code>deploy/backup.sh</code> script (database dump + files) on a schedule, and copy the archive off the server. See README &gt; Backups.</p></div>';};
var _vOut=vOutbox;
vOutbox=function(){var h=_vOut();var card='<div class="card"><h3>Mail server</h3><p>'+(SRV.flags.smtp?'SMTP is configured on the server: notifications are sent automatically'+(SRV.flags.pdf?' with the acknowledgement / acceptance / appointment letters attached as PDF.':'; PDF attachments need Chrome or Chromium on the server (set CHROME_PATH).'):'SMTP is <b>not</b> configured. Set SMTP_HOST, SMTP_USER and SMTP_PASS in the server <code>.env</code> and restart; until then, e-mails wait here and can be sent with your own mail app.')+'</p>'+(SRV.flags.smtp&&isFullAdmin()?'<p><button class="btn sm" data-act="mailtest">Send test e-mail to '+esc(S.email)+'</button></p>':'')+'</div>';
 return h.replace(/<div class="card"><h3>Sending settings<\/h3>[\s\S]*?(?=<div class="card"><h3>Outbox)/,card);};
function vServerTools(){var yrs={};ARTS.forEach(function(a){yrs[a.year]=1;});var y=Object.keys(yrs).sort().reverse();
 var doi=ARTS.filter(function(a){return a.status==='published'&&a.doi;}).length;
 return '<div class="card"><h3>Indexing &amp; DOI tools</h3><p>Every published article has its own web address <code>/article/&lt;id&gt;</code> with Google-Scholar (Highwire) meta tags, JSON-LD and a PDF at <code>/article/&lt;id&gt;/pdf</code>.</p><table class="t"><tr><td>Sitemap</td><td><a href="/sitemap.xml" target="_blank">/sitemap.xml</a> &mdash; submit in Google Search Console</td></tr><tr><td>OAI-PMH feed</td><td><a href="/oai?verb=Identify" target="_blank">/oai</a> &mdash; for harvesters and indexers</td></tr><tr><td>Status</td><td>SMTP: <b>'+(SRV.flags.smtp?'on':'off')+'</b> &middot; PDF engine: <b>'+(SRV.flags.pdf?'on':'off')+'</b> &middot; Visitors counted: <b>'+SRV.visits+'</b></td></tr></table></div>'
 +'<div class="card"><h3>Crossref DOI deposit</h3><p>'+doi+' published article(s) have a DOI. Set your registered DOI prefix in Settings, assign DOIs, then download the deposit file (XML, with reference lists) or deposit directly.</p><div class="row3"><div class="fg"><label>Year (optional)</label><select id="cr-y"><option value="">All</option>'+y.map(function(v){return '<option>'+v+'</option>';}).join('')+'</select></div><div class="fg"><label>Issue (optional)</label><select id="cr-i"><option value="">All</option>'+[1,2,3,4,5,6].map(function(v){return '<option>'+v+'</option>';}).join('')+'</select></div><div class="fg"><label>&nbsp;</label><button class="btn teal" data-act="crxml">Download Crossref XML</button> <button class="btn gold" data-act="crdeposit">Deposit to Crossref</button></div></div><div id="cr-out" class="note" style="display:none"></div><p style="font-size:12.5px;color:#667">Direct deposit needs CROSSREF_USER and CROSSREF_PASS in the server <code>.env</code> and an active Crossref membership.</p></div>'
 +'<div class="card"><h3>Maintenance</h3><p><button class="btn ghost" data-act="clrpdf">Clear generated PDF cache</button> &nbsp;<span style="font-size:12.5px;color:#667">PDFs are regenerated automatically when an article changes.</span></p></div>';}
Object.assign(ACT,{
 crxml:function(){var y=$('cr-y').value,i=$('cr-i').value;window.location.href='/api/crossref.xml'+(y||i?'?':'')+(y?'year='+y:'')+(y&&i?'&':'')+(i?'issue='+i:'');},
 crdeposit:async function(){if(!confirm('Send the deposit to Crossref now?'))return;var o=$('cr-out');o.style.display='block';o.textContent='Sending...';try{var r=await api('POST','/api/crossref/deposit',{year:$('cr-y').value,issue:$('cr-i').value});o.textContent='Crossref responded ('+r.status+') for '+r.articles+' article(s): '+r.response;}catch(e){o.textContent=e.message;}},
 clrpdf:async function(){try{await api('POST','/api/admin/clear-pdf-cache');toast('PDF cache cleared.');}catch(e){toast(e.message);}}
});
var _am4=adminMenu;
adminMenu=function(sub){var h=_am4(sub);if(!isFullAdmin())return h;var i=h.lastIndexOf('</div>');return h.slice(0,i)+'<a href="#/admin/server" class="'+(sub==='server'?'on':'')+'">Indexing &amp; DOI</a>'+h.slice(i);};
var _va4=vAdmin;
vAdmin=function(p){if(p[1]==='server'&&isFullAdmin())return hd('Admin panel','Indexing & DOI tools')+pg('<div class="adm">'+adminMenu('server')+'<div>'+vServerTools()+'</div></div>');return _va4(p);};
