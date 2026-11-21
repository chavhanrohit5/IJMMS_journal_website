/* ==========================================================================
   Accounts (server mode): login with an Author / Reviewer choice, forgotten
   password by e-mailed link, admin user management (add, set / reset
   passwords, change role, open any user's dashboard and return to admin).
   Shared by IJMMS and IJMLS.
   ========================================================================== */
(function(){if(!window.IJMMS_SERVER)return;
var LOGIN_AS=['Author','Reviewer'];

/* ---- login, forgot, reset (one route: #/login, #/login/forgot, #/login/reset/TOKEN) ---- */
vLogin=function(){var p=location.hash.replace(/^#\/?/,'').split('/');
 if(p[0]==='login'&&p[1]==='forgot')return vForgot();
 if(p[0]==='login'&&p[1]==='reset')return vResetPw(p[2]||'');
 var as=window.__loginAs||'Author';
 return hd('Login')+pg('<div class="grid2"><div class="card acc">'
  +'<div class="fg"><label>Login as</label><select id="l-as">'+LOGIN_AS.map(function(r){return '<option'+(r===as?' selected':'')+'>'+r+'</option>';}).join('')+'</select></div>'
  +'<div class="fg"><label>Login ID (e-mail)</label><input id="le" autocomplete="username" placeholder="name@example.org"></div>'
  +'<div class="fg"><label>Password</label><input type="password" id="lp" autocomplete="current-password"></div>'
  +'<p style="margin:-4px 0 14px;font-size:13px"><a href="#/login/forgot">Forgot password? Reset it here</a></p>'
  +'<button class="btn" data-act="login">Login</button> <a class="btn ghost" href="#/register">Register as author</a></div>'
  +'<aside class="side"><div class="card"><h4>Who can log in</h4><p style="font-size:13px"><b>Authors</b> submit manuscripts and follow every stage of review.<br><b>Reviewers</b> read assigned manuscripts and submit review reports. <a href="#/join">Join as reviewer</a></p><p style="font-size:13px">Forgotten your password? Use <a href="#/login/forgot">reset password</a>: a link is sent to your registered e-mail.</p></div></aside></div>');};
function vForgot(){return hd('Reset password')+pg('<div class="card acc" style="max-width:520px"><p>Enter the e-mail address you registered with. We will send you a link to set a new password. The link is valid for 30 minutes.</p>'
 +'<div class="fg"><label>Registered e-mail</label><input id="fp-e" type="email" autocomplete="email" placeholder="name@example.org"></div>'
 +'<button class="btn" data-act="pwforgot">Send reset link</button> <a class="btn ghost" href="#/login">Back to login</a><div id="fp-msg"></div></div>');}
function vResetPw(tok){return hd('Set a new password')+pg('<div class="card acc" style="max-width:520px">'+(tok?'<div class="fg"><label>New password (at least 6 characters)</label><input id="rp-1" type="password" autocomplete="new-password"></div><div class="fg"><label>Repeat new password</label><input id="rp-2" type="password" autocomplete="new-password"></div><button class="btn" data-act="pwreset" data-tok="'+esc(tok)+'">Save new password</button>':'<p>This link is not complete. Please open the link from the e-mail again, or <a href="#/login/forgot">ask for a new one</a>.</p>')+'</div>');}
Object.assign(ACT,{
 login:async function(){var e=($('le').value||'').trim(),pw=$('lp').value,as=$('l-as')?$('l-as').value:'';window.__loginAs=as;
  if(!e||!pw){toast('Enter your login ID and password.');return;}
  try{var r=await api('POST','/api/login',{email:e,password:pw});await SRV.boot();renderChrome();var role=(r.user&&r.user.role)||'';
   if(isAdmin()){toast('Logged in.');location.hash='#/admin';return;}
   if(as&&role&&role!==as.toLowerCase())toast('Logged in. Your account is registered as '+role+'.');else toast('Logged in.');location.hash='#/dash';}catch(x){toast(x.message);}},
 pwforgot:async function(){var e=($('fp-e').value||'').trim();if(!/^\S+@\S+\.\S+$/.test(e)){toast('Enter a valid e-mail address.');return;}
  try{await api('POST','/api/password/forgot',{email:e});$('fp-msg').innerHTML='<div class="note" style="margin-top:14px">If an account is registered with <b>'+esc(e)+'</b>, a reset link has been sent to it. Please check your inbox (and spam folder). If nothing arrives in a few minutes, write to <a href="mailto:'+esc(S.email)+'">'+esc(S.email)+'</a>.</div>';}catch(x){toast(x.message);}},
 pwreset:async function(t){var a=$('rp-1').value,b=$('rp-2').value;if(a.length<6){toast('The new password needs at least 6 characters.');return;}if(a!==b){toast('The two passwords do not match.');return;}
  try{await api('POST','/api/password/reset',{token:t.dataset.tok,password:a});await SRV.boot();renderChrome();toast('Password changed. You are now logged in.');location.hash=isAdmin()?'#/admin':'#/dash';}catch(x){toast(x.message);}}
});

/* ---- admin: users ---- */
var UF='all',PWSHOW={};
function roleLabel(r){return {author:'Author',reviewer:'Reviewer',editor:'Editor',admin:'Administrator'}[r]||r;}
vUsers=function(){var list=USERS.filter(function(u){return u.role!=='admin';}),cnt={all:list.length};list.forEach(function(u){cnt[u.role]=(cnt[u.role]||0)+1;});
 var l=list.filter(function(u){return UF==='all'||u.role===UF;}).sort(function(a,b){return String(a.name).localeCompare(String(b.name));});
 var tabs=[['all','All'],['author','Authors'],['reviewer','Reviewers'],['editor','Editors']].map(function(t){return '<button class="btn sm '+(UF===t[0]?'':'ghost')+'" data-act="ufilter" data-f="'+t[0]+'">'+t[1]+' ('+(cnt[t[0]]||0)+')</button>';}).join(' ');
 return '<div class="card"><h3>Users</h3><p class="pg-h">Every author, reviewer and editor account. Passwords are stored encrypted, so nobody (including the admin) can read an existing password. You can <b>set</b> a new one or <b>reset</b> it to a new temporary password, which is shown here once and e-mailed to the user. <b>Open dashboard</b> lets you work inside a user\'s account; use "Return to admin" at the top to come back.</p>'
  +'<p>'+tabs+'</p><div style="overflow-x:auto"><table class="t bd"><tr><th>Name</th><th>Login ID (e-mail)</th><th>Role</th><th>Affiliation</th><th>Actions</th></tr>'
  +(l.length?l.map(function(u){var pw=PWSHOW[u.id];return '<tr><td><b>'+esc(u.name)+'</b></td><td>'+esc(u.email)+(pw?'<div class="pwshow">New password: <code>'+esc(pw)+'</code> <small>(copy it now; shown once)</small></div>':'')+'</td><td><select data-urole="'+u.id+'">'+['author','reviewer','editor'].map(function(r){return '<option value="'+r+'"'+(u.role===r?' selected':'')+'>'+roleLabel(r)+'</option>';}).join('')+'</select></td><td style="font-size:12.5px">'+esc(u.aff||'')+'</td>'
   +'<td style="white-space:nowrap"><button class="btn sm teal" data-act="ubecome" data-id="'+u.id+'">Open dashboard</button> <button class="btn sm ghost" data-act="usetpw" data-id="'+u.id+'">Set password</button> <button class="btn sm ghost" data-act="resetpw" data-id="'+u.id+'">Reset &amp; e-mail</button> <button class="btn sm red" data-act="deluser" data-id="'+u.id+'" title="Delete">&times;</button></td></tr>';}).join(''):'<tr><td colspan="5">No users in this group yet.</td></tr>')+'</table></div>'
  +'<h4 style="margin-top:22px">Add a user</h4><div class="row4"><div class="fg"><label>Full name</label><input id="nu-n"></div><div class="fg"><label>E-mail (login ID)</label><input id="nu-e" type="email"></div><div class="fg"><label>Role</label><select id="nu-r"><option value="author">Author</option><option value="reviewer">Reviewer</option><option value="editor">Editor</option></select></div><div class="fg"><label>Password (blank = automatic, e-mailed)</label><input id="nu-p" type="text" autocomplete="off"></div></div><div class="fg"><label>Affiliation</label><input id="nu-a" placeholder="Department, institution, city"></div><button class="btn" data-act="adduser">Add user</button></div>';};
Object.assign(ACT,{
 ufilter:function(t){UF=t.dataset.f;route();},
 adduser:async function(){var n=$('nu-n').value.trim(),e=$('nu-e').value.trim(),p=$('nu-p').value.trim(),a=$('nu-a')?$('nu-a').value.trim():'';if(!n||!/^\S+@\S+\.\S+$/.test(e)){toast('Name and a valid e-mail are needed.');return;}if(p&&p.length<6){toast('The password needs at least 6 characters.');return;}
  try{var r=await api('POST','/api/users',{name:n,email:e,role:$('nu-r').value,password:p,aff:a});USERS.push(r.user);PWSHOW[r.user.id]=r.tmp||p;mWelcome(r.user,r.tmp||p);UF='all';toast(roleLabel(r.user.role)+' added. Login details e-mailed.');route();}catch(x){toast(x.message);}},
 usetpw:async function(t){var u=userById(t.dataset.id);if(!u)return;var p=prompt('New password for '+u.name+' ('+u.email+'), at least 6 characters:');if(p===null)return;p=p.trim();if(p.length<6){toast('The password needs at least 6 characters.');return;}
  try{await api('POST','/api/users/'+encodeURIComponent(u.id)+'/password',{password:p});PWSHOW[u.id]=p;if(confirm('Password set. E-mail the new login details to '+u.email+'?'))mWelcome(u,p);toast('Password set.');route();}catch(x){toast(x.message);}},
 resetpw:async function(t){var u=userById(t.dataset.id);if(!u||!confirm('Give '+u.name+' a new temporary password and e-mail it to '+u.email+'?'))return;
  try{var r=await api('POST','/api/users/'+encodeURIComponent(u.id)+'/reset');PWSHOW[u.id]=r.tmp;mWelcome(u,r.tmp);toast('New password created and e-mailed.');route();}catch(x){toast(x.message);}},
 ubecome:async function(t){var u=userById(t.dataset.id);if(!u||!confirm('Open the dashboard of '+u.name+' ('+roleLabel(u.role)+')? You will work as this user until you press "Return to admin".'))return;
  try{await api('POST','/api/admin/become/'+encodeURIComponent(u.id));await SRV.boot();renderChrome();toast('You are now in the dashboard of '+u.name+'.');location.hash='#/dash';}catch(x){toast(x.message);}},
 backadmin:async function(){try{await api('POST','/api/admin/return');await SRV.boot();renderChrome();toast('Back in the admin panel.');location.hash='#/admin/users';}catch(x){toast(x.message);location.hash='#/login';}}
});
document.addEventListener('change',async function(e){var t=e.target;if(!t.dataset||!t.dataset.urole)return;var u=userById(t.dataset.urole);if(!u)return;
 if(!confirm('Change the role of '+u.name+' to '+roleLabel(t.value)+'?')){t.value=u.role;return;}
 try{var r=await api('POST','/api/users/'+encodeURIComponent(u.id)+'/role',{role:t.value});Object.assign(u,r.user);toast('Role changed.');route();}catch(x){toast(x.message);t.value=u.role;}});

/* ---- admin menu: count of new submissions waiting ---- */
var _accAM=adminMenu;adminMenu=function(sub){var h=_accAM(sub),n=(typeof SUBS!=='undefined'?SUBS:[]).filter(function(s){return s.status==='Submitted';}).length;
 return n?h.replace(/(href="#\/admin\/subs"[^>]*>)Submissions</,'$1Submissions <span class="newbadge">'+n+' new</span><'):h;};

/* ---- banner while the admin works inside a user's account ---- */
var _accRC=renderChrome;renderChrome=function(){_accRC.apply(this,arguments);var b=document.getElementById('impbar');
 if(typeof SRV!=='undefined'&&SRV.flags&&SRV.flags.imp&&curUser()){var u=curUser();if(!b){b=document.createElement('div');b.id='impbar';document.body.insertBefore(b,document.body.firstChild);}
  b.innerHTML='Admin view: you are working as <b>'+esc(u.name)+'</b> ('+esc(roleLabel(u.role))+', '+esc(u.email)+') <button class="btn sm gold" data-act="backadmin">Return to admin</button>';}
 else if(b)b.remove();};

(function(){var c=document.createElement('style');c.textContent='.newbadge{background:#b42318;color:#fff;border-radius:9px;padding:1px 7px;font-size:11px;font-weight:bold;margin-left:4px}#impbar{position:sticky;top:0;z-index:99;background:#B8860B;color:#fff;padding:8px 14px;text-align:center;font-size:14px}#impbar .btn{margin-left:10px;background:#0D2B4E;border-color:#0D2B4E;color:#fff}.pwshow{margin-top:4px;font-size:12.5px;color:#0E7C7B}.pwshow code{background:#eef6f5;padding:1px 6px;border-radius:3px;font-size:13px;color:#0D2B4E}';document.head.appendChild(c);})();
})();
