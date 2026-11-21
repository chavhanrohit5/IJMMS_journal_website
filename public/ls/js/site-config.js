/* ========== IJMLS journal details (confirmed 19 Nov 2026) ==========
   Overrides the built-in defaults. Edit here, or in Admin > Settings on the live site.
   NOT YET HELD - keep switched off until each is real: ISSN, Crossref DOI prefix, indexing logos. */
(function(){
  if(typeof JID==='undefined'||JID!=='ls')return;
  START_YEAR=2026; /* Volume 1 = 2026 (from 1 November), issues on the 1st and 15th of every month */
  var EMAIL='editor@ijmls.in';
  var EIC='Dr. Rohit B. Chavhan, Pharm.D, MBA (Hospital & Health System Management)';
  var how=window.IJMMS_SERVER?'Submit through this website (Submit Manuscript) or by email to '+EMAIL+'.':'Submit by email to '+EMAIL+'.';
  var o={
    email:EMAIL,
    editorName:EIC,
    editorTitle:'Editor-in-Chief',
    freq:'Semi-monthly',
    board:'Editor-in-Chief | '+EIC+' | Assistant Professor, Department of Pharmacology and Toxicology, YIOP, Chhatrapati Sambhajinagar | India',
    nmc:'',
    isoOn:'1',
    isoText:'Published by Genosync Publications, an ISO 9001:2015 certified organisation',
    isoCert:'',
    apcApproved:true,
    timeline:'First decision within 2-3 weeks of submission; publication within 2 weeks of acceptance.',
    peer:'Every submission is screened by the editorial office for scope, ethics statements and similarity. Suitable manuscripts undergo double-blind peer review by two independent reviewers: authors and reviewers are not told each other\'s identity. Reviewers submit a recommendation (accept, minor revision, major revision or reject) with comments to the author. The editor makes the final decision. Reviewers must declare conflicts of interest and treat manuscripts as confidential.\nA first decision is normally communicated within 2-3 weeks of submission, and accepted articles are published within 2 weeks of acceptance.',
    announcements:'2026-11-21 | Call for papers: Volume 1, Issues 3 and 4 (December 2026) | IJMLS publishes on the 1st and 15th of every month. It invites original research articles, review articles, systematic reviews and meta-analyses, short communications and letters to the editor across the life sciences for Volume 1, Issue 3 (1 December 2026), Issue 4 (15 December 2026) and Volume 2 (2027). Accepted manuscripts are published in the next available issue. Every manuscript undergoes double-blind peer review.'+how
  };
  ['icmje','crossref','scholar','researchgate','ici','imsear','nlm'].forEach(function(k){o['idx_'+k]='hidden';});
  Object.assign(DEFAULTS,o);
})();
