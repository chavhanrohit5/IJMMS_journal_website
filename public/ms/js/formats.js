/* ==========================================================================
   Article-type formats for IJMMS and IJMLS (shared file; JID picks the list)
   One registry drives: the submission form (fields, word limits, uploads),
   the admin view / edit of what authors submitted, the article draft made
   from a submission, the article editor templates and the Author Guidelines.
   ========================================================================== */
var FMT_GRP=(typeof JID!=='undefined'&&JID==='ls')?'ls':'ms';

/* upload slots: k = key, l = label, acc = accepted extensions, m = several files allowed */
var UP={
 manuscript:{l:'Main manuscript (blinded - no author names)',acc:'.doc,.docx,.pdf',h:'Full text in the section order shown above, with tables at the end and figure legends. Remove author names for double-blind review.'},
 titlepage:{l:'Title page',acc:'.doc,.docx,.pdf',h:'Title, running title, all authors with degrees, affiliations and ORCID, corresponding author, word count, number of tables and figures.'},
 cover:{l:'Cover letter',acc:'.doc,.docx,.pdf',h:'Why the work suits the journal and what is new; confirm it is not under consideration elsewhere.'},
 fig:{l:'Figures / images',acc:'.jpg,.jpeg,.png,.tif,.tiff,.pdf',m:1,h:'One file per figure, numbered in the order cited. Photos at least 300 dpi, line art 600 dpi. JPG or PNG appear in the published article; TIFF is kept for print.'},
 tab:{l:'Tables (editable)',acc:'.doc,.docx,.xlsx,.csv',m:1,h:'Editable tables (Word or Excel), not pictures of tables.'},
 flow:{l:'Flow diagram',acc:'.jpg,.jpeg,.png,.pdf,.doc,.docx',h:''},
 chk:{l:'Reporting guideline checklist',acc:'.pdf,.doc,.docx',h:'Completed checklist with page numbers.'},
 ethics:{l:'Ethics committee approval letter',acc:'.pdf,.jpg,.jpeg,.png',h:'Approval from the institutional ethics committee (or animal ethics / biosafety committee).'},
 consent:{l:'Signed consent form',acc:'.pdf,.jpg,.jpeg,.png',h:'Signed consent for publication from the patient or guardian. It is kept confidential and not published.'},
 gabs:{l:'Graphical abstract (optional)',acc:'.jpg,.jpeg,.png',h:'One landscape image summarising the study (about 1200 x 600 px).'},
 supp:{l:'Supplementary files',acc:'.pdf,.doc,.docx,.xlsx,.csv,.jpg,.jpeg,.png,.tif,.tiff',m:1,h:'Extra tables, datasets, search strategies, full uncropped gels or blots, questionnaires.'},
 confdoc:{l:'Conference acceptance / presentation certificate',acc:'.pdf,.jpg,.jpeg,.png',h:'Proof that the abstract was accepted or presented.'}
};
/* ready-made abstract heading sets */
var AB_IMRAD=['Background','Methods','Results','Conclusions'];
var DECL_ALL=['ethics','consent','funding','coi','contrib','data','aiUse','ack'];
var DECL_SHORT=['funding','coi','aiUse'];

function T(o){o.kw=o.kw||[3,6];o.decl=o.decl||DECL_ALL;return o;}
var FMT_TYPES={
ms:[
 T({t:'Original Research',d:'New clinical, surgical or laboratory research with original data: trials, cohort, case-control, cross-sectional, diagnostic-accuracy and outcome studies.',w:[3000,5000],ab:{n:250,h:AB_IMRAD},refs:50,tab:5,fig:5,
  s:[['Introduction','What is known, the gap in knowledge, and why this study was needed (with references).',1],['Aim and Objectives','Primary and secondary objectives or the hypothesis tested.',1],['Materials and Methods','Design, setting and period; participants and eligibility; sample size; interventions or exposures; outcomes and how they were measured; data collection; statistics (software, tests, significance level); ethics approval and consent.',1],['Results','Participant flow, baseline characteristics, then main and secondary outcomes with effect sizes and 95% confidence intervals. Refer to tables and figures; do not interpret.',1],['Discussion','Main findings, comparison with published work, possible explanations and clinical implications.',1],['Strengths and Limitations','Honest account of bias, confounding, sample size and generalisability.',1],['Conclusion','Answer to the objectives, supported by the results. No new data.',1]],
  up:[['manuscript',1],['titlepage',1],['cover',0],['fig',0],['tab',0],['flow',0,'Participant flow diagram (CONSORT / STROBE)'],['ethics',1],['chk',1],['gabs',0],['supp',0]],
  x:['reg','guide'],rg:'CONSORT (randomised trials), STROBE (observational studies), STARD (diagnostic accuracy), TRIPOD (prediction models), SQUIRE (quality improvement), COREQ or SRQR (qualitative research)',
  eth:'Ethics committee approval with reference number, written informed consent, and prospective trial registration (CTRI or another WHO primary registry) for clinical trials.'}),
 T({t:'Systematic Review / Meta-analysis',d:'Systematic, reproducible synthesis of all available evidence on a focused question, with or without meta-analysis.',w:[4000,8000],ab:{n:300,h:AB_IMRAD},refs:100,tab:6,fig:6,
  s:[['Introduction','Background and why a systematic review is needed now.',1],['Objectives','The review question in PICO form (Population, Intervention or exposure, Comparator, Outcomes).',1],['Methods','Protocol and registration (PROSPERO number); eligibility criteria; information sources and dates; full search strategy; study selection; data extraction; risk-of-bias tool; synthesis and meta-analysis model; heterogeneity; certainty of evidence (GRADE).',1],['Results','Study selection with PRISMA flow diagram; characteristics of included studies; risk of bias; results of syntheses with forest plots; publication bias.',1],['Discussion','Summary of evidence, comparison with earlier reviews, implications for practice and research.',1],['Strengths and Limitations','Limitations of the evidence and of the review process.',1],['Conclusion','What the evidence shows and how certain it is.',1]],
  up:[['manuscript',1],['titlepage',1],['cover',0],['flow',1,'PRISMA 2020 flow diagram'],['chk',1,'PRISMA 2020 checklist'],['fig',0],['tab',0],['supp',0,'Supplementary files (full search strategy for every database is expected)']],
  x:['reg','guide'],rg:'PRISMA 2020 (and PRISMA-S for the search, MOOSE for observational meta-analyses)',eth:'Ethics approval is usually not needed for reviews of published data; state this in the Ethics statement.'}),
 T({t:'Review Article',d:'Narrative review that critically summarises current knowledge on a clinically relevant topic, usually by invitation or after a pre-submission enquiry.',w:[3000,6000],ab:{n:200},refs:80,tab:4,fig:4,
  s:[['Introduction','Why the topic matters and the scope of the review.',1],['Literature Search Strategy','Databases searched, period and main search terms (brief).',1],['Main Body','Organised under your own thematic subheadings (mark subheadings with ### in the text).',1],['Clinical Implications and Future Directions','What clinicians should do differently and what research is needed.',1],['Conclusion','Key take-home messages.',1]],
  up:[['manuscript',1],['titlepage',1],['cover',0],['fig',0],['tab',0],['supp',0]],
  x:['guide'],decl:['funding','coi','contrib','aiUse','ack'],rg:'SANRA (scale for the quality of narrative reviews) is recommended',eth:'Not required unless unpublished patient data or images are included.'}),
 T({t:'Case Report',d:'A single patient with an unusual presentation, rare condition, new diagnostic or therapeutic approach, or an important lesson.',w:[1500,2500],ab:{n:150,h:['Introduction','Case Presentation','Conclusion']},kw:[3,5],refs:20,tab:2,fig:4,
  s:[['Introduction','Why this case is worth reporting, with a brief literature context.',1],['Patient Information','De-identified demographics, presenting complaint, relevant history (medical, family, psychosocial).',1],['Clinical Findings','Relevant examination findings.',1],['Timeline','Key dates or days of illness in order (a table is ideal).',0],['Diagnostic Assessment','Investigations, differential diagnosis and the final diagnosis with reasoning.',1],['Therapeutic Intervention','Treatment given, dose, route and duration; any changes and why.',1],['Follow-up and Outcomes','Outcome, adherence, adverse events and length of follow-up.',1],['Discussion','Comparison with reported cases, strengths and limitations of the report.',1],['Patient Perspective','The patient\'s own view of the experience (optional).',0],['Conclusion','Two or three clear learning points.',1]],
  up:[['manuscript',1],['titlepage',1],['consent',1],['fig',0,'Clinical images (photographs, X-ray, CT, MRI, histopathology)'],['tab',0],['chk',1,'CARE checklist'],['cover',0]],
  x:['consentOk','guide'],rg:'CARE',eth:'Written consent for publication from the patient (or guardian) is mandatory. Remove names, initials, hospital numbers, dates and faces unless consented.'}),
 T({t:'Case Series',d:'A descriptive report of two or more patients with a similar condition, presentation, procedure or outcome, analysed together.',w:[2000,3500],ab:{n:200,h:['Background','Case Series','Conclusions']},refs:30,tab:3,fig:5,
  s:[['Introduction','Background and why the series adds to existing knowledge.',1],['Methods','How cases were identified (consecutive or selected), setting and period, inclusion and exclusion criteria, data recorded, follow-up, ethics and consent.',1],['Case Descriptions','Each case in turn: presentation, findings, management and outcome (use Case 1, Case 2 ... as subheadings with ###).',1],['Summary of Cases','A comparison table of all cases: age, sex, presentation, investigations, treatment and outcome.',1],['Discussion','Common patterns, comparison with literature, possible mechanisms.',1],['Strengths and Limitations','Selection bias, small numbers, lack of a control group.',1],['Conclusion','Learning points and what should be studied next.',1]],
  up:[['manuscript',1],['titlepage',1],['consent',1,'Signed consent forms (one per patient, combined into one file if possible)'],['ethics',0,'Ethics committee approval (if the series used institutional records)'],['fig',0],['tab',0],['chk',0,'CARE checklist (adapted for case series)'],['cover',0]],
  x:['consentOk','guide'],rg:'CARE (adapted for case series)',eth:'Consent for publication from every patient; ethics approval if data were taken from institutional records.'}),
 T({t:'Short Communication',d:'A concise report of preliminary or focused original findings that merit rapid publication.',w:[1000,1800],ab:{n:150},kw:[3,5],refs:15,tab:2,fig:2,
  s:[['Introduction','Brief background and objective.',1],['Methods','Essential methods only.',1],['Results','Key findings.',1],['Discussion','Meaning of the findings and limitations.',1],['Conclusion','One or two sentences.',1]],
  up:[['manuscript',1],['titlepage',1],['fig',0],['tab',0],['ethics',0],['chk',0],['cover',0]],
  x:['reg','guide'],rg:'As for the study design (CONSORT, STROBE, STARD ...)',eth:'Ethics approval and consent as for original research.'}),
 T({t:'Clinical Image',d:'A striking clinical, radiological, endoscopic, intra-operative or histopathological image with a short educational description.',w:[300,600],ab:null,kw:[2,4],refs:5,tab:0,fig:3,
  s:[['Clinical Presentation','Brief, de-identified history.',1],['Image Description','What the image shows; point out key findings (arrows or labels on the image).',1],['Diagnosis and Management','Final diagnosis and treatment.',1],['Teaching Point','The lesson for clinicians.',1]],
  up:[['fig',1,'Clinical images (up to 3, high resolution, with arrows or labels)'],['consent',1],['manuscript',0,'Text file (optional - the fields above are enough)']],
  x:['consentOk'],decl:['consent','funding','coi','aiUse'],rg:'CARE principles for clinical details',eth:'Consent for publication of identifiable images. Faces and identifiers must be masked unless consented.'}),
 T({t:'Letter to Editor',d:'Comments on an article published in the journal, or a brief observation of wide interest.',w:[500,1000],ab:null,kw:[0,3],refs:10,tab:1,fig:1,
  s:[['Letter','Address the letter "Dear Editor"; if responding to an article, cite it as reference 1.',1]],
  up:[['manuscript',1],['fig',0],['tab',0]],x:[],decl:DECL_SHORT,rg:'Not applicable',eth:'Consent is needed only if a patient is described.'}),
 T({t:'Conference Abstract',d:'An abstract accepted at or presented in a scientific meeting, published as part of conference proceedings.',w:[250,300],ab:{n:300,h:AB_IMRAD},kw:[3,5],refs:5,tab:1,fig:1,
  s:[],up:[['confdoc',0],['fig',0],['manuscript',0,'Abstract file (optional)']],x:['confDetails'],decl:['ethics','funding','coi','aiUse'],rg:'As for the study design',eth:'Ethics approval as for the original study.'})
],
ls:[
 T({t:'Original Research',d:'Original laboratory, field, clinical-laboratory or computational research in the life sciences: microbiology, biotechnology, molecular biology, biochemistry, pharmacology, genetics and related fields.',w:[3000,5000],ab:{n:250,h:AB_IMRAD},refs:50,tab:5,fig:6,
  s:[['Introduction','Background, the knowledge gap and the rationale.',1],['Aim and Objectives','Hypothesis and specific objectives.',1],['Materials and Methods','Materials and reagents with source and catalogue numbers; organisms, strains or cell lines with source and authentication; experimental design with biological and technical replicates; protocols; instruments and software with versions; statistics; ethics and biosafety approvals.',1],['Results','Findings in logical order with statistics, referring to tables and figures. Show representative and full data (uncropped gels and blots in supplementary files).',1],['Discussion','Interpretation, comparison with earlier work, mechanisms and significance.',1],['Strengths and Limitations','Limits of the models, methods and sample sizes.',1],['Conclusion','Main conclusions and future work.',1]],
  up:[['manuscript',1],['titlepage',1],['cover',0],['fig',0,'Figures (graphs, microscopy, gels, chromatograms, pathways, structures)'],['tab',0],['flow',0,'Experimental workflow diagram'],['ethics',0,'Ethics / animal ethics / biosafety approval'],['chk',0],['gabs',0],['supp',0,'Supplementary files (raw data, uncropped gels and blots, sequences)']],
  x:['accession','guide'],rg:'ARRIVE 2.0 (animal studies), MIQE (qPCR), MIAPE (proteomics), MIAME (microarrays), STROBE or CONSORT (human studies), FAIR principles for data',
  eth:'Human samples: ethics approval and consent. Animals: institutional animal ethics committee (CPCSEA in India) approval. Recombinant DNA and pathogens: institutional biosafety committee approval.'}),
 T({t:'Systematic Review / Meta-analysis',d:'Systematic, reproducible synthesis of the published evidence on a focused life-sciences question.',w:[4000,8000],ab:{n:300,h:AB_IMRAD},refs:100,tab:6,fig:6,
  s:[['Introduction','Background and need for the review.',1],['Objectives','The review question (PICO, PECO or SPIDER as appropriate).',1],['Methods','Protocol and registration; eligibility; sources and dates; full search strategy; selection; data extraction; risk-of-bias or quality tool; synthesis; heterogeneity.',1],['Results','PRISMA flow, study characteristics, quality, synthesis and forest plots.',1],['Discussion','Summary, comparison and implications.',1],['Strengths and Limitations','Limits of evidence and of the review.',1],['Conclusion','What the evidence supports.',1]],
  up:[['manuscript',1],['titlepage',1],['cover',0],['flow',1,'PRISMA 2020 flow diagram'],['chk',1,'PRISMA 2020 checklist'],['fig',0],['tab',0],['supp',0,'Supplementary files (full search strategy expected)']],
  x:['reg','guide'],rg:'PRISMA 2020; SYRCLE risk-of-bias tool for animal studies',eth:'Usually not needed for reviews of published data; say so in the Ethics statement.'}),
 T({t:'Review Article',d:'Narrative review that critically summarises current knowledge in a life-sciences field.',w:[3000,6000],ab:{n:200},refs:80,tab:4,fig:4,
  s:[['Introduction','Why the topic matters and the scope.',1],['Literature Search Strategy','Databases, period and search terms (brief).',1],['Main Body','Thematic subheadings (mark with ###); include pathway or mechanism diagrams where helpful.',1],['Applications and Future Directions','Practical applications, open questions and research needs.',1],['Conclusion','Key messages.',1]],
  up:[['manuscript',1],['titlepage',1],['cover',0],['fig',0,'Figures (pathways, mechanisms, structures)'],['tab',0],['supp',0]],
  x:['guide'],decl:['funding','coi','contrib','aiUse','ack'],rg:'SANRA is recommended',eth:'Not required for reviews of published work.'}),
 T({t:'Short Communication',d:'A brief research report of preliminary or focused findings.',w:[1000,1800],ab:{n:150},kw:[3,5],refs:15,tab:2,fig:2,
  s:[['Introduction','Brief background and objective.',1],['Materials and Methods','Essential methods only.',1],['Results','Key findings.',1],['Discussion','Meaning and limitations.',1],['Conclusion','One or two sentences.',1]],
  up:[['manuscript',1],['titlepage',1],['fig',0],['tab',0],['ethics',0],['supp',0],['cover',0]],
  x:['accession','guide'],rg:'As for the study design (ARRIVE, MIQE ...)',eth:'Ethics and biosafety approvals as for original research.'}),
 T({t:'Methods and Protocols',d:'A new or improved laboratory, field or computational method, or a detailed validated protocol, with evidence that it works.',w:[2500,4500],ab:{n:250,h:['Background','Method','Validation','Conclusions']},refs:40,tab:4,fig:6,
  s:[['Introduction','The problem the method solves and how it improves on existing methods.',1],['Materials and Equipment','Reagents with source and catalogue numbers, instruments, software with versions.',1],['Procedure','Numbered, step-by-step instructions with timings, critical steps, pause points and safety notes.',1],['Validation and Expected Results','Evidence the method works: accuracy, precision, sensitivity, LOD / LOQ, linearity, robustness or comparison with a reference method; representative results.',1],['Troubleshooting','Common problems, likely causes and solutions (a table works well).',0],['Limitations','Where the method should not be used.',1],['Conclusion','Summary of performance and applications.',1]],
  up:[['manuscript',1],['titlepage',1],['flow',1,'Method / laboratory workflow diagram'],['fig',0],['tab',0],['supp',0,'Supplementary files (raw validation data, code, scripts)'],['cover',0]],
  x:['accession','code','guide'],rg:'MIQE (qPCR methods), ICH Q2(R2) for analytical method validation, FAIR principles; share code in a public repository',eth:'Biosafety or ethics approval when hazardous agents, animals or human samples are used.'}),
 T({t:'Scientific Image',d:'A striking or instructive microscopy, imaging, gel, culture or field image with a short scientific explanation.',w:[300,600],ab:null,kw:[2,4],refs:5,tab:0,fig:3,
  s:[['Specimen and Context','What the specimen is and where it came from.',1],['Imaging Method','Technique, stain, magnification, instrument; include a scale bar on the image.',1],['Image Description','Key features, with arrows or labels.',1],['Significance','Why the image is instructive.',1]],
  up:[['fig',1,'Images (up to 3, high resolution, with scale bars)'],['manuscript',0,'Text file (optional)']],
  x:[],decl:['ethics','funding','coi','aiUse'],rg:'Report imaging settings; no manipulation beyond uniform brightness or contrast changes',eth:'Approvals as for the original work.'}),
 T({t:'Letter to Editor',d:'Comments on a published article or a brief observation of wide interest.',w:[500,1000],ab:null,kw:[0,3],refs:10,tab:1,fig:1,
  s:[['Letter','Address the letter "Dear Editor"; if responding to an article, cite it as reference 1.',1]],
  up:[['manuscript',1],['fig',0],['tab',0]],x:[],decl:DECL_SHORT,rg:'Not applicable',eth:'Not applicable.'}),
 T({t:'Conference Abstract',d:'An abstract accepted at or presented in a scientific meeting, published as part of conference proceedings.',w:[250,300],ab:{n:300,h:AB_IMRAD},kw:[3,5],refs:5,tab:1,fig:1,
  s:[],up:[['confdoc',0],['fig',0],['manuscript',0,'Abstract file (optional)']],x:['confDetails'],decl:['ethics','funding','coi','aiUse'],rg:'As for the study design',eth:'Approvals as for the original study.'})
]};
var FTYPES=FMT_TYPES[FMT_GRP];
function fmtType(t){return FTYPES.filter(function(x){return x.t===t;})[0]||FTYPES[0];}

/* declarations: labels, hints and ready-to-use wording */
var DECL={
 ethics:['Ethics approval','Committee name, reference number and date, or why approval was not required.','This study was approved by the Institutional Ethics Committee of [institution] (reference [number], dated [date]).'],
 consent:['Consent',FMT_GRP==='ls'?'Informed consent from human participants, or "Not applicable".':'Informed consent to take part and consent for publication.','Written informed consent was obtained from all participants (or the patient / guardian) for participation and for publication of this report, including images.'],
 funding:['Funding','Grant numbers and funders, or "None".','This research received no specific grant from any funding agency in the public, commercial or not-for-profit sectors.'],
 coi:['Conflict of interest','Any financial or personal relationships that could influence the work.','The authors declare no conflict of interest.'],
 contrib:['Author contributions','What each author did (CRediT roles), with initials.','Conceptualisation: A.B.; Methodology: C.D.; Investigation: A.B., E.F.; Formal analysis: C.D.; Writing - original draft: A.B.; Writing - review and editing: all authors. All authors approved the final version.'],
 data:['Data availability','Where the data can be found, or how to request it.','The data supporting the findings of this study are available from the corresponding author on reasonable request.'],
 aiUse:['Use of AI-assisted technology','Which AI tools were used and for what, or "None".','No generative AI tools were used in preparing this manuscript.'],
 ack:['Acknowledgements','People or institutions who helped but are not authors.','']
};
/* extra fields */
var XF={
 reg:['Trial / review registration','e.g. CTRI/2026/01/012345 or PROSPERO CRD42026000000 (required for clinical trials and systematic reviews)'],
 guide:['Reporting guideline followed','e.g. STROBE, CONSORT, PRISMA 2020, CARE'],
 accession:['Accession numbers and materials','e.g. GenBank OQ123456; strain ATCC 25922; cell line RRID:CVCL_0030'],
 code:['Code availability','Repository link (GitHub, Zenodo) and licence, or "Not applicable"']
};
var PRES_TYPES=['Oral presentation','Poster presentation','E-poster','Invited talk'];

/* --------------------------- helpers --------------------------- */
function fwc(s){return String(s||'').replace(/[#*|]/g,' ').split(/\s+/).filter(Boolean).length;}
function rq(b){return b?' <span class="rq" title="Mandatory">*</span>':'';}
function fUp(slot){var u=UP[slot[0]]||{l:slot[0],acc:'.pdf,.doc,.docx,.jpg,.jpeg,.png',h:''};return {k:slot[0],req:!!slot[1],l:slot[2]||u.l,acc:u.acc,m:!!u.m,h:u.h};}
function fmtComposeAbs(T,parts){if(!T.ab)return '';if(!T.ab.h)return (parts._||'').trim();return T.ab.h.map(function(h){var v=(parts[h]||'').trim();return v?'**'+h+':** '+v:'';}).filter(Boolean).join('\n\n');}
function fmtSplitAbs(T,text){var p={};if(!T.ab)return p;if(!T.ab.h){p._=text||'';return p;}var s=String(text||'');T.ab.h.forEach(function(h,i){var re=new RegExp('\\*\\*'+h.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+':\\*\\*\\s*([\\s\\S]*?)(?=\\n\\n\\*\\*('+T.ab.h.map(function(x){return x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}).join('|')+'):\\*\\*|$)');var m=s.match(re);p[h]=m?m[1].trim():'';});if(!T.ab.h.some(function(h){return p[h];})&&s)p[T.ab.h[0]]=s;return p;}
function fmtConfText(c){if(!c||!c.name)return '';return (c.kind||'Presented')+' at '+c.name+(c.venue?', '+c.venue:'')+(c.date?', '+c.date:'')+'.';}

/* --------------------------- the form --------------------------- */
/* d = existing structured data (s.fmt) for editing; mode 'new' | 'edit' */
function fmtForm(type,d,mode){var T=fmtType(type);d=d||{};var abs=d.abs||{},secs={},dl=d.decl||{},xx=d.x||{},cf=d.conf||{};(d.secs||[]).forEach(function(x){secs[x.h]=x.t;});
 var h='<div class="fmtbox"><div class="fmtinfo"><b>'+esc(T.t)+'</b> &middot; '+esc(T.d)+'<div class="lims"><span>Words: <b>'+T.w[0].toLocaleString()+'&ndash;'+T.w[1].toLocaleString()+'</b></span><span>Abstract: <b>'+(T.ab?(T.ab.h?'structured, ':'')+T.ab.n+' words':'not required')+'</b></span><span>Keywords: <b>'+(T.kw[1]?T.kw[0]+'&ndash;'+T.kw[1]:'optional')+'</b></span><span>References: <b>&le; '+T.refs+'</b></span><span>Tables: <b>&le; '+T.tab+'</b></span><span>Figures: <b>&le; '+T.fig+'</b></span></div><div class="rg">Reporting guideline: '+esc(T.rg)+'</div></div>';
 if(T.ab){h+='<h4 class="fsec">Abstract'+rq(T.ab.req)+' <small id="wc-abs" class="wcc"></small></h4>';
  if(T.ab.h)h+=T.ab.h.map(function(x){return '<div class="fg"><label>'+esc(x)+'</label><textarea class="fa" data-h="'+esc(x)+'" rows="3">'+esc(abs[x]||'')+'</textarea></div>';}).join('');
  else h+='<div class="fg"><label>Abstract (unstructured, one paragraph)</label><textarea class="fa" data-h="_" rows="6">'+esc(abs._||'')+'</textarea></div>';}
 if(T.x.indexOf('confDetails')>-1){h+='<h4 class="fsec">Conference details</h4><div class="row2"><div class="fg"><label>Conference name</label><input id="cf-name" value="'+esc(cf.name||'')+'"></div><div class="fg"><label>Venue (city, country)</label><input id="cf-venue" value="'+esc(cf.venue||'')+'"></div></div><div class="row3"><div class="fg"><label>Dates</label><input id="cf-date" value="'+esc(cf.date||'')+'" placeholder="12-14 Jan 2027"></div><div class="fg"><label>Presentation</label><select id="cf-kind">'+opt(PRES_TYPES,cf.kind||'Oral presentation')+'</select></div><div class="fg"><label>Presenting author</label><input id="cf-presenter" value="'+esc(cf.presenter||'')+'"></div></div>';}
 if(T.s.length){h+='<h4 class="fsec">Manuscript sections <small id="wc-body" class="wcc"></small></h4><p class="note" style="font-size:12.5px;margin-top:0">Paste the text of each section into its box (tables and figure files are uploaded below). Mark subheadings with ###. Cite references as [1], [2].</p>';
  h+=T.s.map(function(x){return '<div class="fg fsecrow"><label>'+esc(x[0])+rq(x[2])+'</label><div class="hint">'+esc(x[1])+'</div><textarea class="fs" data-h="'+esc(x[0])+'" data-req="'+(x[2]?1:0)+'" rows="'+(x[0]==='Materials and Methods'||x[0]==='Methods'||x[0]==='Results'||x[0]==='Main Body'||x[0]==='Procedure'||x[0]==='Case Descriptions'?8:4)+'">'+esc(secs[x[0]]||'')+'</textarea></div>';}).join('');
  h+='<div class="fg"><label>References (one per line, Vancouver style, in order of citation)'+rq(T.refsReq)+'</label><textarea id="fm-refs" rows="5" placeholder="1. Author AB, Author CD. Title of article. Abbreviated Journal. 2024;12(3):45-52. doi:10.xxxx/xxxxx">'+esc(d.refs||'')+'</textarea></div>';}
 var xs=T.x.filter(function(k){return XF[k];});if(xs.length)h+='<h4 class="fsec">Registration and reporting</h4><div class="row2">'+xs.map(function(k){return '<div class="fg"><label>'+esc(XF[k][0])+rq((T.xreq||[]).indexOf(k)>-1)+'</label><input class="fx" data-k="'+k+'" value="'+esc(xx[k]||'')+'" placeholder="'+esc(XF[k][1])+'"></div>';}).join('')+'</div>';
 if(T.x.indexOf('consentOk')>-1)h+='<label class="ck"><input type="checkbox" id="fm-consentok"'+(xx.consentOk?' checked':'')+'> Written consent for publication has been obtained from the patient(s) or guardian(s) and is uploaded below.</label>';
 h+='<h4 class="fsec">Declarations</h4><div class="row2">'+T.decl.filter(function(k){return DECL[k];}).map(function(k){var D=DECL[k];return '<div class="fg"><label>'+esc(D[0])+rq((T.dreq||[]).indexOf(k)>-1)+' <a href="#" class="usetpl" data-k="'+k+'" data-v="'+esc(D[2])+'"'+(D[2]?'':' style="display:none"')+'>use standard wording</a></label><textarea class="fd" data-k="'+k+'" rows="2" placeholder="'+esc(D[1])+'">'+esc(dl[k]||'')+'</textarea></div>';}).join('')+'</div>';
 if(T.t!=='Conference Abstract'&&!T.nopres){var pc=d.pres||{};h+='<h4 class="fsec">Conference presentation</h4><label class="ck"><input type="checkbox" id="pr-on"'+(pc.name?' checked':'')+'> This work was presented as an abstract at a conference</label><div id="pr-box"'+(pc.name?'':' style="display:none"')+'><div class="row2"><div class="fg"><label>Conference name</label><input id="pr-name" value="'+esc(pc.name||'')+'"></div><div class="fg"><label>Venue (city, country)</label><input id="pr-venue" value="'+esc(pc.venue||'')+'"></div></div><div class="row2"><div class="fg"><label>Date</label><input id="pr-date" value="'+esc(pc.date||'')+'"></div><div class="fg"><label>Presentation</label><select id="pr-kind">'+opt(PRES_TYPES,pc.kind||'Oral presentation')+'</select></div></div></div>';}
 var have={};(d.files||[]).forEach(function(f){(have[f.slot]=have[f.slot]||[]).push(f);});
 h+='<h4 class="fsec">Upload files</h4><table class="t upt"><tr><th style="width:38%">File</th><th>Upload</th></tr>'+T.up.map(function(sl){var u=fUp(sl),ex=have[u.k]||(u.k==='manuscript'&&d.mainName?[{name:d.mainName}]:[]);
  return '<tr><td><b>'+esc(u.l)+'</b>'+rq(u.req)+(u.h?'<div class="hint">'+esc(u.h)+'</div>':'')+'<div class="hint">'+esc(u.acc.replace(/\./g,'').toUpperCase().split(',').join(', '))+(u.m?' &middot; several files allowed':'')+'</div></td><td><input type="file" class="fu" data-k="'+u.k+'" data-req="'+(u.req?1:0)+'"'+(ex.length?' data-has="1"':'')+' accept="'+u.acc+'"'+(u.m?' multiple':'')+'>'+(ex.length?'<div class="hint">Already uploaded: '+ex.map(function(f){return esc(f.name);}).join(', ')+(mode==='edit'?' (choose new files to replace)':'')+'</div>':'')+(u.k==='fig'?'<div class="figcaps" data-k="fig">'+(have.fig||[]).map(function(f,i){return '<div class="fg"><label>Figure '+(i+1)+' legend ('+esc(f.name)+')</label><input class="fcap" value="'+esc(f.caption||'')+'"></div>';}).join('')+'</div>':'')+'</td></tr>';}).join('')+'</table>';
 h+='</div>';
 return h;}

/* read the form back */
function fmtRead(type){var T=fmtType(type),d={type:T.t,abs:{},secs:[],decl:{},x:{},conf:null,pres:null,refs:''};
 document.querySelectorAll('.fmtbox .fa').forEach(function(e){d.abs[e.dataset.h]=e.value.trim();});
 document.querySelectorAll('.fmtbox .fs').forEach(function(e){d.secs.push({h:e.dataset.h,t:e.value.trim()});});
 document.querySelectorAll('.fmtbox .fd').forEach(function(e){d.decl[e.dataset.k]=e.value.trim();});
 document.querySelectorAll('.fmtbox .fx').forEach(function(e){d.x[e.dataset.k]=e.value.trim();});
 var c=$('fm-consentok');if(c)d.x.consentOk=c.checked;var r=$('fm-refs');if(r)d.refs=r.value.trim();
 if($('cf-name'))d.conf={name:$('cf-name').value.trim(),venue:$('cf-venue').value.trim(),date:$('cf-date').value.trim(),kind:$('cf-kind').value,presenter:$('cf-presenter').value.trim()};
 if($('pr-on')&&$('pr-on').checked)d.pres={name:$('pr-name').value.trim(),venue:$('pr-venue').value.trim(),date:$('pr-date').value.trim(),kind:$('pr-kind').value};
 return d;}
function fmtCheck(type,d,isNew){var T=fmtType(type),e=[],w=[];
 if(!isAdmin()){var miss=[];
  if(T.ab&&T.ab.req&&!Object.keys(d.abs).some(function(k){return d.abs[k];}))miss.push('Abstract');
  T.s.forEach(function(x){if(x[2]&&!d.secs.some(function(y){return y.h===x[0]&&y.t;}))miss.push(x[0]);});
  if(T.refsReq&&T.s.length&&!d.refs)miss.push('References');
  (T.xreq||[]).forEach(function(k){if(XF[k]&&T.x.indexOf(k)>-1&&!d.x[k])miss.push(XF[k][0]);});
  (T.dreq||[]).forEach(function(k){if(DECL[k]&&T.decl.indexOf(k)>-1&&!d.decl[k])miss.push(DECL[k][0]);});
  document.querySelectorAll('.fmtbox .fu').forEach(function(f){if(f.dataset.req==='1'&&!f.files.length&&!(f.dataset.has&&!isNew)){var sl=T.up.filter(function(s){return s[0]===f.dataset.k;})[0];if(sl)miss.push(fUp(sl).l);}});
  if(miss.length)e.push('Please complete the mandatory items: '+miss.join(', '));}
 if(T.ab){var n=fwc(fmtComposeAbs(T,d.abs));if(n>T.ab.n)w.push('Abstract is '+n+' words (suggested limit '+T.ab.n+').');}
 var body=d.secs.reduce(function(s,x){return s+fwc(x.t);},0);if(T.s.length&&body&&body>T.w[1])w.push('Main text is '+body+' words (suggested limit '+T.w[1]+').');
 document.querySelectorAll('.fmtbox .fu').forEach(function(f){var sl=T.up.filter(function(s){return s[0]===f.dataset.k;})[0],u=sl&&fUp(sl);if(!u)return;Array.prototype.forEach.call(f.files,function(x){if(x.size>25*1024*1024)e.push(x.name+' is larger than 25 MB');var ext='.'+x.name.split('.').pop().toLowerCase();if(u.acc.split(',').indexOf(ext)<0)e.push(x.name+': '+u.l+' accepts '+u.acc);});});
 var figs=document.querySelector('.fmtbox .fu[data-k="fig"]');if(figs&&figs.files.length>T.fig)w.push(figs.files.length+' figures uploaded (suggested limit '+T.fig+').');
 return {e:e,w:w};}
/* upload chosen files; returns file records */
async function fmtUpload(sid,type,prev){var T=fmtType(type),out=(prev||[]).slice(),main=null;
 var inputs=document.querySelectorAll('.fmtbox .fu');
 for(var i=0;i<inputs.length;i++){var f=inputs[i],k=f.dataset.k;if(!f.files.length)continue;
  out=out.filter(function(x){return x.slot!==k;});
  var caps=Array.prototype.map.call(document.querySelectorAll('.figcaps .fcap'),function(c){return c.value.trim();});
  for(var j=0;j<f.files.length;j++){var x=f.files[j];
   if(k==='manuscript'){await DB.putFile(fileKey(sid),x);main=x.name;continue;}
   var key=fileKey(sid)+'__'+k+(j+1);await DB.putFile(key,x);out.push({slot:k,key:key,name:x.name,size:x.size,caption:k==='fig'?(caps[j]||''):''});}}
 /* captions edited without new files */
 if(!document.querySelector('.fmtbox .fu[data-k="fig"]')||!document.querySelector('.fmtbox .fu[data-k="fig"]').files.length){var cs=document.querySelectorAll('.figcaps .fcap'),fi=0;out.forEach(function(r){if(r.slot==='fig'){if(cs[fi])r.caption=cs[fi].value.trim();fi++;}});}
 return {files:out,main:main};}

/* live counters, figure legends, standard wording, conference toggle */
function fmtCounters(){var tp=$('sf-type')?$('sf-type').value:(window.__fmtEditType||'');if(!tp||!document.querySelector('.fmtbox'))return;var T=fmtType(tp),d=fmtRead(tp);
 if($('wc-abs')&&T.ab){var n=fwc(fmtComposeAbs(T,d.abs));$('wc-abs').innerHTML=n+' / '+T.ab.n+' words';$('wc-abs').className='wcc'+(n>T.ab.n?' over':'');}
 var body=d.secs.reduce(function(s,x){return s+fwc(x.t);},0);if($('wc-body')){$('wc-body').innerHTML=body+' words (target '+T.w[0].toLocaleString()+'&ndash;'+T.w[1].toLocaleString()+')';$('wc-body').className='wcc'+(body>T.w[1]?' over':'');}}
document.addEventListener('input',function(e){if(e.target.closest&&e.target.closest('.fmtbox'))fmtCounters();});
document.addEventListener('change',function(e){var t=e.target;
 if(t.id==='sf-type'&&$('fmt-area')){var keep=fmtRead(t.dataset.prev||t.value);$('fmt-area').innerHTML=fmtForm(t.value,{abs:{},secs:keep.secs,decl:keep.decl,refs:keep.refs,pres:keep.pres});t.dataset.prev=t.value;fmtCounters();if($('sf-apc')&&typeof apcSubNote==='function')$('sf-apc').innerHTML=apcSubNote(t.value);}
 if(t.id==='pr-on'&&$('pr-box'))$('pr-box').style.display=t.checked?'':'none';
 if(t.classList&&t.classList.contains('fu')&&t.dataset.k==='fig'){var box=t.parentNode.querySelector('.figcaps');if(box)box.innerHTML=Array.prototype.map.call(t.files,function(f,i){return '<div class="fg"><label>Figure '+(i+1)+' legend ('+esc(f.name)+')</label><input class="fcap" placeholder="Short title. Explanation of panels, arrows, stains, magnification and abbreviations."></div>';}).join('');}});
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('.usetpl');if(!a)return;e.preventDefault();var ta=a.closest('.fg').querySelector('textarea');if(ta&&(!ta.value.trim()||confirm('Replace the current text with the standard wording?'))){ta.value=a.dataset.v;}});

/* --------------------------- authors: one card per author --------------------------- */
var AUTH_F=[['name','Full name','Dr. A. B. Sharma'],['desig','Designation','Assistant Professor'],['dept','Department','Department of Pharmacology'],['inst','Institution','Name of college / hospital / university'],['place','City, State, Country','Chhatrapati Sambhajinagar, Maharashtra, India'],['email','E-mail','name@example.org'],['phone','Phone',''],['orcid','ORCID iD','0000-0000-0000-0000'],['qual','Qualifications','MBBS, MD']];
function authCard(a,i){a=a||{};return '<div class="aucard" data-i="'+i+'"><div class="auhd"><b>Author '+(i+1)+'</b><label class="aucorr"><input type="radio" name="au-corr"'+(a.corr?' checked':'')+'> Corresponding author</label><span class="aubtn"><button type="button" class="btn sm ghost" data-act="auup" title="Move up">&uarr;</button><button type="button" class="btn sm ghost" data-act="audn" title="Move down">&darr;</button><button type="button" class="btn sm red" data-act="aurm" title="Remove">&times;</button></span></div>'
 +'<div class="augrid">'+AUTH_F.map(function(f){return '<div class="fg"><label>'+esc(f[1])+rq(f[3])+'</label><input data-f="'+f[0]+'" value="'+esc(a[f[0]]||'')+'" placeholder="'+esc(f[2])+'"></div>';}).join('')+'</div></div>';}
function authBlock(list){list=(list&&list.length?list:[{corr:true}]);return '<div class="fg"><label>Authors <span class="auhint">in the order they should appear in the article &middot; leave unused boxes empty &middot; use "Add author" for more than six</span></label><div id="au-list">'+list.map(authCard).join('')+'</div><button type="button" class="btn ghost" data-act="auadd">+ Add author</button></div>';}
function authRenum(){document.querySelectorAll('#au-list .aucard').forEach(function(c,i){c.dataset.i=i;c.querySelector('.auhd b').textContent='Author '+(i+1);});}
function authRead(){var list=[];document.querySelectorAll('#au-list .aucard').forEach(function(c){var a={};c.querySelectorAll('input[data-f]').forEach(function(e){a[e.dataset.f]=e.value.trim();});a.corr=c.querySelector('input[name="au-corr"]').checked;if(AUTH_F.some(function(f){return a[f[0]];}))list.push(a);});
 if(list.length&&!list.some(function(a){return a.corr;}))list[0].corr=true;
 var raw=list.map(function(a){var aff=[a.desig,a.dept,a.inst,a.place].filter(Boolean).join(', ');return [a.name||'Author',aff,a.orcid].filter(function(x,i){return i===0||x;}).join(' | ').replace(/ \| $/,'');}).join('\n');
 var c=list.filter(function(a){return a.corr;})[0];return {list:list,raw:raw,corr:c?[c.name,c.email].filter(Boolean).join(', '):''};}
function authFromSub(s){if(s.fmt&&s.fmt.authors&&s.fmt.authors.length)return s.fmt.authors;var cr=String(s.corr||'').toLowerCase();
 return parseAuthors(s.authorsRaw||'').map(function(x,i){var em=(cr.indexOf(String(x.name).toLowerCase())>-1)?(String(s.corr).match(/[^\s,;<>()]+@[^\s,;<>()]+/)||[''])[0]:'';return {name:x.name,inst:x.aff||'',orcid:x.orcid||'',email:em,corr:!!em||(!cr&&i===0)};});}
Object.assign(ACT,{
 auadd:function(){var l=$('au-list');l.insertAdjacentHTML('beforeend',authCard({},l.children.length));var c=l.lastElementChild;c.querySelector('input').focus();},
 aurm:function(t){var c=t.closest('.aucard'),l=$('au-list');if(l.children.length<2){c.querySelectorAll('input[data-f]').forEach(function(e){e.value='';});return;}var hasText=Array.prototype.some.call(c.querySelectorAll('input[data-f]'),function(e){return e.value.trim();});if(hasText&&!confirm('Remove this author?'))return;c.remove();authRenum();},
 auup:function(t){var c=t.closest('.aucard');if(c.previousElementSibling)c.parentNode.insertBefore(c,c.previousElementSibling);authRenum();},
 audn:function(t){var c=t.closest('.aucard');if(c.nextElementSibling)c.parentNode.insertBefore(c.nextElementSibling,c);authRenum();}
});

/* --------------------------- submission page --------------------------- */
SUB_TYPES=FTYPES.map(function(x){return x.t;});
vSubmit=function(){var u=curUser();if(!u)return hd('Submit manuscript')+pg('<div class="card">Please <a href="#/login">login</a> or <a href="#/register">register as an author</a> to submit a manuscript. Read the <a href="#/guidelines">author guidelines</a> first.</div>');
 var t0=SUB_TYPES[0];
 return hd('Submit manuscript','Choose the article type first: the form below changes to the sections, limits and files that type needs.')+pg('<div class="card fmtform">'
  +'<div class="row2"><div class="fg"><label>Article type</label><select id="sf-type" data-prev="'+esc(t0)+'">'+opt(SUB_TYPES,t0)+'</select></div><div class="fg"><label>Subject area (branch)</label><select id="sf-branch">'+(typeof branchOpts==='function'?branchOpts(''):'')+'</select></div></div>'
  +'<div class="fg"><label>Manuscript title</label><input id="sf-title"></div>'
  +authBlock([{name:u.name,email:u.email,inst:u.aff||'',corr:true},{},{},{},{},{}])
  +'<div class="fg"><label>Keywords (comma separated)</label><input id="sf-kw"></div>'
  +'<div id="fmt-area">'+fmtForm(t0,{},'new')+'</div>'
  +'<div class="fg"><label>Cover note to the editor (optional)</label><textarea id="sf-note" rows="3"></textarea></div>'
  +'<div class="note" id="sf-apc" style="font-size:13px">'+(typeof apcSubNote==='function'?apcSubNote(t0):'')+'</div>'
  +'<label style="display:block;margin:10px 0"><input type="checkbox" id="sf-ok"> I confirm the work is original, not under review elsewhere, all authors approve the submission, and the declarations above are true.</label>'
  +'<button class="btn" data-act="subsubmit">Submit manuscript</button> <span id="sf-prog" style="font-size:13px;color:#5b6b7c"></span></div>');};

ACT.subsubmit=async function(){var g=function(i){return $(i)?$(i).value.trim():'';},u=curUser(),type=g('sf-type'),T=fmtType(type);
 var kw=g('sf-kw').split(/[,;]/).map(function(x){return x.trim();}).filter(Boolean);
 var d=fmtRead(type),chk=fmtCheck(type,d,true),au=authRead();
 if(chk.e.length){toast(chk.e.slice(0,3).join('; '));return;}
 if(chk.w.length&&!confirm(chk.w.join('\n')+'\n\nSubmit anyway? The editor may ask you to shorten it.'))return;
 var id=uid();$('sf-prog').textContent='Uploading files...';
 var up;try{up=await fmtUpload(id,type,[]);}catch(e){$('sf-prog').textContent='';toast('Upload failed: '+e.message);return;}
 var abstract=fmtComposeAbs(T,d.abs)||(d.conf?'':'');
 var s={id:id,authorId:u.id,authorName:u.name,authorEmail:u.email,title:g('sf-title')||'Untitled manuscript',type:type,branch:g('sf-branch'),authorsRaw:au.raw||u.name,corr:au.corr||(u.name+', '+u.email),keywords:kw,abstract:abstract,note:g('sf-note'),status:'Submitted',date:today(),created:Date.now(),hasFile:!!up.main,fileName:up.main||'',
  fmt:{v:1,type:type,authors:au.list,abs:d.abs,secs:d.secs,decl:d.decl,x:d.x,conf:d.conf,pres:d.pres,refs:d.refs,files:up.files,mainName:up.main||''},history:[{d:today(),t:'Submitted by author'}]};
 try{await saveSub(s);}catch(e){$('sf-prog').textContent='';toast('Submission failed: '+e.message);return;}
 ensureRef(s);s.history.push({d:today(),t:'Acknowledgement issued ('+s.ref+')'});await saveSub(s);if(typeof mReceived==='function')mReceived(s);
 toast('Received - reference '+s.ref+'. Confirmation email prepared.');location.hash='#/sub/'+s.id;};

/* --------------------------- submission view (author / editor) --------------------------- */
function fmtView(s){var f=s.fmt;if(!f){if(!isAdmin())return '';return '<div class="card fmtview" id="fmtview"><h3>Manuscript content</h3><p class="note" style="font-size:13px">This manuscript was submitted with the earlier form (abstract and file only). You can add the sections, declarations and files in the new structured format.</p><p><button class="btn gold" data-act="fmtedit" data-id="'+s.id+'">Add structured content</button></p></div>';}var T=fmtType(s.type),ed=isAdmin(),u=curUser(),canEdit=ed||(u&&u.id===s.authorId&&(s.status==='Submitted'||s.status==='Revision requested'));
 var h='<div class="card fmtview" id="fmtview"><h3>Manuscript as submitted <small style="font-weight:400;color:#667">('+esc(s.type)+')</small></h3>';
 if(f.conf&&f.conf.name)h+='<p><b>Conference:</b> '+esc(fmtConfText({kind:f.conf.kind,name:f.conf.name,venue:f.conf.venue,date:f.conf.date}))+(f.conf.presenter?' Presenting author: '+esc(f.conf.presenter)+'.':'')+'</p>';
 if(T.ab)h+='<h4>Abstract</h4><div class="body">'+fmt(fmtComposeAbs(T,f.abs||{})||s.abstract||'',{},{})+'</div>';
 (f.secs||[]).forEach(function(x){if(x.t)h+='<h4>'+esc(x.h)+'</h4><div class="body">'+fmt(x.t,{},{})+'</div>';});
 if(f.refs)h+='<h4>References</h4><ol class="fref">'+f.refs.split('\n').map(function(r){return r.replace(/^\s*\[?\d+[\].)]?\s*/,'').trim();}).filter(Boolean).map(function(r){return '<li>'+esc(r)+'</li>';}).join('')+'</ol>';
 var xs=Object.keys(f.x||{}).filter(function(k){return XF[k]&&f.x[k];});if(xs.length)h+='<h4>Registration and reporting</h4><p>'+xs.map(function(k){return '<b>'+esc(XF[k][0])+':</b> '+esc(f.x[k]);}).join('<br>')+'</p>';
 if(f.x&&f.x.consentOk)h+='<p><b>Consent for publication:</b> confirmed by the author.</p>';
 var dk=Object.keys(f.decl||{}).filter(function(k){return f.decl[k];});if(dk.length)h+='<h4>Declarations</h4><table class="t">'+dk.map(function(k){return '<tr><th style="width:28%">'+esc((DECL[k]||[k])[0])+'</th><td>'+esc(f.decl[k])+'</td></tr>';}).join('')+'</table>';
 if(f.pres&&f.pres.name)h+='<p><b>Prior presentation:</b> '+esc(fmtConfText(f.pres))+'</p>';
 var files=(f.files||[]);h+='<h4>Uploaded files</h4><table class="t">'+(s.hasFile?'<tr><td>Main manuscript</td><td>'+esc(s.fileName)+'</td><td><button class="btn sm teal" data-act="subfile" data-id="'+s.id+'">Download</button></td></tr>':'')
  +files.map(function(x){var u=UP[x.slot]||{l:x.slot};return '<tr><td>'+esc(u.l)+(x.caption?'<div class="hint">'+esc(x.caption)+'</div>':'')+'</td><td>'+esc(x.name)+'</td><td><button class="btn sm ghost" data-act="fmtfile" data-id="'+s.id+'" data-key="'+esc(x.key)+'">Download</button></td></tr>';}).join('')+(!s.hasFile&&!files.length?'<tr><td colspan="3">No files.</td></tr>':'')+'</table>';
 if(canEdit)h+='<p><button class="btn gold" data-act="fmtedit" data-id="'+s.id+'">'+(ed?'Edit submitted content':'Edit my submission')+'</button>'+(ed&&s.articleId?' <a class="btn ghost" href="#/admin/edit/'+s.articleId+'">Open article draft</a>':'')+'</p>';
 return h+'</div>';}
if(typeof vSub==='function'){var _fmtVSub=vSub;vSub=function(id){var h=_fmtVSub(id),s=findSub(id);if(!s||!canSee(s)||(!s.fmt&&!isAdmin()))return h;
 var i1=h.indexOf('<div class="card">'),i2=i1>-1?h.indexOf('<div class="card',i1+10):-1,v=fmtView(s);
 return i2>-1?h.slice(0,i2)+v+h.slice(i2):h+v;};}
Object.assign(ACT,{
 fmtfile:async function(t){var s=findSub(t.dataset.id);var r=((s&&s.fmt&&s.fmt.files)||[]).filter(function(x){return x.key===t.dataset.key;})[0];var b=await DB.getFile(t.dataset.key);if(b)download(b,(r&&r.name)||'file');else toast('File not found.');},
 fmtedit:function(t){var s=findSub(t.dataset.id);if(!s)return;window.__fmtEditType=s.type;window.__fmtEditId=s.id;var f=s.fmt||{abs:fmtSplitAbs(fmtType(s.type),s.abstract||''),secs:[],decl:{},mainName:s.fileName||''};
  $('fmtview').innerHTML='<h3>Edit submitted content</h3>'+(isAdmin()?'<div class="row2"><div class="fg"><label>Article type</label><select id="fe-type">'+opt(FTYPES.map(function(x){return x.t;}).concat(FTYPES.some(function(x){return x.t===s.type;})?[]:[s.type]),s.type)+'</select></div><div class="fg"><label>Title</label><input id="fe-title" value="'+esc(s.title)+'"></div></div>'+authBlock(authFromSub(s))+'<div class="fg"><label>Keywords</label><input id="fe-kw" value="'+esc((s.keywords||[]).join(', '))+'"></div>':'')
   +'<div id="fe-area">'+fmtForm(s.type,f,'edit')+'</div><p><button class="btn teal" data-act="fmtsave" data-id="'+s.id+'">Save changes</button> <button class="btn ghost" type="button" onclick="route()">Cancel</button></p>';fmtCounters();},
 fmtsave:async function(t){var s=findSub(t.dataset.id);if(!s)return;var type=$('fe-type')?$('fe-type').value:s.type,T=fmtType(type),d=fmtRead(window.__fmtEditType||s.type);
  if(!isAdmin()){var ck=fmtCheck(window.__fmtEditType||s.type,d,false);if(ck.e.length){toast(ck.e.slice(0,3).join('; '));return;}}
  var up;try{up=await fmtUpload(s.id,type,(s.fmt&&s.fmt.files)||[]);}catch(e){toast('Upload failed: '+e.message);return;}
  s.fmt=Object.assign({},s.fmt||{},{v:1,type:type,abs:d.abs,secs:d.secs,decl:d.decl,x:d.x,conf:d.conf,pres:d.pres,refs:d.refs,files:up.files});if(up.main){s.fmt.mainName=up.main;s.fileName=up.main;s.hasFile=true;}
  s.abstract=fmtComposeAbs(T,d.abs)||s.abstract;if($('fe-type')){s.type=type;s.title=$('fe-title').value.trim()||s.title;var au=authRead();if(au.list.length){s.authorsRaw=au.raw;s.corr=au.corr;s.fmt.authors=au.list;}s.keywords=$('fe-kw').value.split(/[,;]/).map(function(x){return x.trim();}).filter(Boolean);}
  s.history.push({d:today(),t:(isAdmin()?'Content edited by editorial office':'Submission content updated by author')});await saveSub(s);
  if(isAdmin()&&s.articleId){var a=findArt(s.articleId);if(a&&a.status!=='published'&&confirm('Also update the article draft with these changes?'))await fmtToArticle(s,a);}
  window.__fmtEditType='';toast('Saved.');route();}
});
document.addEventListener('change',function(e){if(e.target.id==='fe-type'&&$('fe-area')){var keep=fmtRead(window.__fmtEditType),s=findSub(window.__fmtEditId)||{};window.__fmtEditType=e.target.value;$('fe-area').innerHTML=fmtForm(e.target.value,{secs:keep.secs,decl:keep.decl,refs:keep.refs,pres:keep.pres,files:(s.fmt||{}).files,mainName:(s.fmt||{}).mainName},'edit');fmtCounters();}});

/* --------------------------- submission -> article draft --------------------------- */
function blobToData(b){return new Promise(function(res){var r=new FileReader();r.onload=function(){res(r.result);};r.onerror=function(){res('');};r.readAsDataURL(b);});}
async function fmtToArticle(s,a){var f=s.fmt||{},T=fmtType(s.type);
 a.type=s.type;a.title=s.title;a.authorsRaw=s.authorsRaw;a.corr=s.corr;a.keywords=s.keywords||[];a.branch=s.branch||a.branch||'';
 a.abstract=fmtComposeAbs(T,f.abs||{})||s.abstract||'';
 var secs=(f.secs||[]).filter(function(x){return x.t;}).map(function(x){return {heading:x.h,text:x.t};});
 a.sections=secs.length?secs:(TEMPLATES[s.type]||['']).map(function(h){return {heading:h,text:''};});
 if(f.refs)a.refs=f.refs;
 var dl=f.decl||{};['ethics','consent','funding','coi','contrib','data','aiUse','ack'].forEach(function(k){if(dl[k])a[k]=dl[k];});
 var x=f.x||{};if(x.reg)a.reg=x.reg;if(x.guide)a.guide=x.guide;if(x.accession)a.accession=x.accession;if(x.code)a.data=(a.data?a.data+' ':'')+'Code: '+x.code;
 if(f.pres&&f.pres.name)a.confPres=fmtConfText(f.pres);
 if(f.conf&&f.conf.name){a.design='Abstract presented at '+f.conf.name+(f.conf.venue?', '+f.conf.venue:'')+(f.conf.date?', '+f.conf.date:'');a.confPres=fmtConfText(f.conf)+(f.conf.presenter?' Presenting author: '+f.conf.presenter+'.':'');}
 var figs=(f.files||[]).filter(function(r){return r.slot==='fig'&&/\.(jpe?g|png)$/i.test(r.name);}),out=[];
 for(var i=0;i<figs.length;i++){var b=await DB.getFile(figs[i].key);if(b){var du=await blobToData(b);if(du)out.push({data:du,caption:String(figs[i].caption||'').replace(/^\s*fig(ure)?\.?\s*\d+[.:]?\s*/i,'')});}}
 if(out.length&&!(a.figures||[]).length)a.figures=out;
 await saveArt(a);return a;}
ACT.subconvert=async function(t){var s=findSub(t.dataset.id),c=calIssue();if(!s)return;
 if(s.articleId&&findArt(s.articleId)){location.hash='#/admin/edit/'+s.articleId;return;}
 var a={id:uid(),figures:[],refs:'',ack:'',funding:'',coi:'',ethics:'',data:'',vol:volOf(c.year),issue:c.issue,year:c.year,period:periodOf(c.year,c.issue),pages:'',artno:'',doi:'',received:s.date,revised:'',accepted:(s.decision&&s.decision.date)||today(),published:today(),license:S.license,status:'draft',views:0,downloads:0,created:Date.now(),hasPdf:false,pdfName:'',subId:s.id};
 toast('Building the article draft from the submission...');
 try{await fmtToArticle(s,a);}catch(e){toast('Could not create the draft: '+e.message);return;}
 s.articleId=a.id;s.history.push({d:today(),t:'Converted to article draft (all submitted sections, declarations and figures carried over)'});await saveSub(s);toast('Draft created with the author\'s content. Review, complete and publish.');location.hash='#/admin/edit/'+a.id;};

/* --------------------------- article editor --------------------------- */
FTYPES.forEach(function(x){TEMPLATES[x.t]=x.s.length?x.s.map(function(y){return y[0];}):[''];});
['Editorial','Commentary / Viewpoint'].forEach(function(t){if(!TEMPLATES[t])TEMPLATES[t]=t==='Editorial'?['']:['Introduction','Main Text','Conclusion'];});
if(typeof types!=='undefined')types=Object.keys(TEMPLATES);
if(typeof TYPE_ORDER!=='undefined')TYPE_ORDER=FTYPES.map(function(x){return x.t;}).concat(['Editorial','Commentary / Viewpoint']);
if(typeof vEditor==='function'){var _fmtVE=vEditor;vEditor=function(id){var h=_fmtVE(id),a=(id&&findArt(id))||{};
 return h.replace('<h4>Issue and publication details</h4>','<div class="fg"><label>Prior presentation (conference abstract)</label><input id="f-confp" value="'+esc(a.confPres||'')+'" placeholder="Presented as a poster at [conference], [city], [date]."></div><h4>Issue and publication details</h4>');};}
if(typeof collect==='function'){var _fmtCol=collect;collect=function(st){var a=_fmtCol(st),e=$('f-confp');if(e)a.confPres=e.value.trim();return a;};}

/* --------------------------- styles --------------------------- */
(function(){var c=document.createElement('style');c.textContent=
 '.fmtbox{margin-top:6px}.fmtinfo{background:#f4f8fb;border-left:4px solid var(--teal,#0E7C7B);padding:10px 14px;margin:6px 0 14px;font-size:13.5px;line-height:1.5}'
+'.fmtinfo .lims{display:flex;flex-wrap:wrap;gap:4px 16px;margin-top:6px;font-size:12.5px;color:#334}.fmtinfo .rg{margin-top:4px;font-size:12.5px;color:#556}'
+'.fsec{margin:18px 0 8px;padding-bottom:4px;border-bottom:1px solid #d6dde6;color:var(--navy,#0D2B4E)}.fsec small{font-weight:400}.wcc{color:#2b7a4b;font-size:12px}.wcc.over{color:#b42318;font-weight:700}'
+'.fsecrow .hint,.upt .hint,.fmtview .hint{font-size:12px;color:#5b6b7c;margin:2px 0 4px;line-height:1.4}.upt td{vertical-align:top}.upt input[type=file]{max-width:100%}.rq{display:inline-block;font-size:11px;color:#fff;background:#b42318;border-radius:3px;padding:0 5px;margin-left:4px}'
+'.ck{display:block;margin:8px 0;font-size:14px}.ck input{width:auto;margin-right:6px}.usetpl{font-weight:400;font-size:12px;margin-left:6px}.fref{font-size:13px;padding-left:22px}.figcaps .fg{margin:6px 0 0}'
+'.aucard{border:1px solid #d6dde6;border-radius:6px;padding:10px 12px 4px;margin:0 0 10px;background:#fbfcfd}.auhd{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:6px}.auhd b{color:var(--navy,#0D2B4E)}.aucorr{font-size:13px;margin:0;text-transform:none;letter-spacing:0}.aucorr input{width:auto;margin-right:4px}.aubtn{margin-left:auto;display:flex;gap:4px}.augrid{display:grid;grid-template-columns:repeat(3,1fr);gap:0 12px}.augrid .fg{margin-bottom:8px}.auhint{font-weight:400;text-transform:none;letter-spacing:0;color:#5b6b7c}@media(max-width:800px){.augrid{grid-template-columns:1fr}}'
+'.gl-ph{border:2px dashed #b8c4d2;border-radius:6px;padding:14px;margin:10px 0;text-align:center;color:#6b7a8c;font-size:13px;background:#fafcfe}.gl-img{margin:10px 0;text-align:center}.gl-img img{max-width:100%;border:1px solid #dde3ea;border-radius:4px}.gl-img figcaption{font-size:12.5px;color:#5b6b7c;margin-top:4px}'
+'.gltoc{columns:2;font-size:14px}.gl details{border:1px solid #dde3ea;border-radius:6px;margin:8px 0;background:#fff}.gl details>summary{cursor:pointer;padding:10px 14px;font-weight:700;color:var(--navy,#0D2B4E);font-size:15px}.gl details>div{padding:0 16px 14px}.gl ol.hd li{margin-bottom:4px}.gl .chk li{list-style:none;margin-left:-18px}.gl .chk li:before{content:"\\2610  ";}'
+'.gl pre.decl{white-space:pre-wrap;background:#f6f8fa;border:1px solid #e3e8ee;border-radius:4px;padding:8px 10px;font-size:12.5px}@media(max-width:700px){.gltoc{columns:1}}';
 document.head.appendChild(c);})();

/* ==========================================================================
   AUTHOR GUIDELINES PAGE (generated from the registry above)
   Example images: the editor uploads them on this page (dashed boxes are
   visible only when logged in as editor); readers see only uploaded images.
   ========================================================================== */
if(typeof DEFAULTS!=='undefined'&&!('glImgs' in DEFAULTS))DEFAULTS.glImgs='';
function glHas(slot){return (','+(S.glImgs||'')+',').indexOf(','+slot+',')>-1;}
function glCap(l){var m=String(l).replace(/\[UPLOAD\s*/,'').replace(/\s*HERE\]/,'').trim().toLowerCase();return 'Example: '+m;}
function glPh(slot,label){if(glHas(slot))return '<figure class="gl-img"><img src="/api/files/gl_'+slot+'?v='+encodeURIComponent(S.glV||'1')+'" alt="'+esc(label)+'" loading="lazy"><figcaption>'+esc(glCap(label))+'</figcaption>'+(isAdmin()?'<div><button class="btn sm ghost" data-act="glrm" data-slot="'+slot+'">Remove image</button></div>':'')+'</figure>';
 if(!isAdmin())return '';return '<div class="gl-ph">'+esc(label)+'<br><input type="file" accept=".jpg,.jpeg,.png" data-gl="'+slot+'" style="margin-top:8px;width:auto"><div style="font-size:11.5px;margin-top:4px">Only editors see this box. Upload a JPG or PNG and it will appear here for authors.</div></div>';}
document.addEventListener('change',async function(e){var t=e.target;if(!t.dataset||!t.dataset.gl||!t.files.length)return;var f=t.files[0];if(f.size>8*1024*1024){toast('Image must be 8 MB or smaller.');return;}
 try{await DB.putFile('gl_'+t.dataset.gl,f);}catch(x){toast('Upload failed: '+x.message);return;}var l=(S.glImgs||'').split(',').filter(Boolean);if(l.indexOf(t.dataset.gl)<0)l.push(t.dataset.gl);S.glImgs=l.join(',');S.glV=String(Date.now());saveSettings();toast('Image added to the guidelines.');route();});
ACT.glrm=function(t){if(!confirm('Remove this example image from the guidelines?'))return;S.glImgs=(S.glImgs||'').split(',').filter(function(x){return x&&x!==t.dataset.slot;}).join(',');saveSettings();route();};
if(typeof DEFAULTS!=='undefined'&&!('glV' in DEFAULTS))DEFAULTS.glV='1';

var GL_PH_BY_TYPE={ms:{'Original Research':[['or-flow','[UPLOAD STUDY FLOWCHART HERE]'],['or-table','[UPLOAD TABLE EXAMPLE HERE]'],['or-fig','[UPLOAD FIGURE 1 HERE]']],'Systematic Review / Meta-analysis':[['sr-prisma','[UPLOAD PRISMA FLOW DIAGRAM HERE]'],['sr-forest','[UPLOAD FIGURE 2 HERE] (forest plot)']],'Review Article':[['rv-algo','[UPLOAD EXPERIMENTAL DIAGRAM HERE] (diagnostic or management algorithm)']],'Case Report':[['cr-clin','[UPLOAD CLINICAL IMAGE HERE]'],['cr-rad','[UPLOAD MRI / CT / X-RAY IMAGE HERE]'],['cr-histo','[UPLOAD HISTOPATHOLOGY IMAGE HERE]']],'Case Series':[['cs-table','[UPLOAD TABLE EXAMPLE HERE] (summary of cases)'],['cs-img','[UPLOAD CLINICAL IMAGE HERE]']],'Short Communication':[['sc-fig','[UPLOAD FIGURE 1 HERE]']],'Clinical Image':[['ci-img','[UPLOAD CLINICAL IMAGE HERE]'],['ci-rad','[UPLOAD MRI / CT / X-RAY IMAGE HERE]']],'Conference Abstract':[]},
 ls:{'Original Research':[['or-flow','[UPLOAD LABORATORY WORKFLOW HERE]'],['or-gel','[UPLOAD FIGURE 1 HERE] (gel electrophoresis / western blot)'],['or-chrom','[UPLOAD FIGURE 2 HERE] (chromatogram)'],['or-table','[UPLOAD TABLE EXAMPLE HERE]']],'Systematic Review / Meta-analysis':[['sr-prisma','[UPLOAD PRISMA FLOW DIAGRAM HERE]']],'Review Article':[['rv-path','[UPLOAD BIOLOGICAL PATHWAY DIAGRAM HERE]']],'Short Communication':[['sc-fig','[UPLOAD FIGURE 1 HERE]']],'Methods and Protocols':[['mp-flow','[UPLOAD LABORATORY WORKFLOW HERE]'],['mp-bio','[UPLOAD BIOINFORMATICS DIAGRAM HERE]']],'Scientific Image':[['si-micro','[UPLOAD MICROSCOPY IMAGE HERE]']],'Conference Abstract':[]}};

function glChecklist(T){var L=['The correct article type ('+T.t+') is selected.','Title page uploaded with all authors, affiliations, ORCID iDs and the corresponding author.'];
 if(T.ab)L.push('Abstract'+(T.ab.h?' with the headings '+T.ab.h.join(', '):'')+', within '+T.ab.n+' words.');else L.push('No abstract (not required for this type).');
 if(T.kw[1])L.push(T.kw[0]+'-'+T.kw[1]+' keywords (MeSH terms where possible).');
 L.push('Main text '+T.w[0].toLocaleString()+'-'+T.w[1].toLocaleString()+' words (excluding abstract, references, tables and legends).');
 if(T.s.length)L.push('All required sections present: '+T.s.filter(function(x){return x[2];}).map(function(x){return x[0];}).join(', ')+'.');
 L.push('Tables (max '+T.tab+') and figures (max '+T.fig+') numbered in order of citation, each cited in the text, with titles or legends.');
 L.push('References: max '+T.refs+', Vancouver style, DOIs included where available.');
 if(T.decl.indexOf('ethics')>-1)L.push('Ethics approval (committee and reference number) and consent statements.');
 if(T.x.indexOf('consentOk')>-1)L.push('Signed patient consent for publication uploaded.');
 if(T.rg&&T.rg!=='Not applicable')L.push('Reporting guideline followed and its checklist uploaded: '+T.rg.split(',')[0]+'.');
 L.push('Declarations completed: '+T.decl.map(function(k){return DECL[k][0];}).join(', ')+'.');
 L.push('Supplementary files uploaded and cited in the text (if any).');L.push('Written permission for any previously published figure or table.');
 return '<ul class="chk">'+L.map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ul>';}
function glType(T,i){var req=T.up.map(fUp);
 return '<details id="gl-t'+i+'"><summary>'+(i+1)+'. '+esc(T.t)+'</summary><div>'
  +'<p>'+esc(T.d)+'</p>'
  +'<table class="t"><tr><th>Main text</th><td>'+T.w[0].toLocaleString()+'&ndash;'+T.w[1].toLocaleString()+' words</td><th>Abstract</th><td>'+(T.ab?(T.ab.h?'Structured, ':'Unstructured, ')+T.ab.n+' words':'Not required')+'</td></tr><tr><th>Keywords</th><td>'+(T.kw[1]?T.kw[0]+'&ndash;'+T.kw[1]:'Optional')+'</td><th>References</th><td>Up to '+T.refs+'</td></tr><tr><th>Tables</th><td>Up to '+T.tab+'</td><th>Figures</th><td>Up to '+T.fig+'</td></tr></table>'
  +(T.ab&&T.ab.h?'<p><b>Abstract headings:</b> '+T.ab.h.map(esc).join(' &middot; ')+'</p>':'')
  +'<h4>Manuscript structure (in this order)</h4><ol class="hd"><li><b>Title page</b> &ndash; title, running title, authors, affiliations, ORCID, corresponding author, word count.</li>'+(T.ab?'<li><b>Abstract</b> and <b>Keywords</b></li>':'')
  +(T.x.indexOf('confDetails')>-1?'<li><b>Conference details</b> &ndash; conference name, venue, dates, oral or poster, presenting author.</li>':'')
  +T.s.map(function(x){return '<li><b>'+esc(x[0])+'</b>'+(x[2]?' (mandatory)':'')+' &ndash; '+esc(x[1])+'</li>';}).join('')
  +T.decl.filter(function(k){return DECL[k];}).map(function(k){return '<li><b>'+esc(DECL[k][0])+'</b></li>';}).join('')
  +(T.s.length?'<li><b>References</b></li><li><b>Tables</b> (each on a separate page, after the references)</li><li><b>Figure legends</b></li>':'')+'</ol>'
  +'<h4>Tables, figures and diagrams</h4><p>'+(T.fig===0&&T.tab===0?'Not expected for this article type.':'Up to '+T.tab+' table(s) and '+T.fig+' figure(s). '+(T.t==='Letter to Editor'?'Visuals only if essential.':'Use visuals only where they add information the text cannot.'))+'</p>'
  +(GL_PH_BY_TYPE[FMT_GRP][T.t]||[]).map(function(p){return glPh(p[0],p[1]);}).join('')
  +'<h4>Files to upload</h4><ul>'+req.map(function(u){return '<li><b>'+esc(u.l)+'</b>'+(u.req?' (mandatory)':'')+(u.h?' &ndash; '+esc(u.h):'')+'</li>';}).join('')+'</ul>'
  +'<h4>Ethics</h4><p>'+esc(T.eth)+'</p><h4>Reporting guideline</h4><p>'+esc(T.rg)+'</p>'
  +'<h4>Submission checklist</h4>'+glChecklist(T)
  +'<p><a class="btn sm" href="#/submit">Submit a '+esc(T.t.toLowerCase())+'</a></p></div></details>';}
var GL_RG=[['CONSORT','Randomised controlled trials','consort-statement.org'],['SPIRIT','Clinical trial protocols','spirit-statement.org'],['STROBE','Observational studies: cohort, case-control, cross-sectional','strobe-statement.org'],['STARD','Diagnostic accuracy studies','equator-network.org'],['TRIPOD','Prediction model studies','tripod-statement.org'],['PRISMA 2020','Systematic reviews and meta-analyses','prisma-statement.org'],['CARE','Case reports and case series','care-statement.org'],['SQUIRE 2.0','Quality-improvement studies','squire-statement.org'],['COREQ / SRQR','Qualitative research','equator-network.org'],['ARRIVE 2.0','Animal research','arriveguidelines.org'],['MIQE','Quantitative PCR experiments','equator-network.org'],['MIAPE','Proteomics experiments','psidev.info'],['FAIR principles','Data and code sharing: findable, accessible, interoperable, reusable','go-fair.org']];
var GL_REFS=[['Journal article','Kumar A, Shah R, Patel M. Outcomes of early laparoscopic cholecystectomy. Indian J Surg. 2023;85(2):210-6. doi:10.1007/s12262-022-03456-1'],['More than six authors','List the first six, then "et al."'],['Book','Sherlock S, Dooley J. Diseases of the liver and biliary system. 12th ed. Oxford: Wiley-Blackwell; 2011.'],['Book chapter','Singh P. Wound healing. In: Rao K, editor. Textbook of surgery. 3rd ed. New Delhi: Elsevier; 2020. p. 45-60.'],['Website','World Health Organization. Antimicrobial resistance [Internet]. Geneva: WHO; 2023 [cited 2026 Nov 21]. Available from: https://www.who.int/'],['Dataset','Author A. Title of dataset [dataset]. Repository; 2024. doi:10.5281/zenodo.0000000'],['Preprint','Author A, Author B. Title. medRxiv [Preprint]. 2025. doi:10.1101/2025.01.01.000000']];
vGuidelines=function(){var ms=FMT_GRP==='ms';
 var img=ms?'clinical photographs, X-ray, CT and MRI images, histopathology, endoscopic and surgical photographs':'microscopy and histology, gel electrophoresis and western blots, chromatograms and spectra, molecular structures, biological pathways and bioinformatics workflows';
 var sec=[];
 sec.push(['gl-over','1. Before you submit','<p>'+esc(S.name)+' ('+esc(S.short)+') publishes peer-reviewed, open-access articles in '+(ms?'all branches of medicine and surgery':'the life sciences')+'. Choose the article type that fits your work: the <a href="#/submit">submission form</a> then shows exactly the sections, word limits and files that type needs.</p><ul><li>Language: clear English (UK or US, used consistently). Use SI units and generic drug names.</li><li>Files: manuscript in Word (DOC or DOCX) or PDF; figures as JPG, PNG or TIFF; tables in Word or Excel. Maximum 25 MB per file.</li><li>Format: A4, 12-point font, double spacing, line and page numbers, tables after the references.</li><li>Review: double-blind. Keep author names out of the main manuscript; put them on the title page.</li><li>Questions: '+esc(S.email)+'</li></ul>'+glPh('sample','[UPLOAD SAMPLE MANUSCRIPT HERE]')]);
 sec.push(['gl-types','2. Article types at a glance','<table class="t"><tr><th>Article type</th><th>Words</th><th>Abstract</th><th>Keywords</th><th>Refs</th><th>Tables</th><th>Figures</th></tr>'+FTYPES.filter(function(T){return !T.off;}).map(function(T,i){return '<tr><td><a href="#" data-gl-open="gl-t'+i+'">'+esc(T.t)+'</a></td><td>'+T.w[0].toLocaleString()+'&ndash;'+T.w[1].toLocaleString()+'</td><td>'+(T.ab?T.ab.n+(T.ab.h?' (structured)':''):'&ndash;')+'</td><td>'+(T.kw[1]?T.kw[0]+'&ndash;'+T.kw[1]:'&ndash;')+'</td><td>'+T.refs+'</td><td>'+T.tab+'</td><td>'+T.fig+'</td></tr>';}).join('')+'</table><p class="note" style="font-size:12.5px">Word counts exclude the abstract, references, tables and figure legends. Editorials and commentaries are by invitation.</p>']);
 sec.push(['gl-detail','3. Detailed guidance for each article type','<p>Open a type to see its structure, what to write under each heading, files, ethics, reporting guideline and checklist.</p>'+FTYPES.filter(function(T){return !T.off;}).map(glType).join('')]);
 sec.push(['gl-title','4. Title page','<ul><li>Full title (concise, no abbreviations) and a running title of up to 50 characters.</li><li>All authors: full name, highest degree, department, institution, city, country and ORCID iD.</li><li>Corresponding author: postal address, e-mail and phone.</li><li>Word counts (abstract and main text) and the number of tables and figures.</li><li>Prior presentation: if the work was presented at a conference, give the conference name, place, date and whether oral or poster. The submission form has a field for this.</li></ul>']);
 sec.push(['gl-fig','5. Tables, figures, images and diagrams','<ul><li><b>Numbering:</b> Arabic numerals in the order first cited (Table 1, Figure 1). Cite every table and figure in the text.</li><li><b>Tables:</b> editable, with a short title above and footnotes below for abbreviations and statistics. No vertical lines; do not repeat data shown in figures.</li><li><b>Figures:</b> '+img+'. Photographs at least 300 dpi, line drawings and graphs 600 dpi. JPG, PNG or TIFF. Use arrows or labels for key findings and add scale bars to micrographs.</li><li><b>Legends:</b> a title sentence, then an explanation of panels, symbols, stains, magnification and abbreviations.</li><li><b>Diagrams and flowcharts:</b> CONSORT, STROBE or PRISMA flow diagrams; '+(ms?'diagnostic or management algorithms; study design diagrams':'laboratory workflows, pathways, experimental and bioinformatics workflows')+'. Supply as editable or high-resolution files.</li><li><b>Graphical abstract</b> (optional): one landscape image (about 1200 x 600 px).</li><li><b>Permissions:</b> obtain written permission to reuse published material and state the source in the legend.</li><li><b>Image integrity:</b> only uniform adjustments of brightness or contrast. No moving, removing or adding of features. Keep original files; full uncropped '+(ms?'images':'gels and blots')+' may be requested.</li></ul>'+glPh('gabs','[UPLOAD GRAPHICAL ABSTRACT HERE]')+glPh('fig2','[UPLOAD FIGURE 2 HERE]')+glPh('suppfig','[UPLOAD SUPPLEMENTARY FIGURE HERE]')]);
 sec.push(['gl-eth','6. Ethics and publication requirements','<ul><li><b>Human research:</b> approval by an institutional ethics committee, following the Declaration of Helsinki and ICMR National Ethical Guidelines (2017). Give the committee name and reference number.</li><li><b>Informed consent:</b> written consent from participants; for case reports, case series and clinical images, written consent for publication.</li><li><b>Patient confidentiality:</b> remove names, initials, hospital numbers, dates and identifiable features.</li>'+(ms?'<li><b>Clinical trials:</b> prospective registration with CTRI or another WHO primary registry before the first participant is enrolled; give the number in the abstract.</li>':'<li><b>Animal research:</b> approval by the institutional animal ethics committee (CPCSEA in India) and ARRIVE reporting.</li><li><b>Biosafety:</b> institutional biosafety committee approval for recombinant DNA, genetically modified organisms and pathogens; state the biosafety level.</li><li><b>Biological samples:</b> permission and material-transfer agreements for samples, strains and cell lines; authenticate cell lines.</li>')+'<li><b>Funding</b> and <b>conflicts of interest:</b> declare all sources and relationships (ICMJE disclosure).</li><li><b>Authorship:</b> all four ICMJE criteria. Others go in the Acknowledgements.</li><li><b>Plagiarism:</b> every submission is checked for similarity.</li><li><b>Duplicate publication:</b> the work must not be published or under review elsewhere (conference abstracts and preprints are allowed if declared).</li><li><b>Data fabrication, falsification and image manipulation</b> are misconduct and are handled under COPE guidance.</li><li><b>Data availability:</b> state where data can be found; share data following the FAIR principles where possible.</li><li><b>Generative AI:</b> AI tools cannot be authors. Describe any use of AI in the declaration; authors are responsible for all content.</li><li><b>Copyright and licence:</b> authors keep copyright; articles are published under '+esc(S.license)+'.</li></ul>']);
 sec.push(['gl-rg','7. Reporting guidelines','<table class="t"><tr><th>Guideline</th><th>Use for</th><th>Website</th></tr>'+GL_RG.filter(function(r){return ms?['ARRIVE 2.0','MIQE','MIAPE'].indexOf(r[0])<0||r[0]==='ARRIVE 2.0':true;}).map(function(r){return '<tr><td><b>'+esc(r[0])+'</b></td><td>'+esc(r[1])+'</td><td>'+esc(r[2])+'</td></tr>';}).join('')+'</table><p>Upload the completed checklist with page numbers.</p>'+glPh('consort','[UPLOAD CONSORT FLOW DIAGRAM HERE]')]);
 sec.push(['gl-ref','8. References','<p>Vancouver style: number references in the order first cited, using numbers in square brackets [1] or [1-3]. Abbreviate journal names as in the NLM catalogue. Give DOIs where available.</p><table class="t">'+GL_REFS.map(function(r){return '<tr><th style="width:22%">'+esc(r[0])+'</th><td>'+esc(r[1])+'</td></tr>';}).join('')+'</table>']);
 var dt=Object.keys(DECL).filter(function(k){return DECL[k][2];}).map(function(k){return '<p><b>'+esc(DECL[k][0])+'</b></p><pre class="decl">'+esc(DECL[k][2])+'</pre>';}).join('')
  +'<p><b>Code availability</b></p><pre class="decl">The code used in this study is available at [repository URL] under the [licence] licence.</pre><p><b>Supplementary materials</b></p><pre class="decl">Supplementary Table S1: [title]. Supplementary Figure S1: [title].</pre><p><b>Prior presentation</b></p><pre class="decl">Part of this work was presented as a [poster / oral presentation] at [conference], [city], [date].</pre>';
 sec.push(['gl-decl','9. Declaration templates','<p>The submission form has a box for each declaration with a "use standard wording" link. Edit the wording to match your study.</p>'+dt]);
 sec.push(['gl-after','10. After acceptance','<ul><li>You will receive an acceptance letter, then galley proofs to check within 48 hours.</li><li>Article processing charges, where applicable, are payable only after acceptance (see <a href="#/apc">APC &amp; waivers</a>).</li><li>On publication every author receives a Certificate of Publication.</li></ul>']);
 return hd('Author Guidelines',esc(S.name)+' ('+esc(S.short)+')')+pg('<div class="gl"><div class="card"><h3>Contents</h3><ol class="gltoc">'+sec.map(function(x){return '<li><a href="#" data-gl-jump="'+x[0]+'">'+x[1].replace(/^\d+\. /,'')+'</a></li>';}).join('')+'</ol></div>'+sec.map(function(x){return '<div class="card" id="'+x[0]+'"><h3>'+x[1]+'</h3>'+x[2]+'</div>';}).join('')+'</div>');};
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('[data-gl-jump],[data-gl-open]');if(!a)return;e.preventDefault();var id=a.dataset.glJump||a.dataset.glOpen,el=document.getElementById(id);if(!el)return;if(el.tagName==='DETAILS')el.open=true;el.scrollIntoView({behavior:'smooth',block:'start'});});

/* ==========================================================================
   ACCEPTANCE LETTER - clean, flowing layout (fits A4 and US Letter)
   ========================================================================== */
acceptHTML=function(s){var a=mailAuthor(s);ensureRef(s);var dt=fmtDate(s.acceptDate||(s.decision&&s.decision.date)||today());
 var B=typeof pubBrand==='function'?pubBrand():{p:'#0D2B4E',a:'#0E7C7B',g:'#B8860B',soft:'#EAF0F6'};
 var logo=typeof pubLogo==='function'?pubLogo():LOGO_SMALL;
 var to=s.corr&&s.corr.indexOf('@')>-1?esc(s.corr).replace(/,\s*/,'<br>'):esc(a.name)+'<br>'+esc(a.email);
 var rows=[['Reference no.',s.ref],['Manuscript title',s.title],['Article type',s.type],['Subject area',s.branch||'-'],['Authors',authNames({authorsRaw:s.authorsRaw})],['Received',fmtDate(s.date)],['Accepted',dt]];
 var apc=S.apcApproved&&typeof apcMail==='function'?apcMail(s):'';
 var css='@page{size:A4;margin:0}*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}html,body{margin:0;background:#fff}'
  +'body{font:10.6pt/1.5 Georgia,"Times New Roman",serif;color:#1c2733}'
  +'.pg{position:relative;width:210mm;height:277mm;margin:10mm auto 0;padding:15mm 19mm 12mm;display:flex;flex-direction:column}'
  +'.fr{position:absolute;inset:5mm 7mm;border:.7mm solid '+B.p+';pointer-events:none}.fr2{position:absolute;inset:6.6mm 8.6mm;border:.25mm solid '+B.g+';pointer-events:none}'
  +'.hd{text-align:center}.hd img{height:19mm;width:auto}.rule{height:.9mm;background:linear-gradient(90deg,'+B.p+' 0 70%,'+B.a+' 70% 88%,'+B.g+' 88%);margin:3mm 0 5mm}'
  +'h1{font:bold 17pt/1.1 Georgia,serif;letter-spacing:2.5pt;text-transform:uppercase;color:'+B.p+';text-align:center;margin:0}.tag{text-align:center;font:bold 7.6pt Arial,sans-serif;letter-spacing:2.2pt;color:'+B.a+';text-transform:uppercase;margin:1.5mm 0 5mm}'
  +'.meta{display:flex;justify-content:space-between;font:9pt Arial,sans-serif;color:#44566b;padding-bottom:2mm;border-bottom:.3mm solid #d5dde6;margin-bottom:4mm}.meta b{color:#1c2733}'
  +'.to{margin:0 0 3mm}.sb{font-weight:bold;color:'+B.p+';margin:0 0 3mm}p{margin:0 0 2.4mm;text-align:justify}'
  +'table{width:100%;border-collapse:collapse;margin:1mm 0 4.5mm;font:9.2pt/1.4 Arial,sans-serif}th{width:36mm;text-align:left;color:'+B.p+';background:'+B.soft+';padding:1.7mm 3mm;border:.25mm solid #c9d3de;vertical-align:top;font-weight:bold}td{padding:1.7mm 3mm;border:.25mm solid #c9d3de;vertical-align:top}'
  +'.nx{display:grid;grid-template-columns:repeat(3,1fr);gap:3mm;margin:0 0 4mm}.nx div{border-top:.8mm solid '+B.a+';background:#f6f9fb;padding:2mm 2.6mm;font:8.6pt/1.4 Arial,sans-serif;color:#33414f}.nx b{display:block;color:'+B.p+';font-size:9pt;margin-bottom:.6mm}'
  +'.sg{margin-top:auto;display:flex;justify-content:space-between;align-items:flex-end;padding-top:2mm}.sg .line{width:58mm;border-top:.35mm solid #1c2733;margin-bottom:1.6mm}.sg .nm{font-weight:bold;color:'+B.p+'}.sg .ds{font:8.8pt/1.45 Arial,sans-serif;color:#44566b}'
  +'.seal{width:29mm;height:29mm;border-radius:50%;border:.6mm solid '+B.p+';box-shadow:inset 0 0 0 1.1mm #fff,inset 0 0 0 1.45mm '+B.g+';display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;font:bold 7.6pt/1.3 Arial,sans-serif;letter-spacing:1pt;color:'+B.p+'}.seal span{font-size:11pt;letter-spacing:1.5pt;margin:.6mm 0}.seal small{font-size:6.8pt;font-weight:normal;letter-spacing:.3pt}'
  +'.ft{margin-top:5mm;padding-top:2.4mm;border-top:.3mm solid #d5dde6;text-align:center;font:8pt/1.45 Arial,sans-serif;color:#5b6b7c}'
  +'.wm{position:absolute;left:50%;top:50%;width:110mm;transform:translate(-50%,-50%);opacity:.045;pointer-events:none}';
 return '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Acceptance-Letter-'+esc(s.ref.replace(/\//g,'-'))+'</title><style>'+css+'</style></head><body><div class="pg"><div class="fr"></div><div class="fr2"></div>'+(typeof LOGO_CIRCLE!=='undefined'?'<img class="wm" src="'+LOGO_CIRCLE+'" alt="">':'')
  +'<div class="hd"><img src="'+logo+'" alt="'+esc(S.name)+'"></div><div class="rule"></div>'
  +'<h1>Letter of Acceptance</h1><div class="tag">Accepted for publication</div>'
  +'<div class="meta"><span>Ref: <b>'+esc(s.ref)+'</b></span><span>Date: <b>'+dt+'</b></span></div>'
  +'<p class="to"><b>To</b><br>'+to+'</p><p class="sb">Subject: Acceptance of your manuscript for publication in '+esc(S.short)+'</p>'
  +'<p>Dear '+esc(a.name)+',</p><p>We are pleased to inform you that, after peer review and editorial evaluation, the manuscript below has been <b>accepted for publication</b> in the <b>'+esc(S.name)+'</b> ('+esc(S.short)+'). Congratulations to you and your co-authors.</p>'
  +'<table>'+rows.map(function(r){return '<tr><th>'+r[0]+'</th><td>'+esc(r[1])+'</td></tr>';}).join('')+'</table>'
  +'<div class="nx"><div><b>1. Production</b>Copyediting and typesetting by the editorial office.</div><div><b>2. Proof approval</b>Please check and approve the galley proof within 48 hours.</div><div><b>3. Publication</b>Published online under the '+esc(S.license)+' licence with a certificate for every author.</div></div>'
  +'<p>'+(apc?esc(apc.trim())+' ':'')+'Please quote the reference number in all correspondence. Thank you for choosing '+esc(S.short)+'.</p>'
  +'<div class="sg"><div>'+signImg(12)+'<div class="line"></div><div class="nm">'+esc(S.editorName||'Editorial Board')+'</div><div class="ds">'+esc(eicLine())+'<br>'+esc(S.email)+'</div></div><div class="seal">ACCEPTED<span>'+esc(S.short)+'</span><small>'+dt+'</small></div></div>'
  +'<div class="ft"><b>'+esc(S.name)+'</b> &middot; '+esc(S.publisher)+(S.address?', '+esc(S.address):'')+(S.issnO?' &middot; E-ISSN '+esc(S.issnO):'')+(S.issnP?' &middot; P-ISSN '+esc(S.issnP):'')+'</div>'
  +'</div><script>window.onload=function(){setTimeout(function(){window.print()},500)}<\/script></body></html>';};
