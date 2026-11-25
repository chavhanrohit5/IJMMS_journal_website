/* ==========================================================================
   Plagiarism & AI content check certificate.
   The editor runs the manuscript through the journal's checker (Plagiarism
   Checker X by default; it has no online API) and enters the real results here:
   s.plag = {sim, ai, tool, aiTool, date, words, excl, sources:[[name,pct]], note,
             report:{name,at}, sendReport, by, at}
   - admin card on the submission page (results + upload of the checker's report)
   - one-page certificate PDF with QR verification (/verify-plag/<id>)
   - attached automatically to the acceptance e-mail; can also be e-mailed any time
   - authors can download it from their manuscript page once accepted
   Shared by IJMMS and IJMLS.
   ========================================================================== */
if(typeof DEFAULTS!=='undefined'){if(!('plagTool' in DEFAULTS))DEFAULTS.plagTool='Plagiarism Checker X';if(!('plagMax' in DEFAULTS))DEFAULTS.plagMax='10';if(!('aiMax' in DEFAULTS))DEFAULTS.aiMax='20';if(!('aiTool' in DEFAULTS))DEFAULTS.aiTool='';}
var PLAG_KEY='plagrep1';
var PLAG_UGC=[['Level 0','Up to 10%','Minor similarity'],['Level 1','Above 10% to 40%','Moderate similarity'],['Level 2','Above 40% to 60%','High similarity'],['Level 3','Above 60%','Very high similarity']];
function plagNum(v){return v===''||v==null||isNaN(+v)?null:Math.round(+v*10)/10;}
function plagOn(s){return !!(s&&s.plag&&plagNum(s.plag.sim)!==null);}
function plagLevel(p){return p<=10?0:p<=40?1:p<=60?2:3;}
function plagMax(){return plagNum(S.plagMax)!==null?plagNum(S.plagMax):10;}
function aiMax(){return plagNum(S.aiMax)!==null?plagNum(S.aiMax):20;}
function plagPass(p){var sim=plagNum(p.sim),ai=plagNum(p.ai);return sim!==null&&sim<=plagMax()&&(ai===null||ai<=aiMax());}
function plagCertNo(s){var d=String((s.plag&&s.plag.date)||today());return S.short+'/PAC/'+d.slice(0,4)+'/'+String(ensureRef(s)).split('/').pop()+'-'+String(s.id).replace(/[^A-Za-z0-9]/g,'').slice(-4).toUpperCase();}
function plagSite(){return typeof pubSite==='function'?pubSite():String(window.__SITE||location.origin).replace(/\/+$/,'');}
function plagVerifyUrl(s){return plagSite()+'/verify-plag/'+encodeURIComponent(s.id);}
function plagColor(v,max){return v<=max?'#1e7d32':v<=max*2?'#B8860B':'#9b1c1c';}
function plagSources(txt){return String(txt||'').split(/\n/).map(function(l){var m=l.split('|');var n=(m[0]||'').trim(),p=plagNum(String(m[1]||'').replace('%',''));return n?[n.slice(0,160),p]:null;}).filter(Boolean).slice(0,8);}

/* ---- e-mail text block (rendered as a table by the e-mail designer) ---- */
function plagText(s){if(!plagOn(s))return '';var p=s.plag,sim=plagNum(p.sim),ai=plagNum(p.ai);
 return 'PLAGIARISM & AI CHECK\nCertificate no.     : '+plagCertNo(s)+'\nSimilarity index    : '+sim+'%\nOriginality         : '+Math.round((100-sim)*10)/10+'%\n'+(ai!==null?'AI-generated content: '+ai+'%\n':'')+'Checked with        : '+(p.tool||S.plagTool)+(ai!==null&&p.aiTool?' / '+p.aiTool:'')+'\nDate of check       : '+fmtDate(p.date||today())+'\nResult              : '+(plagPass(p)?'Within the journal\'s limits':'Reviewed and cleared by the editor')+'\nVerify online       : '+plagVerifyUrl(s)+'\n\nThe Plagiarism & AI Content Check Certificate (PDF) is attached to this e-mail'+(p.report&&p.sendReport?', together with the original similarity report':'')+'.\n\n';}
if(typeof acceptEmail==='function'){var _plagAE=acceptEmail;acceptEmail=function(s,a){var t=_plagAE(s,a),pt=plagText(s);if(!pt)return t;var i=t.indexOf('NEXT STEPS');return i>-1?t.slice(0,i)+pt+t.slice(i):t+'\n'+pt;};}
/* the server attaches the certificate to the acceptance e-mail (att 'accept' becomes 'accept+plag') */
function plagMail(s){var a=mailAuthor(s);
 queueMail(a.email,a.name,'['+ensureRef(s)+'] Plagiarism & AI content check certificate - '+S.short,'Dear '+a.name+',\n\nYour manuscript has been checked for similarity with published literature and internet sources, and for AI-generated content.\n\nMANUSCRIPT\nReference no. : '+ensureRef(s)+'\nTitle         : '+s.title+'\nArticle type  : '+s.type+'\n\n'+plagText(s)+'Please keep this certificate for your records.\n'+sigText(),'plag',s.id);}

/* ---- the certificate (one A4 page) ---- */
function plagHTML(s){var a=mailAuthor(s),p=s.plag||{},sim=plagNum(p.sim)||0,ai=plagNum(p.ai),lv=plagLevel(sim),pass=plagPass(p),src=Array.isArray(p.sources)?p.sources:[],dt=fmtDate(p.date||today());ensureRef(s);
 var rows=[['Reference no.',s.ref],['Title',s.title],['Authors',authNames({authorsRaw:s.authorsRaw})||a.name],['Article type',s.type],['Date received',fmtDate(s.date)]].filter(function(r){return r[1];}).map(function(r){return '<tr><th>'+r[0]+'</th><td>'+esc(r[1])+'</td></tr>';}).join('');
 var det=[['Similarity software',p.tool||S.plagTool],['AI-detection tool',ai!==null?(p.aiTool||S.aiTool||''):''],['Words checked',p.words?Number(p.words).toLocaleString('en-IN'):''],['Excluded from check',p.excl],['Date of check',dt]].filter(function(r){return r[1];}).map(function(r){return '<tr><th>'+r[0]+'</th><td>'+esc(r[1])+'</td></tr>';}).join('');
 var tile=function(lbl,v,c,sub){return '<div class="tl" style="border-color:'+c+'"><div class="v" style="color:'+c+'">'+v+'</div><div class="l">'+lbl+'</div>'+(sub?'<div class="s">'+sub+'</div>':'')+'</div>';};
 var tiles=tile('Similarity index',sim+'%',plagColor(sim,plagMax()),'Limit: '+plagMax()+'%')+tile('Originality',Math.round((100-sim)*10)/10+'%','#0E7C7B','Unique content')+(ai!==null?tile('AI-generated content',ai+'%',plagColor(ai,aiMax()),'Limit: '+aiMax()+'%'):'')+tile('UGC similarity level',PLAG_UGC[lv][0],lv===0?'#1e7d32':lv===1?'#B8860B':'#9b1c1c',PLAG_UGC[lv][2]);
 var ugc='<table class="ug"><tr><th>UGC level</th><th>Similarity</th><th>Category</th></tr>'+PLAG_UGC.map(function(u,i){return '<tr'+(i===lv?' class="on"':'')+'><td>'+u[0]+(i===lv?' &#9664;':'')+'</td><td>'+u[1]+'</td><td>'+u[2]+'</td></tr>';}).join('')+'</table>';
 var srcT=src.length?'<h3>Top matching sources</h3><table class="sr"><tr><th style="width:8mm">#</th><th>Source</th><th style="width:20mm">Match</th></tr>'+src.slice(0,6).map(function(x,i){return '<tr><td>'+(i+1)+'</td><td>'+esc(x[0])+'</td><td>'+(x[1]!==null&&x[1]!==undefined?x[1]+'%':'')+'</td></tr>';}).join('')+'</table>':'';
 var corner='<svg class="cn" viewBox="0 0 60 60"><path d="M2 58V10Q2 2 10 2H58" fill="none" stroke="#B8860B" stroke-width="2.4"/><path d="M10 58V18Q10 10 18 10H58" fill="none" stroke="#0E7C7B" stroke-width="1.2"/><circle cx="2" cy="58" r="2.6" fill="#B8860B"/></svg>';
 var qr=typeof pubQr==='function'?pubQr(plagVerifyUrl(s),21):'';
 return '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Plagiarism-AI-Certificate-'+esc(String(s.ref).replace(/\//g,'-'))+'</title><style>'+docCss()+
 '.frame{position:absolute;inset:7mm;border:1.6mm double #0D2B4E}.in{position:absolute;inset:11mm;border:.35mm solid #B8860B}.cn{position:absolute;width:18mm;height:18mm}.c1{left:9mm;top:9mm}.c2{right:9mm;top:9mm;transform:scaleX(-1)}.c3{left:9mm;bottom:9mm;transform:scaleY(-1)}.c4{right:9mm;bottom:9mm;transform:scale(-1,-1)}'+
 '.wm{position:absolute;left:50%;top:50%;width:115mm;margin-left:-57.5mm;margin-top:-57.5mm;opacity:.045}.c{position:absolute;left:20mm;right:20mm;top:16mm;bottom:16mm}'+
 '.hd{text-align:center}.hd img{height:22mm;width:auto}.ttl{margin:2.5mm 0 0;font-size:22px;letter-spacing:2px;text-transform:uppercase;color:#0D2B4E;text-align:center}.u{width:42mm;height:.9mm;background:linear-gradient(90deg,#0D2B4E,#B8860B,#0E7C7B);margin:1.8mm auto 1.6mm}.tag{text-align:center;font:bold 9.5px Arial,sans-serif;letter-spacing:2.5px;color:#0E7C7B;text-transform:uppercase;margin-bottom:3mm}'+
 '.meta{display:flex;justify-content:space-between;font:10.5px Arial,sans-serif;color:#44566b;margin-bottom:2mm}p{font-size:11.5px;line-height:1.5;margin:0 0 2mm;text-align:justify}h3{font:bold 10.5px Arial,sans-serif;letter-spacing:1.4px;text-transform:uppercase;color:#0D2B4E;margin:3mm 0 1.2mm}'+
 'table{width:100%;border-collapse:collapse;font:10.3px/1.35 Arial,sans-serif}th,td{padding:1.2mm 2.2mm;border:1px solid #b9c6d6;text-align:left;vertical-align:top}table.kv th{width:36mm;color:#0D2B4E}table.sr th,table.ug th{background:#0D2B4E;color:#fff;border-color:#0D2B4E}table.ug tr.on td{background:#fdf3d6;font-weight:bold}'+
 '.tiles{display:flex;gap:2.5mm;margin:2.5mm 0}.tl{flex:1;border:.5mm solid;border-top-width:1.6mm;border-radius:1.5mm;padding:2mm 1.5mm;text-align:center;background:rgba(255,255,255,.85)}.tl .v{font:bold 21px Arial,sans-serif}.tl .l{font:bold 9px Arial,sans-serif;text-transform:uppercase;letter-spacing:.8px;color:#0D2B4E;margin-top:.6mm}.tl .s{font:8.5px Arial,sans-serif;color:#5b6b7c;margin-top:.4mm}'+
 '.two{display:flex;gap:4mm}.two>div{flex:1}.vd{margin:3mm 0 2mm;padding:2.2mm 3mm;border-left:1.4mm solid '+(pass?'#1e7d32':'#B8860B')+';background:'+(pass?'#eef8ef':'#fdf8ec')+';font:10.8px/1.45 Arial,sans-serif}'+
 '.sg{position:absolute;left:0;right:0;bottom:7mm;display:flex;justify-content:space-between;align-items:flex-end}.sg .nm{font-size:12.5px;font-weight:bold;color:#0D2B4E}.sg .ds{font:10px/1.45 Arial,sans-serif;color:#44566b}.line{width:50mm;border-top:.4mm solid #1b2735;margin-bottom:1.2mm}.qrb{text-align:center;font:8.5px Arial,sans-serif;color:#44566b}'+
 '.seal{width:30mm;height:30mm;border-radius:50%;border:.7mm solid #1f4aa8;color:#1f4aa8;display:flex;align-items:center;justify-content:center;text-align:center;font:bold 8.5px/1.3 Arial,sans-serif;letter-spacing:1px;transform:rotate(-10deg);box-shadow:inset 0 0 0 1.2mm #fff,inset 0 0 0 1.6mm #1f4aa8;opacity:.92}.seal span{display:block;font-size:13px;margin:.6mm 0}'+
 '.dis{position:absolute;left:0;right:0;bottom:0;font:8px/1.35 Arial,sans-serif;color:#6b7785;text-align:center}'+
 '</style></head><body><div class="pg"><div class="frame"></div><div class="in"></div>'+['c1','c2','c3','c4'].map(function(k){return corner.replace('class="cn"','class="cn '+k+'"');}).join('')+'<img class="wm" src="'+LOGO_CIRCLE+'" alt="">'+
 '<div class="c"><div class="hd"><img src="'+LOGO_SMALL+'" alt="'+esc(S.name)+'"></div><div class="ttl">Plagiarism &amp; AI Content Check Certificate</div><div class="u"></div><div class="tag">Similarity &middot; Originality &middot; AI-generated content</div>'+
 '<div class="meta"><span>Certificate No: <b>'+esc(plagCertNo(s))+'</b></span><span>Date: <b>'+dt+'</b></span></div>'+
 '<p>This is to certify that the manuscript detailed below, submitted to <b>'+esc(S.name)+'</b> ('+esc(S.short)+'), was checked for similarity with published literature and internet sources'+(ai!==null?' and for AI-generated content':'')+'. The results of the check are given below.</p>'+
 '<table class="kv">'+rows+'</table><div class="tiles">'+tiles+'</div>'+
 '<div class="two"><div><h3>Check details</h3><table class="kv">'+det+'</table></div><div><h3>Similarity levels (UGC Regulations, 2018)</h3>'+ugc+'</div></div>'+srcT+
 '<div class="vd"><b>Result: '+(pass?'The manuscript is within the journal\'s limits for similarity'+(ai!==null?' and AI-generated content':'')+'.':'The results were reviewed by the editor and the manuscript was cleared for publication.')+'</b>'+(p.note?'<br>'+esc(p.note):'')+'</div>'+
 '<div class="sg"><div>'+(typeof signImg==='function'?signImg(11):'')+'<div class="line"></div><div class="nm">'+esc(S.editorName||'Editorial Office')+'</div><div class="ds">'+esc(typeof eicLine==='function'?eicLine():(S.editorTitle||'Editor-in-Chief'))+'<br>'+esc(S.name)+'</div></div>'+
 '<div class="seal"><div>CHECKED<span>&#10004;</span>'+esc(S.short)+'</div></div><div class="qrb">'+qr+'<br>Scan to verify</div></div>'+
 '<div class="dis">Similarity results are produced by '+esc(p.tool||S.plagTool)+(ai!==null&&(p.aiTool||S.aiTool)?'; AI-content estimates by '+esc(p.aiTool||S.aiTool):'')+'. AI-detection scores are probabilistic estimates, not proof of authorship. Verify this certificate at '+esc(plagVerifyUrl(s))+'</div></div></div>'+
 '<script>window.onload=function(){setTimeout(function(){window.print()},500)}<\/script></body></html>';}

/* ---- admin card on the submission page ---- */
function plagReportLink(s){var p=s.plag||{};return p.report?'<a href="/api/files/'+encodeURIComponent('sub:'+s.id+'__'+PLAG_KEY)+'" target="_blank" rel="noopener">📎 '+esc(p.report.name||'similarity report')+'</a>':'';}
function plagCard(s){var adm=isAdmin(),p=s.plag||{},on=plagOn(s);
 if(!adm){if(!on||!payIsAcceptedPl(s))return '';return '<div class="card plagcard"><h4>Plagiarism &amp; AI check</h4><p>Similarity index <b>'+plagNum(p.sim)+'%</b>'+(plagNum(p.ai)!==null?' &middot; AI-generated content <b>'+plagNum(p.ai)+'%</b>':'')+' &middot; checked on '+fmtDate(p.date)+'</p><button class="btn teal" data-act="plagpdf" data-id="'+s.id+'">Plagiarism &amp; AI certificate (PDF)</button>'+(p.report&&p.sendReport?' '+plagReportLink(s):'')+'</div>';}
 var srcTxt=(Array.isArray(p.sources)?p.sources:[]).map(function(x){return x[0]+(x[1]!==null&&x[1]!==undefined?' | '+x[1]:'');}).join('\n');
 var st=on?(plagPass(p)?'<span class="paypill" style="background:#1e7d32">Within limits</span>':'<span class="paypill" style="background:#B8860B">Above limit</span>'):'<span class="paypill" style="background:#5b6b7c">Not checked</span>';
 return '<div class="card plagcard"><h4>Plagiarism &amp; AI check '+st+'</h4><p class="pg-h">Run the manuscript through '+esc(S.plagTool)+' (and your AI detector), then enter the results below and upload the report. The certificate is attached automatically to the acceptance e-mail. Journal limits: similarity '+plagMax()+'%, AI content '+aiMax()+'% (change in Admin &gt; Settings).</p>'
  +'<div class="row4"><div class="fg"><label>Similarity index %</label><input id="pl-sim" type="number" min="0" max="100" step="0.1" value="'+esc(p.sim==null?'':p.sim)+'"></div><div class="fg"><label>AI-generated content % (blank = not checked)</label><input id="pl-ai" type="number" min="0" max="100" step="0.1" value="'+esc(p.ai==null?'':p.ai)+'"></div><div class="fg"><label>Date of check</label><input id="pl-date" type="date" value="'+esc(p.date||today())+'"></div><div class="fg"><label>Words checked</label><input id="pl-words" type="number" min="0" value="'+esc(p.words||'')+'"></div></div>'
  +'<div class="row2"><div class="fg"><label>Similarity software</label><input id="pl-tool" value="'+esc(p.tool||S.plagTool)+'"></div><div class="fg"><label>AI-detection tool</label><input id="pl-aitool" value="'+esc(p.aiTool||S.aiTool||'')+'" placeholder="e.g. GPTZero, ZeroGPT, Originality.ai"></div></div>'
  +'<div class="fg"><label>Excluded from the check</label><input id="pl-excl" value="'+esc(p.excl==null?'Bibliography / references, quoted text':p.excl)+'"></div>'
  +'<div class="fg"><label>Top matching sources (one per line: source | %) - optional</label><textarea id="pl-src" rows="3" placeholder="www.ncbi.nlm.nih.gov | 3&#10;Journal of ... (2021) | 2">'+esc(srcTxt)+'</textarea></div>'
  +'<div class="fg"><label>Editor\'s note on the certificate (optional)</label><input id="pl-note" value="'+esc(p.note||'')+'" placeholder="e.g. Matches are mainly standard methods and references."></div>'
  +'<div class="fg"><label>Similarity report from the software (PDF, DOC or DOCX)</label>'+(p.report?'<div style="margin:2px 0 6px">'+plagReportLink(s)+' <span class="pg-h">uploaded '+fmtDate(String(p.report.at||'').slice(0,10))+'</span></div>':'')+'<input type="file" id="pl-rep" accept=".pdf,.doc,.docx"></div>'
  +'<div class="fg"><label class="ck"><input type="checkbox" id="pl-send"'+(p.sendReport!==false?' checked':'')+'> Also send the original report to the author with the certificate</label></div>'
  +'<button class="btn teal" data-act="plagsave" data-id="'+s.id+'">Save check</button>'+(on?' <button class="btn ghost" data-act="plagpdf" data-id="'+s.id+'">View certificate</button> <button class="btn ghost" data-act="plagmail" data-id="'+s.id+'">E-mail certificate to author</button>':'')+'</div>';}
function payIsAcceptedPl(s){return typeof payIsAccepted==='function'?payIsAccepted(s):(s.status==='Accepted'||s.status==='Published');}
if(typeof vSub==='function'){var _plagVSub=vSub;vSub=function(id){var h=_plagVSub(id),s=findSub(id);if(!s||!canSee(s))return h;var c=plagCard(s);if(!c)return h;var i=h.lastIndexOf('</div></section>');return i>-1?h.slice(0,i)+c+h.slice(i):h+c;};}

Object.assign(ACT,{
 plagpdf:function(t){var s=findSub(t.dataset.id);if(s&&plagOn(s))docOpen(plagHTML(s));},
 plagmail:function(t){var s=findSub(t.dataset.id);if(!s||!plagOn(s))return;if(!confirm('E-mail the plagiarism & AI certificate to '+(s.authorName||'the author')+'?'))return;plagMail(s);s.history=s.history||[];s.history.push({d:today(),t:'Plagiarism & AI certificate e-mailed'});saveSub(s);toast('Certificate e-mailed to the author.');route();},
 plagsave:async function(t){var s=findSub(t.dataset.id);if(!s)return;var sim=plagNum($('pl-sim').value),ai=plagNum($('pl-ai').value);
  if(sim===null||sim<0||sim>100){toast('Enter the similarity index (0-100).');return;}if(ai!==null&&(ai<0||ai>100)){toast('AI content must be between 0 and 100.');return;}
  var was=plagOn(s),p=s.plag=s.plag||{};Object.assign(p,{sim:sim,ai:ai,date:$('pl-date').value||today(),words:+$('pl-words').value||'',tool:$('pl-tool').value.trim()||S.plagTool,aiTool:$('pl-aitool').value.trim(),excl:$('pl-excl').value.trim(),sources:plagSources($('pl-src').value),note:$('pl-note').value.trim(),sendReport:$('pl-send').checked,by:((curUser()||{}).name)||'Editor',at:new Date().toISOString()});
  var f=$('pl-rep')&&$('pl-rep').files[0];
  if(f){if(!/\.(pdf|docx?)$/i.test(f.name)){toast('The report must be a PDF, DOC or DOCX file.');return;}if(f.size>25*1024*1024){toast('The report is larger than 25 MB.');return;}
   try{await DB.putFile('sub:'+s.id+'__'+PLAG_KEY,f);}catch(e){toast('Upload failed: '+e.message);return;}p.report={name:f.name,at:new Date().toISOString()};}
  s.history=s.history||[];s.history.push({d:today(),t:'Plagiarism & AI check recorded: similarity '+sim+'%'+(ai!==null?', AI '+ai+'%':'')});
  try{await saveSub(s);}catch(e){toast(e.message);return;}
  if(!plagPass(p))toast('Saved. Note: the result is above the journal\'s limit - review before accepting.');else toast('Plagiarism check saved.');
  if(!was&&payIsAcceptedPl(s)&&confirm('This manuscript is already accepted. E-mail the certificate to the author now?')){plagMail(s);s.history.push({d:today(),t:'Plagiarism & AI certificate e-mailed'});saveSub(s);}
  route();}
});

/* ---- Settings ---- */
if(typeof vSettings==='function'){var _plagVS=vSettings;vSettings=function(){var h=_plagVS();return h.replace('<button class="btn teal" data-act="savesettings">','<h4>Plagiarism &amp; AI check</h4><div class="row4"><div class="fg"><label>Similarity software</label><input id="s-plagTool" value="'+esc(S.plagTool||'')+'"></div><div class="fg"><label>AI-detection tool</label><input id="s-aiTool" value="'+esc(S.aiTool||'')+'"></div><div class="fg"><label>Similarity limit %</label><input id="s-plagMax" type="number" min="0" max="100" value="'+esc(S.plagMax)+'"></div><div class="fg"><label>AI-content limit %</label><input id="s-aiMax" type="number" min="0" max="100" value="'+esc(S.aiMax)+'"></div></div><button class="btn teal" data-act="savesettings">');};
 var _plagSave=ACT.savesettings;ACT.savesettings=function(t){var e=$('s-plagTool');if(e){S.plagTool=e.value.trim()||'Plagiarism Checker X';S.aiTool=$('s-aiTool').value.trim();S.plagMax=String(plagNum($('s-plagMax').value)!==null?plagNum($('s-plagMax').value):10);S.aiMax=String(plagNum($('s-aiMax').value)!==null?plagNum($('s-aiMax').value):20);}return _plagSave(t);};}
(function(){if(typeof document==='undefined'||!document.head)return;var c=document.createElement('style');c.textContent='.plagcard{border-left:4px solid #0E7C7B}';document.head.appendChild(c);})();
