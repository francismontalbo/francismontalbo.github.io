// Dedicated RAG module for Francis AI
(function () {
  const STOPWORDS = new Set([
    'the', 'and', 'for', 'with', 'that', 'this', 'from', 'about', 'into', 'your', 'you', 'are', 'was', 'were',
    'have', 'has', 'had', 'what', 'when', 'where', 'which', 'who', 'how', 'why', 'can', 'will', 'would', 'could'
  ]);

  function tokenize(text) {
    return (text || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 2 && !STOPWORDS.has(t));
  }

  function cleanText(text) {
    return String(text || '').replace(/\s+/g, ' ').trim();
  }

  function truncateText(text, maxLength = 1200) {
    const cleaned = cleanText(text);
    if (cleaned.length <= maxLength) return cleaned;
    return `${cleaned.slice(0, maxLength - 1).trim()}...`;
  }

  function normalizePageHref(anchor) {
    const rawHref = cleanText(anchor?.getAttribute?.('href') || anchor?.href || '');
    if (!rawHref || /[\u0000-\u001f\s<>]/.test(rawHref)) return '';
    if (rawHref.startsWith('#')) return /^#[a-z][\w-]*$/i.test(rawHref) ? rawHref : '';

    try {
      const baseUrl = window.location?.href || 'https://francismontalbo.github.io/';
      const url = new URL(rawHref, baseUrl);
      if (url.protocol === 'http:' || url.protocol === 'https:' || url.protocol === 'mailto:') {
        return url.href;
      }
    } catch (error) {
      return '';
    }

    return '';
  }

  function getSectionTitle(section) {
    const heading = section?.querySelector?.('h1, h2, h3, h4, h5, h6');
    return cleanText(
      heading?.textContent ||
      section?.getAttribute?.('aria-label') ||
      section?.id ||
      'Page Section'
    );
  }

  function buildPageCorpus(root) {
    const sourceRoot = root || (typeof document !== 'undefined' ? document : null);
    if (!sourceRoot?.querySelectorAll) return [];

    const docs = [];
    const seen = new Set();
    const addDoc = (doc) => {
      const key = `${doc.type}|${doc.title}|${doc.payload}`;
      if (seen.has(key)) return;
      seen.add(key);
      docs.push(doc);
    };

    Array.from(sourceRoot.querySelectorAll('section[id], footer')).forEach((section) => {
      const title = getSectionTitle(section);
      const text = cleanText(section.innerText || section.textContent);
      if (!text || text.length < 30) return;
      addDoc({
        type: 'page-section',
        title,
        text: `${title} ${text}`,
        payload: `Page section | ${title}: ${truncateText(text)}`
      });
    });

    Array.from(sourceRoot.querySelectorAll('a[href]')).forEach((anchor) => {
      const href = normalizePageHref(anchor);
      if (!href) return;
      const label = cleanText(anchor.getAttribute?.('aria-label') || anchor.textContent || href);
      if (!label) return;
      addDoc({
        type: 'page-link',
        title: label,
        text: `${label} ${href}`,
        payload: `Page link | ${label}: ${href}`
      });
    });

    return docs;
  }

  function buildCorpus(siteData) {
    const {
      journalData = [],
      conferenceData = [],
      chapterData = [],
      newsData = [],
      profileContext = '',
      pageCorpus
    } = siteData || {};
    const docs = [];

    docs.push({
      type: 'profile',
      title: 'Profile Context',
      text: profileContext,
      payload: profileContext.replace(/\n+/g, ' | ')
    });

    journalData.forEach((item) => docs.push({
      type: 'journal',
      title: item.title || '',
      text: `${item.year || ''} ${item.authors || ''} ${item.title || ''} ${item.journal || ''} ${item.doi || ''}`,
      payload: `${item.year || ''} | Journal | ${item.title || ''}${item.journal ? ` (${item.journal})` : ''}`
    }));
    conferenceData.forEach((item) => docs.push({
      type: 'conference',
      title: item.title || '',
      text: `${item.year || ''} ${item.authors || ''} ${item.title || ''} ${item.venue || ''} ${item.doi || ''}`,
      payload: `${item.year || ''} | Conference | ${item.title || ''}${item.venue ? ` (${item.venue})` : ''}`
    }));
    chapterData.forEach((item) => docs.push({
      type: 'chapter',
      title: item.title || '',
      text: `${item.year || ''} ${item.authors || ''} ${item.title || ''} ${item.book || ''}`,
      payload: `${item.year || ''} | Chapter | ${item.title || ''}${item.book ? ` (${item.book})` : ''}`
    }));
    newsData.forEach((item) => docs.push({
      type: 'news',
      title: item.title || '',
      text: `${item.date || ''} ${item.title || ''} ${item.summary || ''} ${item.expandedSummary || ''} ${(item.tags || []).join(' ')}`,
      payload: `${item.date || ''} | News | ${item.title || ''} — ${item.summary || ''}`
    }));
    const pageDocs = Array.isArray(pageCorpus) ? pageCorpus : buildPageCorpus();
    pageDocs.forEach((doc) => {
      if (doc?.payload) docs.push(doc);
    });
    return docs;
  }

  function retrieve(query, docs, limit = 12) {
    const qTokens = tokenize(query);
    const qSet = new Set(qTokens);
    if (!qSet.size) return [];

    const scored = docs.map((doc) => {
      const tokens = tokenize(doc.text);
      const tokenSet = new Set(tokens);
      let overlap = 0;
      qTokens.forEach((t) => { if (tokenSet.has(t)) overlap += 1; });
      const coverage = overlap / Math.max(1, qTokens.length);
      const density = overlap / Math.max(1, tokenSet.size);
      let score = overlap + coverage * 5 + density * 2;
      if (qTokens.some((t) => (doc.title || '').toLowerCase().includes(t))) score += 3;
      if (doc.type === 'profile') score += 2; // keeps identity/contact always discoverable
      if (doc.type === 'news' && qTokens.some((t) => ['news', 'award', 'recognition', 'feature', 'impact'].includes(t))) score += 2;
      if (doc.type === 'journal' && qTokens.some((t) => ['publication', 'paper', 'journal', 'research'].includes(t))) score += 2;
      if (doc.type === 'page-section' && qTokens.some((t) => ['about', 'experience', 'education', 'skill', 'skills', 'contact', 'social', 'achievement', 'work', 'works'].includes(t))) score += 2;
      if (doc.type === 'page-link' && qTokens.some((t) => ['contact', 'email', 'profile', 'profiles', 'social', 'link', 'linkedin', 'scholar', 'scopus', 'orcid', 'github', 'researchgate', 'facebook', 'collaboration', 'consulting'].includes(t))) score += 1.5;
      return { ...doc, score };
    }).filter((d) => d.score > 0);

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit).map((d) => d.payload);
  }

  function buildContext(query, siteData, limit = 12) {
    const docs = buildCorpus(siteData);
    return retrieve(query, docs, limit);
  }

  window.FrancisRAG = { tokenize, buildPageCorpus, buildCorpus, retrieve, buildContext };
})();

