/* ========== LOGIN ========== */

/* ========== ADMIN ========== */
var TEMPLATES={'Original Research':['Introduction','Materials and Methods','Results','Discussion','Conclusion'],'Systematic Review / Meta-analysis':['Introduction','Methods','Results','Discussion','Conclusion'],'Review Article':['Introduction','Main Text','Conclusion'],'Case Report':['Introduction','Case Presentation','Discussion','Conclusion'],'Short Communication':['Introduction','Methods','Results and Discussion','Conclusion'],'Letter to Editor':['']};
var EDIT={id:null,figs:[],pdfBlob:null,pdfName:'',hasPdf:false,removePdf:false};

function secRow(h,t){return '<div class="secrow"><div class="top"><input class="sh" placeholder="Section heading" value="'+esc(h)+'"><button class="btn sm ghost" data-act="secup" type="button">&uarr;</button><button class="btn sm ghost" data-act="secdn" type="button">&darr;</button><button class="btn sm red" data-act="secrm" type="button">&times;</button></div><textarea class="st" rows="8" placeholder="Section text. Blank line = new paragraph.">'+esc(t)+'</textarea></div>';}
function figList(){return EDIT.figs.map(function(f,i){return '<div class="figrow"><img src="'+f.data+'" alt=""><div style="flex:1"><b>Figure '+(i+1)+'</b> - put <code>{{fig '+(i+1)+'}}</code> on its own line in a section to place it<br><input class="figcap" placeholder="Caption" value="'+esc(f.caption||'')+'"></div><button class="btn sm red" type="button" data-act="figrm" data-id="'+i+'">&times;</button></div>';}).join('');}
function opt(list,sel){return list.map(function(x){return '<option'+(x===sel?' selected':'')+'>'+esc(x)+'</option>';}).join('');}
function vEditor(id){var a=id?findArt(id):null;if(id&&!a)return '<div class="card">Article not found.</div>';
 EDIT={id:a?a.id:null,figs:a?(a.figures||[]).map(function(f){return {data:f.data,caption:f.caption};}):[],pdfBlob:null,pdfName:a?(a.pdfName||''):'',hasPdf:!!(a&&a.hasPdf),removePdf:false};
 var li=newIssueDefault()||latestIssue();var d=a||{type:'Original Research',title:'',authorsRaw:'',corr:'',keywords:[],abstract:'',sections:(TEMPLATES['Original Research']).map(function(h){return {heading:h,text:''};}),refs:'',ack:'',funding:'',coi:'',ethics:'',data:'',vol:li?li.vol:1,issue:li?li.issue:1,year:li?li.year:new Date().getFullYear(),period:li?li.period:'',pages:'',artno:'',doi:'',received:'',accepted:'',published:today(),license:S.license,status:'draft'};
 var types=Object.keys(TEMPLATES);
 var v=function(i,l,val,ph){return '<div class="fg"><label>'+l+'</label><input id="'+i+'" value="'+esc(val)+'" placeholder="'+esc(ph||'')+'"></div>';};
 var ta=function(i,l,val,ph,r){return '<div class="fg"><label>'+l+'</label><textarea id="'+i+'" rows="'+(r||3)+'" placeholder="'+esc(ph||'')+'">'+esc(val)+'</textarea></div>';};
 return '<div class="card"><h3>'+(a?'Edit article':'New article')+'</h3>'
 +'<div class="note">Formatting in text boxes: blank line = paragraph; <code>**bold**</code> <code>*italic*</code> <code>x^2^</code> <code>H~2~O</code>; lines starting with <code>- </code> make a list; <code>### Subheading</code>; table = lines starting with <code>|</code> (first row is header); <code>{{fig 1}}</code> places a figure.</div>'
 +'<div class="row2"><div class="fg"><label>Article type</label><select id="f-type">'+opt(types,d.type)+'</select></div>'+v('f-title','Title',d.title,'Full article title')+'</div><div class="fg"><label>Subject area (medical / life sciences)</label><select id="f-branch">'+branchOpts(d.branch)+'</select></div>'
 +ta('f-authors','Authors * (one per line: Name | Affiliation | ORCID optional)',d.authorsRaw,'Amit Sharma | Department of Surgery, AIIMS, New Delhi, India\nPriya Rao | Department of Pharmacology, Yash Institute of Pharmacy, India',4)
 +v('f-corr','Corresponding author (name, email)',d.corr,'Amit Sharma, amit@example.com')
 +v('f-kw','Keywords (comma separated)',(d.keywords||[]).join(', '),'')
 +'<div class="fg"><label>Abstract * <button class="btn sm ghost" type="button" data-act="abstmpl">Insert structured template</button></label><textarea id="f-abs" rows="9">'+esc(d.abstract)+'</textarea></div>'
 +'<h4>Main text sections <button class="btn sm ghost" type="button" data-act="tmpl">Load template for type</button> <button class="btn sm ghost" type="button" data-act="addsec">+ Add section</button></h4><div id="secs">'+(d.sections||[]).map(function(s){return secRow(s.heading,s.text);}).join('')+'</div>'
 +'<h4>Figures</h4><div id="figlist">'+figList()+'</div><div class="fg"><input type="file" id="f-figfiles" accept="image/*" multiple><small>PNG/JPG, auto-resized to max 1600 px wide.</small></div>'
 +ta('f-refs','References (one per line; numbering added automatically; Vancouver style)',d.refs,'',8)
 +'<div class="row2">'+ta('f-ack','Acknowledgements',d.ack)+ta('f-fund','Funding',d.funding)+ta('f-coi','Conflict of interest',d.coi)+ta('f-eth','Ethics approval / consent',d.ethics)+'</div>'+ta('f-data','Data availability',d.data)
 +'<h4>Issue and publication details</h4><div class="row4">'+v('f-vol','Volume',d.vol)+v('f-issue','Issue',d.issue)+v('f-year','Year',d.year)+v('f-period','Issue period',d.period,'Nov-Dec 2026')+'</div>'
 +'<div class="row4">'+v('f-pages','Pages',d.pages,'1-12')+v('f-artno','Article no.',d.artno,'e101')+'<div class="fg"><label>DOI <button class="btn sm ghost" type="button" data-act="doi">Suggest</button></label><input id="f-doi" value="'+esc(d.doi||d.doiHold||'')+'" placeholder="Leave blank for no DOI"><label class="ck" style="font-size:12.5px;margin-top:4px"><input type="checkbox" id="f-doion"'+(d.noDoi?'':' checked')+'> Include DOI in this article and its PDF</label></div><div class="fg"><label>License</label><select id="f-lic">'+opt(['CC BY 4.0','CC BY-NC 4.0','CC BY-NC-ND 4.0','CC BY-SA 4.0'],d.license)+'</select></div></div>'
 +'<div class="row3"><div class="fg"><label>Received</label><input type="date" id="f-rec" value="'+esc(d.received)+'"></div><div class="fg"><label>Accepted</label><input type="date" id="f-acc" value="'+esc(d.accepted)+'"></div><div class="fg"><label>Published (backdating allowed)</label><input type="date" id="f-pub" value="'+esc(d.published)+'"></div></div>'
 +'<div class="fg"><label>Ready-made PDF (optional - overrides generated PDF on the public page)</label><input type="file" id="f-pdf" accept="application/pdf"><small id="pdfinfo">'+(EDIT.hasPdf?'Current: '+esc(EDIT.pdfName)+' <label style="display:inline"><input type="checkbox" id="f-rmpdf" style="width:auto"> remove</label>':'None attached')+'</small></div>'
 +'<p><button class="btn teal" data-act="publish">Publish now</button> <button class="btn gold" data-act="draft">Save draft</button> <button class="btn ghost" data-act="prev">Preview journal PDF</button> <a class="btn ghost" href="#/admin">Cancel</a></p></div>';}

function collect(status){var g=function(i){var e=$(i);return e?e.value.trim():'';};var old=EDIT.id?findArt(EDIT.id):null;
 var a={id:EDIT.id||uid(),type:g('f-type'),branch:g('f-branch'),title:g('f-title'),authorsRaw:$('f-authors').value.trim(),corr:g('f-corr'),keywords:g('f-kw').split(/[,;]/).map(function(x){return x.trim();}).filter(Boolean),abstract:$('f-abs').value.trim(),sections:[],figures:[],refs:$('f-refs').value.trim(),ack:g('f-ack'),funding:g('f-fund'),coi:g('f-coi'),ethics:g('f-eth'),data:g('f-data'),vol:parseInt(g('f-vol'),10)||1,issue:parseInt(g('f-issue'),10)||1,year:parseInt(g('f-year'),10)||new Date().getFullYear(),period:g('f-period'),pages:g('f-pages'),artno:g('f-artno'),doi:($('f-doion')&&!$('f-doion').checked)?'':g('f-doi'),doiHold:($('f-doion')&&!$('f-doion').checked)?g('f-doi'):'',noDoi:!!($('f-doion')&&!$('f-doion').checked),received:g('f-rec'),accepted:g('f-acc'),published:g('f-pub')||today(),license:g('f-lic'),status:status,views:old?old.views||0:0,downloads:old?old.downloads||0:0,created:old?old.created:Date.now(),hasPdf:EDIT.hasPdf,pdfName:EDIT.pdfName,seq:old?old.seq||0:0,subId:old?(old.subId||''):''};
 if(!a.period)a.period=periodOf(a.year,a.issue);
 document.querySelectorAll('#secs .secrow').forEach(function(r){var h=r.querySelector('.sh').value.trim(),t=r.querySelector('.st').value.trim();if(h||t)a.sections.push({heading:h,text:t});});
 var caps=document.querySelectorAll('#figlist .figcap');EDIT.figs.forEach(function(f,i){a.figures.push({data:f.data,caption:caps[i]?caps[i].value.trim():f.caption||''});});
 return a;}
async function saveFromForm(status){var a=collect(status);
 if(a.doi&&doiTaken(a.doi,a.id)){toast('This DOI is already used by another article.');return;}
 if(status==='published'){if(!a.title){toast('Title is required.');return;}if(!parseAuthors(a.authorsRaw).length){toast('Add at least one author.');return;}if(!a.abstract&&!a.sections.length&&!(EDIT.pdfBlob||EDIT.hasPdf)){toast('Add an abstract, text or a PDF.');return;}}
 else if(!a.title){toast('Title is required.');return;}
 var rm=$('f-rmpdf');if(rm&&rm.checked){EDIT.removePdf=true;}
 try{if(EDIT.pdfBlob){await DB.putFile(a.id,EDIT.pdfBlob);a.hasPdf=true;a.pdfName=EDIT.pdfName;}else if(EDIT.removePdf){await DB.delFile(a.id);a.hasPdf=false;a.pdfName='';}
  await saveArt(a);}catch(e){toast('Save failed: '+e.message);return;}
 toast(status==='published'?'Published.':'Draft saved.');location.hash=status==='published'?'#/article/'+a.id:'#/admin';}

/* ---------- settings / backup ---------- */
function vSettings(){var f=function(i,l,v){return '<div class="fg"><label>'+l+'</label><input id="s-'+i+'" value="'+esc(v)+'"></div>';};
 return '<div class="card"><h3>Journal settings</h3><div class="note">Only enter ISSN, indexing and accreditation details that are factually true for your journal - they are shown publicly and printed on every PDF.</div><div class="row2">'+f('name','Journal name',S.name)+f('abbr','Abbreviation',S.abbr)+f('short','Short name',S.short)+f('publisher','Publisher',S.publisher)+f('issnP','Print ISSN',S.issnP)+f('issnO','Online ISSN',S.issnO)+f('doiPrefix','DOI prefix',S.doiPrefix)+f('freq','Frequency',S.freq)+f('email','Editorial email',S.email)+f('address','Address',S.address)+f('license','Default license',S.license)+f('tagline','Tagline',S.tagline)+'</div><div class="fg"><label>About the journal</label><textarea id="s-about" rows="6">'+esc(S.about)+'</textarea></div><div class="fg"><label>Indexed in (one per line - shown on About page; leave blank if none)</label><textarea id="s-indexed" rows="4">'+esc(S.indexed)+'</textarea></div><div class="fg"><label>New admin password (leave blank to keep)</label><input type="password" id="s-pw"></div><button class="btn teal" data-act="savesettings">Save settings</button></div>';}
function vBackup(){return '<div class="card"><h3>Backup and import</h3><p>Articles are stored in this browser. Export a backup regularly and use it to move the site to another browser or computer.</p><p><button class="btn" data-act="export">Export backup (JSON)</button></p><div class="fg"><label>Import backup</label><input type="file" id="f-import" accept="application/json"></div><button class="btn gold" data-act="import">Import</button> <button class="btn red" data-act="wipe">Delete all articles</button></div>';}
function blobToDataURL(b){return new Promise(function(res,rej){var r=new FileReader();r.onload=function(){res(r.result);};r.onerror=rej;r.readAsDataURL(b);});}
function download(blob,name){var u=URL.createObjectURL(blob);var a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){a.remove();URL.revokeObjectURL(u);},1500);}
function resizeImage(file,maxW){return new Promise(function(res,rej){var r=new FileReader();r.onload=function(){var im=new Image();im.onload=function(){var w=im.width,h=im.height;if(w>maxW){h=Math.round(h*maxW/w);w=maxW;}var c=document.createElement('canvas');c.width=w;c.height=h;var x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,w,h);x.drawImage(im,0,0,w,h);res(c.toDataURL('image/jpeg',0.86));};im.onerror=rej;im.src=r.result;};r.onerror=rej;r.readAsDataURL(file);});}

/* ========== JOURNAL-FORMAT PDF (print layout) ========== */
function cssStr(s){return '"'+String(s).replace(/\\/g,'\\\\').replace(/"/g,'\\"').replace(/\s+/g,' ')+'"';}
function printHTML(a){
 var au=parseAuthors(a.authorsRaw),affs=[];au.forEach(function(x){if(x.aff&&affs.indexOf(x.aff)<0)affs.push(x.aff);});
 var al=au.map(function(x){var s=esc(x.name),sp=[];if(x.aff)sp.push(affs.indexOf(x.aff)+1);if(a.corr&&a.corr.toLowerCase().indexOf(x.name.toLowerCase())>-1)sp.push('*');return s+(sp.length?'<sup>'+sp.join(',')+'</sup>':'');}).join(', ');
 var cite=a.year+';'+a.vol+'('+a.issue+')'+(a.pages?':'+a.pages:'');
 var rl=S.abbr+' '+cite;var rr=shortAuth(a)+' - '+(a.title.length>70?a.title.slice(0,67)+'...':a.title);
 var fl='© '+a.year+' '+S.publisher+' · '+(a.license||S.license)+(a.doi?' · doi:'+a.doi:'');
 var css=['@page{size:A4;margin:21mm 15mm 19mm 15mm;',
 '@top-left{content:'+cssStr(rl)+';font:7.5pt Arial,sans-serif;color:#666;vertical-align:bottom;padding-bottom:3mm}',
 '@top-right{content:'+cssStr(rr)+';font:7.5pt Arial,sans-serif;color:#666;vertical-align:bottom;padding-bottom:3mm;text-align:right}',
 '@bottom-left{content:'+cssStr(fl)+';font:7.5pt Arial,sans-serif;color:#666;vertical-align:top;padding-top:3mm}',
 '@bottom-right{content:"Page " counter(page) " of " counter(pages);font:7.5pt Arial,sans-serif;color:#666;vertical-align:top;padding-top:3mm}}',
 '@page :first{@top-left{content:none}@top-right{content:none}}',
 '*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}',
 'body{font:9.6pt/1.4 "Times New Roman",Georgia,serif;color:#111;margin:0}',
 '.toolbar{position:sticky;top:0;background:#0D2B4E;color:#fff;padding:9px 14px;font:13px Arial,sans-serif;display:flex;gap:14px;align-items:center;margin:-12mm -15mm 10mm}',
 '.toolbar button{background:#B8860B;color:#fff;border:0;padding:8px 16px;font-weight:700;cursor:pointer;border-radius:3px}',
 '@media screen{html{background:#d7dce2}body{max-width:210mm;margin:0 auto;padding:12mm 15mm;background:#fff;box-shadow:0 0 14px rgba(0,0,0,.25)}}',
 '@media print{.toolbar{display:none}}',
 '.mast{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2.4pt solid #0D2B4E;padding-bottom:3mm;margin-bottom:4mm;font-family:Arial,sans-serif}',
 '.jn{font:bold 12.5pt "Times New Roman",serif;color:#0D2B4E}.jm{font-size:7.5pt;color:#555;margin-top:1mm}',
 '.mr{text-align:right;font-size:7.8pt;color:#333;line-height:1.4}.tag{font-weight:bold;color:#9b1c1c;text-transform:uppercase;letter-spacing:.6pt;font-size:8pt}',
 'h1.title{font:bold 19pt/1.2 "Times New Roman",serif;color:#0D2B4E;margin:2mm 0 3mm}',
 '.authors{font-size:10.5pt;margin-bottom:1.5mm}.affs{font:7.8pt/1.35 Arial,sans-serif;color:#333}',
 '.info{display:grid;grid-template-columns:50mm 1fr;gap:6mm;border-top:.7pt solid #888;border-bottom:.7pt solid #888;padding:4mm 0;margin:4mm 0 5mm}',
 '.info .side{font:7.6pt/1.35 Arial,sans-serif;color:#222}.info .side h5{font:bold 7pt Arial,sans-serif;text-transform:uppercase;letter-spacing:.5pt;color:#0E7C7B;margin:0 0 1mm;margin-top:3mm}.info .side h5:first-child{margin-top:0}',
 '.abs{font-size:9pt;line-height:1.38;text-align:justify}.abs h3{font:bold 9pt Arial,sans-serif;text-transform:uppercase;letter-spacing:.6pt;color:#0D2B4E;margin:0 0 1.5mm}.abs p{margin:0 0 1.5mm}',
 '.cols{column-count:2;column-gap:7mm;text-align:justify;hyphens:auto;-webkit-hyphens:auto}',
 '.cols h2{font:bold 10pt Arial,sans-serif;color:#0D2B4E;margin:4mm 0 1.5mm;break-after:avoid;page-break-after:avoid}',
 '.cols h4{font:italic bold 9.6pt "Times New Roman",serif;margin:2mm 0 1mm;break-after:avoid}',
 '.cols p{margin:0 0 1.8mm;orphans:2;widows:2}.cols ul{margin:0 0 2mm;padding-left:5mm}',
 'figure{break-inside:avoid;page-break-inside:avoid;margin:2mm 0;text-align:center}figure img{max-width:100%;max-height:90mm}',
 'figcaption{font:7.8pt/1.3 Arial,sans-serif;text-align:left;margin-top:1mm}',
 'table{width:100%;border-collapse:collapse;font:7.8pt/1.3 Arial,sans-serif;margin:2mm 0;break-inside:avoid;page-break-inside:avoid}',
 'th,td{padding:1mm 1.5mm;text-align:left;border-bottom:.4pt solid #999}th{border-top:.8pt solid #000;border-bottom:.8pt solid #000;background:#eef2f6}',
 '.cols ol{padding-left:5mm;margin:0;font:7.8pt/1.3 Arial,sans-serif;text-align:left}.cols ol li{margin-bottom:.8mm;break-inside:avoid}',
 '.cols sup,.authors sup{font-size:70%;line-height:0}'].join('\n');
 var side='<h5>Article history</h5>'+(a.received?'Received: '+fmtDate(a.received)+'<br>':'')+(a.accepted?'Accepted: '+fmtDate(a.accepted)+'<br>':'')+'Published: '+fmtDate(a.published)
  +((a.keywords||[]).length?'<h5>Keywords</h5>'+a.keywords.map(esc).join('; '):'')
  +'<h5>How to cite</h5>'+esc(vanc(a))
  +(a.corr?'<h5>Correspondence</h5>'+esc(a.corr):'')
  +'<h5>Open access</h5>© '+esc(a.year)+' The authors. Licensed under '+esc(a.license||S.license)+'.';
 var absHtml=a.abstract?'<h3>Abstract</h3>'+fmt(a.abstract,a,{}):'';
 var meta=[];if(S.issnO)meta.push('eISSN '+S.issnO);if(S.issnP)meta.push('pISSN '+S.issnP);
 return '<!DOCTYPE html><html><head><meta charset="utf-8"><title>'+esc(a.title)+'</title><style>'+css+'</style></head><body>'
  +'<div class="toolbar"><button onclick="window.print()">Print / Save as PDF</button><span>Chrome or Edge: Destination = Save as PDF, Paper = A4, Margins = Default, Background graphics = on.</span></div>'
  +'<div class="mast"><div>'+(typeof LOGO_SMALL!=='undefined'?'<img src="'+LOGO_SMALL+'" style="height:34px;display:block;margin-bottom:2px" alt="'+esc(S.name)+'">':'<div class="jn">'+esc(S.name)+'</div>')+'<div class="jm">'+esc(S.publisher)+(meta.length?' · '+esc(meta.join(' · ')):'')+'</div></div><div class="mr"><div class="tag">'+esc(a.type)+'</div><div>Volume '+esc(a.vol)+', Issue '+esc(a.issue)+' · '+esc(a.period||a.year)+'</div>'+(a.doi?'<div>doi:'+esc(a.doi)+'</div>':'')+'</div></div>'
  +'<h1 class="title">'+esc(a.title)+'</h1><div class="authors">'+al+'</div><div class="affs">'+affs.map(function(f,i){return '<sup>'+(i+1)+'</sup>'+esc(f);}).join('<br>')+(a.corr?'<br>*Corresponding author':'')+'</div>'
  +'<div class="info"><div class="side">'+side+'</div><div class="abs">'+absHtml+'</div></div>'
  +'<div class="cols">'+bodyHtml(a)+declHtml(a)+refsHtml(a)+'</div></body></html>';}
function openPrint(a){var u=URL.createObjectURL(new Blob([printHTML(a)],{type:'text/html'}));var w=window.open(u,'_blank');if(!w)toast('Pop-up blocked - allow pop-ups for this page and try again.');}

/* ========== ACTIONS ========== */
var ACT={
 logout:function(){try{sessionStorage.removeItem(JK+'admin');}catch(e){}location.hash='#/home';renderChrome();},
 login:function(){var pw=($('lp')||{value:''}).value;if(cyrb(pw)===S.pwHash){try{sessionStorage.setItem(JK+'admin','1');}catch(e){}toast('Logged in.');location.hash='#/admin';}else toast('Wrong password.');},
 mail:function(){var s=encodeURIComponent($('cs').value||'Enquiry');var b=encodeURIComponent(($('cm').value||'')+'\n\n'+($('cn').value||'')+' <'+($('ce').value||'')+'>');location.href='mailto:'+S.email+'?subject='+s+'&body='+b;},
 pdf:async function(t){var a=findArt(t.dataset.id);if(!a)return;if(a.hasPdf){var b=await DB.getFile(a.id);if(b){a.downloads=(a.downloads||0)+1;DB.put(a);download(b,a.pdfName||(a.id+'.pdf'));return;}}openPrint(a);},
 jpdf:function(t){var a=findArt(t.dataset.id);if(a)openPrint(a);},
 toggle:async function(t){var a=findArt(t.dataset.id);a.status=a.status==='published'?'draft':'published';await DB.put(a);toast(a.status==='published'?'Published.':'Unpublished.');route();},
 del:async function(t){var a=findArt(t.dataset.id);if(!a||!confirm('Delete "'+a.title+'" permanently?'))return;await DB.del(a.id);await DB.delFile(a.id);ARTS.splice(ARTS.indexOf(a),1);toast('Deleted.');route();},
 secup:function(t){var r=t.closest('.secrow'),p=r.previousElementSibling;if(p)r.parentNode.insertBefore(r,p);},
 secdn:function(t){var r=t.closest('.secrow'),n=r.nextElementSibling;if(n)r.parentNode.insertBefore(n,r);},
 secrm:function(t){t.closest('.secrow').remove();},
 addsec:function(){$('secs').insertAdjacentHTML('beforeend',secRow('',''));},
 tmpl:function(){var rows=document.querySelectorAll('#secs .secrow'),has=false;rows.forEach(function(r){if(r.querySelector('.st').value.trim())has=true;});if(has&&!confirm('Replace current sections with the template? Existing text will be lost.'))return;$('secs').innerHTML=(TEMPLATES[$('f-type').value]||[]).map(function(h){return secRow(h,'');}).join('');},
 abstmpl:function(){var e=$('f-abs');if(e.value.trim()&&!confirm('Replace the current abstract?'))return;e.value='**Background:** \n\n**Methods:** \n\n**Results:** \n\n**Conclusion:** ';},
 doi:function(){$('f-doi').value=S.doiPrefix+'/'+S.short.toLowerCase()+'.'+($('f-year').value||new Date().getFullYear())+'.'+($('f-artno').value||Math.floor(100+Math.random()*900));},
 figrm:function(t){syncCaps();EDIT.figs.splice(parseInt(t.dataset.id,10),1);$('figlist').innerHTML=figList();},
 publish:function(){return saveFromForm('published');},
 draft:function(){return saveFromForm('draft');},
 prev:function(){var a=collect('draft');if(!a.title){toast('Enter a title first.');return;}openPrint(a);},
 savesettings:function(){['name','abbr','short','publisher','issnP','issnO','doiPrefix','freq','email','address','license','tagline'].forEach(function(k){S[k]=$('s-'+k).value.trim();});S.about=$('s-about').value.trim();S.indexed=$('s-indexed').value.trim();var pw=$('s-pw').value;if(pw){if(pw.length<6){toast('Password must be at least 6 characters.');return;}S.pwHash=cyrb(pw);S.defaultPw=false;}saveSettings();renderChrome();toast('Settings saved.');},
 export:async function(){var files={};var keys=await DB.allFileKeys();for(var i=0;i<keys.length;i++){var b=await DB.getFile(keys[i]);if(b)files[keys[i]]=await blobToDataURL(b);}var o={app:'ijmms',version:1,exported:new Date().toISOString(),settings:Object.assign({},S,{pwHash:undefined,defaultPw:undefined}),articles:ARTS,files:files};download(new Blob([JSON.stringify(o)],{type:'application/json'}),'ijmms-backup-'+today()+'.json');toast('Backup downloaded.');},
 import:async function(){var f=$('f-import').files[0];if(!f){toast('Choose a backup file.');return;}try{var o=JSON.parse(await f.text());if(o.app!=='ijmms')throw new Error('Not an IJMMS backup');for(var i=0;i<o.articles.length;i++){await saveArt(o.articles[i]);}var ids=Object.keys(o.files||{});for(var j=0;j<ids.length;j++){var r=await fetch(o.files[ids[j]]);await DB.putFile(ids[j],await r.blob());}if(o.settings){for(var k in o.settings){if(o.settings[k]!==undefined&&k in DEFAULTS)S[k]=o.settings[k];}saveSettings();}toast('Imported '+o.articles.length+' articles.');renderChrome();location.hash='#/admin';}catch(e){toast('Import failed: '+e.message);}},
 wipe:async function(){if(!confirm('Delete ALL articles and files from this browser?'))return;for(var i=ARTS.length-1;i>=0;i--){await DB.del(ARTS[i].id);await DB.delFile(ARTS[i].id);}ARTS=[];ls(JK+'seeded','1');toast('All articles deleted.');location.hash='#/admin';route();}
};
function syncCaps(){var caps=document.querySelectorAll('#figlist .figcap');EDIT.figs.forEach(function(f,i){if(caps[i])f.caption=caps[i].value;});}
async function addFigs(files){syncCaps();for(var i=0;i<files.length;i++){try{EDIT.figs.push({data:await resizeImage(files[i],1600),caption:''});}catch(e){toast('Could not read '+files[i].name);}}$('figlist').innerHTML=figList();$('f-figfiles').value='';}

document.addEventListener('click',function(e){var t=e.target.closest('[data-act]');if(!t)return;var f=ACT[t.dataset.act];if(f){e.preventDefault();f(t);}});
document.addEventListener('input',function(e){if(e.target.id==='sq')doSearch();});
document.addEventListener('keydown',function(e){if(e.target.id==='lp'&&e.key==='Enter')ACT.login();});
document.addEventListener('change',function(e){if(e.target.id==='f-figfiles')addFigs(e.target.files);if(e.target.id==='f-pdf'){var f=e.target.files[0];if(f){EDIT.pdfBlob=f;EDIT.pdfName=f.name;EDIT.hasPdf=true;EDIT.removePdf=false;$('pdfinfo').textContent='Selected: '+f.name;}}});

/* ========== SAMPLE ARTICLE + INIT ========== */
function sampleArticle(){var p1='This sample article shows how the journal template arranges an article for print. The first page carries the journal masthead, article type, title, authors with numbered affiliations, an information column and the abstract; the main text then flows in two justified columns with running headers and page numbers on the following pages.';
 var p2='Paragraphs are separated by a blank line. Text can include **bold**, *italic*, superscripts such as m^2^ and subscripts such as H~2~O. Section headings are set in small bold sans-serif type and are never left alone at the bottom of a column.';
 var tbl='**Table 1.** Example table layout.\n\n| Parameter | Group A | Group B |\n|---|---|---|\n| Sample size | 50 | 50 |\n| Mean age (years) | 45.2 | 46.1 |\n| Follow-up (months) | 12 | 12 |';
 return {id:'sample1',type:'Short Communication',title:'Sample Article: Layout Preview of the IJMMS Journal Template',authorsRaw:'A. Author | Department of Surgery, Example Medical College, India\nB. Author | Department of Pharmacology, Example Institute, India',corr:'A. Author, author@example.org',keywords:['journal template','layout','sample'],abstract:'**Background:** This placeholder article lets the editorial office preview the printed layout. **Methods:** Replace it by publishing a real article from the admin panel. **Results:** The generated PDF uses A4 pages, a two-column body, running headers and page numbers. **Conclusion:** Delete this sample before the site goes live.',sections:[{heading:'Introduction',text:p1+'\n\n'+p2},{heading:'Methods',text:'Lists are made with a leading dash:\n\n- Authors enter text in the article editor.\n- Figures are uploaded and placed with a marker.\n- References are numbered automatically.\n\n'+tbl},{heading:'Results and Discussion',text:'Long articles continue across pages; tables and figures are kept intact and never split across columns.\n\n### Subheadings\n\nUse three hash marks to create an italic subheading inside a section.\n\nThe layout is designed for Chrome and Edge, which support running headers and footers when saving as PDF.'},{heading:'Conclusion',text:'Publish your first real article from the Admin panel, then unpublish or delete this sample.'}],figures:[],refs:'International Committee of Medical Journal Editors. Recommendations for the conduct, reporting, editing, and publication of scholarly work in medical journals. Updated 2024.\nCommittee on Publication Ethics. Core Practices. COPE; 2024.',ack:'',funding:'None.',coi:'The authors declare no conflict of interest.',ethics:'Not applicable.',data:'',vol:1,issue:1,year:2026,period:'Nov-Dec 2026',pages:'1-4',artno:'',doi:'',received:'2026-10-01',accepted:'2026-10-20',published:'2026-11-02',license:'CC BY 4.0',status:'published',views:0,downloads:0,created:Date.now(),hasPdf:false,pdfName:''};}
