var JID=window.IJMMS_JOURNAL||'ms';var JK=JID==='ls'?'ijmls_':'ijmms_';
'use strict';
/* ========== UTIL ========== */
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function uid(){return 'a'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);}
function cyrb(str){var h1=0xdeadbeef,h2=0x41c6ce57;for(var i=0,ch;i<str.length;i++){ch=str.charCodeAt(i);h1=Math.imul(h1^ch,2654435761);h2=Math.imul(h2^ch,1597334677);}h1=Math.imul(h1^(h1>>>16),2246822507)^Math.imul(h2^(h2>>>13),3266489909);h2=Math.imul(h2^(h2>>>16),2246822507)^Math.imul(h1^(h1>>>13),3266489909);return (4294967296*(2097151&h2)+(h1>>>0)).toString(36);}
function $(id){return document.getElementById(id);}
function today(){return new Date().toISOString().slice(0,10);}
function fmtDate(d){if(!d)return '';var x=new Date(d+'T00:00:00');if(isNaN(x))return d;return x.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'});}
function toast(m){var t=document.createElement('div');t.textContent=m;$('toast').appendChild(t);setTimeout(function(){t.remove();},4500);}
function ls(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v);}catch(e){return null;}}

/* ========== SETTINGS ========== */
var DEFAULTS={name:'International Journal of Modern Medicine & Surgery',abbr:'Int J Mod Med Surg',short:'IJMMS',publisher:'Genosync Publications',issnP:'',issnO:'',doiPrefix:'10.xxxxx',license:'CC BY 4.0',email:'editor@ijmms.org',address:'Chhatrapati Sambhajinagar, Maharashtra, India',freq:'Bi-monthly',tagline:'Peer-reviewed, open-access research across medicine and surgery.',about:'IJMMS publishes original research, reviews, case reports and short communications across medical and surgical specialties. All published articles are freely available to read and download.',indexed:'',pwHash:cyrb('admin123'),defaultPw:true};
var S={};
function loadSettings(){var o={};try{o=JSON.parse(ls(JK+'settings')||'{}');}catch(e){}S={};for(var k in DEFAULTS)S[k]=(o[k]!==undefined)?o[k]:DEFAULTS[k];}
function saveSettings(){ls(JK+'settings',JSON.stringify(S));}

/* ========== STORAGE (IndexedDB) ========== */
var ARTS=[];
var DB={db:null,fail:false,
 open:function(){return new Promise(function(res,rej){if(typeof indexedDB==='undefined'){rej(new Error('no idb'));return;}var r=indexedDB.open(JK+'v1',2);r.onupgradeneeded=function(){var d=r.result;if(!d.objectStoreNames.contains('articles'))d.createObjectStore('articles',{keyPath:'id'});if(!d.objectStoreNames.contains('files'))d.createObjectStore('files');if(!d.objectStoreNames.contains('subs'))d.createObjectStore('subs',{keyPath:'id'});};r.onsuccess=function(){DB.db=r.result;res();};r.onerror=function(){rej(r.error);};});},
 st:function(n,m){return DB.db.transaction(n,m).objectStore(n);},
 rq:function(r){return new Promise(function(res,rej){r.onsuccess=function(){res(r.result);};r.onerror=function(){rej(r.error);};});},
 all:function(){return DB.fail?Promise.resolve([]):DB.rq(DB.st('articles','readonly').getAll());},
 put:function(a){return DB.fail?Promise.resolve():DB.rq(DB.st('articles','readwrite').put(a));},
 del:function(id){return DB.fail?Promise.resolve():DB.rq(DB.st('articles','readwrite').delete(id));},
 putFile:function(id,b){return DB.fail?Promise.resolve():DB.rq(DB.st('files','readwrite').put(b,id));},
 getFile:function(id){return DB.fail?Promise.resolve(null):DB.rq(DB.st('files','readonly').get(id));},
 delFile:function(id){return DB.fail?Promise.resolve():DB.rq(DB.st('files','readwrite').delete(id));},
 allFileKeys:function(){return DB.fail?Promise.resolve([]):DB.rq(DB.st('files','readonly').getAllKeys());}
};
function findArt(id){for(var i=0;i<ARTS.length;i++)if(ARTS[i].id===id)return ARTS[i];return null;}
async function saveArt(a){var i=ARTS.indexOf(findArt(a.id));if(i>-1)ARTS[i]=a;else ARTS.push(a);await DB.put(a);}

/* ========== ARTICLE HELPERS ========== */
function pubList(){return ARTS.filter(function(a){return a.status==='published';}).sort(function(x,y){return (y.published||'').localeCompare(x.published||'');});}
function parseAuthors(raw){return String(raw||'').split('\n').map(function(l){return l.trim();}).filter(Boolean).map(function(l){var p=l.split('|').map(function(x){return x.trim();});return {name:p[0]||'',aff:p[1]||'',orcid:p[2]||''};});}
function authNames(a){return parseAuthors(a.authorsRaw).map(function(x){return x.name;}).join(', ');}
function surname(n){var p=n.replace(/^(Dr\.?|Prof\.?|Mr\.?|Ms\.?|Mrs\.?)\s+/i,'').trim().split(/\s+/);return p.length?p[p.length-1]:n;}
function initials(n){var p=n.replace(/^(Dr\.?|Prof\.?|Mr\.?|Ms\.?|Mrs\.?)\s+/i,'').trim().split(/\s+/);p.pop();return p.map(function(x){return x.charAt(0).toUpperCase();}).join('');}
function shortAuth(a){var au=parseAuthors(a.authorsRaw);if(!au.length)return '';return surname(au[0].name)+(au.length>1?' et al.':'');}
function vanc(a){var au=parseAuthors(a.authorsRaw);var l=au.slice(0,6).map(function(x){return surname(x.name)+' '+initials(x.name);}).join(', ');if(au.length>6)l+=', et al';return l+'. '+a.title.replace(/\.$/,'')+'. '+S.abbr+'. '+a.year+';'+a.vol+'('+a.issue+')'+(a.pages?':'+a.pages:(a.artno?':'+a.artno:''))+'.'+(a.doi?' doi:'+a.doi:'');}
function apa(a){var au=parseAuthors(a.authorsRaw);var l=au.map(function(x){return surname(x.name)+', '+initials(x.name).split('').join('. ')+'.';});var s=l.length>1?l.slice(0,-1).join(', ')+', & '+l[l.length-1]:(l[0]||'');return s+' ('+a.year+'). '+a.title.replace(/\.$/,'')+'. '+S.name+', '+a.vol+'('+a.issue+')'+(a.pages?', '+a.pages:'')+'.'+(a.doi?' https://doi.org/'+a.doi:'');}
function cap(s){return s;}

/* ========== TEXT FORMATTING ========== */
function inl(s){s=esc(s);s=s.replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/(^|[^*])\*([^*\n]+)\*/g,'$1<i>$2</i>').replace(/\^([^\^\s]+)\^/g,'<sup>$1</sup>').replace(/~([^~\s]+)~/g,'<sub>$1</sub>');return s;}
function tableHtml(lines){var rows=lines.map(function(l){return l.trim().replace(/^\|/,'').replace(/\|$/,'').split('|').map(function(c){return c.trim();});}).filter(function(r){return !r.every(function(c){return /^:?-{2,}:?$/.test(c);});});if(!rows.length)return '';var h='<table><thead><tr>'+rows[0].map(function(c){return '<th>'+inl(c)+'</th>';}).join('')+'</tr></thead><tbody>';for(var i=1;i<rows.length;i++)h+='<tr>'+rows[i].map(function(c){return '<td>'+inl(c)+'</td>';}).join('')+'</tr>';return h+'</tbody></table>';}
function figHtml(a,i,used){var f=a.figures&&a.figures[i];if(!f)return '';used[i]=true;return '<figure><img src="'+f.data+'" alt="Figure '+(i+1)+'"><figcaption><b>Figure '+(i+1)+'.</b> '+inl(f.caption||'')+'</figcaption></figure>';}
function fmt(text,a,used){return String(text||'').replace(/\r/g,'').split(/\n\s*\n/).map(function(b){b=b.trim();if(!b)return '';var m=b.match(/^\{\{\s*fig\s*(\d+)\s*\}\}$/i);if(m)return figHtml(a,parseInt(m[1],10)-1,used);var ls_=b.split('\n');if(ls_.every(function(l){return /^\|/.test(l.trim());}))return tableHtml(ls_);if(ls_.every(function(l){return /^[-•]\s+/.test(l.trim());}))return '<ul>'+ls_.map(function(l){return '<li>'+inl(l.trim().replace(/^[-•]\s+/,''))+'</li>';}).join('')+'</ul>';if(/^###\s+/.test(b))return '<h4>'+inl(b.replace(/^###\s+/,''))+'</h4>';return '<p>'+inl(ls_.join(' '))+'</p>';}).join('');}
function bodyHtml(a){var used={};var h=(a.sections||[]).map(function(s){return (s.heading?'<h2>'+esc(s.heading)+'</h2>':'')+fmt(s.text,a,used);}).join('');var left='';(a.figures||[]).forEach(function(f,i){if(!used[i])left+=figHtml(a,i,used);});return h+left;}
function declHtml(a){var d='';[['Acknowledgements',a.ack],['Funding',a.funding],['Conflict of interest',a.coi],['Ethics approval',a.ethics],['Data availability',a.data]].forEach(function(p){if(p[1])d+='<h2>'+p[0]+'</h2><p>'+inl(p[1])+'</p>';});return d;}
function refList(a){return String(a.refs||'').split('\n').map(function(l){return l.trim().replace(/^\[?\d+[\].)]\s*/,'');}).filter(Boolean);}
function refsHtml(a){var r=refList(a);if(!r.length)return '';return '<h2>References</h2><ol>'+r.map(function(x){return '<li>'+inl(x)+'</li>';}).join('')+'</ol>';}

/* ========== CHROME ========== */

/* ========== PUBLIC VIEWS ========== */
function vArticle(id){var a=findArt(id);if(!a||(a.status!=='published'&&!isAdmin()))return '<section class="pg"><div class="wrap"><div class="card">Article not found.</div></div></section>';
 if(a.status==='published'&&!window._viewed){a.views=(a.views||0)+1;DB.put(a);}
 var au=parseAuthors(a.authorsRaw),affs=[];au.forEach(function(x){if(x.aff&&affs.indexOf(x.aff)<0)affs.push(x.aff);});
 var al=au.map(function(x){var s=esc(x.name),sp=[];if(x.aff)sp.push(affs.indexOf(x.aff)+1);if(a.corr&&a.corr.toLowerCase().indexOf(x.name.toLowerCase())>-1)sp.push('*');return s+(sp.length?'<sup>'+sp.join(',')+'</sup>':'');}).join(', ');
 var pdfBtn=a.hasPdf?'<button class="btn teal" data-act="pdf" data-id="'+a.id+'">Download PDF</button> <button class="btn ghost" data-act="jpdf" data-id="'+a.id+'">Journal-format PDF</button>':'<button class="btn teal" data-act="jpdf" data-id="'+a.id+'">Download PDF</button>';
 return '<section class="pg"><div class="wrap"><p><a href="#/home">&larr; Back</a></p><div class="art">'+(a.status!=='published'?'<div class="note">Draft - not visible to the public.</div>':'')+'<div class="atype">'+esc(a.type)+(a.branch?' &middot; '+esc(a.branch):'')+'</div><h1>'+esc(a.title)+'</h1><div class="au">'+al+'</div>'+(affs.length?'<div class="af">'+affs.map(function(f,i){return '<sup>'+(i+1)+'</sup>'+esc(f);}).join('<br>')+'</div>':'')+(a.corr?'<div class="af">*Correspondence: '+esc(a.corr)+'</div>':'')
 +'<p style="margin-top:14px;font-size:13px;color:var(--m)">'+esc(S.abbr)+' '+esc(a.year)+';'+esc(a.vol)+'('+esc(a.issue)+')'+(a.pages?':'+esc(a.pages):'')+(a.doi?' &middot; doi: <a href="https://doi.org/'+esc(a.doi)+'" target="_blank" rel="noopener">'+esc(a.doi)+'</a>':'')+'<br>Received '+fmtDate(a.received)+' &middot; Accepted '+fmtDate(a.accepted)+' &middot; Published '+fmtDate(a.published)+'</p><p>'+pdfBtn+'</p>'
 +(a.abstract?'<div class="abs"><h3>Abstract</h3><div class="body">'+fmt(a.abstract,a,{})+'</div></div>':'')
 +((a.keywords||[]).length?'<div class="kw"><b>Keywords:</b> '+a.keywords.map(function(k){return '<span>'+esc(k)+'</span>';}).join('')+'</div>':'')
 +'<div class="body">'+bodyHtml(a)+declHtml(a)+'</div><div class="refs body">'+refsHtml(a)+'</div>'
 +'<h2 style="font-size:18px;margin-top:26px">How to cite</h2><div class="cite"><b>Vancouver:</b> '+esc(vanc(a))+'</div><div class="cite"><b>APA:</b> '+esc(apa(a))+'</div><p style="font-size:12.5px;color:var(--m)">&copy; '+esc(a.year)+' The authors. Licensed under '+esc(a.license||S.license)+'. '+esc(a.views||0)+' views.</p></div></div></section>';}
var SQ='';
function vSearch(){return '<div class="ph"><div class="wrap"><h1>Search</h1></div></div><section class="pg"><div class="wrap"><div class="fg"><input id="sq" placeholder="Title, author, keyword..." value="'+esc(SQ)+'" autocomplete="off"></div><div id="sres"></div></div></section>';}
function vAbout(){var ix=String(S.indexed||'').split('\n').map(function(x){return x.trim();}).filter(Boolean);return '<div class="ph"><div class="wrap"><h1>About the Journal</h1></div></div><section class="pg"><div class="wrap grid2"><div class="card">'+String(S.about).split(/\n\s*\n/).map(function(p){return '<p>'+esc(p)+'</p>';}).join('')+'<h3>Peer review and ethics</h3><p>Manuscripts are screened by the editorial office and evaluated by independent reviewers. Authors must follow ICMJE recommendations and COPE guidance on publication ethics.</p>'+(ix.length?'<h3>Indexing</h3><p>'+ix.map(esc).join(' &middot; ')+'</p>':'')+'</div><aside class="side"><div class="card"><h4>Journal facts</h4><div class="kv"><span>Publisher</span><b>'+esc(S.publisher)+'</b></div><div class="kv"><span>Frequency</span><b>'+esc(S.freq)+'</b></div>'+(S.issnO?'<div class="kv"><span>eISSN</span><b>'+esc(S.issnO)+'</b></div>':'')+(S.issnP?'<div class="kv"><span>pISSN</span><b>'+esc(S.issnP)+'</b></div>':'')+'<div class="kv"><span>License</span><b>'+esc(S.license)+'</b></div></div></aside></div></section>';}
function vGuidelines(){return '<div class="ph"><div class="wrap"><h1>Author Guidelines</h1></div></div><section class="pg"><div class="wrap"><div class="card"><h3>Article types</h3><table class="t"><tr><th>Type</th><th>Words</th><th>Abstract</th><th>References</th></tr><tr><td>Original Research</td><td>3000-5000</td><td>Structured, 250</td><td>up to 45</td></tr><tr><td>Systematic Review / Meta-analysis</td><td>4000-8000</td><td>Structured, 300</td><td>unlimited</td></tr><tr><td>Review Article</td><td>3000-6000</td><td>Unstructured, 200</td><td>up to 60</td></tr><tr><td>Case Report</td><td>1500-2500</td><td>Unstructured, 150</td><td>up to 20</td></tr><tr><td>Short Communication</td><td>1000-1800</td><td>Unstructured, 100</td><td>up to 15</td></tr><tr><td>Letter to Editor</td><td>500-1000</td><td>None</td><td>up to 10</td></tr></table><h3 style="margin-top:20px">Preparation</h3><ul><li>Submit a Word (.docx) file with title page, abstract, keywords, main text, references and declarations.</li><li>Vancouver reference style, numbered in order of citation.</li><li>Figures at 300 dpi or higher with legends; tables in editable form.</li><li>Ethics committee approval, informed consent and trial registration must be stated where applicable.</li><li>Declare funding, conflicts of interest and any use of AI tools.</li></ul><p>Send manuscripts to <a href="mailto:'+esc(S.email)+'">'+esc(S.email)+'</a>.</p></div></div></section>';}
function vContact(){return '<div class="ph"><div class="wrap"><h1>Contact</h1></div></div><section class="pg"><div class="wrap grid2"><div class="card"><div class="fg"><label>Your name</label><input id="cn"></div><div class="fg"><label>Your email</label><input id="ce"></div><div class="fg"><label>Subject</label><input id="cs"></div><div class="fg"><label>Message</label><textarea id="cm"></textarea></div><button class="btn" data-act="mail">Open in email app</button></div><aside class="side"><div class="card"><h4>Editorial office</h4><p style="font-size:13px">'+esc(S.publisher)+'<br>'+esc(S.address)+'<br><a href="mailto:'+esc(S.email)+'">'+esc(S.email)+'</a></p></div></aside></div></section>';}

/* ========== ROUTER ========== */

