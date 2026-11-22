/* ==========================================================================
   Figures, diagrams and tables in any section of an article (admin editor).
   - every figure has a type (Figure, Diagram, Flowchart, Chart, Image), each
     numbered on its own (Figure 1, Diagram 1 ...), and a section to sit in
   - every table has a section to sit in
   - each section in the editor has "+ Figure / diagram here" and "+ Table here"
   - blank items (no image, no table rows) and blank sections never appear in
     the article page or the PDF
   Shared by IJMMS and IJMLS.
   ========================================================================== */
var FIG_KINDS=['Figure','Diagram','Flowchart','Chart','Image'];
function ftNorm(h){return String(h||'').trim().toLowerCase().replace(/\s+/g,' ');}
function ftSecHeads(){return Array.prototype.map.call(document.querySelectorAll('#secs .secrow .sh'),function(e){return e.value.trim();}).filter(Boolean);}
function ftSecOptions(cur){var hs=ftSecHeads();if(cur&&hs.indexOf(cur)<0)hs.push(cur);return '<option value="">Automatic (end of Results)</option>'+hs.map(function(h){return '<option value="'+esc(h)+'"'+(h===cur?' selected':'')+'>'+esc(h)+'</option>';}).join('');}
function ftKindNo(a,i){var k=(a.figures[i]&&a.figures[i].kind)||'Figure',n=0;for(var j=0;j<=i;j++)if(((a.figures[j]&&a.figures[j].kind)||'Figure')===k)n++;return k+' '+n;}

/* ---- rendering ---- */
figHtml=function(a,i,used){var f=a.figures&&a.figures[i];if(!f||!f.data)return '';used[i]=true;var lab=ftKindNo(a,i);return '<figure class="fig'+(f.wide?' wide':'')+'"><img src="'+f.data+'" alt="'+esc(lab)+'"><figcaption><b>'+esc(lab)+'.</b>'+(f.caption?' '+inl(f.caption):'')+'</figcaption></figure>';};
var _ftTab=tabBlock;tabBlock=function(a,n,used){var t=a.tables&&a.tables[n-1];if(!t||!String(t.rows||'').trim())return '';var h=_ftTab(a,n,used);return t.caption?h:h.replace(/(<b>Table \d+\.<\/b>) <\/div>/,'$1</div>');};
bodyHtml=function(a){var used={t:{}},secs=(a.sections||[]).map(function(s){return {heading:s.heading||'',text:s.text||''};});if(!secs.length)secs=[{heading:'',text:''}];
 var all=secs.map(function(s){return s.text;}).join('\n'),auto='';
 var put=function(sec,tok){var k=-1;if(sec){var n=ftNorm(sec);secs.forEach(function(s,i){if(k<0&&ftNorm(s.heading)===n)k=i;});}if(k>-1)secs[k].text+='\n\n'+tok;else auto+='\n\n'+tok;};
 (a.tables||[]).forEach(function(t,i){if(!String(t.rows||'').trim())return;if(!new RegExp('\\{\\{\\s*tab\\s*'+(i+1)+'\\s*\\}\\}','i').test(all))put(t.sec,'{{tab '+(i+1)+'}}');});
 (a.figures||[]).forEach(function(f,i){if(!f||!f.data)return;if(!new RegExp('\\{\\{\\s*fig\\s*'+(i+1)+'\\s*\\}\\}','i').test(all))put(f.sec,'{{fig '+(i+1)+'}}');});
 if(auto)secs[placeTarget(secs)].text+=auto;
 return secs.filter(function(s){return String(s.text||'').trim();}).map(function(s){return (s.heading?'<h2>'+esc(s.heading)+'</h2>':'')+fmt(s.text,a,used);}).join('');};

/* ---- editor: figure and table rows with type and section ---- */
figList=function(){return EDIT.figs.map(function(f,i){var k=f.kind||'Figure';return '<div class="figrow"><img src="'+f.data+'" alt=""><div style="flex:1"><div class="ftline"><select class="figkind" title="Type">'+FIG_KINDS.map(function(x){return '<option'+(x===k?' selected':'')+'>'+x+'</option>';}).join('')+'</select> <span class="ftin">in section</span> <select class="figsec ftsec" title="Section">'+ftSecOptions(f.sec||'')+'</select></div>'
 +'<input class="figcap" placeholder="Caption (optional; the number is added automatically)" value="'+esc(f.caption||'')+'"><div class="fmeta"><button class="btn sm ghost" type="button" data-act="figcapauto" data-id="'+i+'">Auto-caption</button><button class="btn sm ghost" type="button" data-act="figup" data-id="'+i+'">&uarr;</button><button class="btn sm ghost" type="button" data-act="figdn" data-id="'+i+'">&darr;</button><label><input type="checkbox" class="figwide"'+(f.wide?' checked':'')+'> full page width</label></div></div><button class="btn sm red" type="button" data-act="figrm" data-id="'+i+'">&times;</button></div>';}).join('')||'<p class="pg-h" style="margin:4px 0">No figures or diagrams yet. Add them below, or use "+ Figure / diagram here" under any section.</p>';};
var _ftSync=syncCaps;syncCaps=function(){_ftSync();var k=document.querySelectorAll('#figlist .figkind'),s=document.querySelectorAll('#figlist .figsec');EDIT.figs.forEach(function(f,i){if(k[i])f.kind=k[i].value;if(s[i])f.sec=s[i].value;});};
var _ftTabRow=tabRow;tabRow=function(t){t=t||{};var h=_ftTabRow(t);return h.replace('<textarea class="tabdata"','<div class="ftline"><span class="ftin">Place in section</span> <select class="tabsec ftsec">'+ftSecOptions(t.sec||'')+'</select></div><textarea class="tabdata"');};
var _ftCollect=collect;collect=function(st){syncCaps();var a=_ftCollect(st);(a.figures||[]).forEach(function(f,i){var e=EDIT.figs[i];if(e){f.kind=e.kind||'Figure';f.sec=e.sec||'';}});
 var secs=[];document.querySelectorAll('#tablist .tabrow').forEach(function(r){if(r.querySelector('.tabdata').value.trim())secs.push(r.querySelector('.tabsec')?r.querySelector('.tabsec').value:'');});(a.tables||[]).forEach(function(t,i){t.sec=secs[i]||'';});
 a.figures=(a.figures||[]).filter(function(f){return f&&f.data;});return a;};
/* keep the section lists up to date when headings change */
document.addEventListener('focusin',function(e){var t=e.target;if(!t.classList||!t.classList.contains('ftsec'))return;var v=t.value;t.innerHTML=ftSecOptions(v);t.value=v;});

/* "+ Figure / diagram here" and "+ Table here" under every section */
var _ftSecRow=secRow;secRow=function(h,t){var r=_ftSecRow(h,t);return r.replace(/<\/textarea><\/div>$/,'</textarea><div class="secadd"><button class="btn sm ghost" type="button" data-act="secfig">+ Figure / diagram here</button> <button class="btn sm ghost" type="button" data-act="sectab">+ Table here</button></div></div>');};
Object.assign(ACT,{
 secfig:function(t){var h=(t.closest('.secrow').querySelector('.sh').value||'').trim();if(!h){toast('Give this section a heading first.');return;}var inp=document.getElementById('ft-file');if(!inp){inp=document.createElement('input');inp.type='file';inp.accept='image/*';inp.multiple=true;inp.id='ft-file';inp.style.display='none';document.body.appendChild(inp);
   inp.addEventListener('change',async function(){var fs=inp.files,sec=inp.dataset.sec;syncCaps();for(var i=0;i<fs.length;i++){try{EDIT.figs.push({data:await resizeImage(fs[i],1600),caption:autoFigCap(fs[i].name),name:fs[i].name,wide:false,kind:/flow/i.test(fs[i].name)?'Flowchart':/diagram/i.test(fs[i].name)?'Diagram':'Figure',sec:sec});}catch(e){toast('Could not read '+fs[i].name);}}$('figlist').innerHTML=figList();inp.value='';toast(fs.length+' item(s) added to "'+sec+'". Choose the type and caption under Figures.');var fl=$('figlist');if(fl)fl.scrollIntoView({block:'center'});});}
  inp.dataset.sec=h;inp.click();},
 sectab:function(t){var h=(t.closest('.secrow').querySelector('.sh').value||'').trim();if(!h){toast('Give this section a heading first.');return;}$('tablist').insertAdjacentHTML('beforeend',tabRow({sec:h}));renumTabs();var rows=document.querySelectorAll('#tablist .tabrow'),r=rows[rows.length-1];if(r){r.scrollIntoView({block:'center'});r.querySelector('.tabdata').focus();}}
});
/* rename the Figures heading in the editor */
if(typeof vEditor==='function'){var _ftVE=vEditor;vEditor=function(id){var h=_ftVE(id);return h.replace('<h4>Figures</h4>','<h4>Figures, diagrams and images</h4><p class="pg-h" style="margin:-4px 0 8px">Choose the type and the section for each one. Empty items are left out of the article and the PDF.</p>').replace('<h4>Tables <button','<h4>Tables <button');};}

(function(){var c=document.createElement('style');c.textContent='.ftline{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin:2px 0 6px}.ftline select{font-size:12.5px;padding:3px 6px;width:auto;max-width:280px}.ftin{font-size:12px;color:#5b6b7c}.secadd{margin:4px 0 2px;display:flex;gap:6px;flex-wrap:wrap}.secadd .btn{font-size:10.5px}';document.head.appendChild(c);})();
