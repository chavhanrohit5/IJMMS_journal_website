/* ========== IJMMS journal details (confirmed 16 Nov 2026) ==========
   Overrides the built-in defaults. Edit here, or in Admin > Settings once the server edition is live.
   Journal address: editor@ijmms.in (GoDaddy mailbox).
   NOT YET HELD - keep switched off until each is real: ISSN, Crossref DOI prefix, indexing logos,
   NMC statement (enable only with the NMC letter, worded to match it). */
(function(){
  if(typeof JID!=='undefined'&&JID==='ls')return;
  var EMAIL='editor@ijmms.in';
  var EIC='Dr. Rohit Chavhan';
  var how=window.IJMMS_SERVER?'Submit through this website (Submit Manuscript) or by email to '+EMAIL+'.':'Submit by email to '+EMAIL+'.';
  var o={
    email:EMAIL,
    editorName:EIC,
    editorTitle:'Editor-in-Chief',
    freq:'Semi-monthly',
    board:'Editor-in-Chief | '+EIC+' | International Journal of Modern Medicine & Surgery (IJMMS) | India',
    nmc:'',
    isoOn:'1',
    isoText:'Published by Genosync Publications, an ISO 9001:2015 certified organisation',
    isoCert:'',
    apcApproved:true,
    timeline:'First decision within 2-3 weeks of submission; publication within 2 weeks of acceptance.',
    peer:'Every submission is screened by the editorial office for scope, ethics statements and similarity. Suitable manuscripts undergo double-blind peer review by two independent reviewers: authors and reviewers are not told each other\'s identity. Reviewers submit a recommendation (accept, minor revision, major revision or reject) with comments to the author. The editor makes the final decision. Reviewers must declare conflicts of interest and treat manuscripts as confidential.\nA first decision is normally communicated within 2-3 weeks of submission, and accepted articles are published within 2 weeks of acceptance.',
    announcements:'2026-11-21 | Call for papers: Volume 1, Issues 3 and 4 (December 2026) | IJMMS publishes on the 1st and 15th of every month. It invites original research articles, review articles, systematic reviews and meta-analyses, case reports, short communications and letters to the editor across medical and surgical specialties for Volume 1, Issue 3 (1 December 2026), Issue 4 (15 December 2026) and Volume 2 (2027). Accepted manuscripts are published in the next available issue. Every manuscript undergoes double-blind peer review.'+how
  };
  ['icmje','crossref','scholar','researchgate','ici','imsear','nlm'].forEach(function(k){o['idx_'+k]='hidden';});
  Object.assign(DEFAULTS,o);
})();
