'use strict';
/* Indexing helpers: Highwire/Google-Scholar meta tags, JSON-LD, sitemap, OAI-PMH, Crossref deposit XML */
const { xesc, hesc } = require('./util');

function parseAuthors(raw) {
  return String(raw || '').split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
    const p = l.split('|').map((x) => x.trim());
    return { name: p[0] || '', aff: p[1] || '', orcid: (p[2] || '').replace(/^https?:\/\/orcid\.org\//, '') };
  });
}
function nameParts(n) {
  const parts = String(n).replace(/^(Dr\.?|Prof\.?|Mr\.?|Ms\.?|Mrs\.?)\s+/i, '').trim().split(/\s+/);
  const sur = parts.length > 1 ? parts.pop() : parts[0] || '';
  return { given: parts.join(' '), surname: sur };
}
function refLines(a) {
  return String(a.refs || '').split('\n').map((l) => l.trim().replace(/^\[?\d+[\].)]\s*/, '')).filter(Boolean);
}
function pageRange(a) {
  const m = String(a.pages || '').match(/^(\S+?)\s*[-\u2013]\s*(\S+)$/);
  return m ? { first: m[1], last: m[2] } : { first: a.pages || a.artno || '', last: '' };
}
const ymd = (d) => String(d || '').replace(/-/g, '/');
const abstractText = (a) => String(a.abstract || '').replace(/\*\*|\*|\^|~/g, '').replace(/\s+/g, ' ').trim();
const realDoi = (a, S) => !!a.doi && !/^10\.x+\//i.test(a.doi) && !/^10\.x+$/i.test(String(S.doiPrefix || ''));

function articleHead(a, S, site) {
  const url = `${site}/article/${encodeURIComponent(a.id)}`;
  const m = [];
  const add = (n, v) => { if (v !== undefined && v !== null && String(v) !== '') m.push(`<meta name="${n}" content="${hesc(v)}">`); };
  add('citation_title', a.title);
  parseAuthors(a.authorsRaw).forEach((x) => { add('citation_author', x.name); if (x.aff) add('citation_author_institution', x.aff); if (x.orcid) add('citation_author_orcid', 'https://orcid.org/' + x.orcid); });
  add('citation_publication_date', ymd(a.published));
  add('citation_online_date', ymd(a.published));
  add('citation_journal_title', S.name);
  add('citation_journal_abbrev', S.abbr);
  add('citation_publisher', S.publisher);
  add('citation_issn', S.issnO || S.issnP);
  add('citation_volume', a.vol);
  add('citation_issue', a.issue);
  const pg = pageRange(a);
  add('citation_firstpage', pg.first); add('citation_lastpage', pg.last);
  if (a.doi) add('citation_doi', a.doi);
  add('citation_language', 'en');
  add('citation_abstract_html_url', url);
  add('citation_pdf_url', url + '/pdf');
  (a.keywords || []).length && add('citation_keywords', (a.keywords || []).join('; '));
  refLines(a).forEach((r) => add('citation_reference', r));
  add('DC.title', a.title); add('DC.type', 'Text.Serial.Journal'); add('DC.identifier', a.doi || url);
  add('DC.language', 'en'); add('DC.rights', a.license || S.license || '');
  const desc = abstractText(a).slice(0, 300);
  m.push(`<meta name="description" content="${hesc(desc)}">`);
  m.push(`<link rel="canonical" href="${hesc(url)}">`);
  m.push(`<meta property="og:title" content="${hesc(a.title)}"><meta property="og:type" content="article"><meta property="og:url" content="${hesc(url)}"><meta property="og:description" content="${hesc(desc)}">`);
  const ld = {
    '@context': 'https://schema.org', '@type': 'ScholarlyArticle', headline: a.title, name: a.title, url,
    datePublished: a.published, inLanguage: 'en', abstract: abstractText(a), keywords: (a.keywords || []).join(', '),
    license: a.license || S.license, isAccessibleForFree: true,
    author: parseAuthors(a.authorsRaw).map((x) => ({ '@type': 'Person', name: x.name, affiliation: x.aff ? { '@type': 'Organization', name: x.aff } : undefined })),
    isPartOf: { '@type': 'PublicationIssue', issueNumber: String(a.issue), datePublished: a.published,
      isPartOf: { '@type': 'PublicationVolume', volumeNumber: String(a.vol), isPartOf: { '@type': 'Periodical', name: S.name, issn: S.issnO || S.issnP || undefined, publisher: { '@type': 'Organization', name: S.publisher } } } },
    ...(a.doi ? { identifier: { '@type': 'PropertyValue', propertyID: 'DOI', value: a.doi }, sameAs: 'https://doi.org/' + a.doi } : {}),
  };
  m.push(`<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`);
  return m.join('\n');
}
/* readable fallback inside <main id="app"> for crawlers without JavaScript */
function articleFallback(a, S) {
  const au = parseAuthors(a.authorsRaw).map((x) => hesc(x.name)).join(', ');
  const refs = refLines(a).map((r) => `<li>${hesc(r)}</li>`).join('');
  return `<article class="seo"><p>${hesc(a.type || '')}</p><h1>${hesc(a.title)}</h1><p>${au}</p><p>${hesc(S.abbr)} ${hesc(a.year)};${hesc(a.vol)}(${hesc(a.issue)})${a.doi ? ' doi:' + hesc(a.doi) : ''}</p><h2>Abstract</h2><p>${hesc(abstractText(a))}</p>${refs ? '<h2>References</h2><ol>' + refs + '</ol>' : ''}<p><a href="/article/${encodeURIComponent(a.id)}/pdf">PDF</a></p></article>`;
}
function injectShell(html, head, fallback, title) {
  let h = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${hesc(title)}</title>`);
  h = h.replace('</head>', head + '\n</head>');
  if (fallback) h = h.replace(/(<main id="app">)(<\/main>)/, `$1${fallback}$2`);
  return h;
}

function sitemap(arts, site) {
  const pages = ['', 'current-issue.html', 'archive.html', 'about.html', 'editorial-board.html', 'author-guidelines.html', 'ethics.html', 'apc.html', 'indexing.html', 'contact.html', 'subjects.html', 'join-as-reviewer.html', 'copyright-form.html'];
  const u = (loc, last) => `<url><loc>${xesc(loc)}</loc>${last ? `<lastmod>${xesc(last)}</lastmod>` : ''}</url>`;
  return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    pages.map((p) => u(`${site}/${p}`)).join('') +
    arts.map((a) => u(`${site}/article/${encodeURIComponent(a.id)}`, a.published)).join('') + '</urlset>';
}

/* ---------- OAI-PMH 2.0 (oai_dc) ---------- */
function oai(req, arts, S, site) {
  const host = new URL(site).host;
  const now = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
  const verb = req.query.verb;
  const idOf = (a) => `oai:${host}:${a.id}`;
  const head = `<?xml version="1.0" encoding="UTF-8"?>\n<OAI-PMH xmlns="http://www.openarchives.org/OAI/2.0/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.openarchives.org/OAI/2.0/ http://www.openarchives.org/OAI/2.0/OAI-PMH.xsd"><responseDate>${now}</responseDate><request${verb ? ` verb="${xesc(verb)}"` : ''}>${xesc(site + '/oai')}</request>`;
  const err = (code, msg) => `${head}<error code="${code}">${xesc(msg)}</error></OAI-PMH>`;
  const stamp = (a) => (a.published ? a.published + 'T00:00:00Z' : now);
  const dc = (a) => {
    const au = parseAuthors(a.authorsRaw);
    return '<oai_dc:dc xmlns:oai_dc="http://www.openarchives.org/OAI/2.0/oai_dc/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.openarchives.org/OAI/2.0/oai_dc/ http://www.openarchives.org/OAI/2.0/oai_dc.xsd">' +
      `<dc:title>${xesc(a.title)}</dc:title>` + au.map((x) => `<dc:creator>${xesc(x.name)}</dc:creator>`).join('') +
      (a.keywords || []).map((k) => `<dc:subject>${xesc(k)}</dc:subject>`).join('') +
      `<dc:description>${xesc(abstractText(a))}</dc:description><dc:publisher>${xesc(S.publisher)}</dc:publisher><dc:date>${xesc(a.published)}</dc:date><dc:type>Text</dc:type><dc:type>${xesc(a.type)}</dc:type><dc:format>application/pdf</dc:format>` +
      `<dc:identifier>${xesc(site + '/article/' + a.id)}</dc:identifier>${a.doi ? `<dc:identifier>doi:${xesc(a.doi)}</dc:identifier>` : ''}<dc:source>${xesc(S.name)} ${xesc(a.year)};${xesc(a.vol)}(${xesc(a.issue)})</dc:source><dc:language>en</dc:language><dc:rights>${xesc(a.license || S.license)}</dc:rights></oai_dc:dc>`;
  };
  const rec = (a) => `<record><header><identifier>${xesc(idOf(a))}</identifier><datestamp>${stamp(a)}</datestamp></header><metadata>${dc(a)}</metadata></record>`;
  const hdr = (a) => `<header><identifier>${xesc(idOf(a))}</identifier><datestamp>${stamp(a)}</datestamp></header>`;
  if (verb === 'Identify') {
    const first = arts.reduce((m, a) => (a.published && a.published < m ? a.published : m), '9999');
    return `${head}<Identify><repositoryName>${xesc(S.name)}</repositoryName><baseURL>${xesc(site + '/oai')}</baseURL><protocolVersion>2.0</protocolVersion><adminEmail>${xesc(S.email)}</adminEmail><earliestDatestamp>${first === '9999' ? '2017-01-01' : first}T00:00:00Z</earliestDatestamp><deletedRecord>no</deletedRecord><granularity>YYYY-MM-DDThh:mm:ssZ</granularity></Identify></OAI-PMH>`;
  }
  if (verb === 'ListMetadataFormats') return `${head}<ListMetadataFormats><metadataFormat><metadataPrefix>oai_dc</metadataPrefix><schema>http://www.openarchives.org/OAI/2.0/oai_dc.xsd</schema><metadataNamespace>http://www.openarchives.org/OAI/2.0/oai_dc/</metadataNamespace></metadataFormat></ListMetadataFormats></OAI-PMH>`;
  if (verb === 'ListSets') return err('noSetHierarchy', 'This repository does not support sets.');
  const from = req.query.from, until = req.query.until;
  if (verb === 'GetRecord') {
    if (req.query.metadataPrefix !== 'oai_dc') return err('cannotDisseminateFormat', 'Only oai_dc is supported.');
    const a = arts.find((x) => idOf(x) === req.query.identifier);
    return a ? `${head}<GetRecord>${rec(a)}</GetRecord></OAI-PMH>` : err('idDoesNotExist', 'No such record.');
  }
  if (verb === 'ListRecords' || verb === 'ListIdentifiers') {
    if (req.query.metadataPrefix !== 'oai_dc') return err('badArgument', 'metadataPrefix=oai_dc is required.');
    let l = arts.filter((a) => (!from || stamp(a).slice(0, from.length) >= from) && (!until || stamp(a).slice(0, until.length) <= until));
    if (!l.length) return err('noRecordsMatch', 'No records match.');
    return `${head}<${verb}>${l.map(verb === 'ListRecords' ? rec : hdr).join('')}</${verb}></OAI-PMH>`;
  }
  return err('badVerb', 'Illegal OAI verb.');
}

/* ---------- Crossref deposit XML (schema 5.3.1) ---------- */
function crossrefXml(arts, S, site, depositor) {
  const ts = new Date().toISOString().replace(/\D/g, '').slice(0, 17);
  const groups = new Map();
  arts.forEach((a) => { const k = `${a.vol}|${a.issue}|${a.year}`; if (!groups.has(k)) groups.set(k, []); groups.get(k).push(a); });
  const j = `<journal_metadata><full_title>${xesc(S.name)}</full_title><abbrev_title>${xesc(S.abbr)}</abbrev_title>${S.issnP ? `<issn media_type="print">${xesc(S.issnP)}</issn>` : ''}${S.issnO ? `<issn media_type="electronic">${xesc(S.issnO)}</issn>` : ''}</journal_metadata>`;
  const date = (d) => { const p = String(d || '').split('-'); return `<publication_date media_type="online">${p[1] ? `<month>${p[1]}</month>` : ''}${p[2] ? `<day>${p[2]}</day>` : ''}<year>${p[0]}</year></publication_date>`; };
  let body = '';
  for (const [k, list] of groups) {
    const [vol, issue] = k.split('|');
    const first = list[0];
    body += `<journal>${j}<journal_issue>${date(first.published)}<journal_volume><volume>${xesc(vol)}</volume></journal_volume><issue>${xesc(issue)}</issue></journal_issue>`;
    list.forEach((a) => {
      const au = parseAuthors(a.authorsRaw);
      const refs = refLines(a);
      const pg = pageRange(a);
      body += `<journal_article publication_type="full_text"><titles><title>${xesc(a.title)}</title></titles><contributors>${au.map((x, i) => {
        const p = nameParts(x.name);
        return `<person_name sequence="${i === 0 ? 'first' : 'additional'}" contributor_role="author">${p.given ? `<given_name>${xesc(p.given)}</given_name>` : ''}<surname>${xesc(p.surname)}</surname>${x.aff ? `<affiliations><institution><institution_name>${xesc(x.aff)}</institution_name></institution></affiliations>` : ''}${x.orcid ? `<ORCID>https://orcid.org/${xesc(x.orcid)}</ORCID>` : ''}</person_name>`;
      }).join('')}</contributors>${date(a.published)}${pg.first ? `<pages><first_page>${xesc(pg.first)}</first_page>${pg.last ? `<last_page>${xesc(pg.last)}</last_page>` : ''}</pages>` : ''}<doi_data><doi>${xesc(a.doi)}</doi><resource>${xesc(site + '/article/' + a.id)}</resource></doi_data>${refs.length ? `<citation_list>${refs.map((r, i) => `<citation key="ref${i + 1}"><unstructured_citation>${xesc(r)}</unstructured_citation></citation>`).join('')}</citation_list>` : ''}</journal_article>`;
    });
    body += '</journal>';
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n<doi_batch xmlns="http://www.crossref.org/schema/5.3.1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="5.3.1" xsi:schemaLocation="http://www.crossref.org/schema/5.3.1 https://www.crossref.org/schemas/crossref5.3.1.xsd"><head><doi_batch_id>${xesc(S.short)}-${ts}</doi_batch_id><timestamp>${ts}</timestamp><depositor><depositor_name>${xesc(depositor.name)}</depositor_name><email_address>${xesc(depositor.email)}</email_address></depositor><registrant>${xesc(S.publisher)}</registrant></head><body>${body}</body></doi_batch>`;
}

module.exports = { parseAuthors, articleHead, articleFallback, injectShell, sitemap, oai, crossrefXml, realDoi, refLines };
