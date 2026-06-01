const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.join(__dirname, '..');

function getStructuredData(html) {
  const match = html.match(/<script id="news-structured-data" type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/);
  assert.ok(match, 'Expected profile JSON-LD script to exist');
  return JSON.parse(match[1]);
}

test('page includes visible section-specific hashtag context for SEO topics', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const css = fs.readFileSync(path.join(root, 'css', 'styles.css'), 'utf8');
  const data = fs.readFileSync(path.join(root, 'js', 'data.js'), 'utf8');

  const tagCloudCount = (html.match(/class="seo-tag-cloud/g) || []).length;
  assert.ok(tagCloudCount >= 9, 'Expected hashtag context across the major page sections');

  [
    '#AIResearchScientist',
    '#DeepLearning',
    '#MedicalImagingAI',
    '#BiomedicalSignalProcessing',
    '#ComputerVision',
    '#SmartAgricultureAI',
    '#GoogleScholar',
    '#ScopusAuthor',
    '#ResearchPublications',
    '#DOSTATLANTIS',
    '#AIConsulting',
    '#ResearchCollaboration'
  ].forEach((tag) => {
    assert.match(html, new RegExp(tag.replace('#', '\\#')));
  });

  assert.match(html, /"keywords": "AI research scientist, deep learning researcher, biomedical signal processing/);
  assert.match(html, /"Health informatics"/);
  assert.match(data, /Search Topics: #AIResearchScientist #DeepLearning #MedicalImagingAI/);
  assert.match(css, /\.seo-tag-cloud\{/);
  assert.match(css, /\.seo-tag-cloud span\{/);
  const tagRule = css.match(/\.seo-tag-cloud span\{(?<rule>[\s\S]*?)\}/)?.groups?.rule || '';
  assert.match(tagRule, /background:#eff6ff/);
  assert.match(tagRule, /color:#1d4ed8/);
  assert.doesNotMatch(tagRule, /color:#dbeafe/);
  assert.doesNotMatch(css, /\.seo-tag-cloud[\s\S]{0,240}display\s*:\s*none/);
  assert.doesNotMatch(css, /\.seo-tag-cloud[\s\S]{0,240}visibility\s*:\s*hidden/);
});

test('person structured data provides a clear about context for entity panels', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const css = fs.readFileSync(path.join(root, 'css', 'styles.css'), 'utf8');
  const data = fs.readFileSync(path.join(root, 'js', 'data.js'), 'utf8');
  const structuredData = getStructuredData(html);
  const graph = structuredData['@graph'];
  const profilePage = graph.find((node) => node['@type'] === 'ProfilePage');
  const person = graph.find((node) => node['@type'] === 'Person');

  assert.ok(profilePage, 'Expected ProfilePage structured data');
  assert.ok(person, 'Expected Person structured data');
  assert.equal(profilePage.about['@id'], person['@id']);
  assert.equal(person.mainEntityOfPage['@id'], profilePage['@id']);
  assert.match(person.description, /Filipino AI research scientist, associate professor, and software engineer/);
  assert.match(person.disambiguatingDescription, /Scopus Author ID 57212309186/);
  assert.ok(person.identifier.some((item) => item.propertyID === 'Scopus Author ID' && item.value === '57212309186'));
  assert.ok(person.identifier.some((item) => item.propertyID === 'ORCID' && item.value === '0000-0002-1493-5080'));
  assert.ok(person.alumniOf.some((item) => item.name === 'Technological Institute of the Philippines-Manila'));
  assert.ok(person.hasOccupation.some((item) => item.name === 'AI Research Scientist'));
  assert.doesNotMatch(html, /class="entity-about-card"/);
  assert.match(html, /<p class="about-entity-lede">\s*Dr\. Francis Jesmar P\. Montalbo is a Filipino AI research scientist/);
  assert.match(html, /Batangas State University whose work focuses on computer vision/);
  const aboutLeadRule = css.match(/\.about-entity-lede\{(?<rule>[\s\S]*?)\}/)?.groups?.rule || '';
  assert.match(aboutLeadRule, /color:var\(--text\)!important/);
  assert.doesNotMatch(aboutLeadRule, /color:\s*(?:#fff|#f8fafc|white)/i);
  assert.match(data, /About: Dr\. Francis Jesmar P\. Montalbo is a Filipino AI research scientist/);
});
