/*
 * Custom JavaScript for francismontalbo.github.io remake.
 * This script populates the publications section dynamically using
 * arrays defined below and provides search and year‑filter functionality.
 */

// Data arrays for scholarly works. Each object can contain optional
// properties such as volume, pages, location, doi, doiUrl, codeUrl,
// publisher, access ("open" or "closed"), and pubmedUrl (link to PubMed if available).

function getSiteData() {
  const data = window.SiteData || {};
  return {
    journalData: data.journalData || [],
    conferenceData: data.conferenceData || [],
    chapterData: data.chapterData || [],
    newsData: data.newsData || [],
    profileContext: data.profileContext || ''
  };
}

// Mapping of publishers to custom badge classes
const publisherBadgeMap = {
  'Elsevier': 'badge-elsevier',
  'Springer': 'badge-springer',
  'SAGE': 'badge-sage',
  'De Gruyter': 'badge-degruyter',
  'KSII': 'badge-ksii',
  'IJAIN': 'badge-ijain',
  'IOP Publishing': 'badge-iop',
  'ACM': 'badge-acm',
  'IEEE': 'badge-ieee'
};

// Mapping of publishers to Academicon icon classes
const publisherIconMap = {
  'Elsevier': 'ai ai-elsevier',
  'Springer': 'ai ai-springer',
  'IEEE': 'ai ai-ieee',
  'ACM': 'ai ai-acm'
};

// Conference venue icon map for conference badges
const conferenceIconMap = {
  'IEEE': 'ai ai-ieee',
  'ACM': 'ai ai-acm',
  'Springer': 'ai ai-springer'
};

// Academicons icons for PubMed and access type
const pubmedIconClass = 'ai ai-pubmed';
const openAccessIconClass = 'ai ai-open-access';
const closedAccessIconClass = 'ai ai-closed-access';

/**
 * Populate a publications section with data, search box and year filter.
 * @param {Array} data - array of publication objects
 * @param {string} containerId - id of container for cards
 * @param {string} searchId - id of search input
 * @param {string} filterId - id of year filter select
 * @param {string} countId - id of span to show total count (optional)
 */
function initSection(data, containerId, searchId, filterId, countId, publisherFilterId, sortId, clearId, resultsCountId) {
  const parseDate = (entry) => {
    const parsed = entry.date ? Date.parse(entry.date) : Number.NaN;
    return Number.isFinite(parsed) ? parsed : Number(entry.year || 0);
  };
  const sortData = (items, sortMode = 'latest') => {
    const sorted = [...items];
    sorted.sort((a, b) => {
      if (sortMode === 'title') {
        return (a.title || '').localeCompare(b.title || '');
      }
      const yearDiff = Number(a.year || 0) - Number(b.year || 0);
      if (yearDiff !== 0) return sortMode === 'oldest' ? yearDiff : -yearDiff;
      const dateDiff = parseDate(a) - parseDate(b);
      if (dateDiff !== 0) return sortMode === 'oldest' ? dateDiff : -dateDiff;
      return (a.title || '').localeCompare(b.title || '');
    });
    return sorted;
  };
  const normalizedData = sortData(data, 'latest');
  const container = document.getElementById(containerId);
  const searchInput = document.getElementById(searchId);
  const yearSelect = document.getElementById(filterId);
  const publisherSelect = document.getElementById(publisherFilterId);
  const sortSelect = document.getElementById(sortId);
  const clearButton = document.getElementById(clearId);
  const resultsCount = document.getElementById(resultsCountId);
  const countSpan = document.getElementById(countId);
  if (!container) {
    return;
  }

  // Populate year dropdown with unique years
  const years = Array.from(new Set(normalizedData.map((d) => d.year))).sort((a, b) => b - a);
  years.forEach((y) => {
    if (!yearSelect) return;
    const opt = document.createElement('option');
    opt.value = y;
    opt.textContent = y;
    yearSelect.appendChild(opt);
  });
  const publishers = Array.from(new Set(normalizedData.map((d) => d.publisher).filter(Boolean))).sort();
  publishers.forEach((publisher) => {
    if (!publisherSelect) return;
    const opt = document.createElement('option');
    opt.value = publisher;
    opt.textContent = publisher;
    publisherSelect.appendChild(opt);
  });

  // Show total count if applicable
  if (countSpan) {
    countSpan.textContent = normalizedData.length;
  }

  // Render publication cards
  function renderCards(items) {
    container.innerHTML = '';
    items.forEach((entry) => {
      const col = document.createElement('div');
      col.className = 'col-md-6';
      let html = '<div class="publication-card card h-100">';
      html += '<div class="card-body">';
      html += `<h5 class="card-title">${entry.title}</h5>`;
      html += `<p class="text-sm text-accent2 mb-2"><i class="fa-regular fa-calendar me-1"></i>${entry.year}</p>`;
      // Build citation text
      let citation = `${entry.authors}, “${entry.title},” `;
      if (entry.journal) {
        citation += `<em>${entry.journal}</em>`;
        if (entry.volume) citation += `, vol. ${entry.volume}`;
      } else if (entry.venue) {
        citation += `${entry.venue}`;
      }
      if (entry.location) citation += `, ${entry.location}`;
      if (entry.pages) citation += `, ${entry.pages}`;
      if (entry.date) citation += `, ${entry.date}`;
      if (entry.doi) {
        citation += `, doi: <a href="${entry.doiUrl}" target="_blank">${entry.doi}</a>`;
      }
      citation += '.';
      html += `<p class="card-text">${citation}</p>`;
      // Build badges
      html += '<div class="d-flex flex-wrap gap-2 mt-3 pt-1">';
      // Code badge with Font Awesome GitHub icon and custom colour
      if (entry.codeUrl) {
        html += `<a href="${entry.codeUrl}" target="_blank" class="badge badge-code" aria-label="Code repository"><i class="fab fa-github fa-github me-1" style="color:#0B0F08;"></i>Code</a>`;
      }
      // Publisher badge with Academicon icon if available
      if (entry.publisher) {
        const pubClass = publisherBadgeMap[entry.publisher] || 'badge-default';
        const pubIcon = publisherIconMap[entry.publisher];
        if (pubIcon) {
          html += `<span class="badge ${pubClass}"><i class="${pubIcon} me-1"></i>${entry.publisher}</span>`;
        } else {
          html += `<span class="badge ${pubClass}">${entry.publisher}</span>`;
        }
      }
      // PubMed badge if provided
      if (entry.pubmedUrl) {
        html += `<a href="${entry.pubmedUrl}" target="_blank" class="badge badge-default"><i class="${pubmedIconClass} me-1"></i>PubMed</a>`;
      }
      // Access badge (open or closed; default closed)
      if (entry.access === 'open') {
        html += `<span class="badge badge-default"><i class="${openAccessIconClass} me-1"></i>Open Access</span>`;
      } else {
        html += `<span class="badge badge-default"><i class="${closedAccessIconClass} me-1"></i>Closed Access</span>`;
      }
      // Conference venue icons (if venue contains keywords)
      if (entry.venue) {
        const venueLower = entry.venue.toLowerCase();
        Object.keys(conferenceIconMap).forEach((key) => {
          if (venueLower.includes(key.toLowerCase())) {
            html += `<span class="badge badge-default"><i class="${conferenceIconMap[key]} me-1"></i>${key}</span>`;
          }
        });
      }
      html += '</div>';
      html += '</div></div>';
      col.innerHTML = html;
      container.appendChild(col);
    });
  }

  // Search and filter logic
  function applyFilter() {
    const term = (searchInput?.value || '').trim().toLowerCase();
    const year = yearSelect?.value || 'all';
    const publisher = publisherSelect?.value || 'all';
    const sortMode = sortSelect?.value || 'latest';
    const filtered = normalizedData.filter((entry) => {
      const haystack = `${entry.title || ''} ${entry.authors || ''} ${entry.journal || ''} ${entry.venue || ''} ${entry.publisher || ''}`.toLowerCase();
      const matchesText = haystack.includes(term);
      const matchesYear = year === 'all' || String(entry.year) === year;
      const matchesPublisher = publisher === 'all' || (entry.publisher || '') === publisher;
      return matchesText && matchesYear && matchesPublisher;
    });
    renderCards(sortData(filtered, sortMode));
    if (resultsCount) {
      resultsCount.textContent = `Showing ${filtered.length} result${filtered.length === 1 ? '' : 's'}`;
    }
  }

  if (searchInput) searchInput.addEventListener('input', applyFilter);
  if (yearSelect) yearSelect.addEventListener('change', applyFilter);
  if (publisherSelect) publisherSelect.addEventListener('change', applyFilter);
  if (sortSelect) sortSelect.addEventListener('change', applyFilter);
  if (clearButton) {
    clearButton.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (yearSelect) yearSelect.value = 'all';
      if (publisherSelect) publisherSelect.value = 'all';
      if (sortSelect) sortSelect.value = 'latest';
      applyFilter();
    });
  }
  applyFilter();
}

// Initialise publications once DOM is ready
function initializePublications() {
  const { journalData, conferenceData, chapterData } = getSiteData();
  const allData = [
    ...journalData.map((item) => ({ ...item })),
    ...conferenceData.map((item) => ({ ...item })),
    ...chapterData.map((item) => ({ ...item, journal: item.book }))
  ];
  initSection(allData, 'all-publications', 'all-search', 'all-year-filter', 'all-count', 'all-publisher-filter', 'all-sort', 'all-clear-filters', 'all-results-count');
  initSection(journalData, 'journal-publications', 'journal-search', 'journal-year-filter', 'journal-count', 'journal-publisher-filter', 'journal-sort', 'journal-clear-filters', 'journal-results-count');
  initSection(conferenceData, 'conference-publications', 'conf-search', 'conf-year-filter', 'conf-count', 'conf-publisher-filter', 'conf-sort', 'conf-clear-filters', 'conf-results-count');
  initSection(chapterData, 'book-chapters', 'chapters-search', 'chapters-year-filter', 'chapters-count', 'chapters-publisher-filter', 'chapters-sort', 'chapters-clear-filters', 'chapters-results-count');

  // AOS animations
  if (typeof AOS !== 'undefined') {
    AOS.init({ once: true });
  }

  // Back‑to‑top button
  const backToTopBtn = document.getElementById('backToTop');
  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        backToTopBtn.classList.remove('hidden');
      } else {
        backToTopBtn.classList.add('hidden');
      }
    });
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Footer year
  const yearElement = document.getElementById('year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}

function initializeNews() {
  const { newsData } = getSiteData();
  const list = document.getElementById('news-list');
  const count = document.getElementById('news-count');

  if (!list || !count) return;

  const sorted = [...newsData].sort((a, b) => {
    if (Boolean(b.pinned) !== Boolean(a.pinned)) return b.pinned ? 1 : -1;
    return new Date(b.date) - new Date(a.date);
  });

  function render(items) {
    list.innerHTML = '';
    items.forEach((item, index) => {
      const tags = (item.tags || []).map((tag) => `<span class="badge badge-default">#${tag}</span>`).join(' ');
      const article = document.createElement('article');
      const summaryId = `news-expanded-${index}-${item.date}`.replace(/[^a-zA-Z0-9-_]/g, '');
      article.className = 'publication-card';
      article.setAttribute('itemscope', '');
      article.setAttribute('itemtype', 'https://schema.org/NewsArticle');
      article.innerHTML = `
        <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
          <div class="w-full">
            ${(item.image || item.videoEmbed) ? `
              <div class="news-media-row mb-3 ${(item.videoEmbed && item.image && item.mediaLayout === 'side-by-side') ? 'has-video' : ''}">
                ${item.image ? `<div class="news-media news-image-wrap"><img src="${item.image}" alt="${item.imageAlt || item.title}" class="news-image" loading="lazy" itemprop="image" /></div>` : ''}
                ${item.videoEmbed ? `<div class="news-media news-video-wrap">${item.videoEmbed}</div>` : ''}
              </div>
            ` : ''}
            <p class="text-xs text-accent2"><time datetime="${item.date}" itemprop="datePublished">${new Date(item.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>${item.pinned ? ' · <strong>Featured</strong>' : ''}</p>
            <h3 class="text-lg font-semibold mt-1" itemprop="headline">${item.title}</h3>
            <p class="text-sm text-gray-200 mt-2" itemprop="description">${item.summary}</p>
            ${item.expandedSummary && item.expandedSummary !== item.summary && !item.videoEmbed ? `
              <details class="mt-3">
                <summary class="cursor-pointer text-sm text-accent">Read More: detailed summary</summary>
                <p id="${summaryId}" class="text-sm text-gray-300 mt-2">${item.expandedSummary}</p>
              </details>
            ` : ''}
            <div class="flex flex-wrap gap-2 mt-3">${tags}</div>
          </div>
          ${item.link ? `<a href="${item.link}" target="_blank" class="badge badge-code whitespace-nowrap mt-1">${item.linkLabel || 'Read more'}</a>` : ''}
        </div>`;
      list.appendChild(article);
      const button = article.querySelector('button[data-summary-target]');
      if (button) {
        button.addEventListener('click', async () => {
          const target = article.querySelector(`#${button.dataset.summaryTarget}`);
          button.disabled = true;
          await generateNewsSummary(item, target);
          button.disabled = false;
        });
      }
    });
    count.textContent = `${items.length} post${items.length === 1 ? '' : 's'}`;
  }
  render(sorted);

  const newsJsonLd = {
    "@context": "https://schema.org",
    "@graph": sorted.map((item) => ({
      "@type": "NewsArticle",
      headline: item.title,
      description: item.summary,
      datePublished: item.date,
      dateModified: item.date,
      image: item.image ? new URL(item.image, window.location.origin).href : undefined,
      url: item.link || window.location.href,
      keywords: (item.tags || []).join(', '),
      author: {
        "@type": "Person",
        name: "Dr. Francis Jesmar P. Montalbo"
      },
      publisher: {
        "@type": "Person",
        name: "Dr. Francis Jesmar P. Montalbo"
      }
    }))
  };

  let newsStructuredData = document.getElementById('news-structured-data');
  if (!newsStructuredData) {
    newsStructuredData = document.createElement('script');
    newsStructuredData.id = 'news-structured-data';
    newsStructuredData.type = 'application/ld+json';
    document.head.appendChild(newsStructuredData);
  }
  newsStructuredData.textContent = JSON.stringify(newsJsonLd);

}

// Run initialisation immediately or defer to DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    try { initializePublications(); } catch (e) { console.error('Publications init failed:', e); }
    try { initializeNews(); } catch (e) { console.error('News init failed:', e); }
    try { initializeChatbot(); } catch (e) { console.error('Chatbot init failed:', e); }
  });
} else {
  try { initializePublications(); } catch (e) { console.error('Publications init failed:', e); }
  try { initializeNews(); } catch (e) { console.error('News init failed:', e); }
  try { initializeChatbot(); } catch (e) { console.error('Chatbot init failed:', e); }
}
