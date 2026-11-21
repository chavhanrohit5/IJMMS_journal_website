/* ==========================================================================
   Issues: an admin-managed list (settings.issuesCfg) instead of a fixed
   calendar. Each issue: y (year), n (issue no.), v (volume), p (label shown,
   e.g. "Nov–Dec 2026" or "1 November 2026"), d (date, YYYY-MM-DD),
   vis (1 = shown on the site, 0 = admin only), sp (special-issue title).
   Articles in an issue that is not listed, or not shown, are admin only.
   Shared by IJMMS and IJMLS.
   ========================================================================== */
if(typeof DEFAULTS!=='undefined'&&!('issuesCfg' in DEFAULTS))DEFAULTS.issuesCfg='';
var IS_MON=['January','February','March','April','May','June','July','August','September','October','November','December'];
var IS_BIM=['Jan–Feb','Mar–Apr','May–Jun','Jul–Aug','Sep–Oct','Nov–Dec'];
function isPad(n){return String(n).padStart(2,'0');}
function isDefault(){var L=[];/* both journals: Volume 1 = 2026 (from 1 Nov), then the 1st and 15th of every month */
 [[1,10,1],[2,10,15],[3,11,1],[4,11,15]].forEach(function(x,i){L.push({y:2026,n:x[0],v:1,d:'2026-'+isPad(x[1]+1)+'-'+isPad(x[2]),p:x[2]+' '+IS_MON[x[1]]+' 2026',vis:i<2?1:0,sp:''});});
 for(var k=0;k<24;k++){var m=Math.floor(k/2),d=k%2?15:1;L.push({y:2027,n:k+1,v:2,d:'2027-'+isPad(m+1)+'-'+isPad(d),p:d+' '+IS_MON[m]+' 2027',vis:0,sp:''});}
 return L;}
var _isRaw=null,_isList=[];
function isList(){var raw=(typeof S!=='undefined'&&S.issuesCfg)||'';if(raw!==_isRaw){_isRaw=raw;var L=null;try{L=raw?JSON.parse(raw):null;}catch(e){L=null;}_isList=Array.isArray(L)?L:isDefault();}return _isList;}
function isSort(L){return L.slice().sort(function(a,b){return (b.d||'').localeCompare(a.d||'')||(b.y-a.y)||(b.n-a.n);});}
function isFind(y,n){return isList().filter(function(x){return +x.y===+y&&+x.n===+n;})[0]||null;}
function isObj(x){return {year:+x.y,vol:+x.v,issue:+x.n,period:x.p||'',date:x.d||'',vis:+x.vis?1:0,sp:x.sp||''};}
function artPublicIss(a){var x=a&&isFind(a.year,a.issue);return !!(a&&a.status==='published'&&x&&+x.vis);}
function isToday(){var t=new Date();return t.getFullYear()+'-'+isPad(t.getMonth()+1)+'-'+isPad(t.getDate());}

/* ---- replace the fixed-calendar helpers ---- */
volOf=function(y){var x=isList().filter(function(i){return +i.y===+y;})[0];return x?+x.v:(y-START_YEAR+1);};
periodOf=function(y,i){var x=isFind(y,i);if(x)return x.p;return (typeof JID!=='undefined'&&JID==='ls')?('Issue '+i+', '+y):((IS_BIM[i-1]||('Issue '+i))+' '+y);};
/* all issues, newest first; the public sees only issues shown on the site */
allIssues=function(withHidden){var L=isSort(isList());if(!(withHidden&&isAdmin()))L=L.filter(function(x){return +x.vis;});return L.map(isObj);};
/* the current issue: newest shown issue dated today or earlier (else the first shown one) */
calIssue=function(){var t=isToday(),L=isSort(isList()).filter(function(x){return +x.vis;}),c=L.filter(function(x){return (x.d||'')<=t;})[0]||L[L.length-1]||isSort(isList())[0];return c?isObj(c):{year:new Date().getFullYear(),issue:1,vol:1,period:''};};
issueArts=function(y,i){return ARTS.filter(function(a){return a.status==='published'&&+a.year===+y&&+a.issue===+i;}).sort(ord);};
issueCounts=function(){var m={};ARTS.forEach(function(a){if(a.status==='published'){var k=a.year+'-'+a.issue;m[k]=(m[k]||0)+1;}});return m;};
latestIssue=function(){var c=issueCounts(),t=isToday(),L=allIssues(),due=L.filter(function(x){return x.date<=t;});
 for(var k=0;k<due.length;k++){if(c[due[k].year+'-'+due[k].issue])return due[k];}return due[0]||L[L.length-1]||null;};
var _isPub=pubList;pubList=function(){var l=_isPub();return isAdmin()?l:l.filter(artPublicIss);};
var _isArt=vArticle;vArticle=function(id){var a=findArt(id);if(a&&!isAdmin()&&!artPublicIss(a))return '<section class="pg"><div class="wrap"><div class="card">Article not found.</div></div></section>';return _isArt(id);};

/* ---- public archive and issue pages ---- */
function isLabel(x){return 'Vol. '+x.vol+', Issue '+x.issue+(x.sp?' &middot; '+esc(x.sp):'');}
vArchive=function(){var adm=isAdmin(),c=issueCounts(),is=allIssues(adm),by={};is.forEach(function(x){(by[x.year]=by[x.year]||[]).push(x);});var ys=Object.keys(by).sort(function(a,b){return b-a;});
 var un=adm?isUnlisted():[];
 return hd('Archive','All issues &middot; '+esc(S.freq||''))+pg((adm?'<div class="note">You are logged in as admin: issues marked <b>Admin only</b> are hidden from visitors. Manage them in <a href="#/admin/issues">Admin &rarr; Issues</a>.</div>':'')
  +(ys.length?'':'<div class="card">No issues have been published yet.</div>')
  +ys.map(function(y){var l=by[y].slice().sort(function(a,b){return a.issue-b.issue;});var tot=l.reduce(function(s,x){return s+(c[x.year+'-'+x.issue]||0);},0);
   return '<div class="yr"><div class="ttl"><h2>'+y+' &middot; Volume '+esc(String(l[0].vol))+' <small style="font-weight:400;font-size:14px;color:#667">('+tot+' articles)</small></h2></div><div class="isgrid">'+l.map(function(x){return '<a class="iss'+(x.vis?'':' ishid')+'" href="#/issue/'+x.year+'-'+x.issue+'"><b>Issue '+x.issue+'</b><span>'+esc(x.period)+'</span>'+(x.sp?'<span class="issp">'+esc(x.sp)+'</span>':'')+'<em>'+(c[x.year+'-'+x.issue]||0)+' articles'+(x.vis?'':' &middot; Admin only')+'</em></a>';}).join('')+'</div></div>';}).join('')
  +(un.length?'<div class="yr"><div class="ttl"><h2>Not in the issue list (admin only)</h2></div><div class="isgrid">'+un.map(function(u){return '<a class="iss ishid" href="#/issue/'+u.year+'-'+u.issue+'"><b>Vol. '+u.vol+', Issue '+u.issue+'</b><span>'+esc(u.period||String(u.year))+'</span><em>'+u.count+' articles &middot; Admin only</em></a>';}).join('')+'</div></div>':''));};
vIssue=function(key){var m=String(key||'').match(/^(\d{4})-(\d{1,3})$/),nf=hd('Issue')+pg('<div class="card">Issue not found.</div>');if(!m)return nf;var y=+m[1],i=+m[2],adm=isAdmin(),x=isFind(y,i),arts=issueArts(y,i);
 if(!adm&&!(x&&+x.vis))return nf;if(!x&&!arts.length)return nf;
 var o=x?isObj(x):{year:y,issue:i,vol:(arts[0]&&arts[0].vol)||volOf(y),period:(arts[0]&&arts[0].period)||String(y),vis:0,sp:''};
 var is=allIssues(adm).slice().reverse(),idx=-1;is.forEach(function(z,k){if(z.year===y&&z.issue===i)idx=k;});var pv=idx>0?is[idx-1]:null,nx=idx>-1?is[idx+1]:null;
 return hd('Volume '+o.vol+', Issue '+i+(o.sp?' &middot; '+esc(o.sp):''),esc(o.period)+' &middot; '+arts.length+' articles'+(o.vis?'':' &middot; Admin only'))+pg((o.vis?'':'<div class="note">This issue is <b>admin only</b>: visitors cannot see it or its articles. Show it from <a href="#/admin/issues">Admin &rarr; Issues</a>.</div>')+'<p>'+(pv?'<a href="#/issue/'+pv.year+'-'+pv.issue+'">&larr; '+esc(pv.period)+'</a>':'')+(nx?' &nbsp; <a href="#/issue/'+nx.year+'-'+nx.issue+'">'+esc(nx.period)+' &rarr;</a>':'')+' &nbsp; <a href="#/archive">All issues</a>'+(adm?' &nbsp; <a class="btn sm" href="#/admin/new/'+y+'-'+i+'">+ Add article to this issue</a>':'')+'</p>'+(arts.length?tocHtml(arts):'<div class="card">No articles have been published in this issue.</div>'));};
/* articles whose year/issue is not in the list (e.g. older material) */
function isUnlisted(){var m={};ARTS.forEach(function(a){if(!a.year||isFind(a.year,a.issue))return;var k=a.year+'-'+a.issue;if(!m[k])m[k]={year:+a.year,issue:+a.issue,vol:a.vol||volOf(a.year),period:a.period||'',count:0};m[k].count++;});return Object.keys(m).map(function(k){return m[k];}).sort(function(a,b){return b.year-a.year||b.issue-a.issue;});}

/* ---- admin: Issues manager ---- */
var ISW=null,ISY='all';
function isWork(){if(!ISW)ISW=JSON.parse(JSON.stringify(isList()));return ISW;}
function isDirty(on){window.__isDirty=!!on;var e=$('is-state');if(e)e.textContent=on?'Unsaved changes':'';}
function isRows(){var L=isWork(),c={},cAll={};ARTS.forEach(function(a){var k=a.year+'-'+a.issue;cAll[k]=(cAll[k]||0)+1;if(a.status==='published')c[k]=(c[k]||0)+1;});
 var idx=L.map(function(x,i){return i;}).sort(function(a,b){return (L[b].d||'').localeCompare(L[a].d||'')||(L[b].y-L[a].y)||(L[b].n-L[a].n);});
 if(ISY!=='all')idx=idx.filter(function(i){return String(L[i].y)===ISY;});
 return idx.map(function(i){var x=L[i],k=x.y+'-'+x.n;return '<tr class="'+(+x.vis?'':'ishidrow')+'"><td><input data-is="'+i+'.v" data-num="1" value="'+esc(x.v)+'" style="width:46px"></td><td><input data-is="'+i+'.n" data-num="1" value="'+esc(x.n)+'" style="width:46px"></td><td><input data-is="'+i+'.y" data-num="1" value="'+esc(x.y)+'" style="width:62px"></td><td><input data-is="'+i+'.p" value="'+esc(x.p)+'" style="min-width:150px"></td><td><input type="date" data-is="'+i+'.d" value="'+esc(x.d)+'"></td><td><label class="fcck"><input type="checkbox" data-is="'+i+'.vis" data-ck="1"'+(+x.vis?' checked':'')+'> Shown</label></td><td><input data-is="'+i+'.sp" value="'+esc(x.sp||'')+'" placeholder="optional" style="min-width:110px"></td><td style="text-align:center">'+(c[k]||0)+(cAll[k]>(c[k]||0)?' <small class="pg-h">+'+(cAll[k]-(c[k]||0))+' draft</small>':'')+'</td><td style="white-space:nowrap"><a class="btn sm ghost" href="#/issue/'+k+'">View</a> <a class="btn sm" href="#/admin/new/'+k+'">+ Article</a> <button class="btn sm gold" data-act="issdoi" data-id="'+k+'">DOIs</button> <button class="btn sm red" data-act="isdel" data-i="'+i+'" title="Delete this issue">&times;</button></td></tr>';}).join('');}
function isRender(){var b=$('is-body');if(!b)return;b.innerHTML=isBody();isDirty(window.__isDirty);}
function isBody(){var L=isWork(),ys={};L.forEach(function(x){ys[x.y]=1;});var un=isUnlisted();
 return '<p class="fcbar"><button class="btn teal" data-act="issave">Save changes</button> <button class="btn ghost" data-act="isundo">Discard changes</button> <button class="btn ghost" data-act="isadd">+ Add one issue</button> <button class="btn ghost" data-act="isyear">+ Add a whole year</button> <span id="is-state" class="fcstate"></span><span style="float:right">Year: <select id="is-year">'+['all'].concat(Object.keys(ys).sort(function(a,b){return b-a;})).map(function(y){return '<option value="'+y+'"'+(ISY===y?' selected':'')+'>'+(y==='all'?'All years':y)+'</option>';}).join('')+'</select> <button class="btn sm ghost" data-act="isshowall" data-v="1">Show all</button> <button class="btn sm ghost" data-act="isshowall" data-v="0">Hide all</button></span></p>'
  +'<div style="overflow-x:auto"><table class="t bd fct istab"><tr><th>Vol</th><th>Issue</th><th>Year</th><th>Shown as (period / date)</th><th>Issue date</th><th>On website</th><th>Special issue title</th><th>Published articles</th><th></th></tr>'+(L.length?isRows():'<tr><td colspan="9">No issues yet. Use "Add one issue" or "Add a whole year".</td></tr>')+'</table></div>'
  +(un.length?'<h4>Articles in issues that are not in this list (admin only)</h4><p class="pg-h">These articles are hidden from visitors until their issue is added above and shown.</p><table class="t bd"><tr><th>Vol</th><th>Issue</th><th>Year</th><th>Period</th><th>Articles</th><th></th></tr>'+un.map(function(u){return '<tr><td>'+esc(u.vol)+'</td><td>'+u.issue+'</td><td>'+u.year+'</td><td>'+esc(u.period)+'</td><td>'+u.count+'</td><td><a class="btn sm ghost" href="#/issue/'+u.year+'-'+u.issue+'">View</a> <button class="btn sm" data-act="isadopt" data-y="'+u.year+'" data-n="'+u.issue+'" data-v="'+esc(u.vol)+'" data-p="'+esc(u.period)+'">Add to issue list</button></td></tr>';}).join('')+'</table>':'');}
vAdminIssues=function(){ISW=null;return '<div class="card"><h3>Issues</h3><p class="pg-h">Add, edit, delete, show or hide issues. <b>Shown</b> issues and their articles are visible to everyone; issues that are not shown (and articles in issues not listed here) are visible only to the admin, for example back issues kept as an archive. Issue numbering is yours to set: any volume, issue number, label and date.</p><div id="is-body">'+isBody()+'</div></div>';};
function isNextIn(L,y){var mx=0;L.forEach(function(x){if(+x.y===+y&&+x.n>mx)mx=+x.n;});return mx+1;}
Object.assign(ACT,{
 isadd:function(){var L=isWork(),last=isSort(L)[0],y=last?+last.y:new Date().getFullYear(),n=last?isNextIn(L,y):1;
  var yi=prompt('Year of the new issue',String(y));if(!yi)return;y=parseInt(yi,10);if(!(y>1900))return;n=isNextIn(L,y);
  var vv=L.filter(function(x){return +x.y===y;})[0],v=vv?+vv.v:volOf(y);
  L.push({y:y,n:n,v:v,d:y+'-01-01',p:periodOf(y,n),vis:0,sp:''});ISY=String(y);isDirty(1);isRender();},
 isyear:function(){var L=isWork(),last=isSort(L)[0],y0=last?+last.y+1:new Date().getFullYear();
  var y=parseInt(prompt('Year to add',String(y0))||'',10);if(!(y>1900))return;if(L.some(function(x){return +x.y===y;})&&!confirm(y+' already has issues. Add more issues to it anyway?'))return;
  var vv=L.filter(function(x){return +x.y===y;})[0],v=parseInt(prompt('Volume number for '+y,String(vv?vv.v:volOf(y)))||'',10);if(!(v>0))return;
  var f=prompt('How often?\n1 = bi-monthly (6 issues: Jan–Feb ... Nov–Dec)\n2 = 1st and 15th of every month (24 issues)\n3 = monthly (12 issues)\n4 = quarterly (4 issues)','2');if(!f)return;
  var add=[],n0=isNextIn(L,y)-1;
  if(f==='2')for(var k=0;k<24;k++){var m=Math.floor(k/2),d=k%2?15:1;add.push({d:y+'-'+isPad(m+1)+'-'+isPad(d),p:d+' '+IS_MON[m]+' '+y});}
  else if(f==='3')for(var mm=0;mm<12;mm++)add.push({d:y+'-'+isPad(mm+1)+'-01',p:IS_MON[mm]+' '+y});
  else if(f==='4')['January–March','April–June','July–September','October–December'].forEach(function(q,i){add.push({d:y+'-'+isPad(3*i+1)+'-01',p:q+' '+y});});
  else IS_BIM.forEach(function(b,i){add.push({d:y+'-'+isPad(2*i+1)+'-01',p:b+' '+y});});
  add.forEach(function(a,i){L.push({y:y,n:n0+i+1,v:v,d:a.d,p:a.p,vis:0,sp:''});});ISY=String(y);isDirty(1);isRender();toast(add.length+' issues added for '+y+' (admin only until you tick "Shown"). Save to keep them.');},
 isdel:function(t){var L=isWork(),x=L[+t.dataset.i],k=x.y+'-'+x.n,n=ARTS.filter(function(a){return a.year+'-'+a.issue===k;}).length;
  if(!confirm('Delete Vol. '+x.v+', Issue '+x.n+' ('+x.p+') from the issue list?'+(n?'\n\n'+n+' article(s) belong to it. They are NOT deleted, but become admin only until the issue is added again.':'')))return;L.splice(+t.dataset.i,1);isDirty(1);isRender();},
 isadopt:function(t){var L=isWork(),y=+t.dataset.y,n=+t.dataset.n;L.push({y:y,n:n,v:+t.dataset.v||volOf(y),d:y+'-01-01',p:t.dataset.p||String(y),vis:0,sp:''});isDirty(1);isRender();toast('Added as admin only. Tick "Shown" to publish it on the site, then save.');},
 isshowall:function(t){var L=isWork();L.forEach(function(x){if(ISY==='all'||String(x.y)===ISY)x.vis=+t.dataset.v;});isDirty(1);isRender();},
 issave:function(){var L=isWork(),seen={},dup='';L.forEach(function(x){var k=x.y+'-'+x.n;if(seen[k])dup=k;seen[k]=1;});if(dup){toast('Two issues have the same year and issue number ('+dup.replace('-',', issue ')+').');return;}
  if(L.some(function(x){return !(+x.y>1900)||!(+x.n>0)||!(+x.v>0);})){toast('Every issue needs a year, an issue number and a volume.');return;}
  S.issuesCfg=JSON.stringify(L.map(function(x){return {y:+x.y,n:+x.n,v:+x.v,d:x.d||'',p:String(x.p||'').trim(),vis:+x.vis?1:0,sp:String(x.sp||'').trim()};}));saveSettings();ISW=null;isDirty(0);isRender();toast('Issues saved.');},
 isundo:function(){ISW=null;isDirty(0);isRender();}
});
document.addEventListener('input',function(e){var t=e.target;if(!t.dataset||!t.dataset.is||!ISW)return;isSetVal(t);});
document.addEventListener('change',function(e){var t=e.target;if(t.id==='is-year'){ISY=t.value;isRender();return;}if(!t.dataset||!t.dataset.is||!ISW)return;isSetVal(t);if(t.dataset.ck)isRender();});
function isSetVal(t){var p=t.dataset.is.split('.'),x=ISW[+p[0]];if(!x)return;x[p[1]]=t.dataset.ck?(t.checked?1:0):t.dataset.num?(parseInt(t.value,10)||0):t.value;isDirty(1);}
window.addEventListener('beforeunload',function(e){if(window.__isDirty&&/admin\/issues/.test(location.hash)){e.preventDefault();e.returnValue='';}});

/* ---- article editor: pick the issue from the list ---- */
if(typeof vEditor==='function'){var _isVE=vEditor;vEditor=function(id){var h=_isVE(id),a=(id&&findArt(id))||window._newIss||{};var all=allIssues(true),cur=a.year?(a.year+'-'+a.issue):'';
 var sel='<div class="fg"><label>Issue</label><select id="f-isspick"><option value="">Choose an issue to fill in the fields below</option>'+all.map(function(x){var k=x.year+'-'+x.issue;return '<option value="'+k+'"'+(k===cur?' selected':'')+'>Vol. '+x.vol+', Issue '+x.issue+' &middot; '+esc(x.period)+(x.vis?'':' (admin only)')+'</option>';}).join('')+'</select></div>';
 return h.replace('<h4>Issue and publication details</h4>','<h4>Issue and publication details</h4>'+sel);};}
document.addEventListener('change',function(e){if(e.target.id!=='f-isspick'||!e.target.value)return;var m=e.target.value.split('-'),x=isFind(m[0],m[1]);if(!x)return;var set=function(i,v){if($(i))$(i).value=v;};set('f-vol',x.v);set('f-issue',x.n);set('f-year',x.y);set('f-period',x.p);});

(function(){var c=document.createElement('style');c.textContent='.iss.ishid{opacity:.62;border-style:dashed}.issp{display:block;font-size:11.5px;color:var(--teal,#0E7C7B)}.ishidrow td{background:#fafbfc}.istab td{padding:5px 6px}.istab .btn.sm{padding:4px 7px;font-size:10.5px}.ishidrow td:first-child{box-shadow:inset 3px 0 0 #c9d3de}';document.head.appendChild(c);})();
