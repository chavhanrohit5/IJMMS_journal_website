/* ==========================================================================
   Genosync Publications - common publication standard (IJMMS and IJMLS)
   1. Article PDF: A4 portrait, publication-information header, 90 + 90 mm
      first page, two-column justified body, footer on every page.
   2. Certificate of Publication: A4 landscape, one page per author.
   Everything is read from the live settings (Admin > Settings) and the
   article record. Empty identifiers print as grey placeholders, never as
   invented values. Loaded after articles2.js, so it replaces printHTML.
   ========================================================================== */
var PUB_TPL='pubstd-2026-11-21';
if(typeof DEFAULTS!=='undefined'){if(!('website' in DEFAULTS))DEFAULTS.website='';if(!('editorName' in DEFAULTS))DEFAULTS.editorName='';}

function pubBrand(){return JID==='ls'
 ?{p:'#0A5A58',a:'#0E7C7B',g:'#B8860B',soft:'#EAF4F3',ink:'#0B3B3A'}
 :{p:'#0D2B4E',a:'#0E7C7B',g:'#B8860B',soft:'#EAF0F6',ink:'#0D2B4E'};}
function pubLogo(){if(JID==='ls'&&typeof LS_LOGO_SMALL!=='undefined')return LS_LOGO_SMALL;return typeof LOGO_SMALL!=='undefined'?LOGO_SMALL:'';}
function pubSite(){return String(S.website||window.__SITE||location.origin||'').replace(/\/+$/,'');}
function pubHost(){return pubSite().replace(/^https?:\/\//,'');}
function pubArtUrl(a){return pubSite()+(window.IJMMS_SERVER?'/article/'+a.id:'/#/article/'+a.id);}
function pubPh(v,p){return v?esc(v):'<span class="ps-ph">'+esc(p)+'</span>';}
function pubIsSample(a){return !!(a.sample||/^sample/i.test(String(a.id||'')));}
function pubCorrEmail(a){var m=String(a.corr||'').match(/[^\s,;<>()]+@[^\s,;<>()]+\.[A-Za-z]{2,}/);return m?m[0]:'';}
function pubIsCorr(a,name){var c=String(a.corr||'').toLowerCase();return !!(c&&name&&c.indexOf(String(name).toLowerCase())>-1);}
function pubDate(d){return d?fmtDate(d):'';}
function pubPages(a){return a.pages?'pp. '+a.pages:(a.artno?'Article '+a.artno:'');}
function pubCssStr(s){return '"'+String(s).replace(/\\/g,'\\\\').replace(/"/g,'\\"').replace(/\s+/g,' ')+'"';}

/* QR code drawn locally as SVG (qrcode.js, MIT) - no external service. */
function pubQr(text,mm){
 if(typeof qrcode==='undefined')return '';
 var q=qrcode(0,'M');q.addData(String(text));q.make();
 var n=q.getModuleCount(),d='';
 for(var r=0;r<n;r++)for(var c=0;c<n;c++)if(q.isDark(r,c))d+='M'+c+' '+r+'h1v1h-1z';
 return '<svg class="qr" xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 '+(n+4)+' '+(n+4)+'" width="'+mm+'mm" height="'+mm+'mm" shape-rendering="crispEdges" role="img" aria-label="QR code"><rect x="-2" y="-2" width="'+(n+4)+'" height="'+(n+4)+'" fill="#fff"/><path d="'+d+'" fill="#000"/></svg>';}

/* ---------------------------- ARTICLE PDF ---------------------------- */
function pubDecl(a){
 var ls=JID==='ls',rows=[
  ['Ethics approval',a.ethics,1],
  [ls?'Informed consent':'Patient consent',a.consent,1],
  [ls?'Materials, strains and accession numbers':'Trial registration',ls?a.accession:a.reg,0],
  ['Funding',a.funding,1],
  ['Conflict of interest',a.coi,1],
  ['Author contributions',a.contrib,1],
  ['Data availability',a.data,1],
  ['Acknowledgements',a.ack,0],
  ['Supplementary material',a.supp,0],
  ['Abbreviations',a.abv,0]];
 if(ls&&a.reg)rows.splice(3,0,['Trial / review registration',a.reg,0]);
 return rows.filter(function(r){return r[1]||r[2];}).map(function(r){return '<h3>'+r[0]+'</h3><p>'+(r[1]?inl(r[1]):'<span class="ps-ph">Not stated</span>')+'</p>';}).join('');}

printHTML=function(a){
 var B=pubBrand(),au=parseAuthors(a.authorsRaw),affs=[];
 au.forEach(function(x){if(x.aff&&affs.indexOf(x.aff)<0)affs.push(x.aff);});
 var al=au.map(function(x){var sp=[];if(x.aff)sp.push(affs.indexOf(x.aff)+1);var s=esc(x.name)+(sp.length?'<sup>'+sp.join(',')+'</sup>':'');if(pubIsCorr(a,x.name))s+='<sup>*</sup>';return s;}).join(', ');
 var doiTxt=a.doi?'doi:'+a.doi:'doi: to be assigned';
 var foot=S.short+' | Vol. '+a.vol+', Issue '+a.issue+' | '+a.year+' | '+doiTxt;
 var run=shortAuth(a)+' | '+(a.title.length>80?a.title.slice(0,77)+'...':a.title);
 var link=a.doi?'https://doi.org/'+a.doi:pubArtUrl(a);
 var cite=esc(vanc(a).replace(/\s*doi:\S+$/,''))+(a.doi?' doi:<a href="https://doi.org/'+esc(a.doi)+'">'+esc(a.doi)+'</a>':' <span class="ps-ph">doi: to be assigned</span>');
 var F='"Times New Roman","Liberation Serif",Tinos,Georgia,serif',SANS='Arial,"Liberation Sans",Helvetica,sans-serif';
 var css=[
 '@page{size:A4 portrait;margin:15mm 12mm 15mm 12mm;',
 ' @top-left{content:'+pubCssStr(S.short+' | '+S.name)+';font:7pt '+SANS+';color:#777;vertical-align:bottom;padding-bottom:4mm}',
 ' @top-right{content:'+pubCssStr(run)+';font:7pt '+SANS+';color:#777;vertical-align:bottom;padding-bottom:4mm;text-align:right}',
 ' @bottom-left{content:'+pubCssStr(foot)+';font:7.2pt '+SANS+';color:#444;vertical-align:top;padding-top:4mm}',
 ' @bottom-right{content:"Page " counter(page) " of " counter(pages);font:7.2pt '+SANS+';color:#444;vertical-align:top;padding-top:4mm}}',
 '@page :first{@top-left{content:none}@top-right{content:none}}',
 '*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}',
 'html,body{margin:0}body.pubstd{font:9.5pt/1.15 '+F+';color:#111}',
 '.pubstd a{color:'+B.a+';text-decoration:none}',
 '.pubstd .ps-ph{color:#8a8f96;font-style:italic}',
 '.pubstd .toolbar{position:sticky;top:0;z-index:5;background:'+B.p+';color:#fff;padding:9px 14px;font:13px '+SANS+';display:flex;gap:14px;align-items:center;margin:-10mm -12mm 8mm}',
 '.pubstd .toolbar button{background:'+B.g+';color:#fff;border:0;padding:8px 16px;font-weight:700;cursor:pointer;border-radius:3px}',
 '@media screen{html{background:#d7dce2}body.pubstd{max-width:210mm;margin:0 auto;padding:10mm 12mm;background:#fff;box-shadow:0 0 14px rgba(0,0,0,.25)}}',
 '@media print{.pubstd .toolbar{display:none}}',
 /* publication-information header */
 '.pubstd .pihead{display:grid;grid-template-columns:52mm 1fr 52mm;align-items:center;gap:4mm;min-height:13mm;max-height:16mm}',
 '.pubstd .pihead .lg{background:#fff;padding:0}.pubstd .pihead .lg img{display:block;max-width:52mm;max-height:15mm;width:auto;height:auto}',
 '.pubstd .pihead .nm{text-align:center;font:bold 12.5pt/1.15 '+F+';color:'+B.p+'}.pubstd .pihead .nm small{display:block;font:bold 8.5pt '+SANS+';letter-spacing:1.2pt;color:'+B.a+';margin-top:.8mm}',
 '.pubstd .pihead .ids{font:6.9pt/1.32 '+SANS+';color:#333;text-align:right;white-space:nowrap}.pubstd .pihead .ids b{color:'+B.p+';font-weight:bold}',
 '.pubstd .divider{height:1.6mm;background:linear-gradient(90deg,'+B.p+' 0 72%,'+B.a+' 72% 90%,'+B.g+' 90%);margin:2mm 0 1.6mm}',
 '.pubstd .catline{display:flex;justify-content:space-between;font:8pt '+SANS+';margin-bottom:4mm}.pubstd .catline .cat{font-weight:bold;color:#9b1c1c;text-transform:uppercase;letter-spacing:.7pt}',
 /* first page 90 + 90 */
 '.pubstd .fp{display:grid;grid-template-columns:90mm 90mm;column-gap:6mm;align-items:start}',
 '.pubstd h1.title{font:bold 20pt/1.18 '+F+';color:'+B.ink+';margin:0 0 3mm}',
 '.pubstd .authors{font-size:10pt;line-height:1.3;margin-bottom:1.8mm}.pubstd .authors sup{font-size:68%;line-height:0;color:'+B.a+'}',
 '.pubstd .affs{font:8.5pt/1.3 '+F+';color:#333}.pubstd .affs sup{font-size:70%;line-height:0}',
 '.pubstd .corr{font:8.5pt/1.3 '+F+';margin-top:1.5mm}',
 '.pubstd .meta{display:grid;grid-template-columns:23mm 1fr;gap:3mm;margin-top:3.5mm;padding-top:3mm;border-top:.6pt solid #bbb;align-items:start}',
 '.pubstd .meta .qr{display:block}.pubstd .meta .qrnote{font:6.4pt/1.2 '+SANS+';color:#666;text-align:center;margin-top:.6mm}',
 '.pubstd .dates{font:8pt/1.42 '+SANS+'}.pubstd .dates b{display:inline-block;width:17mm;color:'+B.p+'}',
 '.pubstd .box{margin-top:3mm;font:8.2pt/1.32 '+F+';text-align:left;overflow-wrap:anywhere}.pubstd .box h4{font:bold 7.4pt '+SANS+';text-transform:uppercase;letter-spacing:.6pt;color:'+B.a+';margin:0 0 .8mm}',
 '.pubstd .oa{margin-top:3mm;padding:2mm 2.5mm;border:.6pt solid '+B.a+';background:'+B.soft+';font:7.6pt/1.32 '+SANS+'}',
 '.pubstd .abs h2{font:bold 10.5pt '+SANS+';color:'+B.p+';text-transform:uppercase;letter-spacing:.8pt;margin:0 0 1.6mm;padding-bottom:1mm;border-bottom:1.2pt solid '+B.p+'}',
 '.pubstd .abs{font-size:9pt;line-height:1.2;text-align:justify}.pubstd .abs p{margin:0 0 1.4mm}',
 '.pubstd .kv{margin-top:2.5mm;font-size:8.8pt;line-height:1.25}.pubstd .kv b{color:'+B.p+'}',
 '.pubstd .hl{margin-top:3mm;padding:2.4mm 3mm;background:'+B.soft+';border-left:2pt solid '+B.g+';font:8.6pt/1.25 '+F+'}.pubstd .hl h3{font:bold 8pt '+SANS+';text-transform:uppercase;letter-spacing:.6pt;color:'+B.p+';margin:0 0 1mm}.pubstd .hl ul{margin:0;padding-left:4mm}',
 '.pubstd .rule{border:0;border-top:.8pt solid '+B.p+';margin:4.5mm 0 3.5mm}',
 /* body */
 '.pubstd .cols{column-count:2;column-width:90mm;column-gap:6mm;column-fill:balance;text-align:justify;hyphens:auto;-webkit-hyphens:auto;overflow-wrap:break-word}',
 '.pubstd .cols h2{font:bold 11.5pt '+SANS+';color:'+B.p+';margin:3.5mm 0 1.4mm;break-after:avoid}.pubstd .cols h2:first-child{margin-top:0}',
 '.pubstd .cols h4{font:bold 10pt '+F+';font-style:italic;margin:2.2mm 0 1mm;break-after:avoid}',
 '.pubstd .cols p{margin:0 0 1.6mm;orphans:3;widows:3}.pubstd .cols ul{margin:0 0 2mm;padding-left:5mm}',
 '.pubstd .cols sup{font-size:70%;line-height:0}.pubstd .cit{color:'+B.a+'}',
 '.pubstd figure{break-inside:avoid;margin:2.5mm 0;text-align:center}.pubstd figure img{max-width:100%;max-height:85mm;display:block;margin:0 auto}',
 '.pubstd figcaption,.pubstd .tcap{font:8.5pt/1.25 '+F+';text-align:left;margin-top:1mm}.pubstd .tcap{margin:0 0 1mm}.pubstd .tnote{font:7.6pt/1.25 '+F+';color:#444;margin-top:.6mm}',
 '.pubstd .tblk{margin:2.5mm 0;break-inside:avoid}.pubstd .tblk.wide,.pubstd figure.wide{column-span:all;margin:3.5mm 0}',
 '.pubstd table{width:100%;border-collapse:collapse;font:8.3pt/1.22 '+F+';margin:1.5mm 0;break-inside:avoid}',
 '.pubstd th,.pubstd td{padding:.9mm 1.4mm;text-align:left;border-bottom:.4pt solid #999;vertical-align:top}.pubstd th{border-top:.9pt solid #000;border-bottom:.9pt solid #000;background:'+B.soft+'}',
 '.pubstd .decl{margin-top:3mm;padding-top:2mm;border-top:.6pt solid #bbb}.pubstd .decl h3{font:bold 8.6pt '+SANS+';color:'+B.p+';margin:2mm 0 .6mm;break-after:avoid}.pubstd .decl p{font-size:8.6pt;line-height:1.22;margin:0 0 .8mm}',
 '.pubstd .refsblock{margin-top:3.5mm;border-top:.8pt solid '+B.p+';padding-top:1mm}.pubstd .refsblock h2{font:bold 11.5pt '+SANS+';color:'+B.p+';margin:2mm 0 1.5mm}',
 '.pubstd .refsblock ol{column-count:2;column-gap:6mm;padding-left:5mm;margin:0;font:8.2pt/1.25 '+F+';text-align:left;overflow-wrap:anywhere}.pubstd .refsblock li{margin-bottom:.8mm;break-inside:avoid}',
 '.pubstd .apcbox{margin-top:3.5mm;padding:2.2mm 3mm;border:.6pt solid #b9c4cf;border-left:2.2pt solid '+B.g+';background:#fafbfc;font:7.6pt/1.3 '+SANS+';break-inside:avoid}',
 '.pubstd .endline{margin-top:3mm;font:7.4pt/1.35 '+SANS+';color:#555;text-align:center;break-inside:avoid}',
 '.pubstd .wm{position:fixed;left:0;right:0;top:40%;text-align:center;font:bold 120pt '+SANS+';color:rgba(155,28,28,.10);transform:rotate(-32deg);letter-spacing:12pt;z-index:0;pointer-events:none}'
 ].join('\n');

 var ids='<b>P-ISSN:</b> '+pubPh(S.issnP,'XXXX-XXXX')+' &nbsp; <b>E-ISSN:</b> '+pubPh(S.issnO,'XXXX-XXXX')
  +'<br><b>DOI prefix:</b> '+pubPh(S.doiPrefix&&!/x{3,}/i.test(S.doiPrefix)?S.doiPrefix:'','10.XXXXX')
  +'<br><b>Web:</b> '+(pubHost()?'<a href="'+esc(pubSite())+'">'+esc(pubHost())+'</a>':pubPh('','www.example.com'))
  +'<br><b>Frequency:</b> '+pubPh(S.freq,'Quarterly / Biannual')
  +'<br><b>Volume '+esc(a.vol)+' / Issue '+esc(a.issue)+' / '+esc(a.year)+'</b>';
 var head='<div class="pihead"><div class="lg">'+(pubLogo()?'<img src="'+pubLogo()+'" alt="'+esc(S.name)+'">':'')+'</div>'
  +'<div class="nm">'+esc(S.name)+'<small>'+esc(S.short)+'</small></div><div class="ids">'+ids+'</div></div>'
  +'<div class="divider"></div>'
  +'<div class="catline"><span class="cat">'+esc(a.type||'Original Research')+'</span><span><b>Article DOI:</b> '+(a.doi?'<a href="https://doi.org/'+esc(a.doi)+'">'+esc(a.doi)+'</a>':'<span class="ps-ph">to be assigned</span>')+'</span></div>';

 var dates='<b>Received</b> '+pubPh(pubDate(a.received),'dd Month yyyy')+'<br><b>Revised</b> '+pubPh(pubDate(a.revised),'dd Month yyyy')
  +'<br><b>Accepted</b> '+pubPh(pubDate(a.accepted),'dd Month yyyy')+'<br><b>Published</b> '+pubPh(pubDate(a.published),'dd Month yyyy')
  +(pubPages(a)?'<br><b>Pages</b> '+esc(pubPages(a).replace(/^pp\. /,'')):'');
 var corrHtml=a.corr?'<div class="corr"><sup>*</sup><b>Corresponding author:</b> '+esc(a.corr).replace(/([^\s,;<>()]+@[^\s,;<>()]+\.[A-Za-z]{2,})/,'<a href="mailto:$1">$1</a>')+'</div>':'<div class="corr"><sup>*</sup><b>Corresponding author:</b> <span class="ps-ph">name, e-mail</span></div>';
 var left='<div class="left"><h1 class="title">'+esc(a.title)+'</h1><div class="authors">'+al+'</div>'
  +'<div class="affs">'+affs.map(function(f,i){return '<sup>'+(i+1)+'</sup>'+esc(f);}).join('<br>')+'</div>'+corrHtml
  +'<div class="meta"><div>'+pubQr(link,22)+'<div class="qrnote">Scan to read online</div></div><div class="dates">'+dates+'</div></div>'
  +'<div class="box"><h4>How to cite</h4>'+cite+'</div>'
  +'<div class="oa"><b>Open access.</b> &copy; '+esc(a.year)+' The authors. Published by '+esc(S.publisher)+' under the '+esc(a.license||S.license)+' licence, which permits use, sharing and reproduction in any medium, provided the original work is properly cited.</div></div>';
 var kw=(a.keywords||[]).length?a.keywords.map(esc).join('; '):'<span class="ps-ph">keywords</span>';
 var right='<div class="abs"><h2>Abstract</h2>'+(a.abstract?fmt(a.abstract,a,{}):'<p class="ps-ph">Structured abstract: Background, Methods, Results, Conclusions.</p>')
  +'<div class="kv"><b>Keywords:</b> '+kw+'</div><div class="kv"><b>Subject area:</b> '+pubPh(a.branch,S.scope||'subject area')+'</div>'
  +(a.highlights?hlHtml(a).replace('<h3>Key points</h3>','<h3>Editor&rsquo;s perspective / Highlights</h3>'):'')+'</div>';
 var apc=typeof apcStatement==='function'?apcStatement(a):'';
 return '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>'+esc(a.title)+' | '+esc(S.short)+'</title><meta name="author" content="'+esc(au.map(function(x){return x.name;}).join('; '))+'"><meta name="subject" content="'+esc(S.name)+'"><style>'+css+'</style></head><body class="pubstd">'
  +'<div class="toolbar"><button onclick="window.print()">Print / Save as PDF</button><span>Chrome or Edge: Destination = Save as PDF, Paper = A4, Margins = Default, Background graphics = on.</span></div>'
  +(pubIsSample(a)?'<div class="wm">SAMPLE</div>':'')
  +head+'<div class="fp">'+left+right+'</div><hr class="rule">'
  +'<div class="cols">'+bodyHtml(a)+'<div class="decl">'+pubDecl(a)+'</div></div>'
  +(refList(a).length?'<div class="refsblock">'+refsHtml(a)+'</div>':'')
  +(apc?'<div class="apcbox">'+apc+'</div>':'')
  +'<div class="endline">'+esc(S.name)+' ('+esc(S.short)+') &middot; '+esc(S.publisher)+(S.address?' &middot; '+esc(S.address):'')+(S.email?' &middot; '+esc(S.email):'')+'</div></body></html>';};

/* ------------------------ CERTIFICATE OF PUBLICATION ------------------------ */
function certNo(a,n){var id=String(a.artno||a.id||'').replace(/[^A-Za-z0-9]/g,'').toUpperCase().slice(0,12);return S.short+'/CERT/'+a.year+'/'+id+'-'+String(n+1).padStart(2,'0');}
function certVerifyUrl(a,n){return pubSite()+'/verify/'+encodeURIComponent(a.id)+'/'+(n+1);}
function certRole(a,i,au){var r=[];if(i===0)r.push('first');if(pubIsCorr(a,au[i].name))r.push('corresponding');if(!r.length)r.push('co-');return r.join(' and ')+(r[r.length-1]==='co-'?'author':' author');}
function certSeal(B,date){
 return '<svg class="seal" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><defs><path id="sealtop" d="M100,100 m-72,0 a72,72 0 1,1 144,0"/><path id="sealbot" d="M100,100 m-80,0 a80,80 0 0,0 160,0"/></defs>'
 +'<circle cx="100" cy="100" r="96" fill="'+B.p+'"/><circle cx="100" cy="100" r="90" fill="none" stroke="'+B.g+'" stroke-width="3"/><circle cx="100" cy="100" r="58" fill="none" stroke="'+B.g+'" stroke-width="1.6"/>'
 +'<text font-family="Arial,sans-serif" font-size="17" font-weight="bold" fill="#fff" letter-spacing="3"><textPath href="#sealtop" startOffset="50%" text-anchor="middle">PUBLISHED</textPath></text>'
 +'<text font-family="Arial,sans-serif" font-size="13" font-weight="bold" fill="'+B.g+'" letter-spacing="2"><textPath href="#sealbot" startOffset="50%" text-anchor="middle">&#9733; PEER REVIEWED &#9733;</textPath></text>'
 +'<text x="100" y="96" text-anchor="middle" font-family="Georgia,serif" font-size="25" font-weight="bold" fill="#fff">'+esc(S.short)+'</text>'
 +'<text x="100" y="118" text-anchor="middle" font-family="Arial,sans-serif" font-size="11.5" fill="'+B.g+'">'+esc(date)+'</text></svg>';}
function certPage(a,n){
 var B=pubBrand(),au=parseAuthors(a.authorsRaw),x=au[n];if(!x)return '';
 var others=au.filter(function(y,i){return i!==n;}).map(function(y){return esc(y.name);});
 var t=String(a.title||''),ts=t.length>230?11.5:t.length>160?13:t.length>100?14.5:16.5;
 var ns=x.name.length>34?22:x.name.length>24?26:30;
 var pubd=pubDate(a.published),no=certNo(a,n),vurl=certVerifyUrl(a,n);
 var where='published in <b>'+esc(S.name)+'</b> ('+esc(S.short)+'), Volume '+esc(a.vol)+', Issue '+esc(a.issue)+(a.period?', '+esc(a.period):', '+esc(a.year))+(pubPages(a)?', '+esc(pubPages(a)):'')
  +', DOI: '+(a.doi?'<a href="https://doi.org/'+esc(a.doi)+'">'+esc(a.doi)+'</a>':'<span class="ps-ph">to be assigned</span>')+'.';
 var issn=[];if(S.issnO)issn.push('E-ISSN '+S.issnO);if(S.issnP)issn.push('P-ISSN '+S.issnP);
 return '<section class="cert">'
  +'<div class="b1"></div><div class="b2"></div><i class="cn tl"></i><i class="cn tr"></i><i class="cn bl"></i><i class="cn br"></i>'
  +(pubLogo()?'<img class="wmk" src="'+pubLogo()+'" alt="">':'')
  +(pubIsSample(a)?'<div class="smp">SAMPLE</div>':'')
  +'<div class="in">'
  +(pubLogo()?'<img class="logo" src="'+pubLogo()+'" alt="'+esc(S.name)+'">':'<div class="jname">'+esc(S.name)+'</div>')
  +'<h1>Certificate of Publication</h1><div class="orn"><span></span>&#10070;<span></span></div>'
  +'<p class="lead">This is to certify that</p>'
  +'<div class="who" style="font-size:'+ns+'pt">'+esc(x.name)+'</div>'
  +(x.aff?'<div class="aff">'+esc(x.aff)+'</div>':'')
  +'<p class="txt">is the <b>'+certRole(a,n,au)+'</b> of the peer-reviewed '+esc(String(a.type||'article').toLowerCase())+' entitled</p>'
  +'<div class="ttl" style="font-size:'+ts+'pt">&ldquo;'+esc(t)+'&rdquo;</div>'
  +(others.length?'<p class="co"><b>Co-authors:</b> '+others.join(', ')+'</p>':'')
  +'<p class="txt">'+where+'</p>'
  +'<div class="row"><div class="sig"><div class="line"></div><b>'+pubPh(S.editorName,'Editor-in-Chief name')+'</b><span>Editor-in-Chief, '+esc(S.short)+'</span></div>'
  +'<div class="sealw">'+certSeal(B,pubd)+'</div>'
  +'<div class="ver">'+pubQr(vurl,22)+'<div><b>Certificate No.</b><br>'+esc(no)+'<br><b>Date of publication</b><br>'+esc(pubd)+'<br><b>Verify</b><br><a class="u" href="'+esc(vurl)+'">'+esc(vurl.replace(/^https?:\/\//,''))+'</a></div></div></div>'
  +'</div>'
  +'<div class="foot">'+esc(S.publisher)+(S.address?' &middot; '+esc(S.address):'')+(S.email?' &middot; '+esc(S.email):'')+(issn.length?' &middot; '+esc(issn.join(' / ')):'')
  +'<br><span class="cite">'+esc(vanc(a))+'</span></div>'
  +'</section>';}
function certHTML(a,only){
 var B=pubBrand(),au=parseAuthors(a.authorsRaw),SANS='Arial,"Liberation Sans",Helvetica,sans-serif',F='Georgia,"Times New Roman","Liberation Serif",serif';
 var pages=(only!=null&&only>=0?[only]:au.map(function(x,i){return i;})).map(function(i){return certPage(a,i);}).join('');
 var css=['@page{size:A4 landscape;margin:0}','*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}','html,body{margin:0}',
 'body.pubcert{font-family:'+F+';color:#1b2430}',
 '.pubcert .toolbar{position:sticky;top:0;z-index:5;background:'+B.p+';color:#fff;padding:9px 14px;font:13px '+SANS+';display:flex;gap:14px;align-items:center}',
 '.pubcert .toolbar button{background:'+B.g+';color:#fff;border:0;padding:8px 16px;font-weight:700;cursor:pointer;border-radius:3px}',
 '@media screen{html{background:#d7dce2}.pubcert .cert{margin:8mm auto;box-shadow:0 0 14px rgba(0,0,0,.25)}}@media print{.pubcert .toolbar{display:none}}',
 '.pubcert .cert{position:relative;width:297mm;height:210mm;overflow:hidden;background:#fff;page-break-after:always;break-after:page}',
 '.pubcert .cert:last-child{page-break-after:auto;break-after:auto}',
 '.pubcert .b1{position:absolute;inset:7mm;border:2.6mm solid '+B.p+'}',
 '.pubcert .b2{position:absolute;inset:11.5mm;border:.7mm solid '+B.g+'}',
 '.pubcert .cn{position:absolute;width:15mm;height:15mm;border:1.1mm solid '+B.g+';background:#fff}',
 '.pubcert .cn:after{content:"";position:absolute;inset:2.6mm;background:'+B.g+';transform:rotate(45deg)}',
 '.pubcert .tl{left:4.5mm;top:4.5mm}.pubcert .tr{right:4.5mm;top:4.5mm}.pubcert .bl{left:4.5mm;bottom:4.5mm}.pubcert .br{right:4.5mm;bottom:4.5mm}',
 '.pubcert .wmk{position:absolute;left:50%;top:54%;width:200mm;transform:translate(-50%,-50%);opacity:.05}',
 '.pubcert .smp{position:absolute;left:0;right:0;top:38%;text-align:center;font:bold 110pt '+SANS+';color:rgba(155,28,28,.12);transform:rotate(-18deg);letter-spacing:10pt}',
 '.pubcert .in{position:absolute;left:22mm;right:22mm;top:16mm;bottom:28mm;display:flex;flex-direction:column;align-items:center;text-align:center}',
 '.pubcert .logo{height:20mm;max-width:140mm;width:auto;display:block;margin-bottom:2mm}.pubcert .jname{font:bold 16pt '+F+';color:'+B.p+'}',
 '.pubcert h1{font:bold 25pt '+F+';letter-spacing:3.5pt;text-transform:uppercase;color:'+B.p+';margin:1mm 0 0}',
 '.pubcert .orn{display:flex;align-items:center;gap:3mm;color:'+B.g+';font-size:12pt;margin:1.2mm 0 2mm}.pubcert .orn span{display:block;width:38mm;height:.5mm;background:'+B.g+'}',
 '.pubcert .lead{font:italic 12pt '+F+';margin:0;color:#444}',
 '.pubcert .who{font-weight:bold;color:'+B.ink+';margin:1.2mm 0 .4mm;line-height:1.1;max-width:230mm}',
 '.pubcert .aff{font:italic 10.5pt '+F+';color:#444;max-width:220mm}',
 '.pubcert .txt{font:11.5pt/1.4 '+F+';margin:2mm 0 0;max-width:235mm}',
 '.pubcert .ttl{font-weight:bold;font-style:italic;color:'+B.p+';line-height:1.25;margin:1.2mm 0 0;max-width:235mm}',
 '.pubcert .co{font:10pt/1.35 '+F+';color:#333;margin:1.5mm 0 0;max-width:235mm}',
 '.pubcert .row{margin-top:auto;width:100%;display:grid;grid-template-columns:1fr 36mm 1fr;align-items:end;gap:8mm}',
 '.pubcert .sig{text-align:center;font:10pt '+F+'}.pubcert .sig .line{border-top:.35mm solid #333;margin:0 10mm 1.5mm}.pubcert .sig b{display:block}.pubcert .sig span{display:block;font-size:9pt;color:#444}',
 '.pubcert .sealw svg{width:34mm;height:34mm;display:block;margin:0 auto}',
 '.pubcert .ver{display:flex;gap:3mm;align-items:center;justify-content:flex-end;text-align:left;font:7.6pt/1.3 '+SANS+';color:#333}.pubcert .ver b{color:'+B.p+'}.pubcert .ver .u{word-break:break-all;color:#333;text-decoration:none}.pubcert a{color:inherit;text-decoration:none}',
 '.pubcert .ps-ph{color:#8a8f96;font-style:italic}',
 '.pubcert .foot{position:absolute;left:24mm;right:24mm;bottom:14mm;text-align:center;font:7.2pt/1.35 '+SANS+';color:#555}.pubcert .foot .cite{color:#333}'].join('\n');
 return '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Certificate of Publication | '+esc(S.short)+'</title><style>'+css+'</style></head><body class="pubcert">'
  +'<div class="toolbar"><button onclick="window.print()">Print / Save as PDF</button><span>Chrome or Edge: Paper = A4, Layout = Landscape, Margins = None, Background graphics = on.</span></div>'+pages+'</body></html>';}
function openCert(a,n){var u=URL.createObjectURL(new Blob([certHTML(a,n)],{type:'text/html'}));var w=window.open(u,'_blank');if(!w&&typeof toast==='function')toast('Pop-up blocked - allow pop-ups for this page and try again.');}
function certLinks(a){var au=parseAuthors(a.authorsRaw);return au.map(function(x,i){return window.IJMMS_SERVER
 ?'<a class="btn sm ghost" target="_blank" rel="noopener" href="/article/'+encodeURIComponent(a.id)+'/certificate/'+(i+1)+'">'+esc(x.name)+'</a>'
 :'<button class="btn sm ghost" type="button" data-act="certopen" data-id="'+esc(a.id)+'" data-n="'+i+'">'+esc(x.name)+'</button>';}).join(' ');}

/* ------------------------------ ADMIN / AUTHOR UI ------------------------------ */
if(typeof ACT!=='undefined')Object.assign(ACT,{
 certopen:function(t){var a=findArt(t.dataset.id);if(a)openCert(a,parseInt(t.dataset.n,10));},
 certall:function(t){var a=findArt(t.dataset.id);if(!a)return;if(window.IJMMS_SERVER){window.open('/article/'+encodeURIComponent(a.id)+'/certificate/all','_blank');}else openCert(a,null);}
});
/* article editor: Revised date and (IJMLS) materials / accession numbers */
if(typeof vEditor==='function'){var _pubVE=vEditor;vEditor=function(id){var h=_pubVE(id);var a=(id&&findArt(id))||{};
 h=h.replace('<div class="row3"><div class="fg"><label>Received','<div class="row4"><div class="fg"><label>Received');
 h=h.replace(/(<div class="fg"><label>Accepted<\/label>)/,'<div class="fg"><label>Revised</label><input type="date" id="f-revd" value="'+esc(a.revised||'')+'"></div>$1');
 if(JID==='ls')h=h.replace('<h4>Issue and publication details</h4>','<div class="fg"><label>Materials, strains and accession numbers (IJMLS)</label><textarea id="f-accn" rows="2" placeholder="e.g. Sequences deposited in GenBank under accession numbers ...">'+esc(a.accession||'')+'</textarea></div><h4>Issue and publication details</h4>');
 if(a.status==='published'&&parseAuthors(a.authorsRaw).length)h=h.replace('<h4>Issue and publication details</h4>','<div class="toolcard"><b>Certificates of Publication</b> (one per author): '+certLinks(a)+'</div><h4>Issue and publication details</h4>');
 return h;};}
if(typeof collect==='function'){var _pubCol=collect;collect=function(st){var a=_pubCol(st);var e=$('f-revd');a.revised=e?e.value.trim():(a.revised||'');var c=$('f-accn');if(c)a.accession=c.value.trim();var old=a.id&&findArt(a.id);if(old&&old.certIssued)a.certIssued=old.certIssued;return a;};}
/* settings: website printed on PDFs and certificates */
if(typeof vSettings==='function'){var _pubVS=vSettings;vSettings=function(){var h=_pubVS();return h.replace('<button class="btn teal" data-act="savesettings">','<div class="row2"><div class="fg"><label>Website printed on PDFs and certificates (blank = this site\'s address)</label><input id="s-website" value="'+esc(S.website||'')+'" placeholder="https://'+esc(location.host)+'"></div><div class="fg"><label>Editor-in-Chief name (signs certificates)</label><input id="s-editorName" value="'+esc(S.editorName||'')+'"></div></div><button class="btn teal" data-act="savesettings">');};
 var _pubSave=ACT.savesettings;ACT.savesettings=function(t){var w=$('s-website'),e=$('s-editorName');if(w)S.website=w.value.trim();if(e&&e.value.trim())S.editorName=e.value.trim();return _pubSave(t);};}
/* static (browser-only) edition: the publication e-mail tells the author where the certificate is */
if(typeof mPublished==='function'&&!window.IJMMS_SERVER){var _pubMP=mPublished;mPublished=function(s,art){_pubMP(s,art);var m=OUT[OUT.length-1];if(m&&/now published/.test(m.subject)){m.body=m.body.replace('Please share the article link','Your Certificate of Publication (one for each author) is attached as a printable page: open it from your dashboard and choose Save as PDF.\n\nPlease share the article link');m.att='cert';saveOut();}};}
/* server edition: the server sends the publication e-mail with the certificates attached */
if(typeof mPublished==='function'&&window.IJMMS_SERVER){mPublished=function(){};}
/* author's submission page: certificates once the article is published */
if(typeof vSub==='function'){var _pubVSub=vSub;vSub=function(id){var h=_pubVSub(id),s=findSub(id);if(!s||s.status!=='Published')return h;
 var a=(typeof ARTS!=='undefined'?ARTS:[]).filter(function(x){return x.subId===s.id&&x.status==='published';})[0];if(!a)return h;
 var card='<div class="card"><h4>Certificate of Publication</h4><p style="font-size:13px">One certificate for each author of &ldquo;'+esc(a.title)+'&rdquo;:</p><p>'+certLinks(a)+'</p></div>';
 var i=h.lastIndexOf('<div class="card"><h4>History</h4>');return i>-1?h.slice(0,i)+card+h.slice(i):h+card;};}
/* pre-publication check: declarations the publication standard prints on every article */
if(typeof checkArt==='function'){var _pubChk=checkArt;checkArt=function(a){var r=_pubChk(a);var need=[['ethics','Ethics approval'],['consent',JID==='ls'?'Informed consent':'Patient consent'],['funding','Funding'],['coi','Conflict of interest'],['contrib','Author contributions'],['data','Data availability']];
 need.forEach(function(n){if(!String(a[n[0]]||'').trim())r.items.push({lv:'warn',msg:n[1]+' statement is empty - the PDF will print "Not stated". Write "Not applicable" if it does not apply.'});});
 if(!a.revised)r.items.push({lv:'warn',msg:'Revised date is empty - the PDF will show a placeholder.'});
 return r;};}
