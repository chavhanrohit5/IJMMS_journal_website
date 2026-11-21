var BRANCHES={medical:[
{g:'Medicine',items:['General Medicine','Cardiology','Pulmonology & Respiratory Medicine','Gastroenterology & Hepatology','Nephrology','Endocrinology & Diabetes','Haematology','Medical Oncology','Rheumatology & Clinical Immunology','Infectious Diseases','Neurology','Psychiatry & Mental Health','Dermatology & Venereology','Geriatrics','Critical Care Medicine','Emergency Medicine','Palliative Medicine','Physical Medicine & Rehabilitation','Allergy & Immunotherapy','Sports Medicine','Family Medicine & Primary Care','Tropical Medicine','Clinical Pharmacology & Therapeutics']},
{g:'Surgery & Procedural Specialties',items:['General Surgery','Cardiothoracic & Vascular Surgery','Neurosurgery','Orthopaedics & Trauma','Plastic & Reconstructive Surgery','Urology','Paediatric Surgery','Surgical Oncology','GI & Hepatobiliary Surgery','Transplant Surgery','Minimally Invasive & Robotic Surgery','Anaesthesiology & Pain Medicine','Ophthalmology','Otorhinolaryngology (ENT)','Oral & Maxillofacial Surgery','Burns & Wound Care']},
{g:'Women & Child Health',items:['Obstetrics & Gynaecology','Reproductive Medicine & IVF','Paediatrics','Neonatology','Adolescent Medicine']},
{g:'Diagnostics & Laboratory',items:['Radiology & Imaging','Nuclear Medicine','Pathology','Clinical Biochemistry','Laboratory & Transfusion Medicine','Forensic Medicine & Toxicology']},
{g:'Community, Systems & Allied Health',items:['Public Health & Epidemiology','Preventive & Social Medicine','Occupational & Environmental Medicine','Health Policy & Hospital Administration','Medical Education','Medical Ethics & Law','Nursing & Allied Health','Dentistry','Pharmacy Practice & Pharmacovigilance','AYUSH & Integrative Medicine','Digital Health & AI in Medicine','Clinical Research & Biostatistics']}],
life:[
{g:'Molecular & Cellular Life Sciences',items:['Biochemistry','Molecular Biology','Cell Biology','Genetics & Genomics','Proteomics & Metabolomics','Biophysics','Stem Cells & Regenerative Medicine','Cancer Biology']},
{g:'Microbial & Immune Sciences',items:['Microbiology','Virology','Parasitology','Immunology','Vaccinology']},
{g:'Systems & Translational Life Sciences',items:['Physiology','Anatomy & Developmental Biology','Neuroscience','Basic Pharmacology','Toxicology','Nutrition & Food Science','Biomedical Engineering']},
{g:'Applied & Computational Life Sciences',items:['Biotechnology','Bioinformatics & Computational Biology','Pharmaceutical Sciences & Drug Discovery','Environmental & Ecological Health','Biostatistics']}]};
function branchFlat(k){var o=[];BRANCHES[k].forEach(function(g){o=o.concat(g.items);});return o;}
function branchOpts(sel){function og(l,k){return '<optgroup label="'+l+'">'+BRANCHES[k].map(function(g){return g.items.map(function(x){return '<option'+(x===sel?' selected':'')+'>'+esc(x)+'</option>';}).join('');}).join('')+'</optgroup>';}return '<option value="">- select -</option>'+og('Medical &amp; Surgical Sciences','medical')+og('Life Sciences','life');}

/* ========== EXTENDED SETTINGS / CONTENT DEFAULTS ========== */
var DEFAULT_ETHICS='IJMMS follows the recommendations of the International Committee of Medical Journal Editors (ICMJE) and the core practices of the Committee on Publication Ethics (COPE).\n\nAuthorship: all listed authors must meet ICMJE authorship criteria and approve the final manuscript. Changes in authorship after submission need written consent from every author.\n\nEthics approval and consent: studies on humans need approval from an institutional ethics committee and informed consent; animal studies need institutional animal ethics approval. Clinical trials must be registered (for India, the CTRI) before enrolment.\n\nConflicts of interest and funding: authors, reviewers and editors must disclose financial and non-financial conflicts and all sources of funding.\n\nOriginality: manuscripts must be original, not under consideration elsewhere, and are screened with similarity-checking software before review. Duplicate publication, fabrication, falsification and plagiarism lead to rejection or retraction.\n\nCorrections and retractions: errors are corrected through a published correction; seriously flawed or unethical work is retracted following COPE guidance.';
var DEFAULT_AI='Authors must disclose any use of generative AI or AI-assisted tools in preparing a manuscript (what tool, and for what purpose). AI tools cannot be listed as authors and authors remain fully responsible for the content, including accuracy of references. Reviewers and editors must not upload confidential manuscripts to public AI tools.';
var DEFAULT_PEER='Every submission is screened by the editorial office for scope, ethics statements and similarity. Suitable manuscripts are sent to independent reviewers, who submit a recommendation (accept, minor revision, major revision or reject) with comments to the author. The editor makes the final decision. Reviewers must declare conflicts of interest and treat manuscripts as confidential.';
var DEFAULT_FAQ='Who can submit? | Researchers, clinicians and students in any medical or surgical field. All authors must approve the submission.\nHow do I submit? | Register as an author, then use Submit Manuscript. Your submission appears on your dashboard where you can follow its status.\nWhich article types are accepted? | Original research, systematic reviews, review articles, case reports, short communications and letters to the editor. See Author Guidelines for limits.\nIs the journal open access? | Yes. Articles are free to read and download under the licence shown on each article.\nHow are articles cited? | Each article page shows ready-made Vancouver and APA citations with its DOI.';
var DEFAULT_AIMS='The International Journal of Modern Medicine & Surgery (IJMMS) publishes peer-reviewed research that advances clinical practice and understanding of disease across medicine and surgery.\n\nObjectives: to provide a rigorous, freely accessible platform for original research, systematic reviews, review articles, case reports and short communications; to encourage ethical, well-reported studies that follow international reporting guidelines (CONSORT, STROBE, PRISMA, CARE); and to give clinicians, researchers and students dependable evidence for patient care and teaching.\n\nScope: clinical and translational studies, surgical techniques and outcomes, anaesthesia and critical care, pharmacology and therapeutics, diagnostics, public health, medical education and health-system research.';
var DEFAULT_SUBJ='Medical and surgical sciences: '+branchFlat('medical').join('; ')+'.\n\nLife Sciences: '+branchFlat('life').join('; ')+'.';
var DEFAULT_PLAG='All submissions are checked for textual similarity with similarity-detection software before peer review. Manuscripts with unacceptable overlap, duplicate publication or unattributed text are returned to the authors or rejected. Confirmed misconduct after publication is handled by correction or retraction following COPE guidance.';
Object.assign(DEFAULTS,{board:'',announcements:'',special:'',faq:DEFAULT_FAQ,apc:'',ethics:DEFAULT_ETHICS,aipolicy:DEFAULT_AI,peer:DEFAULT_PEER,aims:DEFAULT_AIMS,subjects:DEFAULT_SUBJ,timeline:'',accept:'',plag:DEFAULT_PLAG,nmc:'',showCompliance:'',ugc:'{}'});

/* ========== USERS / SESSION ========== */
var USERS=[];
function loadUsers(){try{USERS=JSON.parse(ls(JK+'users')||'[]');}catch(e){USERS=[];}}
function saveUsers(){ls(JK+'users',JSON.stringify(USERS));}
function curUser(){try{var id=sessionStorage.getItem(JK+'uid');if(!id)return null;if(id==='admin')return {id:'admin',name:'Administrator',email:S.email,role:'admin'};return USERS.filter(function(u){return u.id===id;})[0]||null;}catch(e){return null;}}
function isAdmin(){var u=curUser();return !!u&&(u.role==='admin'||u.role==='editor');}
function isFullAdmin(){var u=curUser();return !!u&&u.role==='admin';}
function setSession(id){try{sessionStorage.setItem(JK+'uid',id);if(id==='admin')sessionStorage.setItem(JK+'admin','1');else sessionStorage.removeItem(JK+'admin');}catch(e){}}

/* ========== DB EXTRAS ========== */
DB.putMany=function(arr){if(DB.fail||!arr.length)return Promise.resolve();return new Promise(function(res,rej){var tx=DB.db.transaction('articles','readwrite'),s=tx.objectStore('articles');arr.forEach(function(a){s.put(a);});tx.oncomplete=function(){res();};tx.onerror=tx.onabort=function(){rej(tx.error);};});};
DB.delMany=function(ids){if(DB.fail||!ids.length)return Promise.resolve();return new Promise(function(res,rej){var tx=DB.db.transaction('articles','readwrite'),s=tx.objectStore('articles');ids.forEach(function(i){s.delete(i);});tx.oncomplete=function(){res();};tx.onerror=tx.onabort=function(){rej(tx.error);};});};
DB.allSubs=function(){return DB.fail?Promise.resolve([]):DB.rq(DB.st('subs','readonly').getAll());};
DB.putSub=function(s){return DB.fail?Promise.resolve():DB.rq(DB.st('subs','readwrite').put(s));};
DB.delSub=function(id){return DB.fail?Promise.resolve():DB.rq(DB.st('subs','readwrite').delete(id));};
var SUBS=[];
function findSub(id){for(var i=0;i<SUBS.length;i++)if(SUBS[i].id===id)return SUBS[i];return null;}
async function saveSub(s){var i=SUBS.indexOf(findSub(s.id));if(i>-1)SUBS[i]=s;else SUBS.push(s);await DB.putSub(s);}


var IC={
 heart:'<path d="M12 21s-7-4.6-9.3-9.2C1 8.3 3 4.5 6.6 4.5c2 0 3.5 1 5.4 3 1.9-2 3.4-3 5.4-3 3.6 0 5.6 3.8 3.9 7.3C19 16.4 12 21 12 21z"/>',
 pulse:'<path d="M2 12h4l2-5 3 10 2.5-7 1.5 2H22"/>',
 syringe:'<path d="M18 2l4 4M15 5l4 4M13 7l4 4-8 8H5v-4zM5 19l-3 3M10 12l2 2"/>',
 pill:'<rect x="2" y="8" width="20" height="8" rx="4" transform="rotate(-40 12 12)"/><path d="M9 8.5l6.5 7"/>',
 steth:'<path d="M6 3v6a4 4 0 008 0V3M10 13v2a5 5 0 0010 0v-1"/><circle cx="20" cy="12" r="2"/>',
 micro:'<path d="M6 21h12M9 21v-3a5 5 0 005-5M8 3l4 2-3 7-4-2zM11 8l3 1.5"/>',
 dna:'<path d="M7 3c0 6 10 6 10 12s-10 6-10 6M17 3c0 6-10 6-10 12s10 6 10 6M8 7h8M8 17h8"/>',
 cross:'<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M12 7v10M7 12h10"/>',
 scalpel:'<path d="M3 21l9-9M12 12l6-9 3 3-9 6zM6 18l-3 3"/>'
};
function ico(n){return '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">'+IC[n]+'</svg>';}
var SPECS=[['Surgery','scalpel'],['Cardiology','heart'],['Anaesthesia & Analgesia','syringe'],['Pharmacology','pill'],['Genetics & Molecular Medicine','dna'],['Pathology & Diagnostics','micro'],['Clinical Practice','steth'],['Emergency & Critical Care','pulse']];

/* ========== ISSUES / ARCHIVE (bi-monthly, from 2017) ========== */
var START_YEAR=2017;
var PERIODS=['Jan–Feb','Mar–Apr','May–Jun','Jul–Aug','Sep–Oct','Nov–Dec'];
function volOf(y){return y-START_YEAR+1;}
function periodOf(y,i){return PERIODS[i-1]+' '+y;}
function calIssue(){var n=new Date();return {year:n.getFullYear(),issue:Math.floor(n.getMonth()/2)+1};}
function allIssues(){var c=calIssue(),out=[];for(var y=c.year;y>=START_YEAR;y--){for(var i=6;i>=1;i--){if(y===c.year&&i>c.issue)continue;out.push({year:y,vol:volOf(y),issue:i,period:periodOf(y,i)});}}if(!out.length)out.push({year:START_YEAR,vol:1,issue:1,period:periodOf(START_YEAR,1)});return out;}
function ord(a,b){return ((a.seq||0)-(b.seq||0))||(a.published||'').localeCompare(b.published||'');}
function issueArts(y,i){return ARTS.filter(function(a){return a.status==='published'&&a.year===y&&a.issue===i;}).sort(ord);}
function issueCounts(){var m={};ARTS.forEach(function(a){if(a.status==='published'){var k=a.year+'-'+a.issue;m[k]=(m[k]||0)+1;}});return m;}
function latestIssue(){var c=issueCounts(),is=allIssues();for(var k=0;k<is.length;k++){if(c[is[k].year+'-'+is[k].issue])return is[k];}return is[0]||null;}

/* ========== DOI ========== */
function doiPrefix(){return String(S.doiPrefix||'10.xxxxx').trim();}
function doiReady(){if(/^10\.x+$/i.test(doiPrefix()))return confirm('The DOI prefix in Settings is still the placeholder "'+doiPrefix()+'". DOIs made with it will not work until you enter your registered Crossref prefix.\n\nContinue anyway?');return true;}
if(typeof DEFAULTS!=='undefined'&&!('doiAuto' in DEFAULTS))DEFAULTS.doiAuto=false;
function doiTaken(doi,exceptId){doi=String(doi).toLowerCase();return ARTS.some(function(a){return a.id!==exceptId&&a.doi&&a.doi.toLowerCase()===doi;});}
function doiAllocator(){var used={};ARTS.forEach(function(x){if(x.doi)used[x.doi.toLowerCase()]=1;if(x.doiHold)used[x.doiHold.toLowerCase()]=1;});return function(a){var n=1,d;do{d=doiPrefix()+'/'+S.short.toLowerCase()+'.'+a.year+'.v'+a.vol+'i'+a.issue+'.'+String(n++).padStart(3,'0');}while(used[d.toLowerCase()]);used[d.toLowerCase()]=1;return d;};}
function nextDoi(a){return doiAllocator()(a);}

/* ========== CHROME ========== */
function renderChrome(){
 var u=curUser();
 $('topbar').innerHTML='<div class="wrap"><span>'+esc(S.publisher)+(S.issnO?' &middot; eISSN '+esc(S.issnO):'')+(S.issnP?' &middot; pISSN '+esc(S.issnP):'')+' &middot; '+esc(S.freq)+' &middot; Open Access ('+esc(S.license)+')</span><span>'+esc(S.email)+'</span></div>';
 $('hrow').innerHTML='<a class="logo" href="#/home"><img class="logoimg" src="'+HEADER_LOGO()+'" alt="'+esc(S.name+' - '+S.short)+'"></a><div><a class="btn ghost sm" href="#/search">Search</a> '+(u?'<a class="btn sm" href="#/'+(isAdmin()?'admin':'dash')+'">'+(isAdmin()?'Admin panel':'My dashboard')+'</a> <button class="btn red sm" data-act="logout">Logout</button>':'<a class="btn gold sm" href="#/submit">Submit manuscript</a> <a class="btn sm" href="#/login">Login</a>')+'</div>';
 var cur=(location.hash.replace(/^#\/?/,'')||window.IJMMS_PAGE||'home').split('/')[0];
 var items=[['home','Home'],['current','Current Issue'],['archive','Archive'],['subjects','Subjects'],['about','About'],['board','Editorial Board'],['guidelines','Author Guidelines'],['ethics','Ethics'],['apc','APC & Waivers'],['special','Special Issues'],['announcements','Announcements'],['indexing','Indexing'],['faq','FAQ'],['contact','Contact'],['join','Join as Reviewer'],['copyright','Copyright Form']];
 if(S.showCompliance==='1')items.splice(12,0,['compliance','UGC Compliance']);
 $('nav').innerHTML=items.map(function(i){return '<a href="#/'+i[0]+'" class="'+(cur===i[0]?'on':'')+'">'+i[1]+'</a>';}).join('');
 $('foot').innerHTML='<div>&copy; '+new Date().getFullYear()+' '+esc(S.publisher)+'. Articles are licensed under '+esc(S.license)+'.<br>'+esc(S.address)+'</div><div><a href="mailto:'+esc(S.email)+'">'+esc(S.email)+'</a></div>';
}

/* ========== PUBLIC VIEWS ========== */
function hd(t,sub){return '<div class="ph"><div class="wrap"><h1>'+t+'</h1>'+(sub?'<p>'+sub+'</p>':'')+'</div></div>';}
function pg(inner){return '<section class="pg"><div class="wrap">'+inner+'</div></section>';}
function paras(s){return String(s||'').split(/\n\s*\n/).filter(function(x){return x.trim();}).map(function(x){return '<p>'+esc(x.trim()).replace(/\n/g,'<br>')+'</p>';}).join('');}
function rows(s){return String(s||'').split('\n').map(function(l){return l.trim();}).filter(Boolean).map(function(l){return l.split('|').map(function(x){return x.trim();});});}
function pill(a){return '';}
function card(a){return '<article class="acard"><div class="atype">'+esc(a.type)+pill(a)+'</div><h3><a href="#/article/'+a.id+'">'+esc(a.title)+'</a></h3><div class="aauth">'+esc(authNames(a))+'</div><div class="ameta">'+esc(S.abbr)+' '+esc(a.year)+';'+esc(a.vol)+'('+esc(a.issue)+')'+(a.pages?':'+esc(a.pages):'')+(a.doi?' &middot; doi:'+esc(a.doi):'')+'</div><a class="btn sm" href="#/article/'+a.id+'">Read</a> <button class="btn sm ghost" data-act="pdf" data-id="'+a.id+'">PDF</button></article>';}
function tocRow(a){return '<div class="toc"><div class="tt"><a href="#/article/'+a.id+'">'+esc(a.title)+'</a>'+pill(a)+'</div><div class="ta">'+esc(authNames(a))+'</div><div class="tm">'+esc(a.type)+(a.branch?' &middot; '+esc(a.branch):'')+(a.pages?' &middot; pp. '+esc(a.pages):'')+(a.doi?' &middot; doi:'+esc(a.doi):'')+' &middot; <a href="#/article/'+a.id+'">Abstract</a> &middot; <a href="#" data-act="pdf" data-id="'+a.id+'">PDF</a></div></div>';}
var TYPE_ORDER=['Original Research','Systematic Review / Meta-analysis','Review Article','Case Report','Short Communication','Letter to Editor'];
function tocHtml(arts){var by={};arts.forEach(function(a){(by[a.type]=by[a.type]||[]).push(a);});var types=TYPE_ORDER.filter(function(t){return by[t];}).concat(Object.keys(by).filter(function(t){return TYPE_ORDER.indexOf(t)<0;}));return types.map(function(t){return '<div class="ttl"><h2>'+esc(t)+'s</h2></div>'+by[t].map(tocRow).join('');}).join('');}

function vHome(){var p=pubList(),li=latestIssue(),c=issueCounts();var arts=li?issueArts(li.year,li.issue):[];var an=rows(S.announcements).slice(-3).reverse();
 return '<div class="hero"><div class="wrap"><div class="hlogo"><img src="'+HERO_LOGO()+'" alt="'+esc(S.short)+' logo"></div><div class="jt">'+esc(S.name)+'</div><div class="jd"><b>'+esc(S.short)+'</b> &middot; Peer-reviewed &middot; Open Access &middot; '+esc(S.freq)+' &middot; '+esc(S.scope||'')+(S.issnO?' &middot; eISSN '+esc(S.issnO):'')+(S.issnP?' &middot; pISSN '+esc(S.issnP):'')+'<br>Published by '+esc(S.publisher)+', '+esc(S.address)+'</div><p style="margin:0 auto">'+esc(S.tagline)+'</p><div class="stats"><div><b>'+esc(S.freq)+'</b><span>Publication frequency</span></div><div><b>Open Access</b><span>'+esc(S.license)+'</span></div><div><b>Peer-reviewed</b><span>Independent review</span></div></div></div><p style="margin-top:18px"><a class="btn gold" href="#/submit">Submit manuscript</a> <a class="btn ghost" href="#/archive">Browse archive</a></p></div></div>'
 +pg(branchHome()
 +'<div class="grid2"><div><div class="ttl"><h2>'+(li?'Latest issue &middot; Vol. '+li.vol+', Issue '+li.issue+' ('+esc(li.period)+')':'Latest articles')+'</h2></div>'+(arts.length?arts.slice(0,8).map(card).join(''):'<div class="card">No articles published yet.</div>')+(li?'<p><a href="#/issue/'+li.year+'-'+li.issue+'">View full issue ('+arts.length+' articles) &rarr;</a> &nbsp; <a href="#/archive">Archive &rarr;</a></p>':'')+'</div><aside class="side"><div class="card"><h4>Journal</h4><div class="kv"><span>Publisher</span><b>'+esc(S.publisher)+'</b></div><div class="kv"><span>Frequency</span><b>'+esc(S.freq)+'</b></div><div class="kv"><span>Access</span><b>Open</b></div><div class="kv"><span>License</span><b>'+esc(S.license)+'</b></div></div>'+(an.length?'<div class="card"><h4>Announcements</h4>'+an.map(function(r){return '<p style="font-size:13px"><b>'+esc(r[1]||'')+'</b><br><span class="pg-h">'+esc(fmtDate(r[0]))+'</span></p>';}).join('')+'<a href="#/announcements">All announcements</a></div>':'')+'<div class="card"><h4>For authors</h4><p style="font-size:13px">Register, submit your manuscript online and follow its review status.</p><a class="btn sm" href="#/submit">Submit</a> <a class="btn sm ghost" href="#/guidelines">Guidelines</a></div></aside></div>');}
function vCurrent(){var li=latestIssue();if(!li)return hd('Current Issue')+pg('<div class="card">No issue published yet.</div>');var arts=issueArts(li.year,li.issue);
 return hd('Current Issue','Volume '+li.vol+', Issue '+li.issue+' &middot; '+esc(li.period)+' &middot; '+arts.length+' articles')+pg(arts.length?tocHtml(arts):'<div class="card">No articles in this issue yet.</div>');}
function vArchive(){var c=issueCounts(),is=allIssues(),by={};is.forEach(function(x){(by[x.year]=by[x.year]||[]).push(x);});var ys=Object.keys(by).sort(function(a,b){return b-a;});
 return hd('Archive','All issues from '+START_YEAR+' &middot; bi-monthly &middot; volume = year &minus; '+(START_YEAR-1))+pg('<div class="card"><b>Archival policy.</b> Every issue stays online and freely accessible; articles are never removed except by a published retraction. Issue records for each bi-monthly period since '+START_YEAR+' are listed below.</div>'+ys.map(function(y){var l=by[y].slice().sort(function(a,b){return a.issue-b.issue;});var tot=l.reduce(function(s,x){return s+(c[x.year+'-'+x.issue]||0);},0);return '<div class="yr"><div class="ttl"><h2>'+y+' &middot; Volume '+volOf(+y)+' <small style="font-weight:400;font-size:14px;color:#667">('+tot+' articles)</small></h2></div><div class="isgrid">'+l.map(function(x){return '<a class="iss" href="#/issue/'+x.year+'-'+x.issue+'"><b>Issue '+x.issue+'</b><span>'+esc(x.period)+'</span><em>'+(c[x.year+'-'+x.issue]||0)+' articles</em></a>';}).join('')+'</div></div>';}).join(''));}
function vIssue(key){var m=String(key||'').match(/^(\d{4})-(\d)$/);if(!m)return hd('Issue')+pg('<div class="card">Issue not found.</div>');var y=+m[1],i=+m[2];if(y<START_YEAR||i<1||i>6)return hd('Issue')+pg('<div class="card">Issue not found.</div>');var arts=issueArts(y,i);
 var is=allIssues().slice().reverse(),idx=-1;is.forEach(function(x,k){if(x.year===y&&x.issue===i)idx=k;});var pv=is[idx-1],nx=is[idx+1];
 return hd('Volume '+volOf(y)+', Issue '+i,esc(periodOf(y,i))+' &middot; '+arts.length+' articles')+pg('<p>'+(pv?'<a href="#/issue/'+pv.year+'-'+pv.issue+'">&larr; '+esc(pv.period)+'</a>':'')+(nx?' &nbsp; <a href="#/issue/'+nx.year+'-'+nx.issue+'">'+esc(nx.period)+' &rarr;</a>':'')+' &nbsp; <a href="#/archive">All issues</a>'+(isAdmin()?' &nbsp; <a class="btn sm" href="#/admin/new/'+y+'-'+i+'">+ Add article to this issue</a>':'')+'</p>'+(arts.length?tocHtml(arts):'<div class="card">No articles have been published in this issue.</div>'));}
function vSearch(){return hd('Search')+pg('<div class="fg"><input id="sq" placeholder="Title, author, keyword, DOI..." value="'+esc(SQ)+'" autocomplete="off"></div><div id="sres"></div>');}
function doSearch(){var q=($('sq')||{value:''}).value.toLowerCase().trim();SQ=q;if(!$('sres'))return;if(q.length<2){$('sres').innerHTML='<div class="card">Type at least two characters.</div>';return;}var r=pubList().filter(function(a){return (a.title+' '+authNames(a)+' '+(a.branch||'')+' '+(a.keywords||[]).join(' ')+' '+a.abstract+' '+(a.doi||'')).toLowerCase().indexOf(q)>-1;});$('sres').innerHTML='<p class="pg-h">'+r.length+' result(s)'+(r.length>60?' &middot; showing first 60':'')+'</p>'+(r.length?r.slice(0,60).map(tocRow).join(''):'<div class="card">No results.</div>');}

function vBoard(){var r=rows(S.board);var out='';if(!r.length)out='<div class="card">The editorial board will be listed here once appointed. (Admin: Content &rarr; Editorial board.)</div>';else{var last='';out='<table class="t bd"><tr><th>Role</th><th>Name</th><th>Affiliation</th><th>Country</th></tr>'+r.map(function(x){var t='<tr><td>'+(x[0]!==last?'<b>'+esc(x[0])+'</b>':'')+'</td><td>'+esc(x[1]||'')+'</td><td>'+esc(x[2]||'')+'</td><td>'+esc(x[3]||'')+'</td></tr>';last=x[0];return t;}).join('')+'</table>';}
 return hd('Editorial Board')+pg(out);}
function vIndexing(){var r=rows(S.indexed.replace(/\|/g,'|')),out='';var ix=r.filter(function(x){return x[0];});
 out=ix.length?'<table class="t"><tr><th>Database / service</th><th>Details</th></tr>'+ix.map(function(x){return '<tr><td>'+esc(x[0])+'</td><td>'+(/^https?:/.test(x[1]||'')?'<a href="'+esc(x[1])+'" target="_blank" rel="noopener">'+esc(x[1])+'</a>':esc(x[1]||''))+'</td></tr>';}).join('')+'</table>':'<div class="card">No indexing information has been published yet.</div>';
 return hd('Indexing & Abstracting')+pg(out+(S.nmc?'<div class="card" style="margin-top:16px"><h3>Recognition / accreditation</h3>'+paras(S.nmc)+'</div>':''));}
function vAnnounce(){var r=rows(S.announcements).reverse();return hd('Announcements')+pg(r.length?r.map(function(x){return '<div class="card"><span class="pg-h">'+esc(fmtDate(x[0]))+'</span><h3>'+esc(x[1]||'')+'</h3><p>'+esc(x[2]||'')+'</p></div>';}).join(''):'<div class="card">No announcements.</div>');}
function vSpecial(){var r=rows(S.special);return hd('Special Issues')+pg(r.length?r.map(function(x){return '<div class="card"><h3>'+esc(x[0]||'')+'</h3>'+(x[1]?'<p class="pg-h">Deadline: '+esc(fmtDate(x[1]))+'</p>':'')+'<p>'+esc(x[2]||'')+'</p></div>';}).join(''):'<div class="card">No special issues are open at the moment.</div>');}
function vFaq(){var r=rows(S.faq);return hd('Frequently Asked Questions')+pg(r.map(function(x){return '<div class="card"><h3>'+esc(x[0])+'</h3><p>'+esc(x.slice(1).join(' | '))+'</p></div>';}).join(''));}
function vApc(){return hd('Article Processing Charges & Waivers')+pg('<div class="card">'+(S.apc?paras(S.apc):'<p>Details of article processing charges and waivers have not been published yet.</p>')+'</div>');}
function vEthics(){return hd('Publication Ethics & Policies')+pg('<div class="card">'+paras(S.ethics)+'</div><div class="card" style="margin-top:14px"><h3>Peer review</h3>'+paras(S.peer)+'</div><div class="card" style="margin-top:14px"><h3>Use of AI tools</h3>'+paras(S.aipolicy)+'</div>'+(S.plag?'<div class="card" style="margin-top:14px"><h3>Plagiarism screening</h3>'+paras(S.plag)+'</div>':''));}

/* UGC Suggestive Parameters for Peer-Reviewed Journals (Annexure-I, UGC notification 16 July 2025) */
var UGC=[['1. Journal preliminary criteria','1.1','Journal title'],['1. Journal preliminary criteria','1.2','ISSN (print and/or online)'],['1. Journal preliminary criteria','1.3','Periodicity and continuity (regular publication schedule)'],['1. Journal preliminary criteria','1.4','Contact and publication details'],['1. Journal preliminary criteria','1.5','Transparent review policy'],['1. Journal preliminary criteria','1.6','Website on a certified domain'],['1. Journal preliminary criteria','1.7','Open access or subscription policy'],['1. Journal preliminary criteria','1.8','Integration with national/international repositories (e.g. ONOS)'],['1. Journal preliminary criteria','1.9','Archival policy'],
['2. Editorial board criteria','2.1','Editorial board details'],['2. Editorial board criteria','2.2','Editorial board composition'],['2. Editorial board criteria','2.3','Efficient editorial/review process'],
['3. Journal editorial policy','3.1','Aims, objectives and scope'],['3. Journal editorial policy','3.2','Subject areas'],['3. Journal editorial policy','3.3','Article processing charges (APC)'],['3. Journal editorial policy','3.4','Publishing timeline'],['3. Journal editorial policy','3.5','Acceptance rate'],
['4. Quality criteria - content','4.1','Academic contribution'],['4. Quality criteria - content','4.2','Conformity to journal scope'],
['5. Journal standards','5.1','Bibliographic data and literature citation'],['5. Journal standards','5.2','Font and design'],['5. Journal standards','5.3','Infographics and exhibits'],['5. Journal standards','5.4','Citation record'],['5. Journal standards','5.5','Print continuum'],['5. Journal standards','5.6','Quality of website'],['5. Journal standards','5.7','Multilingual availability'],
['6. Research ethics','6.1','Ethical guidelines for authors'],['6. Research ethics','6.2','Plagiarism prevention'],['6. Research ethics','6.3','Conflict of interest'],['6. Research ethics','6.4','AI-generated content policy'],
['7. Journal visibility','7.1','Impact factor or similar (if applicable)'],['7. Journal visibility','7.2','Indexation in reputed databases'],
['8. Journal impact criteria','8.1','Self-citation score'],['8. Journal impact criteria','8.2','Total citation rate'],['8.3'.charAt(0)+'. Journal impact criteria','8.3','Cite score']];
function ugcSaved(){try{return JSON.parse(S.ugc||'{}');}catch(e){return {};}}
function ugcAuto(no){var c=issueCounts(),hasArt=Object.keys(c).length>0;var m={'1.1':!!S.name,'1.2':!!(S.issnP||S.issnO),'1.3':!!S.freq&&hasArt,'1.4':!!(S.address&&S.email&&S.publisher),'1.5':!!S.peer,'1.7':!!S.license,'1.9':hasArt,'2.1':rows(S.board).length>0,'3.1':!!S.aims,'3.2':!!S.subjects,'3.3':!!S.apc,'3.4':!!S.timeline,'3.5':!!S.accept,'5.1':ARTS.some(function(a){return a.refs;}),'6.1':!!S.ethics,'6.2':!!S.plag,'6.4':!!S.aipolicy,'7.2':!!S.indexed};return no in m?m[no]:null;}
function vCompliance(){var sv=ugcSaved(),last='';var r=UGC.filter(function(x){return sv[x[1]]&&sv[x[1]].s;});
 return hd('UGC Suggestive Parameters - Self-assessment')+pg('<div class="note">Self-assessment by the publisher against the UGC Suggestive Parameters for Peer-Reviewed Journals (Annexure-I, 16 July 2025). It is not a UGC listing or endorsement.</div>'+(r.length?'<table class="t bd"><tr><th>No.</th><th>Parameter</th><th>Status</th><th>Remarks</th></tr>'+r.map(function(x){return '<tr><td>'+x[1]+'</td><td>'+esc(x[2])+'</td><td>'+esc(sv[x[1]].s)+'</td><td>'+esc(sv[x[1]].n||'')+'</td></tr>';}).join('')+'</table>':'<div class="card">No items assessed yet.</div>'));}

function branchPanel(k,counts){var life=k==='life',c=counts?branchCounts():{};
 return '<div class="bp'+(life?' life':'')+'"><h3>'+ico(life?'dna':'steth')+(life?'Life Sciences':'Medical &amp; Surgical Branches')+'</h3>'+BRANCHES[k].map(function(g){return '<h4>'+esc(g.g)+'</h4><div class="chips">'+g.items.map(function(x){return '<a href="#/subject/'+encodeURIComponent(x)+'">'+esc(x)+(counts?' <span>'+(c[x]||0)+'</span>':'')+'</a>';}).join('')+'</div>';}).join('')+'</div>';}
function branchCounts(){var m={};ARTS.forEach(function(a){if(a.status==='published'&&a.branch)m[a.branch]=(m[a.branch]||0)+1;});return m;}
function vSubjects(){return hd('Subjects','Medical &amp; surgical branches and life sciences')+pg('<div class="bpanels one">'+branchPanel('medical',true)+branchPanel('life',true)+'</div>');}
function vSubject(n){var l=pubList().filter(function(a){return a.branch===n;});var life=branchFlat('life').indexOf(n)>-1;return hd(esc(n),life?'Life Sciences':'Medical &amp; Surgical Sciences')+pg('<p><a href="#/subjects">&larr; All subjects</a></p>'+(l.length?l.map(tocRow).join(''):'<div class="card">No articles have been published in this subject yet.</div>'));}
/* ========== ROUTER ========== */
function route(){
 var h=location.hash.replace(/^#\/?/,'')||window.IJMMS_PAGE||'home';var p=h.split('/');var v=p[0];var html='';window._viewed=false;
 var R={home:vHome,current:vCurrent,archive:vArchive,search:vSearch,about:vAbout,guidelines:vGuidelines,contact:vContact,board:vBoard,indexing:vIndexing,announcements:vAnnounce,special:vSpecial,apc:vApc,ethics:vEthics,faq:vFaq,compliance:vCompliance,subjects:vSubjects,progress:vProgress,join:vJoin,copyright:vCopyright,login:vLogin,register:vRegister,submit:vSubmit,dash:vDash};
 if(v==='article')html=vArticle(p[1]);else if(v==='issue')html=vIssue(p[1]);else if(v==='subject')html=vSubject(decodeURIComponent(p[1]||''));else if(v==='sub')html=vSub(p[1]);else if(v==='admin')html=isAdmin()?vAdmin(p):vLogin();else if(R[v])html=R[v]();else html=vHome();
 $('app').innerHTML=html;renderChrome();window.scrollTo(0,0);
 if(v==='search')doSearch();
}
