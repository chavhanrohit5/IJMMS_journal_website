/* Used only by the server's headless Chrome (PDF generation): builds the requested document from server data. */
(function(){
 var D=window.__RD||{};
 S={};var st=D.settings||{};for(var k in DEFAULTS)S[k]=(st[k]!==undefined)?st[k]:DEFAULTS[k];['website','editorName','editorTitle','scope','nmc','pdfTemplate'].forEach(function(k){if(st[k]!==undefined)S[k]=st[k];});
 USERS=D.users||[];ARTS=D.article?[D.article]:[];SUBS=D.sub?[D.sub]:[];REVAPPS=D.revapp?[D.revapp]:[];
 var h='';if(D.site)window.__SITE=D.site;
 if(D.kind==='article'){var a=D.article;(a.figures||[]).forEach(function(f){if(f.data&&f.data.charAt(0)==='/')f.data=location.origin+f.data;});h=printHTML(a);}
 else if(D.kind==='ack')h=ackHTML(D.sub);
 else if(D.kind==='accept')h=acceptHTML(D.sub);
 else if(D.kind==='revack')h=revLetterHTML(D.revapp,'ack');
 else if(D.kind==='revappoint')h=revLetterHTML(D.revapp,'appoint');
 else if(D.kind==='cf')h=cfHTML(cfData(D.sub));
 else if(D.kind==='cert')h=certHTML(D.article,D.certN);
 h=h.replace(/<script>window\.onload[\s\S]*?<\/script>/g,'');
 /* replace the whole site shell (after parsing ends), so no site stylesheet leaks into the PDF */
 var put=function(){document.open();document.write(h);document.close();};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(put,0);});else put();
})();
