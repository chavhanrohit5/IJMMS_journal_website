/* ========== INFO: journal facts, indexing & abstracting, quality, visitors, reviewer applications, copyright form ========== */
var A_=function(){return window.IJMMS_ASSETS||'';};
var IDXLOGO={icmje:'assets/idx-icmje.png',crossref:'assets/idx-crossref.png',scholar:'assets/idx-scholar.png',researchgate:'assets/idx-researchgate.png',ici:'assets/idx-ici.png',imsear:'assets/idx-imsear.png',nlm:'assets/idx-nlm.png'};
var IDX=[['icmje','ICMJE Recommendations','Follows the ICMJE Recommendations for the Conduct, Reporting, Editing and Publication of Scholarly Work in Medical Journals.','https://www.icmje.org/recommendations/'],
 ['crossref','Crossref','DOI registration and reference linking.','https://www.crossref.org/'],
 ['scholar','Google Scholar','Article full texts are discoverable through Google Scholar.','https://scholar.google.com/'],
 ['researchgate','ResearchGate','Articles can be shared and discovered through ResearchGate.','https://www.researchgate.net/'],
 ['ici','Indian Citation Index','Indian Citation Index (ICI).','https://www.indiancitationindex.com/'],
 ['imsear','IMSEAR','Index Medicus for South-East Asia Region (WHO IMSEAR).','https://imsear.searo.who.int/'],
 ['nlm','NLM Catalog','National Library of Medicine catalog record.','https://www.ncbi.nlm.nih.gov/nlmcatalog/']];
IDX.forEach(function(x){DEFAULTS['idx_'+x[0]]=(x[0]==='nlm')?'hidden':'show';DEFAULTS['idxu_'+x[0]]='';});
Object.assign(DEFAULTS,{nlmId:'',isoOn:'1',isoText:'ISO certified',isoCert:'',ifVal:'',ifSrc:'',vcOn:'1'});
function idxShown(){return IDX.filter(function(x){return S['idx_'+x[0]]!=='hidden';});}
function idxUrl(x){return S['idxu_'+x[0]]||x[3];}
function idxCard(x){var st=S['idx_'+x[0]],extra=(x[0]==='nlm'&&S.nlmId)?'<br><b>NLM ID: '+esc(S.nlmId)+'</b>':'';
 return '<a class="ixc" href="'+esc(idxUrl(x))+'" target="_blank" rel="noopener"><div class="ixl"><img src="'+A_()+IDXLOGO[x[0]]+'" alt="'+esc(x[1])+'"></div><div class="ixn">'+esc(x[1])+'</div><div class="ixd">'+esc(x[2])+extra+'</div>'+(st==='applied'?'<div class="ixs">Application in process</div>':'')+'</a>';}
function ifLine(){return 'Impact factor: <b>'+(S.ifVal?esc(S.ifVal)+(S.ifSrc?' <span style="font-weight:400">('+esc(S.ifSrc)+')</span>':''):'not yet assigned')+'</b>';}
function isoLine(){return S.isoOn==='1'?'<b>'+esc(S.isoText||'ISO certified')+'</b>'+(S.isoCert?' <span style="font-weight:400">('+esc(S.isoCert)+')</span>':''):'';}
function kvRow(k,v){return v?'<tr><th>'+k+'</th><td>'+v+'</td></tr>':'';}
function glanceTable(){var rows='';
 rows+=kvRow('Journal title',esc(S.name))+kvRow('Abbreviation',esc(S.abbr))+kvRow('Publisher',esc(S.publisher)+(S.address?', '+esc(S.address):''))+kvRow('Subject area',esc(S.scope||''))+kvRow('Frequency',esc(S.freq))+kvRow('Language','English')
  +kvRow('ISSN',(S.issnO?'eISSN '+esc(S.issnO):'')+(S.issnO&&S.issnP?' &middot; ':'')+(S.issnP?'pISSN '+esc(S.issnP):''))
  +kvRow('Peer review','Double-blind peer review by two independent reviewers (see <a href="#/ethics">publication ethics</a>)')+kvRow('Access and licence','Open access &middot; '+esc(S.license))
  +kvRow('Submission','Free of charge &middot; article processing charges, if applicable, are payable only after acceptance (<a href="#/apc">APC rate card</a>)')
  +kvRow('DOI',S.doiPrefix&&S.doiPrefix!=='10.xxxxx'?'Prefix '+esc(S.doiPrefix):'')
  +kvRow('Quality standard',isoLine())+kvRow('Impact factor',ifLine().replace('Impact factor: ',''))+kvRow('Editorial office','<a href="mailto:'+esc(S.email)+'">'+esc(S.email)+'</a>');
 return '<table class="gl">'+rows+'</table>';}
function idxStrip(){var l=idxShown();if(!l.length)return '';return '<section class="ixstrip"><div class="wrap"><h3>Indexing &amp; Abstracting</h3><div class="ixrow">'+l.map(function(x){return '<a href="'+esc(idxUrl(x))+'" target="_blank" rel="noopener" title="'+esc(x[1])+'"><img src="'+A_()+IDXLOGO[x[0]]+'" alt="'+esc(x[1])+'"></a>';}).join('')+'</div><p>'+(isoLine()?isoLine()+' &middot; ':'')+ifLine()+' &middot; <a href="#/indexing">Details</a></p></div></section>';}
var _vHome0=vHome;
vHome=function(){var h=_vHome0();var gl='<section class="pg" style="padding-bottom:0"><div class="wrap"><div class="card"><h3 style="margin-top:0">Journal at a glance</h3>'+glanceTable()+'</div></div></section>';
 return h.replace('<section class="pg">',gl+idxStrip()+'<section class="pg">');};
function vIndexing(){var l=idxShown();
 var b='<div class="card"><h3 style="margin-top:0">Indexing, abstracting and discovery</h3><p style="font-size:14px;color:#445">Listings and platforms through which articles of '+esc(S.short)+' can be found. Click a logo to open the service.</p>'+(l.length?'<div class="ixgrid">'+l.map(idxCard).join('')+'</div>':'<p>No listings have been entered yet.</p>')+'</div>';
 b+='<div class="grid2" style="margin-top:18px"><div class="card"><h3 style="margin-top:0">Quality and recognition</h3><table class="gl">'+kvRow('ISO',isoLine()||'Not stated')+kvRow('Impact factor',ifLine().replace('Impact factor: ',''))+kvRow('Publication ethics','ICMJE recommendations and COPE guidance (<a href="#/ethics">policies</a>)')+kvRow('UGC parameters','Self-assessed against the UGC suggestive parameters for peer-reviewed journals (UGC notice dated 16 July 2025)'+(S.showCompliance==='1'?' &middot; <a href="#/compliance">view self-assessment</a>':''))+'</table>'
  +'<p style="font-size:12.5px;color:#667;margin-top:10px">The UGC has discontinued the UGC-CARE list and does not approve individual journals; its notice provides suggestive parameters for choosing peer-reviewed journals.</p></div>'
  +'<div class="card"><h3 style="margin-top:0">Journal information</h3>'+glanceTable()+'</div></div>';
 return hd('Indexing & Abstracting','Indexing, quality standards and journal information')+pg(b);}
function vCopyright(){var u=curUser(),mine=u?SUBS.filter(function(s){return isAdmin()||s.authorId===u.id;}):[];
 var sel=mine.length?'<div class="fg"><label>Fill from my manuscript</label><select id="cf-pick"><option value="">- choose -</option>'+mine.map(function(s){return '<option value="'+esc(s.id)+'">'+esc((s.ref||'')+' '+s.title.slice(0,70))+'</option>';}).join('')+'</select></div>':'';
 return hd('Copyright Form','Copyright and licence-to-publish agreement (up to 5 authors)')+pg('<div class="card"><p style="font-size:14px">Complete the details below and generate the PDF. Print it, have every author sign, and return the scanned copy to <a href="mailto:'+esc(S.email)+'">'+esc(S.email)+'</a> after your manuscript is accepted. If you are logged in, you can also generate it from your dashboard.</p>'+sel
  +'<div class="fg"><label>Manuscript title *</label><input id="cf-title"></div><div class="row2"><div class="fg"><label>Reference number (if any)</label><input id="cf-ref"></div><div class="fg"><label>Article type</label><select id="cf-type">'+opt(SUB_TYPES,'Original Research')+'</select></div></div>'
  +'<div class="fg"><label>Authors * (up to 5, one per line: Name | Affiliation | Email)</label><textarea id="cf-auth" rows="5"></textarea></div><div class="fg"><label>Corresponding author (name)</label><input id="cf-corr"></div><button class="btn teal" data-act="cfgen">Generate copyright form (PDF)</button></div>');}

/* ---------- visitors counter ---------- */
var VC=null,VCBUSY=false;
function vcShow(){var e=$('vc');if(!e)return;var w=$('vcw');if(VC===null){if(w)w.style.display='none';return;}if(w)w.style.display='';e.textContent=Number(VC).toLocaleString('en-IN');}
function visitors(){if(S.vcOn==='0'){var w=$('vcw');if(w)w.style.display='none';return;}if(VC!==null){vcShow();return;}if(VCBUSY||typeof fetch!=='function')return;VCBUSY=true;
 var ns=((location.hostname||'local').replace(/[^a-z0-9]/gi,'-')+'-'+JK.replace(/_/g,'')).toLowerCase(),first=true;try{first=!sessionStorage.getItem(JK+'vc');}catch(e){}
 fetch('https://api.counterapi.dev/v1/'+ns+'/visits'+(first?'/up':'')).then(function(r){return r.json();}).then(function(j){if(j&&typeof j.count==='number'){VC=j.count;try{sessionStorage.setItem(JK+'vc','1');}catch(e){}vcShow();}}).catch(function(){}).then(function(){VCBUSY=false;});}
var _rc3=renderChrome;
renderChrome=function(){_rc3();var f=$('foot');if(!f)return;
 var n=[];if(isoLine())n.push(isoLine());n.push(ifLine());
 f.insertAdjacentHTML('beforeend','<div class="fx">'+n.join(' &middot; ')+'<span id="vcw" style="display:none"> &middot; Visitors: <b id="vc">-</b></span></div>');vcShow();visitors();};

/* ---------- reviewer applications ---------- */
var REVAPPS=[];
function loadRev(){try{REVAPPS=JSON.parse(ls(JK+'revapps')||'[]');}catch(e){REVAPPS=[];}}
function saveRev(){ls(JK+'revapps',JSON.stringify(REVAPPS));}
loadRev();
function findRev(id){return REVAPPS.filter(function(r){return r.id===id;})[0];}
function revRef(){var y=new Date().getFullYear(),n=REVAPPS.filter(function(r){return (r.ref||'').indexOf('/'+y+'/')>0;}).length+1;return 'RA/'+S.short+'/'+y+'/'+('000'+n).slice(-4);}
function vJoin(){
 if(window._rvdone){var r=findRev(window._rvdone);if(r)return hd('Join as Reviewer','Application received')+pg('<div class="card"><h3 style="margin-top:0">Thank you, '+esc(r.name)+'.</h3><p>Your reviewer application has been received. Reference: <b>'+esc(r.ref)+'</b>. The editorial office will evaluate it and contact you at <b>'+esc(r.email)+'</b>. An acknowledgement e-mail has been prepared in the journal outbox.</p><p><button class="btn gold" data-act="rvackpdf" data-id="'+esc(r.id)+'">Download acknowledgement (PDF)</button> <a class="btn ghost" href="#/home">Back to home</a></p></div>');}
 var br=branchFlat(JBR);
 return hd('Join as Reviewer','Peer reviewers are essential to '+esc(S.short)+'. Apply to join our reviewer panel.')+pg('<div class="card"><div class="note">Reviewing is a confidential scholarly service. Submitting this form does not guarantee appointment. Please upload an up-to-date resume / CV.</div>'
 +'<div class="row2"><div class="fg"><label>Full name *</label><input id="rv-n"></div><div class="fg"><label>E-mail *</label><input id="rv-e" type="email"></div></div>'
 +'<div class="row2"><div class="fg"><label>Phone / WhatsApp</label><input id="rv-p"></div><div class="fg"><label>ORCID iD</label><input id="rv-o" placeholder="0000-0000-0000-0000"></div></div>'
 +'<div class="row2"><div class="fg"><label>Affiliation / institution *</label><input id="rv-a"></div><div class="fg"><label>Designation *</label><input id="rv-d" placeholder="e.g. Assistant Professor"></div></div>'
 +'<div class="row2"><div class="fg"><label>Highest qualification *</label><input id="rv-q" placeholder="e.g. MD, PhD, Pharm.D"></div><div class="fg"><label>Years of experience</label><input id="rv-y" type="number" min="0"></div></div>'
 +'<div class="fg"><label>Areas of expertise * (hold Ctrl / Cmd to select several)</label><select id="rv-ex" multiple size="8">'+br.map(function(x){return '<option>'+esc(x)+'</option>';}).join('')+'</select></div>'
 +'<div class="fg"><label>Keywords / specific interests</label><input id="rv-kw"></div>'
 +'<div class="row2"><div class="fg"><label>Profile link (Google Scholar / ResearchGate / institutional)</label><input id="rv-u"></div><div class="fg"><label>Number of publications</label><input id="rv-pub" type="number" min="0"></div></div>'
 +'<div class="row2"><div class="fg"><label>Previous peer-review experience</label><select id="rv-rev"><option>None</option><option>1-10 manuscripts</option><option>11-50 manuscripts</option><option>More than 50 manuscripts</option></select></div><div class="fg"><label>Availability</label><select id="rv-av"><option>1-2 manuscripts per quarter</option><option>1 manuscript per month</option><option>2-3 manuscripts per month</option></select></div></div>'
 +'<div class="fg"><label>Resume / CV * (PDF or Word, max 3 MB)</label><input type="file" id="rv-cv" accept=".pdf,.doc,.docx"></div>'
 +'<div class="fg"><label>Cover note</label><textarea id="rv-note" rows="3" placeholder="Why would you like to review for this journal?"></textarea></div>'
 +'<label style="display:block;margin:10px 0"><input type="checkbox" id="rv-ok"> I will treat manuscripts as confidential, declare conflicts of interest, follow COPE guidance for peer reviewers, and the information above is true.</label><button class="btn teal" data-act="rvsubmit">Submit application</button></div>');}
function letterDoc(title,inner){return '<!DOCTYPE html><html><head><meta charset="utf-8"><title>'+esc(title)+'</title><style>@page{size:A4;margin:13mm 17mm 14mm}*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}body{margin:0;font:10.4pt/1.5 "Times New Roman",Georgia,serif;color:#111}.tb{position:sticky;top:0;background:#0D2B4E;color:#fff;padding:8px 14px;font:13px Arial,sans-serif;margin:0 -17mm 6mm}.tb button{background:#B8860B;color:#fff;border:0;padding:7px 14px;font-weight:700;border-radius:3px;cursor:pointer}@media print{.tb{display:none}}@media screen{html{background:#d7dce2}body{max-width:210mm;margin:0 auto;padding:6mm 17mm;background:#fff}}'
 +'.hd{text-align:center;border-bottom:2.4pt solid '+(GRP==='ls'?'#0E7C7B':'#0D2B4E')+';padding-bottom:3mm;margin-bottom:5mm}.hd img{height:30mm;width:auto}.hd .m{font:8pt Arial,sans-serif;color:#555;margin-top:1mm}'
 +'h1{font:bold 17pt Arial,sans-serif;letter-spacing:1.5pt;text-transform:uppercase;text-align:center;margin:3mm 0 1mm;color:#0D2B4E}h2{font:bold 10pt Arial,sans-serif;color:#0D2B4E;margin:4mm 0 1mm}.sub{text-align:center;font:8.5pt Arial,sans-serif;letter-spacing:1.4pt;text-transform:uppercase;color:#0E7C7B;margin-bottom:5mm}'
 +'table{border-collapse:collapse;width:99.5%;font:9pt/1.35 Arial,sans-serif;margin:3mm 0}th,td{border:.6pt solid #98a6b5;padding:1.8mm 2.4mm;text-align:left;vertical-align:top}th{background:#eef2f6;width:38mm}p{margin:0 0 2.6mm;text-align:justify}ol.cl{margin:0;padding-left:5mm}ol.cl li{margin-bottom:2mm;text-align:justify;font-size:9.6pt}.ref{display:flex;justify-content:space-between;font:9pt Arial,sans-serif;margin-bottom:4mm}'
 +'.sig{break-inside:avoid}.sig td{height:15mm}.foot{margin-top:5mm;font:8pt Arial,sans-serif;color:#555;text-align:center}.sg{margin-top:12mm;break-inside:avoid}.sg b{display:block}</style></head><body><div class="tb"><button onclick="window.print()">Print / Save as PDF</button> A4 - background graphics on</div><div class="hd"><img src="'+(typeof LOGO_SMALL!=='undefined'?LOGO_SMALL:'')+'" alt="'+esc(S.name)+'"><div class="m">'+esc(S.publisher)+(S.issnO?' &middot; eISSN '+esc(S.issnO):'')+(S.issnP?' &middot; pISSN '+esc(S.issnP):'')+' &middot; '+esc(S.email)+'</div></div>'+inner+'<script>window.onload=function(){setTimeout(function(){try{window.print();}catch(e){}},900);};<\/script></body></html>';}
function revLetterHTML(r,kind){var ap=kind==='appoint',d=ap?(r.approvedDate||today()):r.date;
 var tb='<table><tr><th>Reference</th><td>'+esc(r.ref)+'</td></tr><tr><th>Name</th><td>'+esc(r.name)+'</td></tr><tr><th>Affiliation</th><td>'+esc(r.aff)+(r.desig?', '+esc(r.desig):'')+'</td></tr><tr><th>Expertise</th><td>'+esc((r.expertise||[]).join('; '))+'</td></tr>'+(ap?'<tr><th>Appointed as</th><td>Reviewer, '+esc(S.name)+'</td></tr>':'<tr><th>Date received</th><td>'+fmtDate(r.date)+'</td></tr>')+'</table>';
 var body=ap?'<p>Dear '+esc(r.name)+',</p><p>We are pleased to inform you that, following evaluation of your application and resume, you have been <b>appointed to the reviewer panel</b> of <b>'+esc(S.name)+' ('+esc(S.short)+')</b>. We value your willingness to contribute your expertise to the peer-review process.</p><p>A reviewer account has been created for you; your login details are sent separately by e-mail. You will receive manuscripts matching your expertise by e-mail and in your dashboard, and you may accept or decline each invitation. Reviewers are expected to keep manuscripts confidential, declare conflicts of interest, give constructive, evidence-based reports and follow COPE guidance for peer reviewers.</p>'
  :'<p>Dear '+esc(r.name)+',</p><p>We acknowledge with thanks the receipt of your application to join the reviewer panel of <b>'+esc(S.name)+' ('+esc(S.short)+')</b>. Your details and resume are recorded below. The editorial office will evaluate your application and contact you by e-mail. Submission of an application does not guarantee appointment.</p>';
 return letterDoc(ap?'Reviewer appointment letter':'Reviewer application acknowledgement','<h1>'+(ap?'Reviewer Appointment Letter':'Acknowledgement of Application')+'</h1><div class="sub">'+(ap?'Appointment to the reviewer panel':'Application to join as reviewer')+'</div><div class="ref"><span>Ref: <b>'+esc(r.ref)+'</b></span><span>Date: <b>'+fmtDate(d)+'</b></span></div>'+body+tb+'<p>Thank you for supporting '+esc(S.short)+'.</p><div class="sg"><b>'+esc(S.editorName||'Editorial Board')+'</b>'+esc(S.editorTitle||'Editor-in-Chief')+'<br>'+esc(S.name)+'<br>'+esc(S.publisher)+' &middot; '+esc(S.email)+'</div>');}
function rvEmails(r,kind){if(kind==='ack')queueMail(r.email,r.name,'['+r.ref+'] Reviewer application received - '+S.short,'Dear '+r.name+',\n\nThank you for applying to join the reviewer panel of '+S.name+' ('+S.short+').\n\nYour application (reference '+r.ref+') and resume have been received. The editorial office will evaluate it and contact you. An acknowledgement letter (PDF) is attached.\n'+sigText(),'revack',r.id);}
function vRevApps(){var f=window._rvf||'all',l=REVAPPS.slice().reverse().filter(function(r){return f==='all'||r.status===f;});
 var cnt=function(s){return REVAPPS.filter(function(r){return r.status===s;}).length;};
 var h='<div class="card"><h3>Reviewer applications</h3><p>'+REVAPPS.length+' total &middot; '+cnt('Pending')+' pending &middot; '+cnt('Approved')+' approved &middot; '+cnt('Rejected')+' rejected. Share the public link <code>#/join</code> (&ldquo;Join as Reviewer&rdquo;) with prospective reviewers.</p><p>'+['all','Pending','Approved','Rejected'].map(function(x){return '<button class="btn sm '+(f===x?'':'ghost')+'" data-act="rvfilter" data-f="'+x+'">'+x+'</button>';}).join(' ')+'</p>';
 if(!l.length)return h+'<p>No applications.</p></div>';
 return h+l.map(function(r){return '<details class="card" style="margin:8px 0;padding:10px 14px"><summary><b>'+esc(r.name)+'</b> &middot; '+esc(r.aff)+' &middot; '+esc((r.expertise||[]).slice(0,2).join(', '))+' &middot; '+spill(r.status)+' <small>'+esc(r.ref)+' &middot; '+fmtDate(r.date)+'</small></summary><table class="t" style="margin-top:8px">'
  +[['E-mail',r.email],['Phone',r.phone],['Designation',r.desig],['Qualification',r.qual],['Experience (years)',r.years],['Expertise',(r.expertise||[]).join('; ')],['Keywords',r.kw],['ORCID',r.orcid],['Profile',r.url],['Publications',r.pubs],['Review experience',r.rev],['Availability',r.avail],['Cover note',r.note]].filter(function(x){return x[1];}).map(function(x){return '<tr><th style="width:170px">'+x[0]+'</th><td>'+esc(x[1])+'</td></tr>';}).join('')+'</table><p style="margin-top:10px">'
  +(r.hasCv?'<button class="btn sm" data-act="rvcv" data-id="'+r.id+'">Download resume ('+esc(r.cvName)+')</button> ':'')+'<button class="btn sm ghost" data-act="rvackpdf" data-id="'+r.id+'">Acknowledgement PDF</button> '
  +(r.status==='Approved'?'<button class="btn sm gold" data-act="rvappointpdf" data-id="'+r.id+'">Appointment letter PDF</button> ':'')
  +(r.status!=='Approved'?'<button class="btn sm teal" data-act="rvapprove" data-id="'+r.id+'">Approve &amp; create reviewer account</button> ':'')+(r.status==='Pending'?'<button class="btn sm red" data-act="rvreject" data-id="'+r.id+'">Reject</button> ':'')+'<button class="btn sm ghost" data-act="rvdel" data-id="'+r.id+'">Delete</button></p></details>';}).join('')+'</div>';}
var _am3=adminMenu;
adminMenu=function(sub){var h=_am3(sub);if(!isAdmin())return h;var n=REVAPPS.filter(function(r){return r.status==='Pending';}).length,i=h.lastIndexOf('</div>');return h.slice(0,i)+'<a href="#/admin/revapps" class="'+(sub==='revapps'?'on':'')+'">Reviewer applications'+(n?' ('+n+')':'')+'</a>'+h.slice(i);};
var _va3=vAdmin;
vAdmin=function(p){if(p[1]==='revapps'&&isAdmin())return hd('Admin panel','Reviewer applications')+pg('<div class="adm">'+adminMenu('revapps')+'<div>'+vRevApps()+'</div></div>');return _va3(p);};

/* ---------- copyright form ---------- */
function cfData(src){var au=parseAuthors(src.authorsRaw||'');return {title:src.title||'',ref:src.ref||'',type:src.type||'',authors:au.slice(0,5).map(function(x){return {name:x.name,aff:x.aff||'',email:x.email||''};}),more:Math.max(0,au.length-5),corr:src.corr||''};}
function cfHTML(d){var rows='';for(var i=0;i<5;i++){var a=d.authors[i]||{};rows+='<tr><td style="text-align:center">'+(i+1)+'</td><td>'+esc(a.name||'')+'</td><td>'+esc(a.aff||'')+(a.email?'<br>'+esc(a.email):'')+'</td><td></td><td></td></tr>';}
 var cl=['<b>Licence to publish.</b> The author(s) retain the copyright in the article. The author(s) grant '+esc(S.publisher)+' (the Publisher) a non-exclusive, worldwide, perpetual licence to publish, reproduce, distribute, archive, index and make the article available in '+esc(S.name)+' in all media, and agree that the article is published under the <b>'+esc(S.license)+'</b> licence, which allows others to share and adapt it with proper attribution.',
 '<b>Originality and prior publication.</b> The article is original, has not been published, is not under consideration elsewhere, and does not infringe any copyright or other right of a third party. Any overlap with earlier work has been disclosed to the editor.',
 '<b>Authorship.</b> All authors meet the ICMJE authorship criteria, have approved the final version and agree to be accountable for the work. No person who qualifies as an author has been omitted. Changes to authorship after submission require the written consent of all authors.',
 '<b>Ethics, consent and registration.</b> Research involving human participants or animals was approved by the appropriate committee and conducted ethically; informed consent (including consent for publication of case details or images) was obtained; clinical trials and systematic reviews are registered where required.',
 '<b>Conflicts of interest and funding.</b> All financial and non-financial conflicts of interest and all sources of funding are disclosed in the manuscript.',
 '<b>Third-party material.</b> Written permission has been obtained for any figure, table or text reproduced from other sources, and the sources are acknowledged.',
 '<b>Data and AI tools.</b> The data supporting the findings are available as stated in the manuscript. Any use of generative AI tools has been disclosed, and the authors take full responsibility for the content.',
 '<b>Corrections and retraction.</b> The authors will cooperate with the journal in correcting errors and, if necessary, in retraction, in line with COPE guidance. The Publisher may take such action where misconduct or serious error is established.',
 '<b>Charges.</b> Manuscript submission is free. Any article processing charge is payable only after final acceptance, as stated on the journal&rsquo;s APC page; signing this form does not create an obligation to pay before acceptance, and payment does not guarantee publication.',
 '<b>Authority.</b> The corresponding author signs on behalf of all co-authors only if each co-author has authorised this in writing; otherwise every author must sign below.'];
 return letterDoc('Copyright form','<h1>Copyright &amp; Licence to Publish Agreement</h1><div class="sub">'+esc(S.name)+' ('+esc(S.short)+')</div><div class="ref"><span>Form No: <b>CF/'+esc(S.short)+'/'+esc((d.ref||'').replace(/[^A-Za-z0-9]+/g,'-')||'____')+'</b></span><span>Date: <b>'+fmtDate(today())+'</b></span></div>'
 +'<table><tr><th>Manuscript title</th><td>'+esc(d.title)+'</td></tr><tr><th>Manuscript reference</th><td>'+esc(d.ref||'')+'</td></tr><tr><th>Article type</th><td>'+esc(d.type)+'</td></tr><tr><th>Corresponding author</th><td>'+esc(d.corr||'')+'</td></tr></table>'
 +'<h2>Terms</h2><ol class="cl">'+cl.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ol>'
 +'<div class="sig"><h2>Declaration and signatures</h2><p style="font-size:9.4pt">We, the undersigned, have read and agree to the above terms and confirm that the information given is correct.</p><table style="table-layout:fixed"><tr><th style="width:10mm;text-align:center">No.</th><th style="width:38mm">Author name</th><th>Affiliation / e-mail</th><th style="width:34mm">Signature</th><th style="width:22mm">Date</th></tr>'+rows+'</table>'+(d.more?'<p style="font-size:8.6pt;color:#a00">This manuscript has '+(d.authors.length+d.more)+' authors; please attach a continuation sheet signed by the remaining '+d.more+'.</p>':'')+'</div>'
 +'<div class="foot">Return the signed form (scan or photograph) to '+esc(S.email)+' quoting the manuscript reference. &middot; '+esc(S.publisher)+(S.address?', '+esc(S.address):'')+'</div>');}

async function rvStore(r,f,ex){
  try{await DB.putFile('rv_'+r.id,f);r.hasCv=true;}catch(e){toast('Resume could not be stored in this browser; application saved without it.');}
  REVAPPS.push(r);saveRev();rvEmails(r,'ack');
  queueMail(S.email,S.short+' editorial office','New reviewer application: '+r.name+' ['+r.ref+']','A new reviewer application was received.\n\nName: '+r.name+'\nE-mail: '+r.email+'\nAffiliation: '+r.aff+'\nExpertise: '+ex.join('; ')+'\n\nReview it in Admin panel > Reviewer applications.\n');
  window._rvdone=r.id;route();toast('Application submitted.');}
function rvApprovedMail(r,tmp){queueMail(r.email,r.name,'['+r.ref+'] Appointed to the reviewer panel - '+S.short,'Dear '+r.name+',\n\nWe are pleased to inform you that you have been appointed to the reviewer panel of '+S.name+' ('+S.short+'). Your appointment letter (PDF) is attached.\n\n'+(tmp?'Your reviewer login details are sent in a separate e-mail.\n':'Your existing account now has reviewer access.\n')+'You will receive manuscripts matching your expertise: '+(r.expertise||[]).join('; ')+'.\n'+sigText(),'revappoint',r.id);}
/* ---------- ACT handlers ---------- */
Object.assign(ACT,{
 rvfilter:function(t){window._rvf=t.dataset.f;route();},
 rvsubmit:async function(){var g=function(i){var e=$(i);return e?e.value.trim():'';};var ex=[].slice.call($('rv-ex').selectedOptions).map(function(o){return o.value;});
  var f=$('rv-cv').files[0];
  if(!g('rv-n')||!/^\S+@\S+\.\S+$/.test(g('rv-e'))||!g('rv-a')||!g('rv-d')||!g('rv-q')){toast('Please complete name, valid e-mail, affiliation, designation and qualification.');return;}
  if(!ex.length){toast('Select at least one area of expertise.');return;}if(!f){toast('Please attach your resume / CV.');return;}if(f.size>3*1024*1024){toast('Resume must be 3 MB or smaller.');return;}
  if(!$('rv-ok').checked){toast('Please accept the declaration.');return;}
  if(REVAPPS.some(function(r){return r.email.toLowerCase()===g('rv-e').toLowerCase()&&r.status!=='Rejected';})){toast('An application with this e-mail already exists.');return;}
  var r={id:uid(),ref:revRef(),name:g('rv-n'),email:g('rv-e'),phone:g('rv-p'),orcid:g('rv-o'),aff:g('rv-a'),desig:g('rv-d'),qual:g('rv-q'),years:g('rv-y'),expertise:ex,kw:g('rv-kw'),url:g('rv-u'),pubs:g('rv-pub'),rev:g('rv-rev'),avail:g('rv-av'),note:g('rv-note'),status:'Pending',date:today(),created:Date.now(),hasCv:false,cvName:f.name};
  await rvStore(r,f,ex);},
 rvackpdf:function(t){var r=findRev(t.dataset.id);if(r)docOpen(revLetterHTML(r,'ack'));},
 rvappointpdf:function(t){var r=findRev(t.dataset.id);if(r)docOpen(revLetterHTML(r,'appoint'));},
 rvcv:async function(t){var r=findRev(t.dataset.id),b=r&&await DB.getFile('rv_'+r.id);if(b)download(b,r.cvName||'resume');else toast('Resume file not available in this browser.');},
 rvapprove:function(t){var r=findRev(t.dataset.id);if(!r)return;var ex=USERS.filter(function(u){return u.email.toLowerCase()===r.email.toLowerCase();})[0],tmp='';
  if(ex){if(ex.role==='admin'){toast('This e-mail belongs to an administrator.');return;}if(!confirm('An account with this e-mail exists ('+ex.role+'). Change its role to reviewer?'))return;ex.role='reviewer';ex.expertise=r.expertise;saveUsers();}
  else{tmp=genPw();var u={id:uid(),name:r.name,email:r.email,aff:r.aff,role:'reviewer',pwHash:cyrb(tmp),tmp:tmp,expertise:r.expertise,rvId:r.id};USERS.push(u);saveUsers();mWelcome(u,tmp);}
  r.status='Approved';r.approvedDate=today();saveRev();
  rvApprovedMail(r,tmp);
  toast('Approved. Reviewer account created; e-mails prepared in Outbox.');route();},
 rvreject:function(t){var r=findRev(t.dataset.id);if(!r)return;var why=prompt('Reason for rejection (optional, included in the e-mail):','');if(why===null)return;r.status='Rejected';saveRev();
  queueMail(r.email,r.name,'['+r.ref+'] Your reviewer application - '+S.short,'Dear '+r.name+',\n\nThank you for your interest in joining the reviewer panel of '+S.name+'. After evaluation we are unable to take your application forward at this time.'+(why?'\n\nNote: '+why:'')+'\n\nYou are welcome to apply again in future.\n'+sigText());toast('Rejected. E-mail prepared in Outbox.');route();},
 rvdel:async function(t){var r=findRev(t.dataset.id);if(!r||!confirm('Delete this application permanently?'))return;try{await DB.delFile('rv_'+r.id);}catch(e){}REVAPPS.splice(REVAPPS.indexOf(r),1);saveRev();route();},
 cfgen:function(){var au=($('cf-auth').value||'').split('\n').map(function(l){return l.trim();}).filter(Boolean);if(!$('cf-title').value.trim()||!au.length){toast('Enter the title and at least one author.');return;}
  var d=cfData({title:$('cf-title').value.trim(),ref:$('cf-ref').value.trim(),type:$('cf-type').value,authorsRaw:au.join('\n'),corr:$('cf-corr').value.trim()});docOpen(cfHTML(d));},
 cfsub:function(t){var s=findSub(t.dataset.id);if(s)docOpen(cfHTML(cfData(s)));},
 cfart:function(t){var a=findArt(t.dataset.id);if(a)docOpen(cfHTML(cfData(a)));}
});
document.addEventListener('change',function(e){if(e.target.id==='cf-pick'&&e.target.value){var s=findSub(e.target.value);if(!s)return;var d=cfData(s);$('cf-title').value=d.title;$('cf-ref').value=d.ref;$('cf-type').value=d.type;$('cf-auth').value=parseAuthors(s.authorsRaw).slice(0,5).map(function(x){return x.name+' | '+(x.aff||'')+' | '+(x.email||'');}).join('\n');$('cf-corr').value=d.corr;}});
/* reviewer / copyright PDFs from the outbox */
var _opdf0=ACT.opdf;
ACT.opdf=function(t){var m=omOf(t);if(m&&(m.att==='revack'||m.att==='revappoint')){var r=findRev(m.subId);if(!r){toast('Application no longer exists.');return;}docOpen(revLetterHTML(r,m.att==='revack'?'ack':'appoint'));return;}return _opdf0(t);};
/* copyright button in manuscript view + accepted wording */
var _vSub3=vSub;
vSub=function(id){var h=_vSub3(id);return h.replace(/(<button class="btn gold" data-act="acceptpdf" data-id="([^"]+)">Letter of acceptance \(PDF\)<\/button>)/,'$1 <button class="btn teal" data-act="cfsub" data-id="$2">Copyright form (PDF)</button>');};
var _ae3=acceptEmail;
acceptEmail=function(s,a){var t=_ae3(s,a),add='\nCOPYRIGHT FORM: Please download the Copyright & Licence-to-Publish form (up to 5 authors, pre-filled with your manuscript details) from your dashboard - open your manuscript and choose "Copyright form (PDF)" - or from the "Copyright Form" page of the website. Have all authors sign it and return a scan to '+S.email+'.\n';var i=t.indexOf('\nWith regards,');return i>=0?t.slice(0,i)+add+t.slice(i):t+add;};

/* ---------- settings: quality, indexing, visitors ---------- */
var _vSettings3=vSettings;
vSettings=function(){var h=_vSettings3();var sel=function(id,v){return '<select id="'+id+'"><option value="show"'+(v==='show'?' selected':'')+'>Show</option><option value="applied"'+(v==='applied'?' selected':'')+'>Show as &ldquo;Application in process&rdquo;</option><option value="hidden"'+(v==='hidden'?' selected':'')+'>Hide</option></select>';};
 var blk='<div class="card" style="margin:14px 0;background:#f7fafc"><h4 style="margin-top:0">Indexing, quality and metrics (shown on the Indexing page and home page)</h4><div class="note">Show a listing only where it is factually true for this journal. The UGC no longer approves or lists journals, and the Impact Factor is assigned only by Clarivate &mdash; leave it blank until officially assigned.</div>'
 +IDX.map(function(x){return '<div class="row2"><div class="fg"><label>'+esc(x[1])+'</label>'+sel('s-idx_'+x[0],S['idx_'+x[0]])+'</div><div class="fg"><label>Link to your listing (optional)</label><input id="s-idxu_'+x[0]+'" value="'+esc(S['idxu_'+x[0]])+'" placeholder="'+esc(x[3])+'"></div></div>';}).join('')
 +'<div class="row2"><div class="fg"><label>NLM Catalog ID (your own journal&rsquo;s ID)</label><input id="s-nlmId" value="'+esc(S.nlmId)+'"></div><div class="fg"><label><input type="checkbox" id="s-isoOn" style="width:auto"'+(S.isoOn==='1'?' checked':'')+'> Show ISO line</label><input id="s-isoText" value="'+esc(S.isoText)+'" placeholder="ISO certified"></div></div>'
 +'<div class="row2"><div class="fg"><label>ISO certificate details (standard, number, body)</label><input id="s-isoCert" value="'+esc(S.isoCert)+'" placeholder="e.g. ISO 9001:2015, Cert. No. ..."></div><div class="fg"><label>Impact factor value</label><input id="s-ifVal" value="'+esc(S.ifVal)+'"></div></div><div class="row2"><div class="fg"><label>Impact factor source / year</label><input id="s-ifSrc" value="'+esc(S.ifSrc)+'" placeholder="e.g. Clarivate JCR 2025"></div><div class="fg"><label><input type="checkbox" id="s-vcOn" style="width:auto"'+(S.vcOn!=='0'?' checked':'')+'> Show visitor counter in footer</label></div></div></div>';
 return h.replace('<button class="btn teal" data-act="savesettings">',blk+'<button class="btn teal" data-act="savesettings">');};
var _save3=ACT.savesettings;
ACT.savesettings=function(t){IDX.forEach(function(x){var a=$('s-idx_'+x[0]),b=$('s-idxu_'+x[0]);if(a)S['idx_'+x[0]]=a.value;if(b)S['idxu_'+x[0]]=b.value.trim();});['nlmId','isoText','isoCert','ifVal','ifSrc'].forEach(function(k){var e=$('s-'+k);if(e)S[k]=e.value.trim();});var o=$('s-isoOn');if(o)S.isoOn=o.checked?'1':'0';var v=$('s-vcOn');if(v){S.vcOn=v.checked?'1':'0';}return _save3(t);};
