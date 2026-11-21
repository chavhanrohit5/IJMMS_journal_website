/* ==========================================================================
   Copyright form on the manuscript page: authors either upload the signed
   form (PDF / JPG / PNG) or sign it online (draw or type a signature).
   s.cr = {method:'upload'|'digital', status:'Received'|'Verified', fileName,
           signer, desig, email, sig (PNG data URL), at, ip}
   The server stamps the time and IP of a digital signature. The editor sees
   the status, opens the file or the signed form, and marks it verified.
   Shared by IJMMS and IJMLS.
   ========================================================================== */
var CR_KEY='crform1';
function crIsDue(s){return !!s&&(!!s.cr||(s.decision&&s.decision.d==='Accepted')||['Accepted','In production','Published'].indexOf(s.status)>-1);}
function crPill(s){var c=s.cr;if(!c)return '<span class="paypill" style="background:#B8860B">Not yet received</span>';return '<span class="paypill" style="background:'+(c.status==='Verified'?'#1e7d32':'#0E7C7B')+'">'+(c.status==='Verified'?'Verified':(c.method==='digital'?'Signed online':'Uploaded'))+'</span>';}
function crWhen(c){try{return new Date(c.at).toLocaleString('en-IN',{timeZone:'Asia/Kolkata',day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})+' IST';}catch(e){return c.at||'';}}

function crCard(s){if(!crIsDue(s))return '';var c=s.cr,adm=isAdmin(),u=curUser()||{};
 var h='<div class="card crcard"><h4>Copyright form '+crPill(s)+'</h4>';
 if(c){h+='<p>'+(c.method==='digital'?'Signed online by <b>'+esc(c.signer)+'</b>'+(c.desig?' ('+esc(c.desig)+')':'')+' on '+esc(crWhen(c))+(adm&&c.ip?' &middot; IP '+esc(c.ip):''):'Signed form uploaded'+(c.fileName?': <b>'+esc(c.fileName)+'</b>':'')+' on '+esc(crWhen(c)))+'.</p>'
   +'<p>'+(c.method==='digital'?'<button class="btn sm" data-act="crview" data-id="'+s.id+'">View signed form</button>':'<a class="btn sm" href="/api/files/'+encodeURIComponent('sub:'+s.id+'__'+CR_KEY)+'" target="_blank" rel="noopener">Open uploaded form</a>')
   +(adm?(c.status==='Verified'?' <button class="btn sm ghost" data-act="crverify" data-v="0" data-id="'+s.id+'">Undo verification</button>':' <button class="btn sm teal" data-act="crverify" data-v="1" data-id="'+s.id+'">Mark as verified</button>'):'')+'</p>';
   if(adm||c.status==='Verified')return h+(adm?crAdminTools(s):'')+'</div>';
   h+='<p class="pg-h">Need to change it? You can upload or sign again below; the new form replaces this one.</p>';}
 else if(adm)return h+'<p>The author has not provided the copyright form yet.</p>'+crAdminTools(s)+'</div>';
 else h+='<p>Before publication, every accepted manuscript needs a signed copyright and licence-to-publish form. Choose <b>one</b> of the two ways below.</p>';
 h+='<div class="crtabs"><button class="btn sm '+(window.__crTab==='upload'?'ghost':'')+'" data-act="crtab" data-t="sign">✍️ Sign online</button> <button class="btn sm '+(window.__crTab==='upload'?'':'ghost')+'" data-act="crtab" data-t="upload">📎 Upload signed form</button></div>';
 if(window.__crTab==='upload'){
  h+='<div class="crpane"><ol class="paysteps"><li><button class="btn sm ghost" data-act="cfsub" data-id="'+s.id+'">Download the copyright form</button> (filled in with your manuscript details).</li><li>Print it, have the authors sign it, and scan or photograph it.</li><li>Upload the signed form here (PDF, JPG or PNG, up to 10 MB).</li></ol><div class="fg"><input type="file" id="cr-file" accept=".pdf,.jpg,.jpeg,.png"></div><button class="btn" data-act="crupload" data-id="'+s.id+'">Upload signed form</button></div>';}
 else{
  h+='<div class="crpane"><p style="font-size:13.5px">Read the <a href="#" data-act="cfsub" data-id="'+s.id+'">copyright form and its terms</a>, then sign below. The corresponding author may sign on behalf of all co-authors.</p>'
   +'<div class="row2"><div class="fg"><label>Full name of the signing author</label><input id="cr-name" value="'+esc(u.name||s.authorName||'')+'"></div><div class="fg"><label>Designation</label><input id="cr-desig" placeholder="e.g. Assistant Professor, Department of Surgery"></div></div>'
   +'<div class="fg"><label>Signature <span class="crmode"><a href="#" data-act="crmode" data-m="draw" class="'+(window.__crMode==='type'?'':'on')+'">Draw</a> | <a href="#" data-act="crmode" data-m="type" class="'+(window.__crMode==='type'?'on':'')+'">Type</a></span></label>'
   +(window.__crMode==='type'?'<input id="cr-typed" placeholder="Type your name as your signature" style="font:italic 26px \'Brush Script MT\',\'Segoe Script\',cursive">':'<canvas id="cr-pad" width="560" height="150" class="crpad"></canvas><div><a href="#" data-act="crclear" style="font-size:12.5px">Clear signature</a></div>')+'</div>'
   +'<label class="crck"><input type="checkbox" id="cr-ok1"> I have read the terms of the copyright and licence-to-publish form and agree to them.</label>'
   +'<label class="crck"><input type="checkbox" id="cr-ok2"> I sign on behalf of all authors, who have read and approved these terms.</label>'
   +'<label class="crck"><input type="checkbox" id="cr-ok3"> I agree that this electronic signature has the same effect as my handwritten signature.</label>'
   +'<button class="btn gold" data-act="crsign" data-id="'+s.id+'">Sign copyright form</button></div>';}
 return h+'</div>';}
function crAdminTools(s){return '<p style="margin-top:8px"><button class="btn sm ghost" data-act="cfsub" data-id="'+s.id+'">Blank form for this manuscript</button> <button class="btn sm ghost" data-act="crremind" data-id="'+s.id+'">E-mail the author to sign</button></p>';}
if(typeof vSub==='function'){var _crVSub=vSub;vSub=function(id){var h=_crVSub(id),s=findSub(id);if(!s||!canSee(s))return h;var c=crCard(s);if(!c)return h;var i=h.lastIndexOf('</div></section>');var out=i>-1?h.slice(0,i)+c+h.slice(i):h+c;setTimeout(crPadInit,0);return out;};}

/* signature pad */
function crPadInit(){var cv=document.getElementById('cr-pad');if(!cv||cv.__ok)return;cv.__ok=1;var x=cv.getContext('2d'),dn=false,last=null;x.lineWidth=2.4;x.lineCap='round';x.lineJoin='round';x.strokeStyle='#10207a';cv.__ink=0;
 var pos=function(e){var r=cv.getBoundingClientRect();return [(e.clientX-r.left)*cv.width/r.width,(e.clientY-r.top)*cv.height/r.height];};
 cv.addEventListener('pointerdown',function(e){dn=true;last=pos(e);cv.setPointerCapture(e.pointerId);e.preventDefault();});
 cv.addEventListener('pointermove',function(e){if(!dn)return;var p=pos(e);x.beginPath();x.moveTo(last[0],last[1]);x.lineTo(p[0],p[1]);x.stroke();last=p;cv.__ink++;e.preventDefault();});
 ['pointerup','pointercancel','pointerleave'].forEach(function(n){cv.addEventListener(n,function(){dn=false;});});}
function crTypedPng(t){var cv=document.createElement('canvas');cv.width=560;cv.height=150;var x=cv.getContext('2d');x.fillStyle='#10207a';var f=58;do{x.font='italic '+f+'px "Brush Script MT","Segoe Script","Lucida Handwriting",cursive';f-=2;}while(x.measureText(t).width>520&&f>20);x.textBaseline='middle';x.fillText(t,20,78);return cv.toDataURL('image/png');}
function crTrim(cv){var x=cv.getContext('2d'),d=x.getImageData(0,0,cv.width,cv.height).data,w=cv.width,hh=cv.height,a=w,b=hh,c=0,e=0;for(var y=0;y<hh;y++)for(var i=0;i<w;i++){if(d[(y*w+i)*4+3]>10){if(i<a)a=i;if(i>c)c=i;if(y<b)b=y;if(y>e)e=y;}}
 if(c<=a||e<=b)return cv.toDataURL('image/png');var o=document.createElement('canvas'),p=8;o.width=c-a+2*p;o.height=e-b+2*p;o.getContext('2d').drawImage(cv,a-p,b-p,o.width,o.height,0,0,o.width,o.height);return o.toDataURL('image/png');}

Object.assign(ACT,{
 crtab:function(t){window.__crTab=t.dataset.t;route();},
 crmode:function(t){window.__crMode=t.dataset.m;route();},
 crclear:function(){var cv=$('cr-pad');if(cv){cv.getContext('2d').clearRect(0,0,cv.width,cv.height);cv.__ink=0;}},
 crview:function(t){var s=findSub(t.dataset.id);if(s)docOpen(cfHTML(cfData(s)));},
 crsign:async function(t){var s=findSub(t.dataset.id);if(!s)return;var nm=$('cr-name').value.trim(),sig='';
  if(!nm){toast('Enter the name of the signing author.');return;}
  if(!($('cr-ok1').checked&&$('cr-ok2').checked&&$('cr-ok3').checked)){toast('Please tick all three confirmations.');return;}
  if(window.__crMode==='type'){var ty=($('cr-typed').value||'').trim();if(!ty){toast('Type your signature.');return;}sig=crTypedPng(ty);}
  else{var cv=$('cr-pad');if(!cv||(cv.__ink||0)<8){toast('Please draw your signature in the box.');return;}sig=crTrim(cv);}
  if(sig.length>300000){toast('The signature image is too large. Please clear it and sign again.');return;}
  var u=curUser()||{};s.cr={method:'digital',status:'Received',signer:nm,desig:$('cr-desig').value.trim(),email:u.email||s.authorEmail||'',sig:sig,at:new Date().toISOString()};
  s.history=s.history||[];s.history.push({d:today(),t:'Copyright form signed online by '+nm});
  try{var r=await saveSub(s);}catch(e){toast(e.message);return;}
  crNotify(s,'signed online by '+nm);toast('Thank you. The copyright form has been signed.');route();},
 crupload:async function(t){var s=findSub(t.dataset.id);if(!s)return;var f=$('cr-file').files[0];if(!f){toast('Choose the scanned, signed form.');return;}
  if(!/\.(pdf|jpe?g|png)$/i.test(f.name)){toast('Please upload a PDF, JPG or PNG file.');return;}if(f.size>10*1024*1024){toast('The file is larger than 10 MB.');return;}
  try{await DB.putFile('sub:'+s.id+'__'+CR_KEY,f);}catch(e){toast('Upload failed: '+e.message);return;}
  s.cr={method:'upload',status:'Received',fileName:f.name,at:new Date().toISOString()};s.history=s.history||[];s.history.push({d:today(),t:'Signed copyright form uploaded ('+f.name+')'});
  try{await saveSub(s);}catch(e){toast(e.message);return;}
  crNotify(s,'uploaded ('+f.name+')');toast('Signed copyright form uploaded. Thank you.');route();},
 crverify:async function(t){var s=findSub(t.dataset.id);if(!s||!s.cr)return;s.cr.status=t.dataset.v==='1'?'Verified':'Received';s.history=s.history||[];s.history.push({d:today(),t:'Copyright form '+(s.cr.status==='Verified'?'verified by the editorial office':'verification undone')});try{await saveSub(s);}catch(e){toast(e.message);return;}toast(s.cr.status==='Verified'?'Copyright form verified.':'Verification undone.');route();},
 crremind:function(t){var s=findSub(t.dataset.id);if(!s)return;var a=mailAuthor(s);
  queueMail(a.email,a.name,'['+ensureRef(s)+'] Please sign the copyright form - '+S.short,'Dear '+a.name+',\n\nTo publish your accepted manuscript we need the signed copyright and licence-to-publish form.\n\nMANUSCRIPT\nReference no. : '+ensureRef(s)+'\nTitle         : '+s.title+'\nLogin page    : '+portalUrl()+'\n\nHOW TO SIGN\n1. Log in and open this manuscript from your dashboard.\n2. Under "Copyright form", choose Sign online (draw or type your signature) or Upload signed form.\n3. Submit. You will see the status change to "Signed online" or "Uploaded".\n\n'+sigText(),'',s.id);
  toast('Reminder e-mailed to the author.');}
});
function crNotify(s,how){queueMail(S.email,'Editorial Office','['+ensureRef(s)+'] Copyright form received','The copyright form for an accepted manuscript has been '+how+'.\n\nCOPYRIGHT FORM\nReference no. : '+ensureRef(s)+'\nTitle         : '+s.title+'\nAuthor        : '+(s.authorName||'')+' ('+(s.authorEmail||'')+')\nMethod        : '+(s.cr.method==='digital'?'Signed online':'Uploaded scan')+'\n\nOpen the submission in the admin panel to view it and mark it as verified.\n'+sigText(),s.cr.method==='digital'?'cf':'',s.id);}

/* acceptance e-mail: tell authors where to sign */
if(typeof acceptEmail==='function'){var _crAE=acceptEmail;acceptEmail=function(s,a){var t=_crAE(s,a),c='COPYRIGHT FORM\nSign it online or upload the signed copy: log in, open this manuscript from your dashboard and use the "Copyright form" section.\n\n';var i=t.indexOf('NEXT STEPS');return i>-1?t.slice(0,i)+c+t.slice(i):t+'\n'+c;};}

/* copyright page: logged-in authors get a direct link to sign */
if(typeof vCopyright==='function'){var _crVC=vCopyright;vCopyright=function(){var h=_crVC(),u=curUser();if(!u||isAdmin())return h;var mine=SUBS.filter(function(s){return s.authorId===u.id&&crIsDue(s);});if(!mine.length)return h;
 var box='<div class="card crcard"><h4>Sign or upload your copyright form online</h4><table class="t bd"><tr><th>Manuscript</th><th>Status</th><th></th></tr>'+mine.map(function(s){return '<tr><td>'+esc((s.ref||'')+' – '+s.title)+'</td><td>'+crPill(s)+'</td><td><a class="btn sm" href="#/sub/'+s.id+'">Open</a></td></tr>';}).join('')+'</table></div>';
 var i=h.indexOf('<div class="card">');return i>-1?h.slice(0,i)+box+h.slice(i):box+h;};}

/* admin submissions list: show copyright status in the payments list too */
(function(){var c=document.createElement('style');c.textContent='.crcard{border-left:4px solid #0E7C7B}.crtabs{margin:6px 0 10px}.crpane{border:1px solid #d6dde6;border-radius:6px;padding:12px 14px;background:#fbfcfd}.crpad{width:100%;max-width:560px;height:150px;border:1.5px dashed #9fb0c2;border-radius:6px;background:#fff;touch-action:none;cursor:crosshair;display:block}.crmode{float:right;font-weight:normal;text-transform:none;letter-spacing:0}.crmode a.on{font-weight:bold;text-decoration:none;color:#0D2B4E}.crck{display:block;font-size:13.5px;margin:6px 0}.crck input{margin-right:6px}';document.head.appendChild(c);})();
