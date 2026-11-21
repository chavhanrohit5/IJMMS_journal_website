/* ==========================================================================
   Submission form settings (admin): article types, sections, upload slots,
   declarations, author fields, general fields, what is mandatory, and the
   "trouble submitting?" options (e-mail / main manuscript only).
   Stored as one JSON string in settings.formCfg. Shared by IJMMS and IJMLS.
   ========================================================================== */
if(typeof DEFAULTS!=='undefined'&&!('formCfg' in DEFAULTS))DEFAULTS.formCfg='';
function fcClone(o){return JSON.parse(JSON.stringify(o));}
/* built-in defaults: nothing is mandatory until the editor marks it */
var FC_DEF=(function(){var t=fcClone(FTYPES);t.forEach(function(T){T.s.forEach(function(x){x[2]=0;});T.up.forEach(function(x){x[1]=0;});if(T.ab)T.ab.req=0;T.xreq=[];T.dreq=[];T.refsReq=0;T.off=0;});
 return {types:t,up:fcClone(UP),decl:fcClone(DECL),af:AUTH_F.map(function(f){return [f[0],f[1],f[2],0];}),au:{cards:6,min:0},
  g:{title:{l:'Manuscript title',show:1,req:0},branch:{l:'Subject area (branch)',show:1,req:0},kw:{l:'Keywords (comma separated)',show:1,req:0},note:{l:'Cover note to the editor',show:1,req:0},ok:{l:'I confirm the work is original, not under review elsewhere, all authors approve the submission, and the declarations above are true.',show:1,req:0}},
  fb:{on:1,email:'',text:'Having trouble with the online form? You can e-mail your manuscript to the editorial office, or upload only the main manuscript and we will collect the other details later.',quick:1}};})();
var FC=fcClone(FC_DEF),_fcLast=null;
function fmtCfgSync(){var raw=(typeof S!=='undefined'&&S.formCfg)||'';if(raw===_fcLast)return;_fcLast=raw;var c={};try{c=raw?JSON.parse(raw):{};}catch(e){c={};}
 var d=fcClone(FC_DEF);FC={types:c.types||d.types,up:c.up||d.up,decl:c.decl||d.decl,af:c.af||d.af,au:Object.assign(d.au,c.au||{}),g:d.g,fb:Object.assign(d.fb,c.fb||{})};
 Object.keys(c.g||{}).forEach(function(k){if(FC.g[k])Object.assign(FC.g[k],c.g[k]);});
 FC.types.forEach(function(T){T.kw=T.kw||[3,6];T.decl=T.decl||[];T.x=T.x||[];T.up=T.up||[];T.s=T.s||[];T.w=T.w||[0,0];});
 FTYPES=FC.types;UP=FC.up;DECL=FC.decl;AUTH_F=FC.af;
 SUB_TYPES=FTYPES.filter(function(x){return !x.off;}).map(function(x){return x.t;});
 if(typeof TEMPLATES!=='undefined'){FTYPES.forEach(function(x){TEMPLATES[x.t]=x.s.length?x.s.map(function(y){return y[0];}):[''];});if(typeof types!=='undefined')types=Object.keys(TEMPLATES);}
 if(typeof TYPE_ORDER!=='undefined')TYPE_ORDER=FTYPES.map(function(x){return x.t;}).concat(['Editorial','Commentary / Viewpoint']);}
fmtType=function(t){fmtCfgSync();return FTYPES.filter(function(x){return x.t===t;})[0]||FC_DEF.types.filter(function(x){return x.t===t;})[0]||FTYPES[0];};
var _fcRoute=route;route=function(){fmtCfgSync();return _fcRoute.apply(this,arguments);};

/* --------------------------- submit page --------------------------- */
function fcMail(){return FC.fb.email||S.email||'';}
function fcHelpBox(loggedIn){var f=FC.fb;if(!f.on)return '';var em=fcMail();
 return '<div class="card fchelp"><b>Trouble submitting?</b><p>'+esc(f.text)+'</p><p>'
  +(em?'<a class="btn ghost" href="mailto:'+esc(em)+'?subject='+encodeURIComponent('Manuscript submission - '+S.short)+'">E-mail manuscript to '+esc(em)+'</a> ':'')
  +(f.quick?(loggedIn?(/quick/.test(location.hash)?'<a class="btn ghost" href="#/submit">Use the full form</a>':'<a class="btn gold" href="#/submit/quick">Upload main manuscript only</a>'):'<a class="btn gold" href="#/login">Log in to upload the main manuscript only</a>'):'')
  +'</p></div>';}
function fcG(k,inner){var g=FC.g[k];if(!g||!g.show)return '';return inner(g.l+rq(g.req));}
vSubmit=function(){fmtCfgSync();var u=curUser();
 if(!u)return hd('Submit manuscript')+pg('<div class="card">Please <a href="#/login">login</a> or <a href="#/register">register as an author</a> to submit a manuscript. Read the <a href="#/guidelines">author guidelines</a> first.</div>'+fcHelpBox(false));
 if(/^#\/submit\/quick/.test(location.hash)&&FC.fb.quick)return vQuickSubmit(u);
 var t0=SUB_TYPES[0]||(FTYPES[0]||{}).t,n=Math.max(1,+FC.au.cards||1),list=[{name:u.name,email:u.email,inst:u.aff||'',corr:true}];for(var i=1;i<n;i++)list.push({});
 return hd('Submit manuscript','Choose the article type first: the form below changes to the sections, limits and files that type needs.')+pg(fcHelpBox(true)+'<div class="card fmtform">'
  +'<p class="fcleg">Items marked <span class="rq">*</span> are mandatory.</p>'
  +'<div class="row2"><div class="fg"><label>Article type</label><select id="sf-type" data-prev="'+esc(t0)+'">'+opt(SUB_TYPES,t0)+'</select></div>'+fcG('branch',function(l){return '<div class="fg"><label>'+l+'</label><select id="sf-branch">'+(typeof branchOpts==='function'?branchOpts(''):'')+'</select></div>';})+'</div>'
  +fcG('title',function(l){return '<div class="fg"><label>'+l+'</label><input id="sf-title"></div>';})
  +authBlock(list)
  +fcG('kw',function(l){return '<div class="fg"><label>'+l+'</label><input id="sf-kw"></div>';})
  +'<div id="fmt-area">'+fmtForm(t0,{},'new')+'</div>'
  +fcG('note',function(l){return '<div class="fg"><label>'+l+'</label><textarea id="sf-note" rows="3"></textarea></div>';})
  +'<div class="note" id="sf-apc" style="font-size:13px">'+(typeof apcSubNote==='function'?apcSubNote(t0):'')+'</div>'
  +fcG('ok',function(l){return '<label style="display:block;margin:10px 0"><input type="checkbox" id="sf-ok"> '+l+'</label>';})
  +'<button class="btn" data-act="subsubmit">Submit manuscript</button> <span id="sf-prog" style="font-size:13px;color:#5b6b7c"></span></div>');};
/* general and author checks before the existing submit action */
function fcCheckGeneral(){if(isAdmin())return true;var miss=[],v=function(i){var e=$(i);return e?(e.type==='checkbox'?e.checked:e.value.trim()):true;};
 [['title','sf-title'],['branch','sf-branch'],['kw','sf-kw'],['note','sf-note'],['ok','sf-ok']].forEach(function(x){var g=FC.g[x[0]];if(g&&g.show&&g.req&&!v(x[1]))miss.push(x[0]==='ok'?'the confirmation box':g.l);});
 var cards=document.querySelectorAll('#au-list .aucard'),filled=[];cards.forEach(function(c){if(Array.prototype.some.call(c.querySelectorAll('input[data-f]'),function(e){return e.value.trim();}))filled.push(c);});
 if(+FC.au.min&&filled.length<+FC.au.min)miss.push('at least '+FC.au.min+' author(s)');
 var req=AUTH_F.filter(function(f){return f[3];});filled.forEach(function(c){var i=Array.prototype.indexOf.call(cards,c)+1;req.forEach(function(f){var e=c.querySelector('input[data-f="'+f[0]+'"]');if(e&&!e.value.trim())miss.push('Author '+i+': '+f[1]);});});
 if(miss.length){toast('Please complete the mandatory items: '+miss.slice(0,6).join(', ')+(miss.length>6?' ...':''));return false;}return true;}
var _fcSub=ACT.subsubmit;ACT.subsubmit=async function(t){if(!fcCheckGeneral())return;return _fcSub.call(this,t);};

/* quick submission: main manuscript only */
function vQuickSubmit(u){return hd('Submit manuscript','Quick submission: upload the main manuscript only')+pg(fcHelpBox(true)+'<div class="card fmtform">'
 +'<p>Upload your main manuscript file. The editorial office will contact you for the title page, declarations and other files if they are needed.</p>'
 +'<div class="row2"><div class="fg"><label>Article type</label><select id="qs-type">'+opt(SUB_TYPES,SUB_TYPES[0])+'</select></div><div class="fg"><label>Manuscript title</label><input id="qs-title"></div></div>'
 +'<div class="row2"><div class="fg"><label>Your name</label><input id="qs-name" value="'+esc(u.name||'')+'"></div><div class="fg"><label>E-mail</label><input id="qs-email" value="'+esc(u.email||'')+'"></div></div>'
 +'<div class="row2"><div class="fg"><label>Phone</label><input id="qs-phone"></div><div class="fg"><label>Main manuscript (Word or PDF)<span class="rq"> *</span></label><input type="file" id="qs-file" accept=".doc,.docx,.pdf"></div></div>'
 +'<div class="fg"><label>Message to the editor</label><textarea id="qs-note" rows="3"></textarea></div>'
 +'<button class="btn" data-act="qsubmit">Submit</button> <span id="qs-prog" style="font-size:13px;color:#5b6b7c"></span></div>');}
ACT.qsubmit=async function(){var g=function(i){return $(i)?$(i).value.trim():'';},u=curUser(),f=$('qs-file').files[0];
 if(!f){toast('Choose the main manuscript file.');return;}var ext='.'+f.name.split('.').pop().toLowerCase();if(['.doc','.docx','.pdf'].indexOf(ext)<0){toast('Please upload a Word or PDF file.');return;}if(f.size>25*1024*1024){toast('The file is larger than 25 MB. Please e-mail it instead.');return;}
 var id=uid();$('qs-prog').textContent='Uploading...';try{await DB.putFile(fileKey(id),f);}catch(e){$('qs-prog').textContent='';toast('Upload failed: '+e.message+'. You can e-mail the manuscript instead.');return;}
 var nm=g('qs-name')||u.name,em=g('qs-email')||u.email,ph=g('qs-phone');
 var s={id:id,authorId:u.id,authorName:u.name,authorEmail:u.email,title:g('qs-title')||'Untitled manuscript',type:g('qs-type'),branch:'',authorsRaw:nm,corr:nm+', '+em,keywords:[],abstract:'',note:(g('qs-note')+(ph?'\nPhone: '+ph:'')+'\n[Quick submission - main manuscript only]').trim(),status:'Submitted',date:today(),created:Date.now(),hasFile:true,fileName:f.name,history:[{d:today(),t:'Submitted by author (quick submission - main manuscript only)'}]};
 try{await saveSub(s);}catch(e){$('qs-prog').textContent='';toast('Submission failed: '+e.message);return;}
 ensureRef(s);s.history.push({d:today(),t:'Acknowledgement issued ('+s.ref+')'});await saveSub(s);if(typeof mReceived==='function')mReceived(s);
 toast('Received - reference '+s.ref+'.');location.hash='#/sub/'+s.id;};

/* --------------------------- admin: Submission form --------------------------- */
var FCW=null,FCSEL='general';
function fcSet(path,val){var p=path.split('.'),o=FCW;for(var i=0;i<p.length-1;i++)o=o[p[i]];o[p[p.length-1]]=val;}
function fcGet(path){var p=path.split('.'),o=FCW;for(var i=0;i<p.length;i++){if(o==null)return undefined;o=o[p[i]];}return o;}
function fcIn(path,v,ph,cls){return '<input data-fc="'+path+'" value="'+esc(v==null?'':v)+'"'+(ph?' placeholder="'+esc(ph)+'"':'')+(cls?' class="'+cls+'"':'')+'>';}
function fcNum(path,v){return '<input type="number" min="0" data-fc="'+path+'" data-num="1" value="'+esc(v==null?'':v)+'" style="width:90px">';}
function fcTa(path,v,r){return '<textarea data-fc="'+path+'" rows="'+(r||2)+'">'+esc(v||'')+'</textarea>';}
function fcCk(path,v,l){return '<label class="fcck"><input type="checkbox" data-fc="'+path+'" data-ck="1"'+(v?' checked':'')+'> '+(l||'')+'</label>';}
function fcInList(path,arr,key,l){var on=(arr||[]).indexOf(key)>-1;return '<label class="fcck"><input type="checkbox" data-fclist="'+path+'" data-key="'+esc(key)+'"'+(on?' checked':'')+'> '+(l||'')+'</label>';}
function fcRowBtns(path,i){return '<span class="fcrb"><button type="button" class="btn sm ghost" data-act="fcmv" data-p="'+path+'" data-i="'+i+'" data-d="-1" title="Move up">&uarr;</button><button type="button" class="btn sm ghost" data-act="fcmv" data-p="'+path+'" data-i="'+i+'" data-d="1" title="Move down">&darr;</button><button type="button" class="btn sm red" data-act="fcrm" data-p="'+path+'" data-i="'+i+'" title="Delete">&times;</button></span>';}

function fcPanelGeneral(){var h='<h3>General fields</h3><table class="t fct"><tr><th>Field</th><th>Label shown to authors</th><th>Show</th><th>Mandatory</th></tr>';
 [['title','Title'],['branch','Subject area'],['kw','Keywords'],['note','Cover note'],['ok','Confirmation box']].forEach(function(x){var g=FCW.g[x[0]];h+='<tr><td><b>'+x[1]+'</b></td><td>'+(x[0]==='ok'?fcTa('g.ok.l',g.l,2):fcIn('g.'+x[0]+'.l',g.l))+'</td><td>'+fcCk('g.'+x[0]+'.show',g.show)+'</td><td>'+fcCk('g.'+x[0]+'.req',g.req)+'</td></tr>';});
 h+='</table><h3>Authors</h3><div class="row2"><div class="fg"><label>Author boxes shown at the start</label>'+fcNum('au.cards',FCW.au.cards)+'</div><div class="fg"><label>Minimum number of authors (0 = no minimum)</label>'+fcNum('au.min',FCW.au.min)+'</div></div>'
  +'<p class="pg-h">Fields in each author box. Mandatory fields are checked for every author whose box is filled in.</p><table class="t fct"><tr><th>Label</th><th>Example text (placeholder)</th><th>Mandatory</th><th></th></tr>'
  +FCW.af.map(function(f,i){return '<tr><td>'+fcIn('af.'+i+'.1',f[1])+'</td><td>'+fcIn('af.'+i+'.2',f[2])+'</td><td>'+fcCk('af.'+i+'.3',f[3])+'</td><td>'+fcRowBtns('af',i)+'</td></tr>';}).join('')
  +'</table><p><button class="btn sm" data-act="fcadd" data-what="af">+ Add author field</button></p>';
 return h;}
function fcPanelType(i){var T=FCW.types[i],p='types.'+i,custom=!FC_DEF.types.some(function(x){return x.t===T.t;});
 var h='<h3>'+esc(T.t)+(T.off?' <span class="pill dr">hidden</span>':'')+'</h3>'
  +'<div class="row2"><div class="fg"><label>Name of article type</label>'+(custom?fcIn(p+'.t',T.t):'<input value="'+esc(T.t)+'" disabled title="Built-in type names are fixed so that existing submissions keep working">')+'</div><div class="fg"><label>&nbsp;</label>'+fcCk(p+'.off',T.off,'Hide this type from the submission form')+'</div></div>'
  +'<div class="fg"><label>Description shown to authors</label>'+fcTa(p+'.d',T.d,2)+'</div>'
  +'<div class="fcgrid"><div class="fg"><label>Words from</label>'+fcNum(p+'.w.0',T.w[0])+'</div><div class="fg"><label>Words to</label>'+fcNum(p+'.w.1',T.w[1])+'</div><div class="fg"><label>References up to</label>'+fcNum(p+'.refs',T.refs)+'</div><div class="fg"><label>Tables up to</label>'+fcNum(p+'.tab',T.tab)+'</div><div class="fg"><label>Figures up to</label>'+fcNum(p+'.fig',T.fig)+'</div><div class="fg"><label>Keywords from</label>'+fcNum(p+'.kw.0',T.kw[0])+'</div><div class="fg"><label>Keywords to</label>'+fcNum(p+'.kw.1',T.kw[1])+'</div></div>'
  +'<h4>Abstract</h4><div class="fcgrid"><div class="fg"><label>Abstract</label><select data-act-change="fcab" data-i="'+i+'"><option value="none"'+(!T.ab?' selected':'')+'>Not asked</option><option value="plain"'+(T.ab&&!T.ab.h?' selected':'')+'>One paragraph</option><option value="struct"'+(T.ab&&T.ab.h?' selected':'')+'>Structured (with headings)</option></select></div>'
  +(T.ab?'<div class="fg"><label>Word limit</label>'+fcNum(p+'.ab.n',T.ab.n)+'</div><div class="fg"><label>&nbsp;</label>'+fcCk(p+'.ab.req',T.ab.req,'Mandatory')+'</div>':'')+'</div>'
  +(T.ab&&T.ab.h?'<div class="fg"><label>Abstract headings (comma separated)</label><input data-fc="'+p+'.ab.h" data-list="1" value="'+esc(T.ab.h.join(', '))+'"></div>':'')
  +'<h4>Manuscript sections</h4><table class="t fct"><tr><th style="width:32%">Heading</th><th>Guidance for authors</th><th>Mandatory</th><th></th></tr>'
  +T.s.map(function(x,j){return '<tr><td>'+fcIn(p+'.s.'+j+'.0',x[0])+'</td><td>'+fcTa(p+'.s.'+j+'.1',x[1],2)+'</td><td>'+fcCk(p+'.s.'+j+'.2',x[2])+'</td><td>'+fcRowBtns(p+'.s',j)+'</td></tr>';}).join('')
  +'</table><p><button class="btn sm" data-act="fcadd" data-what="sec" data-i="'+i+'">+ Add section</button> '+(T.s.length?fcCk(p+'.refsReq',T.refsReq,'References mandatory'):'')+'</p>'
  +'<h4>Files to upload</h4><table class="t fct"><tr><th style="width:30%">File</th><th>Label shown (blank = library name)</th><th>Mandatory</th><th></th></tr>'
  +T.up.map(function(x,j){return '<tr><td><select data-fc="'+p+'.up.'+j+'.0">'+Object.keys(FCW.up).map(function(k){return '<option value="'+esc(k)+'"'+(k===x[0]?' selected':'')+'>'+esc(FCW.up[k].l)+'</option>';}).join('')+(FCW.up[x[0]]?'':'<option selected value="'+esc(x[0])+'">(deleted file type)</option>')+'</select></td><td>'+fcIn(p+'.up.'+j+'.2',x[2]||'',(FCW.up[x[0]]||{}).l)+'</td><td>'+fcCk(p+'.up.'+j+'.1',x[1])+'</td><td>'+fcRowBtns(p+'.up',j)+'</td></tr>';}).join('')
  +'</table><p><button class="btn sm" data-act="fcadd" data-what="up" data-i="'+i+'">+ Add upload</button> <span class="pg-h">New kinds of file can be created under "Upload &amp; declaration library".</span></p>'
  +'<h4>Extra fields</h4><table class="t fct"><tr><th>Field</th><th>Ask</th><th>Mandatory</th></tr>'+Object.keys(XF).map(function(k){return '<tr><td>'+esc(XF[k][0])+'</td><td>'+fcInList(p+'.x',T.x,k)+'</td><td>'+fcInList(p+'.xreq',T.xreq,k)+'</td></tr>';}).join('')
  +'<tr><td>Conference details (for conference abstracts)</td><td>'+fcInList(p+'.x',T.x,'confDetails')+'</td><td></td></tr><tr><td>Patient consent confirmation tick-box</td><td>'+fcInList(p+'.x',T.x,'consentOk')+'</td><td></td></tr><tr><td>"Presented at a conference" option</td><td>'+fcCk(p+'.nopres',T.nopres,'Hide')+'</td><td></td></tr></table>'
  +'<h4>Declarations</h4><table class="t fct"><tr><th>Declaration</th><th>Ask</th><th>Mandatory</th></tr>'+Object.keys(FCW.decl).map(function(k){return '<tr><td>'+esc(FCW.decl[k][0])+'</td><td>'+fcInList(p+'.decl',T.decl,k)+'</td><td>'+fcInList(p+'.dreq',T.dreq,k)+'</td></tr>';}).join('')+'</table>'
  +'<div class="fcgrid2"><div class="fg"><label>Reporting guideline (shown to authors)</label>'+fcTa(p+'.rg',T.rg,2)+'</div><div class="fg"><label>Ethics requirements (Author Guidelines)</label>'+fcTa(p+'.eth',T.eth,2)+'</div></div>'
  +'<p class="fcdanger"><button class="btn sm ghost" data-act="fccopy" data-i="'+i+'">Make a new type from this one</button> <button class="btn sm red" data-act="fcdeltype" data-i="'+i+'">Delete this article type</button></p>';
 return h;}
function fcPanelLib(){var h='<h3>Upload library</h3><p class="pg-h">Kinds of file that article types can ask for. Accepted types: comma separated extensions, e.g. .pdf,.docx,.jpg</p><table class="t fct"><tr><th>Name</th><th>Accepted files</th><th>Several files</th><th>Guidance</th><th></th></tr>';
 Object.keys(FCW.up).forEach(function(k){var u=FCW.up[k],b=!!FC_DEF.up[k];h+='<tr><td>'+fcIn('up.'+k+'.l',u.l)+'</td><td>'+fcIn('up.'+k+'.acc',u.acc)+'</td><td>'+fcCk('up.'+k+'.m',u.m)+'</td><td>'+fcTa('up.'+k+'.h',u.h,2)+'</td><td>'+(b?'':'<button type="button" class="btn sm red" data-act="fcdellib" data-lib="up" data-k="'+esc(k)+'" title="Delete">&times;</button>')+'</td></tr>';});
 h+='</table><p><button class="btn sm" data-act="fcadd" data-what="lib-up">+ New kind of upload</button></p><h3>Declaration library</h3><table class="t fct"><tr><th>Name</th><th>Hint</th><th>Standard wording</th><th></th></tr>';
 Object.keys(FCW.decl).forEach(function(k){var d=FCW.decl[k],b=!!FC_DEF.decl[k];h+='<tr><td>'+fcIn('decl.'+k+'.0',d[0])+'</td><td>'+fcTa('decl.'+k+'.1',d[1],2)+'</td><td>'+fcTa('decl.'+k+'.2',d[2],3)+'</td><td>'+(b?'':'<button type="button" class="btn sm red" data-act="fcdellib" data-lib="decl" data-k="'+esc(k)+'" title="Delete">&times;</button>')+'</td></tr>';});
 return h+'</table><p><button class="btn sm" data-act="fcadd" data-what="lib-decl">+ New declaration</button></p>';}
function fcPanelHelp(){var f=FCW.fb;return '<h3>If an author cannot submit</h3>'+fcCk('fb.on',f.on,'Show the "Trouble submitting?" box on the submission page')
 +'<div class="fg"><label>Message</label>'+fcTa('fb.text',f.text,3)+'</div><div class="fg"><label>E-mail address for manuscripts (blank = journal e-mail '+esc(S.email||'')+')</label>'+fcIn('fb.email',f.email,S.email)+'</div>'
 +fcCk('fb.quick',f.quick,'Offer "Upload main manuscript only" (quick submission with just the main file)');}
function fcMenu(){var it=[['general','General fields &amp; authors']].concat(FCW.types.map(function(T,i){return ['type:'+i,esc(T.t)+(T.off?' (hidden)':'')];})).concat([['lib','Upload &amp; declaration library'],['help','Trouble submitting options']]);
 return '<div class="fcmenu">'+it.map(function(x){return '<a href="#" data-fcsel="'+x[0]+'" class="'+(FCSEL===x[0]?'on':'')+'">'+x[1]+'</a>';}).join('')+'<a href="#" data-act="fcnewtype" class="fcnew">+ New article type</a></div>';}
function fcPanel(){var m=FCSEL.match(/^type:(\d+)$/);if(m&&FCW.types[+m[1]])return fcPanelType(+m[1]);if(FCSEL==='lib')return fcPanelLib();if(FCSEL==='help')return fcPanelHelp();FCSEL='general';return fcPanelGeneral();}
function fcRender(){var b=$('fc-body');if(b)b.innerHTML='<div class="fclay">'+fcMenu()+'<div id="fc-panel">'+fcPanel()+'</div></div>';fcDirty(window.__fcDirty);}
function fcDirty(on){window.__fcDirty=!!on;var e=$('fc-state');if(e)e.textContent=on?'Unsaved changes':'';}
function vFormCfg(){fmtCfgSync();if(!FCW)FCW=fcClone(FC);
 return '<div class="card"><h3 style="margin-top:0">Submission form</h3><p class="pg-h">Choose what authors see when they submit to '+esc(S.short)+': article types, sections, files, declarations, author details, and which items are mandatory. Changes apply to the submission page, the editor\'s view of submissions and the Author Guidelines after you save.</p>'
  +'<p class="fcbar"><button class="btn teal" data-act="fcsave">Save changes</button> <button class="btn ghost" data-act="fcundo">Discard changes</button> <a class="btn ghost" href="#/submit" target="_blank">Preview submission page</a> <button class="btn sm red" data-act="fcreset" style="float:right">Reset everything to the original form</button> <span id="fc-state" class="fcstate"></span></p>'
  +'<div id="fc-body"><div class="fclay">'+fcMenu()+'<div id="fc-panel">'+fcPanel()+'</div></div></div></div>';}
function fcMove(arr,i,d){var j=i+d;if(j<0||j>=arr.length)return;var x=arr[i];arr[i]=arr[j];arr[j]=x;}
function fcSlug(s){return String(s).toLowerCase().replace(/[^a-z0-9]+/g,'').slice(0,20)||'item';}
function fcUniq(obj,base){var k=base,n=2;while(obj[k])k=base+n++;return k;}
Object.assign(ACT,{
 fcmv:function(t){fcMove(fcGet(t.dataset.p),+t.dataset.i,+t.dataset.d);fcDirty(1);fcRender();},
 fcrm:function(t){var a=fcGet(t.dataset.p);if(!confirm('Delete this row?'))return;a.splice(+t.dataset.i,1);fcDirty(1);fcRender();},
 fcadd:function(t){var w=t.dataset.what,i=+t.dataset.i;
  if(w==='af'){var k=fcUniq(FCW.af.reduce(function(o,f){o[f[0]]=1;return o;},{}),'extra');FCW.af.push([k,'New field','',0]);}
  else if(w==='sec')FCW.types[i].s.push(['New section','What authors should write here.',0]);
  else if(w==='up')FCW.types[i].up.push([Object.keys(FCW.up)[0],0]);
  else if(w==='lib-up'){var n=prompt('Name of the new kind of upload (e.g. "Plagiarism report")');if(!n)return;FCW.up[fcUniq(FCW.up,'c_'+fcSlug(n))]={l:n,acc:'.pdf,.doc,.docx,.jpg,.jpeg,.png',h:''};}
  else if(w==='lib-decl'){var d=prompt('Name of the new declaration (e.g. "Clinical trial registration")');if(!d)return;FCW.decl[fcUniq(FCW.decl,'c_'+fcSlug(d))]=[d,'',''];}
  fcDirty(1);fcRender();},
 fcdellib:function(t){var lib=t.dataset.lib,k=t.dataset.k;if(!confirm('Delete "'+(lib==='up'?FCW.up[k].l:FCW.decl[k][0])+'" from the library and from every article type?'))return;delete FCW[lib][k];
  FCW.types.forEach(function(T){if(lib==='up')T.up=T.up.filter(function(x){return x[0]!==k;});else{T.decl=T.decl.filter(function(x){return x!==k;});T.dreq=(T.dreq||[]).filter(function(x){return x!==k;});}});fcDirty(1);fcRender();},
 fcnewtype:function(){var n=prompt('Name of the new article type');if(!n)return;n=n.trim();if(FCW.types.some(function(x){return x.t===n;})){toast('That type already exists.');return;}
  FCW.types.push({t:n,d:'',w:[1000,3000],ab:{n:250,req:0},kw:[3,6],refs:30,tab:3,fig:3,s:[['Introduction','',0],['Main Text','',0],['Conclusion','',0]],up:[['manuscript',0],['titlepage',0]],x:[],xreq:[],decl:['funding','coi'],dreq:[],rg:'',eth:'',off:0});FCSEL='type:'+(FCW.types.length-1);fcDirty(1);fcRender();},
 fccopy:function(t){var T=FCW.types[+t.dataset.i],n=prompt('Name of the new article type',T.t+' (copy)');if(!n)return;n=n.trim();if(FCW.types.some(function(x){return x.t===n;})){toast('That type already exists.');return;}var c=fcClone(T);c.t=n;c.off=0;FCW.types.push(c);FCSEL='type:'+(FCW.types.length-1);fcDirty(1);fcRender();},
 fcdeltype:function(t){var i=+t.dataset.i,T=FCW.types[i];if(FCW.types.length<2){toast('At least one article type is needed.');return;}
  var used=(typeof SUBS!=='undefined'?SUBS:[]).filter(function(s){return s.type===T.t;}).length;
  if(!confirm('Delete the article type "'+T.t+'"?'+(used?'\n\n'+used+' existing submission(s) use this type. They are kept, but authors can no longer choose it. (To hide it for now instead, use "Hide this type".)':'')))return;FCW.types.splice(i,1);FCSEL='general';fcDirty(1);fcRender();},
 fcsave:function(){var bad=FCW.types.filter(function(T){return !String(T.t||'').trim();});if(bad.length){toast('Every article type needs a name.');return;}
  var names={};if(FCW.types.some(function(T){var d=names[T.t];names[T.t]=1;return d;})){toast('Two article types have the same name.');return;}
  FCW.af=FCW.af.filter(function(f){return String(f[1]).trim();});
  S.formCfg=JSON.stringify(FCW);saveSettings();_fcLast=null;fmtCfgSync();FCW=fcClone(FC);fcDirty(0);fcRender();toast('Submission form saved.');},
 fcundo:function(){FCW=fcClone(FC);fcDirty(0);fcRender();toast('Changes discarded.');},
 fcreset:function(){if(!confirm('Reset the whole submission form to the original settings? All your changes to types, sections, uploads, author fields and mandatory items will be lost.'))return;S.formCfg='';saveSettings();_fcLast=null;fmtCfgSync();FCW=fcClone(FC);FCSEL='general';fcDirty(0);fcRender();toast('Submission form reset.');}
});
document.addEventListener('input',function(e){var t=e.target;if(!t.dataset||!t.dataset.fc||!FCW)return;fcInput(t);});
document.addEventListener('change',function(e){var t=e.target;if(!t.dataset||!FCW)return;
 if(t.dataset.fc){fcInput(t);if(t.tagName==='SELECT'||t.dataset.ck){if(/\.off$/.test(t.dataset.fc))fcRender();}}
 else if(t.dataset.fclist){var a=fcGet(t.dataset.fclist);if(!a){a=[];fcSet(t.dataset.fclist,a);}var k=t.dataset.key,ix=a.indexOf(k);if(t.checked&&ix<0)a.push(k);if(!t.checked&&ix>-1)a.splice(ix,1);
  if(/\.(xreq|dreq)$/.test(t.dataset.fclist)&&t.checked){var askP=t.dataset.fclist.replace(/\.xreq$/,'.x').replace(/\.dreq$/,'.decl'),ask=fcGet(askP);if(ask.indexOf(k)<0){ask.push(k);fcRender();}}
  if(/\.(x|decl)$/.test(t.dataset.fclist)&&!t.checked){var rp=t.dataset.fclist.replace(/\.x$/,'.xreq').replace(/\.decl$/,'.dreq'),r=fcGet(rp)||[];if(r.indexOf(k)>-1){r.splice(r.indexOf(k),1);fcRender();}}
  fcDirty(1);}
 else if(t.dataset.actChange==='fcab'){var T=FCW.types[+t.dataset.i];T.ab=t.value==='none'?null:t.value==='plain'?{n:(T.ab&&T.ab.n)||250,req:(T.ab&&T.ab.req)||0}:{n:(T.ab&&T.ab.n)||250,req:(T.ab&&T.ab.req)||0,h:(T.ab&&T.ab.h)||['Background','Methods','Results','Conclusions']};fcDirty(1);fcRender();}});
function fcInput(t){var v;if(t.dataset.ck)v=t.checked?1:0;else if(t.dataset.num)v=t.value===''?0:Math.max(0,+t.value||0);else if(t.dataset.list)v=t.value.split(',').map(function(x){return x.trim();}).filter(Boolean);else v=t.value;fcSet(t.dataset.fc,v);fcDirty(1);}
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('[data-fcsel]');if(!a)return;e.preventDefault();FCSEL=a.dataset.fcsel;fcRender();var p=$('fc-panel');if(p&&p.getBoundingClientRect().top<0)p.scrollIntoView();});
window.addEventListener('beforeunload',function(e){if(window.__fcDirty&&/admin\/form/.test(location.hash)){e.preventDefault();e.returnValue='';}});

var _fcAM=adminMenu;adminMenu=function(sub){var h=_fcAM(sub);if(!isFullAdmin())return h;var i=h.lastIndexOf('</div>');return h.slice(0,i)+'<a href="#/admin/form" class="'+(sub==='form'?'on':'')+'">Submission form</a>'+h.slice(i);};
var _fcVA=vAdmin;vAdmin=function(p){if(p[1]==='form'&&isFullAdmin())return hd('Admin panel','Submission form settings')+pg('<div class="adm">'+adminMenu('form')+'<div>'+vFormCfg()+'</div></div>');return _fcVA(p);};

/* quick submissions: tell the editor in the content card */
var _fcFV=fmtView;fmtView=function(s){var h=_fcFV(s);if(!s.fmt&&/Quick submission/.test(s.note||''))h=h.replace('This manuscript was submitted with the earlier form (abstract and file only).','This is a quick submission: the author uploaded only the main manuscript.');return h;};

(function(){var c=document.createElement('style');c.textContent='.rq{color:#b42318;font-weight:bold}.fcleg{font-size:12.5px;color:#5b6b7c;margin:0 0 8px}.fchelp{border-left:4px solid var(--gold,#B8860B);background:#fffaf0}.fchelp p{margin:6px 0}'
 +'.fclay{display:grid;grid-template-columns:210px 1fr;gap:18px;align-items:start}.fcmenu{display:flex;flex-direction:column;border:1px solid #d6dde6;border-radius:6px;overflow:hidden;position:sticky;top:10px}.fcmenu a{padding:8px 11px;font-size:13px;border-bottom:1px solid #e6ebf0;color:#1c2733;text-decoration:none}.fcmenu a.on{background:var(--navy,#0D2B4E);color:#fff}.fcmenu a.fcnew{color:var(--teal,#0E7C7B);font-weight:bold;border-bottom:0}'
 +'.fct td,.fct th{vertical-align:top}.fct input,.fct textarea,.fct select{width:100%;box-sizing:border-box;font-size:13px}.fct textarea{min-height:38px;font-family:inherit;line-height:1.35}.fcbar .btn{margin-bottom:4px}.fcck{display:inline-flex;align-items:center;gap:5px;font-size:13px;white-space:nowrap}.fcck input{width:auto!important}.fcrb{white-space:nowrap}.fcrb .btn{padding:3px 7px}'
 +'.fcgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:4px 12px}.fcgrid2{display:grid;grid-template-columns:1fr 1fr;gap:12px}.fcbar{border-bottom:1px solid #e6ebf0;padding-bottom:10px}.fcstate{color:#b42318;font-size:13px;margin-left:8px}.fcdanger{margin-top:18px;padding-top:10px;border-top:1px solid #e6ebf0}'
 +'@media(max-width:800px){.fclay{grid-template-columns:1fr}.fcmenu{position:static}.fcgrid2{grid-template-columns:1fr}}';document.head.appendChild(c);})();

/* DOI options in Settings */
if(typeof vSettings==='function'){var _dVS=vSettings;vSettings=function(){var h=_dVS();return h.replace('<button class="btn teal" data-act="savesettings">','<div class="fg"><label class="ck"><input type="checkbox" id="s-doiAuto"'+(S.doiAuto?' checked':'')+'> Give DOIs automatically to articles imported from a CSV file</label><div class="pg-h" style="font-size:12.5px">DOIs are otherwise added only by the editor: type one in the article editor (or use "Suggest"), or use "Assign DOIs" for an issue. Each article has its own "Include DOI" switch. Articles with that switch off are skipped by "Assign DOIs".</div></div><button class="btn teal" data-act="savesettings">');};
 var _dSave=ACT.savesettings;ACT.savesettings=function(t){var e=$('s-doiAuto');if(e)S.doiAuto=e.checked;return _dSave(t);};}
