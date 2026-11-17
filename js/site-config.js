/* ========== IJMMS journal details (confirmed 16 Nov 2026) ==========
   Overrides the built-in defaults. Edit here, or in Admin > Settings once the server edition is live.
   TO DO before launch on the journal's own domain: change `email` to the journal's address.
   NOT YET HELD - keep switched off until each is real: ISSN, Crossref DOI prefix, indexing logos,
   NMC statement (enable only with the NMC letter, worded to match it). */
(function(){
  if(typeof JID!=='undefined'&&JID==='ls')return;
  var EMAIL='genosyncglobal@gmail.com';
  var EIC='Dr. Rohit B. Chavhan, Pharm.D, MBA (Hospital & Health System Management)';
  var how=window.IJMMS_SERVER?'Submit through this website (Submit Manuscript) or by email to '+EMAIL+'.':'Submit by email to '+EMAIL+'.';
  var o={
    email:EMAIL,
    editorName:EIC,
    editorTitle:'Editor-in-Chief',
    board:'Editor-in-Chief | '+EIC+' | Assistant Professor, Department of Pharmacology and Toxicology, YIOP, Chhatrapati Sambhajinagar | India',
    nmc:'',
    isoOn:'1',
    isoText:'Published by Genosync Publications, an ISO 9001:2015 certified organisation',
    isoCert:'',
    apcApproved:true,
    timeline:'First decision within 2-3 weeks of submission; publication within 2 weeks of acceptance.',
    peer:'Every submission is screened by the editorial office for scope, ethics statements and similarity. Suitable manuscripts undergo double-blind peer review by two independent reviewers: authors and reviewers are not told each other\'s identity. Reviewers submit a recommendation (accept, minor revision, major revision or reject) with comments to the author. The editor makes the final decision. Reviewers must declare conflicts of interest and treat manuscripts as confidential.\nA first decision is normally communicated within 2-3 weeks of submission, and accepted articles are published within 2 weeks of acceptance.',
    announcements:'2026-11-16 | Call for papers: Volume 11, Issue 1 (January-February 2027) | IJMMS invites original research articles, review articles, systematic reviews and meta-analyses, case reports, short communications and letters to the editor across medical and surgical specialties for Volume 11, Issue 1 (January-February 2027). Submission deadline: 31 December 2026. Expected publication: by 28 February 2027. Submission is free and every manuscript undergoes double-blind peer review. '+how
  };
  ['icmje','crossref','scholar','researchgate','ici','imsear','nlm'].forEach(function(k){o['idx_'+k]='hidden';});
  Object.assign(DEFAULTS,o);
  /* Preview notice: this edition keeps accounts and submissions only in the visitor's own browser. */
  if(!window.IJMMS_SERVER){
    var addBar=function(){
      if(document.getElementById('preview-bar'))return;
      var b=document.createElement('div');b.id='preview-bar';b.setAttribute('role','note');
      b.style.cssText='background:#fff4ce;color:#3d2f00;border-bottom:1px solid #e6cf7a;padding:8px 14px;font:14px/1.4 system-ui,-apple-system,Segoe UI,Arial,sans-serif;text-align:center';
      b.innerHTML='<b>Preview version.</b> Accounts and submissions made here are not saved or sent to the journal. To submit a manuscript, email <a href="mailto:'+EMAIL+'" style="color:inherit">'+EMAIL+'</a>.';
      document.body.insertBefore(b,document.body.firstChild);
    };
    if(document.body)addBar();else document.addEventListener('DOMContentLoaded',addBar);
  }
})();
