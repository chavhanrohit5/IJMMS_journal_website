/* Used only by the server's headless Chrome (PDF generation): builds the requested document from server data. */
(function(){
 var D=window.__RD||{};
 S={};var st=D.settings||{};for(var k in DEFAULTS)S[k]=(st[k]!==undefined)?st[k]:DEFAULTS[k];
 USERS=D.users||[];ARTS=D.article?[D.article]:[];SUBS=D.sub?[D.sub]:[];REVAPPS=D.revapp?[D.revapp]:[];
 var h='';
 if(D.kind==='article'){var a=D.article;(a.figures||[]).forEach(function(f){if(f.data&&f.data.charAt(0)==='/')f.data=location.origin+f.data;});h=printHTML(a);}
 else if(D.kind==='ack')h=ackHTML(D.sub);
 else if(D.kind==='accept')h=acceptHTML(D.sub);
 else if(D.kind==='revack')h=revLetterHTML(D.revapp,'ack');
 else if(D.kind==='revappoint')h=revLetterHTML(D.revapp,'appoint');
 else if(D.kind==='cf')h=cfHTML(cfData(D.sub));
 h=h.replace(/<script>window\.onload[\s\S]*?<\/script>/g,'');
 document.open();document.write(h);document.close();
})();
