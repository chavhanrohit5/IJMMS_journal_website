/* ==========================================================================
   Zenodo (CERN) is the journals' official DOI partner. DOIs look like
   10.5281/zenodo.<record number> and are issued by Zenodo when the article
   is deposited there, so the editor pastes the DOI (or the Zenodo link) into
   the article editor; the site does not invent DOI numbers.
   Shared by IJMMS and IJMLS.
   ========================================================================== */
if(typeof DEFAULTS!=='undefined'){if(!('doiPartner' in DEFAULTS))DEFAULTS.doiPartner='Zenodo (CERN)';}
var ZEN_PREFIX='10.5281',ZEN_URL='https://zenodo.org',ZEN_NEW='https://zenodo.org/uploads/new';
function zenOn(){return /zenodo/i.test(S.doiPartner||'');}
/* accept 10.5281/zenodo.123, https://doi.org/..., https://zenodo.org/records/123 or /record/123 */
function zenNormDoi(v){v=String(v||'').trim();if(!v)return '';var m=v.match(/zenodo\.org\/(?:records?|deposit|uploads)\/(\d+)/i);if(m)return ZEN_PREFIX+'/zenodo.'+m[1];
 v=v.replace(/^https?:\/\/(dx\.)?doi\.org\//i,'').replace(/^doi:\s*/i,'');if(/^\d{5,}$/.test(v))return ZEN_PREFIX+'/zenodo.'+v;return v;}
function zenRecord(doi){var m=String(doi||'').match(/zenodo\.(\d+)/i);return m?ZEN_URL+'/records/'+m[1]:'';}

/* article editor: the DOI box takes the Zenodo DOI or link */
if(typeof vEditor==='function'){var _zVE=vEditor;vEditor=function(id){var h=_zVE(id);if(!zenOn())return h;
 return h.replace('<label>DOI <button class="btn sm ghost" type="button" data-act="doi">Suggest</button></label>','<label>DOI (from Zenodo) <a class="btn sm ghost" href="'+ZEN_NEW+'" target="_blank" rel="noopener">Open Zenodo</a> <button class="btn sm ghost" type="button" data-act="doi">Paste Zenodo link</button></label>')
  .replace('placeholder="Leave blank for no DOI"','placeholder="10.5281/zenodo.1234567 or the Zenodo record link"');};}
if(typeof ACT!=='undefined'){var _zDoi=ACT.doi;ACT.doi=function(t){if(!zenOn())return _zDoi&&_zDoi(t);var v=prompt('Paste the DOI or the record link from Zenodo\n(e.g. https://zenodo.org/records/1234567 or 10.5281/zenodo.1234567)',$('f-doi')?$('f-doi').value:'');if(v===null)return;var d=zenNormDoi(v);if(d&&!/^10\.\d{4,9}\/\S+$/.test(d)){toast('That does not look like a DOI or Zenodo link.');return;}if($('f-doi'))$('f-doi').value=d;if($('f-doion')&&d)$('f-doion').checked=true;toast(d?'DOI set: '+d:'DOI cleared.');};
 ['issdoi','assigndoi'].forEach(function(k){var o=ACT[k];ACT[k]=function(t){if(zenOn()){toast('DOIs come from Zenodo: deposit the article at zenodo.org, then paste its DOI in the article editor.');return;}return o&&o(t);};});}
document.addEventListener('change',function(e){if(e.target&&e.target.id==='f-doi'&&zenOn()){var d=zenNormDoi(e.target.value);if(d!==e.target.value)e.target.value=d;}});
if(typeof collect==='function'){var _zCol=collect;collect=function(st){var a=_zCol(st);if(zenOn()){a.doi=zenNormDoi(a.doi);if(a.doiHold)a.doiHold=zenNormDoi(a.doiHold);}return a;};}

/* public pages */
function zenBadge(){return '<a href="'+ZEN_URL+'" target="_blank" rel="noopener" title="Zenodo, operated by CERN"><img src="'+A_()+'assets/zenodo.png" alt="Zenodo" style="height:34px;width:auto;border-radius:4px;vertical-align:middle"></a>';}
function zenCard(){return '<div class="card zencard"><div class="zrow">'+zenBadge()+'<div><h3 style="margin:0 0 4px">Official DOI partner: Zenodo</h3><p style="margin:0;font-size:14px">Every article in '+esc(S.short)+' receives a Digital Object Identifier (DOI) through <b>Zenodo</b>, the open research repository operated by CERN. DOIs have the form <code>10.5281/zenodo.xxxxxxx</code>, are registered with DataCite and resolve permanently at <a href="https://doi.org" target="_blank" rel="noopener">doi.org</a>. The full text is also preserved in Zenodo.</p></div></div></div>';}
if(typeof vIndexing==='function'){var _zIx=vIndexing;vIndexing=function(){var h=_zIx();if(!zenOn())return h;var i=h.indexOf('<div class="card">');return i>-1?h.slice(0,i)+zenCard()+h.slice(i):h+zenCard();};}
if(typeof glanceTable==='function'){var _zGl=glanceTable;glanceTable=function(){var h=_zGl();if(!zenOn())return h;var row=kvRow('DOI partner','<a href="'+ZEN_URL+'" target="_blank" rel="noopener">Zenodo</a> (CERN) &middot; DOIs 10.5281/zenodo.xxxxxxx');return /<tr><th>DOI<\/th>/.test(h)?h.replace(/<tr><th>DOI<\/th><td>[\s\S]*?<\/td><\/tr>/,row):h.replace('</table>',row+'</table>');};}
if(typeof idxStrip==='function'){var _zStrip=idxStrip;idxStrip=function(){var h=_zStrip();if(!zenOn())return h;var b='<span class="zenstrip">DOI partner '+zenBadge()+'</span>';return h?h.replace('</div><p>',b+'</div><p>'):'<section class="ixstrip"><div class="wrap"><h3>DOI partner</h3><div class="ixrow">'+zenBadge()+'</div></div></section>';};}
/* article page: show where the DOI comes from */
if(typeof vArticle==='function'){var _zArt=vArticle;vArticle=function(id){var h=_zArt(id),a=findArt(id);if(!a||!a.doi||!zenOn()||!/zenodo/i.test(a.doi))return h;var rec=zenRecord(a.doi);return h.replace(/(<a href="https:\/\/doi\.org\/[^"]+"[^>]*>[^<]*<\/a>)/,'$1 <span class="zennote">· DOI via <a href="'+esc(rec||ZEN_URL)+'" target="_blank" rel="noopener">Zenodo</a></span>');};}
/* author guidelines: one line on DOIs */
if(typeof vGuidelines==='function'){var _zGd=vGuidelines;vGuidelines=function(){var h=_zGd();if(!zenOn())return h;var n='<div class="note"><b>DOI.</b> Each published article receives a DOI through our official DOI partner <a href="'+ZEN_URL+'" target="_blank" rel="noopener">Zenodo</a> (CERN), in the form 10.5281/zenodo.xxxxxxx. The DOI is shown on the article page, in the PDF and in the certificate of publication.</div>';var i=h.lastIndexOf('</div></section>');return i>-1?h.slice(0,i)+n+h.slice(i):h+n;};}

(function(){var c=document.createElement('style');c.textContent='.zencard{border-left:4px solid #1E88E5}.zrow{display:flex;gap:16px;align-items:center}.zrow img{height:56px!important}.zenstrip{display:inline-flex;align-items:center;gap:8px;font-size:12px;color:#5b6b7c;margin-left:10px}.zennote{font-size:12.5px;color:#5b6b7c}@media(max-width:600px){.zrow{flex-direction:column;align-items:flex-start}}';document.head.appendChild(c);})();
