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

  function buildCorpus(siteData) {
    const { journalData = [], conferenceData = [], chapterData = [], newsData = [], profileContext = '' } = siteData || {};
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
      return { ...doc, score };
    }).filter((d) => d.score > 0);

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit).map((d) => d.payload);
  }

  function buildContext(query, siteData, limit = 12) {
    const docs = buildCorpus(siteData);
    return retrieve(query, docs, limit);
  }

  window.FrancisRAG = { tokenize, buildCorpus, retrieve, buildContext };
})();

