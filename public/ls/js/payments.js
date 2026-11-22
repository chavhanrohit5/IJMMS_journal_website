/* ==========================================================================
   APC payments with the publisher's Razorpay.me link (settings.payLink).
   s.pay = {status:'Due'|'Reported'|'Paid'|'Waived', amount, cur, ref, paidOn,
            note, reportedAt}
   - acceptance e-mail gets an "APC PAYMENT" section with the link and steps
   - author dashboard: Pay online button + "I have paid" form (payment ID)
   - admin: payment panel per submission, payment request / receipt e-mails,
     and Admin > Payments overview
   Shared by IJMMS and IJMLS.
   ========================================================================== */
if(typeof DEFAULTS!=='undefined'){if(!('payLink' in DEFAULTS))DEFAULTS.payLink='https://razorpay.me/@genosyncglobalprivatelimited';if(!('payOn' in DEFAULTS))DEFAULTS.payOn=true;}
var PAY_ST=['Due','Reported','Paid','Waived'];
function payLink(){return String(S.payLink||'').trim();}
function payActive(){return S.payOn!==false&&!!payLink();}
function payIsAccepted(s){return !!s&&((s.decision&&s.decision.d==='Accepted')||['Accepted','In production','Published'].indexOf(s.status)>-1);}
function payDefault(s){var c=(typeof apcCalc==='function')?apcCalc(GRP,s.type,'in',{}):null;return {status:'Due',amount:c?c.total:0,cur:'INR',ref:'',paidOn:'',note:''};}
function payOf(s){if(!s.pay)s.pay=payDefault(s);return s.pay;}
function payAmt(p){return (p.cur==='USD'?'$':'₹')+Number(p.amount||0).toLocaleString('en-IN');}
function payPill(st){var c={Due:'#B8860B',Reported:'#0E7C7B',Paid:'#1e7d32',Waived:'#5b6b7c'}[st]||'#5b6b7c';return '<span class="paypill" style="background:'+c+'">'+esc(st==='Reported'?'Payment reported':st==='Due'?'Payment due':st)+'</span>';}
/* text block used in e-mails (rendered as a table, steps and a "Pay APC online" button) */
function rzpOn(){return typeof SRV!=='undefined'&&!!(SRV.flags&&SRV.flags.rzp);}
function rzpLink(s){var l=s&&s.pay&&s.pay.link;return l&&l.short_url&&['created','partially_paid'].indexOf(l.status||'created')>-1?l.short_url:'';}
function payText(s){var p=payOf(s);if(p.status==='Waived'||p.status==='Paid')return '';var rl=rzpLink(s);
 if(rl)return 'APC PAYMENT\nAmount payable : '+payAmt(p)+'\nPay online     : '+rl+'\nPay to         : '+(S.payee||'Genosync Global Private Limited')+'\nReference      : '+ensureRef(s)+'\n\nHOW TO PAY\n1. Open the payment link (also sent to you by SMS and e-mail from Razorpay).\n2. Pay by UPI, card, net banking or wallet. The amount is already filled in.\n3. Your payment is confirmed automatically and you will receive a receipt by e-mail.\n\n';
 if(!payActive())return '';
 return 'APC PAYMENT\nAmount payable : '+payAmt(p)+' (plus applicable taxes)\nPay online     : '+payLink()+'\nPay to         : '+(S.payee||'Genosync Global Private Limited')+'\nReference      : '+ensureRef(s)+'\n\nHOW TO PAY\n1. Open the payment link and enter the amount shown above.\n2. Write your reference number '+ensureRef(s)+' in the notes, if asked.\n3. After paying, log in to your dashboard, open this manuscript and enter the Razorpay payment ID (it starts with pay_) under "APC payment".\n\n';}

/* acceptance e-mail: add the payment section and open the payment record */
if(typeof acceptEmail==='function'){var _payAE=acceptEmail;acceptEmail=function(s,a){payOf(s);var t=_payAE(s,a),pt=payText(s);if(!pt)return t;var i=t.indexOf('NEXT STEPS');return i>-1?t.slice(0,i)+pt+t.slice(i):t+'\n'+pt;};}

var PAY_KEY='payproof1';
function payProofLink(s){var p=s.pay||{};return p.proof?'<a href="/api/files/'+encodeURIComponent('sub:'+s.id+'__'+PAY_KEY)+'" target="_blank" rel="noopener">📎 '+esc(p.proof.name||'payment screenshot')+'</a>':'';}
async function payUploadProof(s,f,by){if(!/\.(jpe?g|png|pdf)$/i.test(f.name)){toast('Please choose a JPG, PNG or PDF file.');return false;}if(f.size>10*1024*1024){toast('The file is larger than 10 MB.');return false;}
 try{await DB.putFile('sub:'+s.id+'__'+PAY_KEY,f);}catch(e){toast('Upload failed: '+e.message);return false;}var p=payOf(s);p.proof={name:f.name,at:new Date().toISOString(),by:by};return true;}
function payMailRequest(s,reminder){var a=mailAuthor(s),p=payOf(s);
 queueMail(a.email,a.name,'['+ensureRef(s)+'] APC payment '+(reminder?'reminder':'request')+' - '+S.short,'Dear '+a.name+',\n\n'+(reminder?'This is a reminder that the article processing charge for your accepted manuscript is still due.':'Your manuscript has been accepted for publication. Please pay the article processing charge (APC) so that we can take your article into production.')+'\n\nMANUSCRIPT\nReference no. : '+ensureRef(s)+'\nTitle         : '+s.title+'\nArticle type  : '+s.type+'\n\n'+payText(s)+(p.note?'NOTE FROM THE EDITORIAL OFFICE\n'+p.note+'\n\n':'')+sigText(),'',s.id);}
function payMailReceipt(s){var a=mailAuthor(s),p=payOf(s);
 queueMail(a.email,a.name,'['+ensureRef(s)+'] Payment received - '+S.short,'Dear '+a.name+',\n\nThank you. We have received the article processing charge for your manuscript. Your article now moves to production.\n\nPAYMENT DETAILS\nReference no.  : '+ensureRef(s)+'\nTitle          : '+s.title+'\nAmount         : '+payAmt(p)+'\nPayment ID     : '+(p.ref||'-')+'\nDate received  : '+fmtDate(p.paidOn||today())+'\nStatus         : Paid\n\n'+sigText(),'',s.id);}

/* ---- the payment card on a submission page ---- */
function payCard(s){if(!payIsAccepted(s)&&!s.pay)return '';var p=payOf(s),adm=isAdmin(),lnk=payLink();
 var h='<div class="card paycard"><h4>APC payment '+payPill(p.status)+'</h4>';
 if(adm){h+='<div class="row4"><div class="fg"><label>Amount</label><input id="py-amt" type="number" min="0" value="'+esc(p.amount)+'"></div><div class="fg"><label>Currency</label><select id="py-cur">'+['INR','USD'].map(function(c){return '<option'+(p.cur===c?' selected':'')+'>'+c+'</option>';}).join('')+'</select></div><div class="fg"><label>Status</label><select id="py-st">'+PAY_ST.map(function(x){return '<option'+(p.status===x?' selected':'')+'>'+x+'</option>';}).join('')+'</select></div><div class="fg"><label>Payment date</label><input id="py-date" type="date" value="'+esc(p.paidOn||'')+'"></div></div>'
   +'<div class="row2"><div class="fg"><label>Razorpay payment ID / reference</label><input id="py-ref" value="'+esc(p.ref||'')+'" placeholder="pay_..."></div><div class="fg"><label>Note to author (shown in the payment e-mail)</label><input id="py-note" value="'+esc(p.note||'')+'"></div></div>'
   +'<div class="fg"><label>Payment screenshot / receipt (JPG, PNG or PDF)</label>'+(p.proof?'<div style="margin:2px 0 6px">'+payProofLink(s)+' <span class="pg-h">uploaded '+fmtDate(String(p.proof.at||'').slice(0,10))+(p.proof.by?' by '+esc(p.proof.by):'')+'</span></div>':'')+'<input type="file" id="py-proof" accept=".jpg,.jpeg,.png,.pdf"> <button class="btn sm ghost" type="button" data-act="payproof" data-id="'+s.id+'">'+(p.proof?'Replace':'Upload')+' screenshot</button></div>'
   +(p.reportedAt?'<p class="pg-h">Author reported payment on '+fmtDate(p.reportedAt)+(p.authorNote?': '+esc(p.authorNote):'')+'. Check it in your Razorpay dashboard, then set the status to <b>Paid</b>.</p>':'')
   +rzpAdminBox(s)+'<button class="btn teal" data-act="paysave" data-id="'+s.id+'">Save payment</button> <button class="btn ghost" data-act="paymail" data-id="'+s.id+'">E-mail payment request</button> <button class="btn ghost" data-act="paymail" data-r="1" data-id="'+s.id+'">E-mail reminder</button>'+(lnk?' <a class="btn ghost" href="'+esc(lnk)+'" target="_blank" rel="noopener">Open payment link</a>':'');}
 else{h+='<p><b>Amount:</b> '+payAmt(p)+' <span class="pg-h">(plus applicable taxes)</span></p>';
  if(p.status==='Due'&&rzpLink(s)){h+='<p><a class="btn gold" href="'+esc(rzpLink(s))+'" target="_blank" rel="noopener">Pay '+payAmt(p)+' online &rarr;</a></p><p class="pg-h">Pay by UPI, card, net banking or wallet. Your payment is confirmed automatically and a receipt is e-mailed to you.</p>';}
  else if(p.status==='Due'){h+=(lnk&&payActive()?'<p><a class="btn gold" href="'+esc(lnk)+'" target="_blank" rel="noopener">Pay APC online &rarr;</a></p><ol class="paysteps"><li>Open the payment page and enter <b>'+payAmt(p)+'</b>.</li><li>Write your reference <b>'+esc(ensureRef(s))+'</b> in the notes, if asked.</li><li>After paying, enter the Razorpay payment ID below and press <b>I have paid</b>.</li></ol>':'<p>The editorial office will send you the payment details.</p>')
    +'<div class="row2"><div class="fg"><label>Razorpay payment ID</label><input id="py-ref" placeholder="pay_..."></div><div class="fg"><label>Note (optional)</label><input id="py-anote" placeholder="e.g. paid by UPI on 25 Nov"></div></div><div class="fg"><label>Payment screenshot (optional)</label><input type="file" id="py-proof" accept=".jpg,.jpeg,.png,.pdf"></div><button class="btn" data-act="payreport" data-id="'+s.id+'">I have paid</button>';}
  else if(p.status==='Reported')h+='<p>Thank you. You reported your payment'+(p.ref?' (ID <b>'+esc(p.ref)+'</b>)':'')+' on '+fmtDate(p.reportedAt)+'. The editorial office will confirm it shortly.</p>'+(p.proof?'<p>'+payProofLink(s)+'</p>':'');
  else if(p.status==='Paid')h+='<p>✓ Payment received'+(p.paidOn?' on '+fmtDate(p.paidOn):'')+(p.ref?' (ID '+esc(p.ref)+')':'')+'. Thank you.</p>';
  else h+='<p>The APC for this manuscript has been waived.</p>';}
 return h+'</div>';}
if(typeof vSub==='function'){var _payVSub=vSub;vSub=function(id){var h=_payVSub(id),s=findSub(id);if(!s||!canSee(s))return h;var c=payCard(s);if(!c)return h;var i=h.lastIndexOf('</div></section>');return i>-1?h.slice(0,i)+c+h.slice(i):h+c;};}

Object.assign(ACT,{
 paysave:async function(t){var s=findSub(t.dataset.id);if(!s)return;var p=payOf(s),was=p.status;
  p.amount=Math.max(0,+$('py-amt').value||0);p.cur=$('py-cur').value;p.status=$('py-st').value;p.ref=$('py-ref').value.trim();p.note=$('py-note').value.trim();p.paidOn=$('py-date').value||(p.status==='Paid'?today():p.paidOn||'');
  s.history=s.history||[];if(was!==p.status)s.history.push({d:today(),t:'APC payment: '+p.status+(p.ref?' ('+p.ref+')':'')});
  try{await saveSub(s);}catch(e){toast(e.message);return;}
  if(was!=='Paid'&&p.status==='Paid'&&confirm('Payment marked as Paid. E-mail a payment receipt to the author?'))payMailReceipt(s);toast('Payment saved.');route();},
 payproof:async function(t){var s=findSub(t.dataset.id),f=$('py-proof')&&$('py-proof').files[0];if(!s)return;if(!f){toast('Choose the screenshot or receipt first.');return;}
  if(!(await payUploadProof(s,f,'editor')))return;s.history=s.history||[];s.history.push({d:today(),t:'Payment screenshot uploaded ('+f.name+')'});try{await saveSub(s);}catch(e){toast(e.message);return;}toast('Payment screenshot saved.');route();},
 paymail:function(t){var s=findSub(t.dataset.id);if(!s)return;if(!payLink()){toast('Add the payment link in Admin > Settings first.');return;}payMailRequest(s,!!t.dataset.r);s.history=s.history||[];s.history.push({d:today(),t:'APC payment '+(t.dataset.r?'reminder':'request')+' e-mailed'});saveSub(s);toast('Payment '+(t.dataset.r?'reminder':'request')+' e-mailed to the author.');route();},
 payreport:async function(t){var s=findSub(t.dataset.id);if(!s)return;var ref=$('py-ref').value.trim(),n=$('py-anote').value.trim();var pf=$('py-proof')&&$('py-proof').files[0];if(!ref&&!n&&!pf){toast('Enter the Razorpay payment ID, a note, or attach a screenshot.');return;}
  if(pf&&!(await payUploadProof(s,pf,'author')))return;
  var p=payOf(s);p.status='Reported';p.ref=ref;p.authorNote=n;p.reportedAt=today();s.history=s.history||[];s.history.push({d:today(),t:'Author reported APC payment'+(ref?' ('+ref+')':'')});
  try{await saveSub(s);}catch(e){toast(e.message);return;}
  queueMail(S.email,'Editorial Office','['+ensureRef(s)+'] APC payment reported by author','A payment has been reported for an accepted manuscript.\n\nPAYMENT REPORTED\nReference no. : '+ensureRef(s)+'\nTitle         : '+s.title+'\nAuthor        : '+(s.authorName||'')+' ('+(s.authorEmail||'')+')\nAmount due    : '+payAmt(p)+'\nPayment ID    : '+(ref||'-')+'\nNote          : '+(n||'-')+'\nScreenshot    : '+(p.proof?'attached in the admin panel':'-')+'\n\nCheck the payment in the Razorpay dashboard, then open the submission in the admin panel and set the payment status to Paid.\n'+sigText(),'',s.id);
  toast('Thank you. The editorial office has been informed.');route();}
});

/* ---- Razorpay Payment Links (server keeps the keys) ---- */
var RZP_ST={created:'Sent, not paid yet',partially_paid:'Partly paid',paid:'Paid',cancelled:'Cancelled',expired:'Expired'};
function rzpAdminBox(s){var p=payOf(s),l=p.link;if(!rzpOn())return '<p class="pg-h">Razorpay payment links (with SMS): not set up yet. The server administrator adds the Razorpay keys with <code>deploy/set-razorpay.sh</code>.</p>';
 var h='<div class="rzpbox" style="border:1px solid #cfe3e2;background:#f4fbfa;border-radius:8px;padding:10px 12px;margin:8px 0"><b>Razorpay payment link</b> <span class="pg-h">(amount pre-filled; Razorpay sends it by SMS and e-mail'+(SRV.flags.rzpHook?'; payment is confirmed automatically':'')+')</span>';
 if(l&&l.id)h+='<div style="margin:6px 0">Link: <a href="'+esc(l.short_url)+'" target="_blank" rel="noopener">'+esc(l.short_url)+'</a> &middot; <b>'+esc(RZP_ST[l.status]||l.status)+'</b> &middot; sent '+fmtDate(String(l.created||'').slice(0,10))+(l.sms?' &middot; SMS to '+esc(l.to):' &middot; <span style="color:#a15c00">no valid phone, SMS not sent</span>')+'</div>';
 if(p.status!=='Paid'&&p.status!=='Waived')h+='<button class="btn sm gold" type="button" data-act="rzplink" data-id="'+s.id+'">'+(l&&l.id?'Send a new payment link':'Send Razorpay payment link (SMS + e-mail)')+'</button> ';
 if(l&&l.id)h+='<button class="btn sm ghost" type="button" data-act="rzpcheck" data-id="'+s.id+'">Check payment status</button>';
 return h+'</div>';}
function rzpPut(s,ns){var i=SUBS.indexOf(s);if(i>-1)SUBS[i]=ns;else SUBS.push(ns);return ns;}
Object.assign(ACT,{
 rzplink:async function(t){var s=findSub(t.dataset.id);if(!s)return;var amt=$('py-amt')?Math.max(0,+$('py-amt').value||0):payOf(s).amount,cur=$('py-cur')?$('py-cur').value:payOf(s).cur;
  if(!amt){toast('Enter the APC amount first.');return;}if(!confirm('Send a Razorpay payment link for '+(cur==='USD'?'$':'₹')+Number(amt).toLocaleString('en-IN')+' to '+(s.authorName||'the author')+' by SMS and e-mail?'))return;
  t.disabled=true;try{var r=await api('POST','/api/subs/'+encodeURIComponent(s.id)+'/rzp-link',{amount:amt,cur:cur});s=rzpPut(s,r.sub);}catch(e){t.disabled=false;toast(e.message);return;}
  payMailRequest(s,false);toast('Payment link sent'+(s.pay.link.sms?' by SMS to '+s.pay.link.to:'')+' and by e-mail.');route();},
 rzpcheck:async function(t){var s=findSub(t.dataset.id);if(!s)return;t.disabled=true;try{var r=await api('POST','/api/subs/'+encodeURIComponent(s.id)+'/rzp-status');rzpPut(s,r.sub);toast(r.paidNow?'Payment received. Marked as Paid and receipt e-mailed.':'Status: '+(RZP_ST[r.status]||r.status));}catch(e){toast(e.message);}t.disabled=false;route();}
});

/* ---- Admin > Payments ---- */
function vPayments(){var l=SUBS.filter(function(s){return payIsAccepted(s)||s.pay;}).sort(function(a,b){return String(b.acceptDate||b.date).localeCompare(String(a.acceptDate||a.date));}),tot={Due:0,Reported:0,Paid:0,Waived:0};
 l.forEach(function(s){tot[payOf(s).status]=(tot[payOf(s).status]||0)+1;});
 return '<div class="card"><h3>APC payments</h3><p class="pg-h">Accepted manuscripts and their article processing charge. Authors pay through <a href="'+esc(payLink())+'" target="_blank" rel="noopener">'+esc(payLink()||'(no payment link set)')+'</a> and report the payment ID in their dashboard; confirm it in your Razorpay dashboard and mark it <b>Paid</b> on the submission.</p>'
  +'<p>'+PAY_ST.map(function(x){return payPill(x)+' '+tot[x];}).join(' &nbsp; ')+'</p><div style="overflow-x:auto"><table class="t bd"><tr><th>Reference</th><th>Title</th><th>Author</th><th>Amount</th><th>Status</th><th>Payment ID</th><th></th></tr>'
  +(l.length?l.map(function(s){var p=payOf(s);return '<tr><td>'+esc(s.ref||'')+'</td><td style="max-width:280px">'+esc(s.title||'')+'</td><td>'+esc(s.authorName||'')+'</td><td>'+payAmt(p)+'</td><td>'+payPill(p.status)+'</td><td><code>'+esc(p.ref||'')+'</code>'+(p.proof?'<br>'+payProofLink(s):'')+'</td><td><a class="btn sm ghost" href="#/sub/'+s.id+'">Open</a></td></tr>';}).join(''):'<tr><td colspan="7">No accepted manuscripts yet.</td></tr>')+'</table></div></div>';}
var _payAM=adminMenu;adminMenu=function(sub){var h=_payAM(sub);if(!isFullAdmin())return h;var i=h.lastIndexOf('</div>');return h.slice(0,i)+'<a href="#/admin/payments" class="'+(sub==='payments'?'on':'')+'">APC payments</a>'+h.slice(i);};
var _payVA=vAdmin;vAdmin=function(p){if(p[1]==='payments'&&isFullAdmin())return hd('Admin panel','APC payments')+pg('<div class="adm">'+adminMenu('payments')+'<div>'+vPayments()+'</div></div>');return _payVA(p);};

/* ---- Settings: payment link ---- */
if(typeof vSettings==='function'){var _payVS=vSettings;vSettings=function(){var h=_payVS();return h.replace('<button class="btn teal" data-act="savesettings">','<h4>APC payments</h4><div class="row2"><div class="fg"><label>Online payment link (Razorpay.me or payment page)</label><input id="s-payLink" value="'+esc(S.payLink||'')+'" placeholder="https://razorpay.me/@..."></div><div class="fg"><label>Payee name</label><input id="s-payee" value="'+esc(S.payee||'Genosync Global Private Limited')+'"></div></div><div class="fg"><label class="ck"><input type="checkbox" id="s-payOn"'+(S.payOn!==false?' checked':'')+'> Show the payment link in acceptance e-mails and author dashboards</label></div><button class="btn teal" data-act="savesettings">');};
 var _paySave=ACT.savesettings;ACT.savesettings=function(t){var e=$('s-payLink');if(e){var v=e.value.trim();if(v&&!/^https:\/\//.test(v)){toast('The payment link must start with https://');return;}S.payLink=v;S.payee=$('s-payee').value.trim();S.payOn=$('s-payOn').checked;}return _paySave(t);};}
if(typeof DEFAULTS!=='undefined'&&!('payee' in DEFAULTS))DEFAULTS.payee='Genosync Global Private Limited';

/* ---- APC page: pay button for accepted authors ---- */
if(typeof vApc==='function'){var _payApc=vApc;vApc=function(){var h=_payApc();if(!payActive())return h;var box='<div class="card paycard"><h4>Pay the APC online</h4><p>Pay only after you have received the acceptance letter for your manuscript. Enter the amount stated in your acceptance e-mail and quote your manuscript reference number.</p><p><a class="btn gold" href="'+esc(payLink())+'" target="_blank" rel="noopener">Pay APC online &rarr;</a></p><p class="pg-h" style="font-size:12.5px">After paying, log in and enter the Razorpay payment ID on your manuscript page so the editorial office can confirm it.</p></div>';var i=h.lastIndexOf('</div></section>');return i>-1?h.slice(0,i)+box+h.slice(i):h+box;};}

(function(){var c=document.createElement('style');c.textContent='.paypill{display:inline-block;color:#fff;border-radius:10px;padding:2px 9px;font-size:11px;font-weight:bold;vertical-align:middle;margin-left:6px;letter-spacing:.3px}.paycard{border-left:4px solid #B8860B}.paysteps{margin:6px 0 12px 18px;font-size:14px}.paysteps li{margin:3px 0}';document.head.appendChild(c);})();
