/* ========== ARTICLES 2: APC rate card, citations/references automation, editor extras, journal PDF ========== */
var GRP=(typeof JID!=='undefined'&&JID==='ls')?'ls':'ms';
TEMPLATES['Case Report']=['Introduction','Patient Information','Clinical Findings','Timeline','Diagnostic Assessment','Therapeutic Intervention','Follow-up and Outcomes','Discussion','Patient Perspective','Conclusion'];
TEMPLATES['Systematic Review / Meta-analysis']=['Introduction','Methods','Results','Discussion','Limitations','Conclusion'];
if(GRP==='ls'){TYPE_ORDER=TYPE_ORDER.filter(function(x){return x!=='Case Report';});SUB_TYPES=SUB_TYPES.filter(function(x){return x!=='Case Report';});delete TEMPLATES['Case Report'];}
DEFAULTS.apcApproved=false;

/* ---------- APC rate card (approved wording and rates) ---------- */
var APC_ROWS={
 ms:[['Original Research','Original Research Article','3,000–5,000',5000,5999,150,3,3],['Review Article','Review Article','3,000–6,000',6000,6499,160,3,3],['Systematic Review / Meta-analysis','Systematic Review / Meta-analysis','4,000–8,000',8000,7999,200,4,4],['Case Report','Case Report','1,500–2,500',2500,3499,120,2,2],['Short Communication','Short Communication','1,000–1,800',1800,2999,115,2,2],['Letter to Editor','Letter to Editor','500–1,000',1000,1999,110,1,1]],
 ls:[['Original Research','Original Research Article','3,000–5,000',5000,2500,135,3,3],['Review Article','Review Article','3,000–6,000',6000,3500,145,3,3],['Systematic Review / Meta-analysis','Systematic Review / Meta-analysis','4,000–8,000',8000,4500,180,4,4],['Short Communication','Short Communication','1,000–1,800',1800,2000,110,2,2],['Letter to Editor','Letter to Editor','500–1,000',1000,1500,105,1,1]]};
var APC_NAME={ms:'Medical Sciences',ls:'Life Sciences'};
var APC_EXTRA=[['Each additional figure','₹500','$15'],['Each additional table','₹300','$10'],['Complex diagram / Flowchart','₹800','$25'],['Figure redrawing / Image enhancement','₹500–₹1,000','$15–$25'],['Additional 500 words','₹500','$15']];
var APC_TERMS=['Article Processing Charges are payable only after final acceptance of the manuscript.','Acceptance is strictly based on editorial assessment and independent peer review.','Payment of APC does not guarantee manuscript acceptance or publication.','Additional figures, tables, diagrams, and word-count extensions will be charged separately.','GST or other applicable taxes will be charged additionally, wherever applicable.','Any waiver or discount will be subject to journal policy and editorial approval.',"The APC covers the journal's publication processing activities, as defined by its actual services.",'Journal subscription fees or third-party publication fees, if any, are not included unless explicitly stated.'];
function inr(n){return '₹'+Number(n).toLocaleString('en-IN');}
function usd(n){return '$'+n;}
function apcRow(grp,type){var r=APC_ROWS[grp]||[];for(var i=0;i<r.length;i++){if(r[i][0]===type||r[i][1]===type)return r[i];}return null;}
function apcCalc(grp,type,reg,o){var r=apcRow(grp,type);if(!r)return null;o=o||{};var f=Math.max(0,(o.figs||0)-r[6]),t=Math.max(0,(o.tabs||0)-r[7]),w=Math.max(0,Math.ceil(((o.words||0)-r[3])/500)),d=o.diag||0;
 var base=reg==='in'?r[4]:r[5],ex=reg==='in'?(f*500+t*300+d*800+w*500):(f*15+t*10+d*25+w*15);return {row:r,base:base,extra:ex,total:base+ex,xf:f,xt:t,xw:w,fmt:function(n){return reg==='in'?inr(n):usd(n);}};}
function apcStatement(a){var r=apcRow(GRP,a.type);if(!r)return '';var ok=!!S.apcApproved;
 return '<b>Article processing charge ('+APC_NAME[GRP]+').</b> '+(ok?'':'<i>Proposed rates, subject to formal approval by the journal.</i> ')+esc(r[1])+': '+inr(r[4])+' (Indian authors) / '+usd(r[5])+' (international authors), including '+r[6]+' figure(s) and '+r[7]+' table(s). The APC is payable only after final acceptance, following editorial assessment and independent peer review. Payment of an APC does not guarantee acceptance or publication. Additional figures (₹500 / $15 each), tables (₹300 / $10 each), complex diagrams (₹800 / $25), figure redrawing (₹500–₹1,000 / $15–$25) and additional 500 words (₹500 / $15) are charged separately; GST or other applicable taxes are additional where applicable.';}
function apcTable(g){var rows=APC_ROWS[g].map(function(r){return '<tr><td class="n" data-label="Article type">'+esc(r[1])+'</td><td data-label="Word limit">'+r[2]+'</td><td data-label="Indian authors (INR)"><b>'+inr(r[4])+'</b></td><td data-label="International authors (USD)"><b>'+usd(r[5])+'</b></td></tr>';}).join('');
 return '<div class="apcwrap"><table class="apct '+g+'"><thead><tr><th>Article type</th><th>Word limit</th><th>Indian authors (INR)</th><th>International authors (USD)</th></tr></thead><tbody>'+rows+'</tbody></table></div>';}
function vApc(){var order=[GRP];var n=0;var lo=APC_ROWS[GRP].slice().sort(function(a,b){return a[4]-b[4];})[0],loU=APC_ROWS[GRP].slice().sort(function(a,b){return a[5]-b[5];})[0];
 var h=hd('Article Processing Charges (APC) - Journal Rate Card',APC_NAME[GRP]+' rate card');
 var b=(S.apcApproved?'':'<div class="apcnote"><b>Proposed rates.</b> These APC rates are proposed for implementation and are not presented as existing or previously verified journal charges until they are formally approved by the journal.</div>');
 b+='<div class="apchl"><div><b>From '+inr(lo[4])+'</b></div><div>'+esc(lo[1])+', Indian authors. International authors from '+usd(loU[5])+' ('+esc(loU[1])+').</div></div>';
 order.forEach(function(g){n++;b+='<h2 class="apcsec">'+n+'. '+APC_NAME[g].toUpperCase()+' - APC charges'+(g===GRP?' <small style="font-size:12px;color:#0E7C7B">(this journal)</small>':'')+'</h2>'+apcTable(g);});
 b+='<h2 class="apcsec">2. Additional figure and table charges</h2><p>These charges apply to all article types.</p><div class="apcwrap"><table class="apct"><thead><tr><th>Additional service</th><th>Indian authors (INR)</th><th>International authors (USD)</th></tr></thead><tbody>'+APC_EXTRA.map(function(r){return '<tr><td class="n" data-label="Service">'+r[0]+'</td><td data-label="Indian (INR)">'+r[1]+'</td><td data-label="International (USD)">'+r[2]+'</td></tr>';}).join('')+'</tbody></table></div>';
 b+='<h2 class="apcsec">3. Included figures and tables</h2><p>The following number of figures and tables are included in the basic APC. Any figures or tables exceeding the included allowance will attract additional charges as specified above.</p><div class="apcwrap"><table class="apct"><thead><tr><th>Article type</th><th>Figures included</th><th>Tables included</th></tr></thead><tbody>'+APC_ROWS[GRP].map(function(r){return '<tr><td class="n" data-label="Article type">'+esc(r[1])+'</td><td data-label="Figures included">'+r[6]+'</td><td data-label="Tables included">'+r[7]+'</td></tr>';}).join('')+'</tbody></table></div>';
 b+='<h2 class="apcsec">4. APC terms and conditions</h2><ol class="apcterms">'+APC_TERMS.map(function(t){return '<li>'+esc(t)+'</li>';}).join('')+'</ol>';
 b+='<h2 class="apcsec">APC estimator</h2><div class="card"><div class="row4"><div class="fg"><label>Subject group</label><select id="ap-g"><option value="'+GRP+'">'+APC_NAME[GRP]+'</option></select></div><div class="fg"><label>Article type</label><select id="ap-t">'+opt(APC_ROWS[GRP].map(function(r){return r[0];}),'Original Research')+'</select></div><div class="fg"><label>Author category</label><select id="ap-r"><option value="in">Indian (INR)</option><option value="int">International (USD)</option></select></div><div class="fg"><label>Words</label><input id="ap-w" type="number" value="0"></div></div><div class="row4"><div class="fg"><label>Figures</label><input id="ap-f" type="number" value="0"></div><div class="fg"><label>Tables</label><input id="ap-b" type="number" value="0"></div><div class="fg"><label>Complex diagrams</label><input id="ap-d" type="number" value="0"></div><div class="fg"><label>&nbsp;</label><button class="btn teal" data-act="apccalc">Estimate</button></div></div><div id="ap-out" class="note" style="margin-top:8px">The estimate uses only the rates above and excludes taxes and the redrawing / enhancement service.</div></div>';
 if(S.apc)b+='<h2 class="apcsec">Waivers and additional notes</h2><div class="card">'+paras(S.apc)+'</div>';
 return h+pg(b);}

/* ---------- Citations and references automation ---------- */
var _fmt0=fmt;
function citeNums(g){var out=[];g.split(',').forEach(function(p){var m=p.trim().match(/^(\d+)\s*[–—-]\s*(\d+)$/);if(m){var a=+m[1],b=+m[2];if(b>=a&&b-a<200)for(var i=a;i<=b;i++)out.push(i);else out.push(a,b);}else if(/^\d+$/.test(p.trim()))out.push(+p.trim());});return out;}
var CITE_RE=/\[(\d{1,3}(?:\s*[,–—-]\s*\d{1,3})*)\]/g;
fmt=function(t,a,u){var h=_fmt0(t,a,u);if(!a||!a.refs)return h;var n=refList(a).length;if(!n)return h;
 return h.replace(CITE_RE,function(m,g){var nums=citeNums(g);var bad=nums.some(function(x){return x<1||x>n;});return '<span class="cit'+(bad?' bad':'')+'" data-act="gotoref" data-id="'+nums[0]+'" title="'+(bad?'No such reference':'Go to reference')+'">['+g.replace(/\s+/g,'')+']</span>';});};
function doiLink(h){return h.replace(/(doi:\s*|https?:\/\/(?:dx\.)?doi\.org\/)(10\.\d{4,9}\/[^\s<]+?)(?=[.,;]?(?:\s|<|$))/gi,function(m,p,d){return '<a href="https://doi.org/'+d+'" target="_blank" rel="noopener">'+p+d+'</a>';});}
refsHtml=function(a){var r=refList(a);if(!r.length)return '';return '<h2>References</h2><ol>'+r.map(function(x,i){return '<li id="ref'+(i+1)+'">'+doiLink(inl(x))+'</li>';}).join('')+'</ol>';};
function citeAudit(a){var n=refList(a).length,order=[],seen={},missing=[];(a.sections||[]).forEach(function(s){String(s.text||'').replace(CITE_RE,function(m,g){citeNums(g).forEach(function(x){if(x<1||x>n){if(missing.indexOf(x)<0)missing.push(x);}else if(!seen[x]){seen[x]=1;order.push(x);}});return m;});});
 var uncited=[];for(var i=1;i<=n;i++)if(!seen[i])uncited.push(i);var inorder=order.every(function(x,i){return x===i+1;});return {n:n,order:order,missing:missing,uncited:uncited,inorder:inorder,ncite:order.length};}
function compress(nums){nums=nums.slice().sort(function(a,b){return a-b;});var out=[],i=0;while(i<nums.length){var j=i;while(j+1<nums.length&&nums[j+1]===nums[j]+1)j++;if(j-i>=2)out.push(nums[i]+'–'+nums[j]);else for(var k=i;k<=j;k++)out.push(nums[k]);i=j+1;}return out.join(',');}
function renumberRefs(){var refs=refList({refs:$('f-refs').value}),n=refs.length;var rows=[].slice.call(document.querySelectorAll('#secs .st'));var order=[],map={};
 rows.forEach(function(t){t.value.replace(CITE_RE,function(m,g){citeNums(g).forEach(function(x){if(x>=1&&x<=n&&!map[x]){order.push(x);map[x]=order.length;}});return m;});});
 if(!order.length)return 'No citations such as [1] were found in the sections.';var next=order.length;for(var i=1;i<=n;i++)if(!map[i]){next++;map[i]=next;}
 rows.forEach(function(t){t.value=t.value.replace(CITE_RE,function(m,g){var nums=citeNums(g);if(nums.some(function(x){return x<1||x>n;}))return m;var seen={},out=[];nums.forEach(function(x){var y=map[x];if(!seen[y]){seen[y]=1;out.push(y);}});return '['+compress(out)+']';});});
 var nr=new Array(n);for(var k=1;k<=n;k++)nr[map[k]-1]=refs[k-1];$('f-refs').value=nr.map(function(x,i){return (i+1)+'. '+x;}).join('\n');return 'Renumbered '+order.length+' cited reference(s) in order of first citation; '+(n-order.length)+' uncited reference(s) moved to the end.';}
function crToVanc(m){var au=(m.author||[]).map(function(x){return (x.family||x.name||'')+' '+((x.given||'').split(/[\s.\-]+/).filter(Boolean).map(function(s){return s.charAt(0).toUpperCase();}).join(''));});var l=au.slice(0,6).join(', ');if(au.length>6)l+=', et al';var ti=((m.title||[])[0]||'').replace(/<[^>]+>/g,'').replace(/\.$/,'');var j=((m['short-container-title']||[])[0])||((m['container-title']||[])[0])||'';var d=(m.issued&&m.issued['date-parts']&&m.issued['date-parts'][0])||[];var s=(l?l+'. ':'')+ti+'. '+(j?j+'. ':'')+(d[0]||'')+(m.volume?';'+m.volume:'')+(m.issue?'('+m.issue+')':'')+(m.page?':'+m.page:'')+'. doi:'+m.DOI;return s.replace(/\s+\./g,'.');}
async function addRefByDoi(txt){var dois=(txt.match(/10\.\d{4,9}\/[^\s,;]+/g)||[]).map(function(x){return x.replace(/[.)]+$/,'');}),ok=0,bad=[];
 for(var i=0;i<dois.length;i++){try{var r=await fetch('https://api.crossref.org/works/'+encodeURIComponent(dois[i]));if(!r.ok)throw new Error(r.status);var j=await r.json();var ta=$('f-refs');ta.value=(ta.value.trim()?ta.value.trim()+'\n':'')+crToVanc(j.message);ok++;}catch(e){bad.push(dois[i]);}}
 return (dois.length?ok+' reference(s) added from Crossref. ':'No DOI found in the text. ')+(bad.length?'Could not fetch: '+bad.join(', ')+' (check the DOI and your internet connection).':'');}

/* ---------- extra declarations ---------- */
declHtml=function(a){var d='';[['Author contributions',a.contrib],['Acknowledgements',a.ack],['Funding',a.funding],['Conflict of interest',a.coi],['Ethics approval',a.ethics],['Patient consent',a.consent],['Trial / review registration',a.reg],['Data availability',a.data],['Supplementary material',a.supp],['Abbreviations',a.abv]].forEach(function(p){if(p[1])d+='<h2>'+p[0]+'</h2><p>'+inl(p[1])+'</p>';});return d;};
function hlHtml(a){var l=String(a.highlights||'').split('\n').map(function(x){return x.trim().replace(/^[-•]\s*/,'');}).filter(Boolean);return l.length?'<div class="hl"><h3>Key points</h3><ul>'+l.map(function(x){return '<li>'+inl(x)+'</li>';}).join('')+'</ul></div>':'';}

/* ---------- article page additions ---------- */
var _vArticle0=vArticle;
vArticle=function(id){var h=_vArticle0(id),a=findArt(id);if(!a||h.indexOf('class="art"')<0)return h;
 var hl=hlHtml(a);if(hl){var ri=h.indexOf('<div class="refs body">'),bi=h.lastIndexOf('<div class="body">',ri);if(bi>0)h=h.slice(0,bi)+hl.replace('class="hl"','class="abs" style="margin:12px 0"')+h.slice(bi);}
 var apc='';var ex='<p>'+'<button class="btn sm ghost" data-act="ris" data-id="'+a.id+'">Export RIS</button> <button class="btn sm ghost" data-act="bib" data-id="'+a.id+'">Export BibTeX</button></p>'+(apc?'<div class="note" style="font-size:13px;margin-top:14px">'+apc+'</div>':'');
 h=h.replace('<p style="font-size:12.5px;color:var(--m)">&copy;',ex+'<p style="font-size:12.5px;color:var(--m)">&copy;');return h;};
function risOf(a){var au=parseAuthors(a.authorsRaw),L=['TY  - JOUR'];au.forEach(function(x){L.push('AU  - '+surname(x.name)+', '+initials(x.name));});L.push('TI  - '+a.title,'JO  - '+S.name,'JA  - '+S.abbr,'PY  - '+a.year,'VL  - '+a.vol,'IS  - '+a.issue);if(a.pages)L.push('SP  - '+a.pages);if(a.doi){L.push('DO  - '+a.doi);L.push('UR  - https://doi.org/'+a.doi);}(a.keywords||[]).forEach(function(k){L.push('KW  - '+k);});if(a.abstract)L.push('AB  - '+a.abstract.replace(/\*\*|\n+/g,' '));L.push('ER  - ');return L.join('\r\n');}
function bibOf(a){var au=parseAuthors(a.authorsRaw).map(function(x){return surname(x.name)+', '+x.name.replace(/^(Dr\.?|Prof\.?)\s+/i,'').split(/\s+/).slice(0,-1).join(' ');}).join(' and ');return '@article{'+surname((parseAuthors(a.authorsRaw)[0]||{name:'article'}).name).toLowerCase()+a.year+',\n  author = {'+au+'},\n  title = {'+a.title+'},\n  journal = {'+S.name+'},\n  year = {'+a.year+'},\n  volume = {'+a.vol+'},\n  number = {'+a.issue+'},'+(a.pages?'\n  pages = {'+a.pages+'},':'')+(a.doi?'\n  doi = {'+a.doi+'},':'')+'\n}';}

/* ---------- checks ---------- */
var LIM={'Original Research':{abs:250,refs:45},'Systematic Review / Meta-analysis':{abs:300,refs:999},'Review Article':{abs:200,refs:60},'Case Report':{abs:150,refs:20},'Short Communication':{abs:100,refs:15},'Letter to Editor':{abs:0,refs:10}};
function wc(s){return String(s||'').replace(/\{\{[^}]*\}\}|[|*#~^]/g,' ').split(/\s+/).filter(Boolean).length;}
function artStats(a){var words=0,tabs=0;(a.sections||[]).forEach(function(s){words+=wc(s.text);String(s.text||'').replace(/\r/g,'').split(/\n\s*\n/).forEach(function(b){var ls=b.trim().split('\n');if(ls.length>1&&ls.every(function(l){return /^\|/.test(l.trim());}))tabs++;});});return {words:words,figs:(a.figures||[]).length,tabs:tabs,absw:wc(a.abstract),refs:refList(a).length};}
function checkArt(a){var L=[],add=function(lv,m){L.push({lv:lv,msg:m});},st=artStats(a),lim=LIM[a.type]||{abs:0,refs:999},row=apcRow(GRP,a.type);
 if(!a.title)add('err','Title is missing.');else if(wc(a.title)>25)add('warn','Title is longer than 25 words.');
 var au=parseAuthors(a.authorsRaw);if(!au.length)add('err','No authors.');else if(au.some(function(x){return !x.aff;}))add('warn','Some authors have no affiliation (use: Name | Affiliation).');
 if(!a.corr||a.corr.indexOf('@')<0)add('warn','Corresponding author e-mail is missing.');
 if(!a.branch)add('warn','Subject area not selected.');
 if(a.type!=='Letter to Editor'){if(!a.abstract)add('err','Abstract is missing.');else if(lim.abs&&st.absw>lim.abs)add('warn','Abstract has '+st.absw+' words; limit for this type is '+lim.abs+'.');}
 var k=(a.keywords||[]).length;if(a.type!=='Letter to Editor'&&(k<3||k>8))add('warn','Keywords: '+k+' (3-8 recommended).');
 if(!(a.sections||[]).length)add('err','No main text sections.');
 if(row){if(st.words>row[3])add('warn','Main text has '+st.words+' words; limit '+row[2]+'. Excess is charged per additional 500 words.');else if(st.words<parseInt(row[2].replace(/,/g,''),10))add('warn','Main text has '+st.words+' words; the usual range is '+row[2]+'.');}
 if(st.refs>lim.refs)add('warn',st.refs+' references; limit for this type is '+lim.refs+'.');if(!st.refs&&a.type!=='Letter to Editor')add('warn','No references.');
 var c=citeAudit(a);if(c.n){if(c.missing.length)add('err','Citation(s) with no matching reference: ['+c.missing.join('], [')+'].');if(c.uncited.length)add('warn','Reference(s) never cited in the text: '+c.uncited.join(', ')+'.');if(!c.ncite)add('warn','No in-text citations like [1] were found.');else if(!c.inorder&&!c.missing.length)add('warn','Citations are not numbered in order of first appearance - use "Renumber by first citation".');}
 if((a.figures||[]).some(function(f){return !f.caption;}))add('warn','Some figures have no caption.');
 if(row){if(st.figs>row[6]||st.tabs>row[7])add('warn','Figures/tables: '+st.figs+' / '+st.tabs+' (included: '+row[6]+' / '+row[7]+'); extra items attract additional charges.');}
 if(a.type==='Original Research'&&!a.ethics)add('warn','Ethics approval / consent statement is missing.');
 if(a.type==='Case Report'&&!a.consent&&!a.ethics)add('err','Case report needs a patient-consent statement.');
 if(a.type==='Systematic Review / Meta-analysis'&&!a.reg)add('warn','No review registration (e.g. PROSPERO) stated.');
 if(!a.coi)add('warn','Conflict-of-interest statement is missing.');if(!a.funding)add('warn','Funding statement is missing.');if(!a.data&&a.type==='Original Research')add('warn','Data availability statement is missing.');
 if(!a.doi)add('warn','DOI not assigned (use Suggest).');if(!a.pages&&!a.artno)add('warn','Pages / article number not set.');
 if(a.received&&a.accepted&&a.accepted<a.received)add('err','Accepted date is before received date.');
 if(!L.some(function(x){return x.lv==='err';})&&!L.some(function(x){return x.lv==='warn';}))add('ok','All checks passed.');return {items:L,st:st};}
function checkHtml(a){var r=checkArt(a),s=r.st;return '<div class="chk ok"><b>Counts:</b> '+s.words+' words &middot; abstract '+s.absw+' words &middot; '+s.figs+' figure(s) &middot; '+s.tabs+' table(s) &middot; '+s.refs+' reference(s)</div>'+r.items.map(function(x){return '<div class="chk '+(x.lv==='err'?'err':x.lv==='warn'?'warn':'ok')+'">'+(x.lv==='err'?'&#10007; ':x.lv==='warn'?'&#9888; ':'&#10003; ')+esc(x.msg)+'</div>';}).join('');}
function apcEstHtml(a){var st=artStats(a),o={figs:st.figs,tabs:st.tabs,words:st.words},i=apcCalc(GRP,a.type,'in',o),n=apcCalc(GRP,a.type,'int',o);if(!i)return '<div class="chk warn">APC is not defined for this article type in this journal.</div>';
 return '<div class="chk ok"><b>APC estimate for this article</b> (payable only after acceptance; excl. taxes): Indian authors '+i.fmt(i.total)+' (basic '+i.fmt(i.base)+(i.extra?' + extras '+i.fmt(i.extra):'')+') &middot; International authors '+n.fmt(n.total)+(i.xf||i.xt||i.xw?' &middot; extra: '+i.xf+' fig, '+i.xt+' table, '+i.xw+'&times;500 words':'')+(S.apcApproved?'':' &middot; <i>proposed rates</i>')+'</div>';}

/* ---------- editor: extra sections + tools ---------- */
var _vEditor0=vEditor,_collect0=collect;
vEditor=function(id){var h=_vEditor0(id);if(h.indexOf('id="f-refs"')<0)return h;var a=(id&&findArt(id))||{};
 var ta=function(i,l,v,ph,r){return '<div class="fg"><label>'+l+'</label><textarea id="'+i+'" rows="'+(r||2)+'" placeholder="'+esc(ph||'')+'">'+esc(v||'')+'</textarea></div>';};
 var tools='<div class="toolcard"><b>Reference tools</b> - cite in text as <code>[1]</code>, <code>[2,5]</code> or <code>[3-6]</code>; citations link to the numbered reference list on the article page and PDF.<div class="row2" style="margin-top:8px"><div class="fg"><label>Add references by DOI (paste one or more DOIs - fetched from Crossref)</label><textarea id="f-doiadd" rows="2" placeholder="10.1000/xyz123"></textarea></div><div class="fg"><label>&nbsp;</label><button class="btn sm teal" type="button" data-act="refdoi">Add from DOI</button> <button class="btn sm ghost" type="button" data-act="refclean">Clean list</button> <button class="btn sm ghost" type="button" data-act="citecheck">Check citations</button> <button class="btn sm gold" type="button" data-act="citesort">Renumber by first citation</button></div></div><div id="citeout"></div></div>';
 h=h.replace(/<div class="fg"><label>References[\s\S]*?<\/textarea><\/div>/,function(m){return m+tools;});
 var extra='<h4>Additional sections</h4>'+ta('f-hl','Key points / Highlights (one per line, 3-5)',a.highlights,'',3)+'<div class="row2">'+ta('f-contrib','Author contributions (CRediT)',a.contrib,'Conceptualization: A.B.; Methods: C.D.; Writing - original draft: A.B.; ...')+ta('f-consent','Patient consent (required for case reports)',a.consent,'Written informed consent for publication was obtained from the patient.')+ta('f-reg','Trial / review registration (CTRI, ClinicalTrials.gov, PROSPERO)',a.reg)+ta('f-supp','Supplementary material',a.supp)+'</div>'+ta('f-abv','Abbreviations',a.abv);
 h=h.replace('<h4>Issue and publication details</h4>',extra+'<h4>Issue and publication details</h4>');
 h=h.replace('<p><button class="btn teal" data-act="publish">','<div class="toolcard"><b>Pre-publication tools</b> <button class="btn sm teal" type="button" data-act="chkart">Run checks</button> <button class="btn sm ghost" type="button" data-act="apcart">APC estimate</button> <label style="display:inline;margin-left:10px"><input type="checkbox" id="f-autopdf" style="width:auto" checked> open journal-format PDF automatically after publishing</label><div id="chkout"></div></div><p><button class="btn teal" data-act="publish">');return h;};
collect=function(st){var a=_collect0(st);var g=function(i){var e=$(i);return e?e.value.trim():'';};a.highlights=g('f-hl');a.contrib=g('f-contrib');a.consent=g('f-consent');a.reg=g('f-reg');a.supp=g('f-supp');a.abv=g('f-abv');return a;};
Object.assign(ACT,{
 gotoref:function(t){var e=document.getElementById('ref'+t.dataset.id);if(e){e.scrollIntoView({behavior:'smooth',block:'center'});e.style.background='#fff3c4';setTimeout(function(){e.style.background='';},1800);}},
 apccalc:function(){var r=apcCalc($('ap-g').value,$('ap-t').value,$('ap-r').value,{figs:+$('ap-f').value||0,tabs:+$('ap-b').value||0,words:+$('ap-w').value||0,diag:+$('ap-d').value||0});$('ap-out').innerHTML=r?'Basic APC: <b>'+r.fmt(r.base)+'</b> &middot; Additional: <b>'+r.fmt(r.extra)+'</b>'+(r.xf||r.xt||r.xw?' ('+r.xf+' extra figure(s), '+r.xt+' extra table(s), '+r.xw+' &times; 500 words)':'')+' &middot; Total: <b>'+r.fmt(r.total)+'</b> (excl. taxes)':'This article type is not offered in the selected subject group.';},
 citecheck:function(){var a=collect('draft'),c=citeAudit(a);$('citeout').innerHTML='<div class="chk '+(c.missing.length?'err':c.uncited.length||!c.inorder?'warn':'ok')+'">'+c.n+' reference(s); '+c.ncite+' cited. '+(c.missing.length?'Missing: ['+c.missing.join('], [')+']. ':'')+(c.uncited.length?'Not cited: '+c.uncited.join(', ')+'. ':'')+(c.inorder?'Numbering is in order of first citation.':'Not in order of first citation.')+'</div>';},
 citesort:function(){if(!confirm('Renumber citations and reorder the reference list by order of first citation?'))return;$('citeout').innerHTML='<div class="chk ok">'+esc(renumberRefs())+'</div>';},
 refclean:function(){var seen={},out=[];refList({refs:$('f-refs').value}).forEach(function(x){var k=x.toLowerCase();if(!seen[k]){seen[k]=1;out.push(x);}});$('f-refs').value=out.map(function(x,i){return (i+1)+'. '+x;}).join('\n');$('citeout').innerHTML='<div class="chk ok">'+out.length+' unique reference(s), numbered.</div>';},
 refdoi:async function(){$('citeout').innerHTML='<div class="chk warn">Fetching from Crossref...</div>';var m=await addRefByDoi($('f-doiadd').value);$('f-doiadd').value='';ACT.refclean();$('citeout').innerHTML='<div class="chk ok">'+esc(m)+'</div>';},
 chkart:function(){$('chkout').innerHTML=checkHtml(collect('draft'));},
 apcart:function(){$('chkout').innerHTML=apcEstHtml(collect('draft'));},
 ris:function(t){var a=findArt(t.dataset.id);if(a)download(new Blob([risOf(a)],{type:'application/x-research-info-systems'}),(a.doi||a.id).replace(/[\/\\]/g,'_')+'.ris');},
 bib:function(t){var a=findArt(t.dataset.id);if(a)download(new Blob([bibOf(a)],{type:'text/plain'}),(a.doi||a.id).replace(/[\/\\]/g,'_')+'.bib');}
});
var _pub0=ACT.publish;
ACT.publish=function(t){var a=collect('published'),r=checkArt(a),errs=r.items.filter(function(x){return x.lv==='err';});if(errs.length&&!confirm('Problems found:\n- '+errs.map(function(x){return x.msg;}).join('\n- ')+'\n\nPublish anyway?'))return;window._autopdf=!!($('f-autopdf')&&$('f-autopdf').checked);return _pub0(t);};
var _sff0=saveFromForm;
saveFromForm=async function(st){await _sff0(st);if(st==='published'&&window._autopdf){window._autopdf=false;var m=location.hash.match(/#\/article\/(.+)$/);var a=m&&findArt(m[1]);if(a)openPrint(a);}};

/* ---------- admin settings: APC approval switch ---------- */
var _vSettings0=vSettings;
vSettings=function(){var h=_vSettings0();return h.replace('<button class="btn teal" data-act="savesettings">','<div class="fg"><label><input type="checkbox" id="s-apcok" style="width:auto"'+(S.apcApproved?' checked':'')+'> APC rate card has been formally approved by the journal (removes the &ldquo;proposed rates&rdquo; notice and shows amounts in letters)</label></div><button class="btn teal" data-act="savesettings">');};
var _save0=ACT.savesettings;ACT.savesettings=function(t){var c=$('s-apcok');if(c)S.apcApproved=!!c.checked;return _save0(t);};

/* ---------- submission form: APC info ---------- */
var _vSubmit0=vSubmit;
function apcSubNote(type){var i=apcCalc(GRP,type,'in',{}),n=apcCalc(GRP,type,'int',{});if(!i)return 'Article processing charges are payable only after acceptance.';return 'The APC is payable only after final acceptance (payment does not guarantee acceptance). '+(S.apcApproved?'':'<i>Proposed rates:</i> ')+esc(i.row[1])+' - '+inr(i.base)+' (Indian authors) / '+usd(n.base)+' (international authors), including '+i.row[6]+' figure(s) and '+i.row[7]+' table(s). <a href="#/apc">Full APC rate card</a>.';}
vSubmit=function(){var h=_vSubmit0();return h.replace('<label style="display:block;margin:10px 0"><input type="checkbox" id="sf-ok">','<div class="note" id="sf-apc" style="font-size:13px">'+apcSubNote('Original Research')+'</div><label style="display:block;margin:10px 0"><input type="checkbox" id="sf-ok">');};
document.addEventListener('change',function(e){if(e.target.id==='sf-type'&&$('sf-apc'))$('sf-apc').innerHTML=apcSubNote(e.target.value);});

/* ========== JOURNAL-FORMAT PDF (A4, two-column) ========== */
printHTML=function(a){
 var au=parseAuthors(a.authorsRaw),affs=[];au.forEach(function(x){if(x.aff&&affs.indexOf(x.aff)<0)affs.push(x.aff);});
 var al=au.map(function(x){var s=esc(x.name),sp=[];if(x.aff)sp.push(affs.indexOf(x.aff)+1);if(a.corr&&a.corr.toLowerCase().indexOf(x.name.toLowerCase())>-1)sp.push('*');return s+(sp.length?'<sup>'+sp.join(',')+'</sup>':'');}).join(', ');
 var cite=a.year+';'+a.vol+'('+a.issue+')'+(a.pages?':'+a.pages:'');
 var rl=S.abbr+' '+cite;var rr=shortAuth(a)+' - '+(a.title.length>70?a.title.slice(0,67)+'...':a.title);
 var fl='© '+a.year+' '+S.publisher+' · '+(a.license||S.license)+(a.doi?' · doi:'+a.doi:'');
 var teal=GRP==='ls'?'#0E7C7B':'#0D2B4E';
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
 '.mast{display:flex;justify-content:space-between;align-items:center;gap:8mm;border-bottom:2.4pt solid '+teal+';padding-bottom:3.5mm;margin-bottom:4.5mm;font-family:Arial,sans-serif}',
 '.mast .lg img{height:25mm;width:auto;display:block}.jn{font:bold 17pt/1.15 "Times New Roman",serif;color:'+teal+'}',
 '.mr{text-align:right;font-size:8.2pt;color:#333;line-height:1.55;flex:0 0 auto;max-width:62mm}.mr .pub{color:#555;margin-top:1.5mm;font-size:7.6pt}.tag{font-weight:bold;color:#9b1c1c;text-transform:uppercase;letter-spacing:.6pt;font-size:8.6pt;margin-bottom:.5mm}',
 'h1.title{font:bold 19pt/1.2 "Times New Roman",serif;color:'+teal+';margin:2mm 0 3mm}',
 '.authors{font-size:10.5pt;margin-bottom:1.5mm}.affs{font:7.8pt/1.35 Arial,sans-serif;color:#333}',
 '.info{display:grid;grid-template-columns:50mm 1fr;gap:6mm;border-top:.7pt solid #888;border-bottom:.7pt solid #888;padding:4mm 0;margin:4mm 0 5mm}',
 '.info .side{font:7.6pt/1.35 Arial,sans-serif;color:#222;overflow-wrap:anywhere}.info .side h5{font:bold 7pt Arial,sans-serif;text-transform:uppercase;letter-spacing:.5pt;color:#0E7C7B;margin:0 0 1mm;margin-top:3mm}.info .side h5:first-child{margin-top:0}',
 '.abs{font-size:9pt;line-height:1.38;text-align:justify}.abs h3{font:bold 9pt Arial,sans-serif;text-transform:uppercase;letter-spacing:.6pt;color:'+teal+';margin:0 0 1.5mm}.abs p{margin:0 0 1.5mm}',
 '.hl{margin-top:3mm;padding:2.5mm 3mm;background:#eef6f6;border-left:2pt solid #0E7C7B;font:8.4pt/1.35 Arial,sans-serif}.hl h3{font:bold 8pt Arial,sans-serif;text-transform:uppercase;letter-spacing:.6pt;color:#0E7C7B;margin:0 0 1mm}.hl ul{margin:0;padding-left:4mm}',
 '.cols{column-count:2;column-gap:7mm;column-fill:balance;text-align:justify;hyphens:auto;-webkit-hyphens:auto;overflow-wrap:break-word}',
 '.cols h2{font:bold 10pt Arial,sans-serif;color:'+teal+';margin:4mm 0 1.5mm;break-after:avoid;page-break-after:avoid}',
 '.cols h4{font:italic bold 9.6pt "Times New Roman",serif;margin:2mm 0 1mm;break-after:avoid}',
 '.cols p{margin:0 0 1.8mm;orphans:3;widows:3}.cols ul{margin:0 0 2mm;padding-left:5mm}',
 '.decl h2{font-size:8.6pt;margin:2.5mm 0 .8mm}.decl p{font-size:8.6pt;line-height:1.32;margin:0 0 1mm}',
 'figure{break-inside:avoid;page-break-inside:avoid;margin:2.5mm 0;text-align:center}figure img{max-width:100%;max-height:85mm;display:block;margin:0 auto}',
 '.tblk{margin:2.5mm 0;break-inside:avoid;page-break-inside:avoid}.tcap{font:7.9pt/1.3 Arial,sans-serif;text-align:left;margin-bottom:1mm}.tnote{font:7pt/1.3 Arial,sans-serif;color:#444;text-align:left;margin-top:.8mm}',
 '.tblk.wide,figure.wide{column-span:all;margin:3.5mm 0}figure.wide img{max-height:95mm}',
 'figcaption{font:7.8pt/1.3 Arial,sans-serif;text-align:left;margin-top:1mm}',
 'table{width:100%;border-collapse:collapse;font:7.8pt/1.3 Arial,sans-serif;margin:2mm 0;break-inside:avoid;page-break-inside:avoid}',
 'th,td{padding:1mm 1.5mm;text-align:left;border-bottom:.4pt solid #999;vertical-align:top}th{border-top:.8pt solid #000;border-bottom:.8pt solid #000;background:#eef2f6}',
 '.refsblock{margin-top:3mm;border-top:.7pt solid #888;padding-top:1mm}.refsblock h2{font:bold 10pt Arial,sans-serif;color:'+teal+';margin:2mm 0 1.5mm}',
 '.refsblock ol{column-count:2;column-gap:7mm;padding-left:5mm;margin:0;font:7.8pt/1.32 Arial,sans-serif;text-align:left;overflow-wrap:anywhere}.refsblock li{margin-bottom:.9mm;break-inside:avoid}.refsblock a{color:#0E7C7B;text-decoration:none}',
 '.cols sup,.authors sup{font-size:70%;line-height:0}.cit{color:#0E7C7B}',
 '.apcbox{margin-top:4mm;padding:2.5mm 3.2mm;border:.7pt solid #b9c4cf;border-left:2.4pt solid #B8860B;background:#fafbfc;font:7.6pt/1.38 Arial,sans-serif;break-inside:avoid;page-break-inside:avoid}',
 '.endline{margin-top:3mm;font:7.4pt/1.35 Arial,sans-serif;color:#555;text-align:center;break-inside:avoid}'].join('\n');
 var cit=(function(){return esc(vanc(a));})();
 var side='<h5>Article history</h5>'+(a.received?'Received: '+fmtDate(a.received)+'<br>':'')+(a.accepted?'Accepted: '+fmtDate(a.accepted)+'<br>':'')+'Published: '+fmtDate(a.published)
  +((a.keywords||[]).length?'<h5>Keywords</h5>'+a.keywords.map(esc).join('; '):'')
  +(a.branch?'<h5>Subject area</h5>'+esc(a.branch):'')
  +'<h5>How to cite</h5>'+cit
  +(a.corr?'<h5>Correspondence</h5>'+esc(a.corr):'')
  +'<h5>Open access</h5>© '+esc(a.year)+' The authors. Licensed under '+esc(a.license||S.license)+'.';
 var absHtml=a.abstract?'<h3>Abstract</h3>'+fmt(a.abstract,a,{}):'';
 var meta=[];if(S.issnO)meta.push('eISSN '+S.issnO);if(S.issnP)meta.push('pISSN '+S.issnP);
 var apc=apcStatement(a);
 return '<!DOCTYPE html><html><head><meta charset="utf-8"><title>'+esc(a.title)+'</title><style>'+css+'</style></head><body>'
  +'<div class="toolbar"><button onclick="window.print()">Print / Save as PDF</button><span>Chrome or Edge: Destination = Save as PDF, Paper = A4, Margins = Default, Background graphics = on.</span></div>'
  +'<div class="mast"><div class="lg">'+(typeof LOGO_SMALL!=='undefined'?'<img src="'+LOGO_SMALL+'" alt="'+esc(S.name)+'">':'<div class="jn">'+esc(S.name)+'</div>')+'</div><div class="mr"><div class="tag">'+esc(a.type)+'</div><div>Volume '+esc(a.vol)+', Issue '+esc(a.issue)+'</div><div>'+esc(a.period||a.year)+'</div>'+(a.doi?'<div>doi:'+esc(a.doi)+'</div>':'')+'<div class="pub">'+esc(S.publisher)+(meta.length?'<br>'+esc(meta.join(' · ')):'')+'</div></div></div>'
  +'<h1 class="title">'+esc(a.title)+'</h1><div class="authors">'+al+'</div><div class="affs">'+affs.map(function(f,i){return '<sup>'+(i+1)+'</sup>'+esc(f);}).join('<br>')+(a.corr?'<br>*Corresponding author':'')+'</div>'
  +'<div class="info"><div class="side">'+side+'</div><div class="abs">'+absHtml+hlHtml(a)+'</div></div>'
  +'<div class="cols">'+bodyHtml(a)+'<div class="decl">'+declHtml(a)+'</div></div>'
  +(refList(a).length?'<div class="refsblock">'+refsHtml(a)+'</div>':'')
  +(apc?'<div class="apcbox">'+apc+'</div>':'')
  +'<div class="endline">'+esc(S.name)+' · '+esc(S.publisher)+(S.email?' · '+esc(S.email):'')+'</div></body></html>';};

/* ---------- APC wording for letters / e-mails ---------- */
function apcMail(s){if(!S.apcApproved)return '';var r=apcRow(GRP,s.type);return r?' For your article type ('+r[1]+'): '+inr(r[4])+' (Indian authors) / '+usd(r[5])+' (international authors), including '+r[6]+' figure(s) and '+r[7]+' table(s), plus applicable taxes. Additional figures, tables, diagrams and words are charged as per the APC page.':'';}
function apcMailHtml(s){return esc(apcMail(s));}

/* ========== TABLES & FIGURES: auto-numbering, auto-caption, auto-placement in Results ========== */
function normTable(t){t=String(t||'').replace(/\r/g,'').trim();if(!t)return '';var ls=t.split('\n').filter(function(l){return l.trim();});var cells;
 if(ls.some(function(l){return l.indexOf('\t')>=0;}))cells=ls.map(function(l){return l.split('\t');});
 else if(ls.some(function(l){return l.indexOf('|')>=0;}))cells=ls.map(function(l){return l.trim().replace(/^\|/,'').replace(/\|$/,'').split('|');});
 else cells=ls.map(function(l){return l.split(',').map(function(c){return c.replace(/^\s*"|"\s*$/g,'');});});
 return cells.map(function(r){return '| '+r.map(function(c){return c.trim();}).join(' | ')+' |';}).join('\n');}
function autoTabCap(rows){var l=normTable(rows).split('\n')[0]||'';var h=l.replace(/^\||\|$/g,'').split('|').map(function(x){return x.trim();}).filter(Boolean);if(h.length<2)return '';return 'Summary of '+h.slice(1).join(', ').replace(/,([^,]*)$/,' and$1')+' by '+h[0].toLowerCase()+'.';}
function autoFigCap(name){var n=String(name||'').replace(/\.[a-z0-9]+$/i,'').replace(/^(fig(ure)?[\s_\-]*\d*[\s_\-]*)/i,'').replace(/[_\-]+/g,' ').replace(/\s+/g,' ').trim();if(!n)return '';return n.charAt(0).toUpperCase()+n.slice(1)+'.';}
figHtml=function(a,i,used){var f=a.figures&&a.figures[i];if(!f)return '';used[i]=true;return '<figure class="fig'+(f.wide?' wide':'')+'"><img src="'+f.data+'" alt="Figure '+(i+1)+'"><figcaption><b>Figure '+(i+1)+'.</b> '+inl(f.caption||'')+'</figcaption></figure>';};
function tabBlock(a,n,used){var t=a.tables&&a.tables[n-1];if(!t)return '';used.t=used.t||{};used.t[n]=true;return '<div class="tblk'+(t.wide?' wide':'')+'"><div class="tcap"><b>Table '+n+'.</b> '+inl(t.caption||'')+'</div>'+tableHtml(normTable(t.rows).split('\n'))+(t.note?'<div class="tnote">'+inl(t.note)+'</div>':'')+'</div>';}
var _fmt1=fmt;
fmt=function(t,a,u){var h=_fmt1(t,a,u);return h.replace(/<p>\{\{\s*tab\s*(\d+)\s*\}\}<\/p>/gi,function(m,n){return tabBlock(a,parseInt(n,10),u||{});});};
function placeTarget(secs){var re=[/result/i,/main text|clinical findings|findings|case presentation|body/i];for(var r=0;r<re.length;r++)for(var i=0;i<secs.length;i++)if(re[r].test(secs[i].heading||''))return i;return secs.length-1;}
bodyHtml=function(a){var used={t:{}},secs=(a.sections||[]).map(function(s){return {heading:s.heading,text:s.text||''};});if(!secs.length)secs=[{heading:'',text:''}];
 var all=secs.map(function(s){return s.text;}).join('\n');var add='';
 (a.tables||[]).forEach(function(t,i){if(!new RegExp('\\{\\{\\s*tab\\s*'+(i+1)+'\\s*\\}\\}','i').test(all))add+='\n\n{{tab '+(i+1)+'}}';});
 (a.figures||[]).forEach(function(f,i){if(!new RegExp('\\{\\{\\s*fig\\s*'+(i+1)+'\\s*\\}\\}','i').test(all))add+='\n\n{{fig '+(i+1)+'}}';});
 if(add)secs[placeTarget(secs)].text+=add;
 return secs.map(function(s){return (s.heading?'<h2>'+esc(s.heading)+'</h2>':'')+fmt(s.text,a,used);}).join('');};

/* admin editor: tables panel + figure options */
function tabRow(t){t=t||{};return '<div class="tabrow"><div class="top"><b class="tabn"></b><input class="tabcap" placeholder="Table caption (auto-numbered: Table 1., Table 2. ...)" value="'+esc(t.caption||'')+'"><button class="btn sm ghost" type="button" data-act="tabcapauto" title="Draft a caption from the column headings">Auto-caption</button><button class="btn sm ghost" type="button" data-act="tabup">&uarr;</button><button class="btn sm ghost" type="button" data-act="tabdn">&darr;</button><button class="btn sm red" type="button" data-act="tabrm">&times;</button></div><textarea class="tabdata" rows="6" placeholder="Paste from Excel / Word / CSV, or type with | between cells. First row = column headings.">'+esc(t.rows||'')+'</textarea><div class="fmeta" style="display:flex;gap:10px;align-items:center;margin-top:6px;flex-wrap:wrap"><input class="tabnote" style="flex:1;min-width:200px" placeholder="Footnote / abbreviations (optional)" value="'+esc(t.note||'')+'"><label style="display:inline-flex;gap:4px;align-items:center"><input type="checkbox" class="tabwide" style="width:auto"'+(t.wide?' checked':'')+'> full page width</label></div></div>';}
function renumTabs(){document.querySelectorAll('#tablist .tabrow .tabn').forEach(function(e,i){e.textContent='Table '+(i+1);});}
figList=function(){return EDIT.figs.map(function(f,i){return '<div class="figrow"><img src="'+f.data+'" alt=""><div style="flex:1"><b>Figure '+(i+1)+'</b> <small>(placed in Results automatically; or type <code>{{fig '+(i+1)+'}}</code> in a section)</small><br><input class="figcap" placeholder="Caption (auto-numbered)" value="'+esc(f.caption||'')+'"><div class="fmeta"><button class="btn sm ghost" type="button" data-act="figcapauto" data-id="'+i+'">Auto-caption</button><button class="btn sm ghost" type="button" data-act="figup" data-id="'+i+'">&uarr;</button><button class="btn sm ghost" type="button" data-act="figdn" data-id="'+i+'">&darr;</button><label><input type="checkbox" class="figwide"'+(f.wide?' checked':'')+'> full page width</label></div></div><button class="btn sm red" type="button" data-act="figrm" data-id="'+i+'">&times;</button></div>';}).join('');};
syncCaps=function(){var caps=document.querySelectorAll('#figlist .figcap'),w=document.querySelectorAll('#figlist .figwide');EDIT.figs.forEach(function(f,i){if(caps[i])f.caption=caps[i].value;if(w[i])f.wide=w[i].checked;});};
addFigs=async function(files){syncCaps();for(var i=0;i<files.length;i++){try{EDIT.figs.push({data:await resizeImage(files[i],1600),caption:autoFigCap(files[i].name),name:files[i].name,wide:false});}catch(e){toast('Could not read '+files[i].name);}}$('figlist').innerHTML=figList();$('f-figfiles').value='';};
var _vEditor1=vEditor;
vEditor=function(id){var h=_vEditor1(id);if(h.indexOf('<h4>Figures</h4>')<0)return h;var a=(id&&findArt(id))||{};
 var panel='<h4>Tables <button class="btn sm ghost" type="button" data-act="addtab">+ Add table</button></h4><div class="note">Tables and figures are numbered and captioned automatically, and placed at the end of the <b>Results</b> section (or the main text) unless you type <code>{{tab 1}}</code> / <code>{{fig 1}}</code> on its own line where you want them. Tick &ldquo;full page width&rdquo; for wide tables or figures.</div><div id="tablist">'+(a.tables||[]).map(tabRow).join('')+'</div>';
 h=h.replace('<h4>Figures</h4>',panel+'<h4>Figures</h4>');return h;};
var _collect1=collect;
collect=function(st){var a=_collect1(st);var w=document.querySelectorAll('#figlist .figwide');a.figures.forEach(function(f,i){if(w[i])f.wide=w[i].checked;if(EDIT.figs[i]&&EDIT.figs[i].name)f.name=EDIT.figs[i].name;});
 a.tables=[];document.querySelectorAll('#tablist .tabrow').forEach(function(r){var d=r.querySelector('.tabdata').value.trim();if(!d)return;var rows=normTable(d);a.tables.push({caption:r.querySelector('.tabcap').value.trim(),rows:rows,note:r.querySelector('.tabnote').value.trim(),wide:r.querySelector('.tabwide').checked});});return a;};
function moveRow(r,dir){var s=dir<0?r.previousElementSibling:r.nextElementSibling;if(!s)return;if(dir<0)r.parentNode.insertBefore(r,s);else r.parentNode.insertBefore(s,r);renumTabs();}
Object.assign(ACT,{
 addtab:function(){$('tablist').insertAdjacentHTML('beforeend',tabRow({}));renumTabs();},
 tabrm:function(t){t.closest('.tabrow').remove();renumTabs();},
 tabup:function(t){moveRow(t.closest('.tabrow'),-1);},tabdn:function(t){moveRow(t.closest('.tabrow'),1);},
 tabcapauto:function(t){var r=t.closest('.tabrow'),c=autoTabCap(r.querySelector('.tabdata').value);if(c)r.querySelector('.tabcap').value=c;else toast('Paste the table data first (first row = headings).');},
 figcapauto:function(t){syncCaps();var f=EDIT.figs[+t.dataset.id];var c=autoFigCap(f.name);if(c){f.caption=c;$('figlist').innerHTML=figList();}else toast('No file name available for this figure - type the caption.');},
 figup:function(t){syncCaps();var i=+t.dataset.id;if(i>0){var x=EDIT.figs.splice(i,1)[0];EDIT.figs.splice(i-1,0,x);$('figlist').innerHTML=figList();}},
 figdn:function(t){syncCaps();var i=+t.dataset.id;if(i<EDIT.figs.length-1){var x=EDIT.figs.splice(i,1)[0];EDIT.figs.splice(i+1,0,x);$('figlist').innerHTML=figList();}}
});
document.addEventListener('DOMContentLoaded',renumTabs);
var _route0=window.route;if(typeof route==='function'){var _r=route;route=function(){var x=_r.apply(this,arguments);setTimeout(renumTabs,0);return x;};}
/* counts / checks include structured tables */
var _artStats0=artStats;
artStats=function(a){var s=_artStats0(a);s.tabs+=(a.tables||[]).length;return s;};
var _checkArt0=checkArt;
checkArt=function(a){var r=_checkArt0(a),txt=(a.sections||[]).map(function(s){return s.text||'';}).join(' ')+' '+(a.abstract||'');
 (a.figures||[]).forEach(function(f,i){if(!new RegExp('\\b(fig(ure)?s?\\.?\\s*'+(i+1)+'\\b|\\{\\{\\s*fig\\s*'+(i+1)+')','i').test(txt))r.items.unshift({lv:'warn',msg:'Figure '+(i+1)+' is not mentioned in the text (e.g. "Figure '+(i+1)+'").'});});
 (a.tables||[]).forEach(function(t,i){if(!t.caption)r.items.unshift({lv:'warn',msg:'Table '+(i+1)+' has no caption.'});if(!new RegExp('\\b(tab(le)?s?\\.?\\s*'+(i+1)+'\\b|\\{\\{\\s*tab\\s*'+(i+1)+')','i').test(txt))r.items.unshift({lv:'warn',msg:'Table '+(i+1)+' is not mentioned in the text (e.g. "Table '+(i+1)+'").'});});
 r.st=artStats(a);if(r.items.length>1)r.items=r.items.filter(function(x){return x.lv!=='ok';});return r;};
