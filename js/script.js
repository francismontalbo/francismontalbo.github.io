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
const openAccessIconClass = 'fa-solid fa-unlock-keyhole';
const closedAccessIconClass = 'fa-solid fa-lock';

const scimagoByJournal = {
  'Applied Soft Computing': { id: '18136' },
  'Neurocomputing': { id: '24807' },
  'Multimedia Tools and Applications': { id: '25627' },
  'Smart Agricultural Technology': { id: '21101111783' },
  'Biomedical Signal Processing and Control': { id: '4700152237' },
  'MethodsX': { id: '21100317906' },
  'Machine Vision and Applications': { id: '12984' },
  'Environmental Science and Pollution Research': { id: '23918' },
  'Journal of Process Mechanical Engineering': { id: '20408' }
};


function escapeHtml(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildCitation(entry, format = 'IEEE') {
  const authors = entry.authors || 'Unknown Author';
  const title = entry.title || 'Untitled';
  const year = entry.year || 'n.d.';
  const source = entry.journal || entry.venue || entry.book || '';
  const pages = entry.pages ? `, ${entry.pages}` : '';
  const volume = entry.volume ? `, vol. ${entry.volume}` : '';
  const doi = entry.doi ? ` doi:${entry.doi}` : '';
  const link = entry.doiUrl || entry.publicationUrl || entry.pubmedUrl || '';

  if (format === 'APA') {
    return `${authors} (${year}). ${title}. ${source}${doi ? `. ${doi}` : ''}${link ? ` ${link}` : ''}`.trim();
  }
  if (format === 'MLA') {
    return `${authors}. "${title}." ${source}, ${year}${volume}${pages}${doi ? `, ${doi}` : ''}${link ? `, ${link}` : ''}.`;
  }
  // IEEE default
  return `${authors}, "${title}," ${source}${volume}${pages}, ${year}${doi ? `, ${doi}` : ''}${link ? `, ${link}` : ''}.`;
}

/**
 * Populate a publications section with data, search box and year filter.
 * @param {Array} data - array of publication objects
 * @param {string} containerId - id of container for cards
 * @param {string} searchId - id of search input
 * @param {string} filterId - id of year filter select
 * @param {string} countId - id of span to show total count (optional)
 */
function initSection(data, containerId, searchId, filterId, countId, publisherFilterId, sortId, clearId, resultsCountId) {
  const INITIAL_VISIBLE = 6;
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
  let visibleCount = INITIAL_VISIBLE;
  let lastFiltered = [];

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
    lastFiltered = items;
    container.innerHTML = '';
    items.slice(0, visibleCount).forEach((entry) => {
      const col = document.createElement('article');
      col.className = 'work-item';
      let html = '<div class="publication-card card h-100">';
      html += '<div class="card-body d-flex flex-column">';
      html += `<h5 class="card-title">${entry.title}</h5>`;
      html += `<p class="text-sm text-accent2 mb-2"><i class="fa-regular fa-calendar me-1"></i>${entry.year}</p>`;
      html += '<div class="work-meta mb-2">';
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
      const scimagoMeta = scimagoByJournal[entry.journal] || null;
      const scimagoUrl = entry.scimagoUrl || (scimagoMeta ? `https://www.scimagojr.com/journalsearch.php?q=${scimagoMeta.id}&tip=sid` : '');
      const scimagoImg = entry.scimagoImg || (scimagoMeta ? `https://www.scimagojr.com/journal_img.php?id=${scimagoMeta.id}` : '');
      if (scimagoUrl && scimagoImg) {
        html += `<div class="work-citation-layout"><div class="work-widget"><a href="${scimagoUrl}" target="_blank" rel="noopener noreferrer" title="SCImago Journal & Country Rank"><img src="${scimagoImg}" alt="SCImago Journal & Country Rank" loading="lazy" /></a></div><p class="card-text">${citation}</p></div>`;
      } else {
        html += `<p class="card-text">${citation}</p>`;
      }
      html += '</div>';
      const publicationUrl = entry.publicationUrl || entry.doiUrl || entry.pubmedUrl || '';
      const publicationLabel = entry.doiUrl ? 'Read Publication' : (entry.pubmedUrl ? 'View on PubMed' : 'View Publication');
      // Build badges (grouped by interaction type)
      html += '<div class="work-badges mt-3 pt-1 mt-auto">';
      html += '<div class="work-badges-section-label">Actions</div>';
      html += '<div class="work-badges-group work-badges-group-actions d-flex flex-wrap gap-2">';
      if (publicationUrl) {
        html += `<a href="${publicationUrl}" target="_blank" rel="noopener noreferrer" class="badge badge-read-publication badge-action" aria-label="Open publication"><i class="fa-solid fa-book-open-reader me-1"></i>${publicationLabel}</a>`;
      }
      const ieeeCite = escapeHtml(buildCitation(entry, 'IEEE'));
      const apaCite = escapeHtml(buildCitation(entry, 'APA'));
      const mlaCite = escapeHtml(buildCitation(entry, 'MLA'));
      html += `<details class="cite-menu"><summary class="badge badge-cite"><i class="fa-solid fa-quote-left me-1"></i>Cite</summary><div class="cite-options"><button type="button" class="badge badge-default cite-copy badge-action" data-citation="${ieeeCite}">Copy IEEE</button><button type="button" class="badge badge-default cite-copy badge-action" data-citation="${apaCite}">Copy APA</button><button type="button" class="badge badge-default cite-copy badge-action" data-citation="${mlaCite}">Copy MLA</button></div></details>`;
      // Code badge with Font Awesome GitHub icon and custom colour
      if (entry.codeUrl) {
        html += `<a href="${entry.codeUrl}" target="_blank" class="badge badge-code badge-action" aria-label="Code repository"><i class="fab fa-github fa-github me-1" style="color:#0B0F08;"></i>Code</a>`;
      }
      // PubMed badge if provided
      if (entry.pubmedUrl) {
        html += `<a href="${entry.pubmedUrl}" target="_blank" class="badge badge-default badge-action"><i class="${pubmedIconClass} me-1"></i>PubMed</a>`;
      }
      html += '</div>';
      html += '<div class="work-badges-section-label">Details</div>';
      html += '<div class="work-badges-group work-badges-group-static d-flex flex-wrap gap-2">';
      // Publication type badge
      if (entry.workType) {
        html += `<span class="badge badge-default badge-static"><i class="fa-regular fa-file-lines me-1"></i>${entry.workType}</span>`;
      }
      // Publisher badge with Academicon icon if available
      if (entry.publisher) {
        const pubClass = publisherBadgeMap[entry.publisher] || 'badge-default';
        const pubIcon = publisherIconMap[entry.publisher];
        if (pubIcon) {
          html += `<span class="badge ${pubClass} badge-static"><i class="${pubIcon} me-1"></i>${entry.publisher}</span>`;
        } else {
          html += `<span class="badge ${pubClass} badge-static">${entry.publisher}</span>`;
        }
      }
      // Access badge (open or closed; default closed)
      if (entry.access === 'open') {
        html += `<span class="badge badge-access-open badge-static"><i class="${openAccessIconClass} me-1"></i>Open Access</span>`;
      } else if (entry.access === 'closed') {
        html += `<span class="badge badge-access-closed badge-static"><i class="${closedAccessIconClass} me-1"></i>Subscription</span>`;
      } else {
        html += `<span class="badge badge-default badge-static"><i class="fa-solid fa-circle-question me-1"></i>Access: Check publisher</span>`;
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
      html += '</div>';
      html += '</div></div>';

      col.innerHTML = html;
      container.appendChild(col);
      setupCitationMenuDismissal(col);
      col.querySelectorAll('.cite-copy').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const citationText = btn.getAttribute('data-citation') || '';
          try {
            await navigator.clipboard.writeText(citationText);
            const old = btn.textContent;
            btn.textContent = 'Copied!';
            setTimeout(() => { btn.textContent = old; }, 1200);
          } catch (e) {
            btn.textContent = 'Copy failed';
          }
        });
      });
    });

    let loadMoreBtn = container.parentElement.querySelector(`[data-load-more-for="${containerId}"]`);
    if (!loadMoreBtn) {
      loadMoreBtn = document.createElement('button');
      loadMoreBtn.type = 'button';
      loadMoreBtn.className = 'ui-btn ui-btn-sm ui-btn-primary mt-3';
      loadMoreBtn.dataset.loadMoreFor = containerId;
      loadMoreBtn.addEventListener('click', () => {
        visibleCount += INITIAL_VISIBLE;
        renderCards(lastFiltered);
      });
      container.parentElement.appendChild(loadMoreBtn);
    }
    const shownCount = Math.min(items.length, visibleCount);
    const hiddenCount = items.length - shownCount;
    loadMoreBtn.style.display = hiddenCount > 0 ? 'inline-flex' : 'none';
    if (hiddenCount > 0) {
      const nextBatch = Math.min(INITIAL_VISIBLE, hiddenCount);
      loadMoreBtn.innerHTML = `<i class="fa-solid fa-angles-down me-2" aria-hidden="true"></i>Load ${nextBatch} more works <span class="load-more-meta">(${shownCount} of ${items.length} shown)</span>`;
      loadMoreBtn.setAttribute('aria-label', `Load ${nextBatch} more works. ${hiddenCount} remaining.`);
      loadMoreBtn.title = `${hiddenCount} works remaining`;
    } else {
      loadMoreBtn.textContent = '';
      loadMoreBtn.removeAttribute('title');
    }
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
    visibleCount = INITIAL_VISIBLE;
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


  if (!container.dataset.citeOutsideBound) {
    document.addEventListener('click', (event) => {
      const openMenus = document.querySelectorAll('#works .cite-menu[open]');
      openMenus.forEach((menu) => {
        if (!menu.contains(event.target)) {
          menu.removeAttribute('open');
        }
      });
    });
    container.dataset.citeOutsideBound = 'true';
  }

  applyFilter();
}

// Initialise publications once DOM is ready

function closeOtherCitationMenus(activeMenu) {
  document.querySelectorAll('#works .cite-menu[open]').forEach((menu) => {
    if (menu !== activeMenu) menu.removeAttribute('open');
  });
}

function setupCitationMenuDismissal(scopeElement) {
  const menus = scopeElement.querySelectorAll('.cite-menu');
  menus.forEach((menu) => {
    menu.addEventListener('toggle', () => {
      if (menu.open) closeOtherCitationMenus(menu);
    });
  });
}

function initializePublications() {
  const { journalData, conferenceData, chapterData } = getSiteData();
  const typedJournals = journalData.map((item) => ({ ...item, workType: item.workType || 'Journal Article' }));
  const typedConferences = conferenceData.map((item) => ({ ...item, workType: item.workType || 'Conference Paper' }));
  const typedChapters = chapterData.map((item) => ({ ...item, journal: item.book, workType: item.workType || 'Book Chapter' }));

  const allData = [
    ...typedJournals,
    ...typedConferences,
    ...typedChapters
  ];
  initSection(allData, 'all-publications', 'all-search', 'all-year-filter', 'all-count', 'all-publisher-filter', 'all-sort', 'all-clear-filters', 'all-results-count');
  initSection(typedJournals, 'journal-publications', 'journal-search', 'journal-year-filter', 'journal-count', 'journal-publisher-filter', 'journal-sort', 'journal-clear-filters', 'journal-results-count');
  initSection(typedConferences, 'conference-publications', 'conf-search', 'conf-year-filter', 'conf-count', 'conf-publisher-filter', 'conf-sort', 'conf-clear-filters', 'conf-results-count');
  initSection(typedChapters, 'book-chapters', 'chapters-search', 'chapters-year-filter', 'chapters-count', 'chapters-publisher-filter', 'chapters-sort', 'chapters-clear-filters', 'chapters-results-count');

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
                ${item.image ? `<div class="news-media news-image-wrap"><img src="${item.image}" alt="${item.imageAlt || item.title}" class="news-image" loading="lazy" itemprop="image" data-modal-src="${item.image}" onclick="window.openImageModal && window.openImageModal(this)" /></div>` : ''}
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
          ${item.link ? `<a href="${item.link}" target="_blank" rel="noopener noreferrer" class="ui-btn ui-btn-sm ui-btn-primary whitespace-nowrap mt-1">${item.linkLabel || 'Read more'}</a>` : ''}
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



function initializeImageModal() {
  if (document.getElementById('image-viewer-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'image-viewer-modal';
  modal.className = 'image-modal hidden';
  modal.innerHTML = `
    <div class="image-modal-backdrop" data-close-modal="true"></div>
    <div class="image-modal-content" role="dialog" aria-modal="true" aria-label="Image viewer">
      <button class="image-modal-close" type="button" aria-label="Close image viewer">&times;</button>
      <div class="image-modal-controls">
        <button type="button" data-zoom="in">+</button>
        <button type="button" data-zoom="out">−</button>
        <button type="button" data-zoom="reset">Reset</button>
      </div>
      <div class="image-modal-stage">
        <img id="image-modal-target" alt="Expanded image" draggable="false" />
      </div>
    </div>`;
  document.body.appendChild(modal);

  const img = modal.querySelector('#image-modal-target');
  const stage = modal.querySelector('.image-modal-stage');
  let scale = 1, x = 0, y = 0, dragging = false, startX = 0, startY = 0;

  const apply = () => { img.style.transform = `translate(${x}px, ${y}px) scale(${scale})`; };
  const reset = () => { scale = 1; x = 0; y = 0; apply(); };
  const close = () => { modal.classList.add('hidden'); document.body.style.overflow=''; reset(); };

  window.openImageModal = (trigger) => {
    if (!trigger) return;
    img.src = trigger.dataset.modalSrc || trigger.src;
    img.alt = trigger.alt || 'Expanded image';
    modal.classList.remove('hidden');
    document.body.style.overflow='hidden';
    reset();
  };

  modal.addEventListener('click', (e) => {
    if (e.target.dataset.closeModal === 'true' || e.target.classList.contains('image-modal-close')) close();
  });
  modal.querySelector('[data-zoom="in"]').addEventListener('click', () => { scale = Math.min(5, scale + 0.2); apply(); });
  modal.querySelector('[data-zoom="out"]').addEventListener('click', () => { scale = Math.max(1, scale - 0.2); apply(); });
  modal.querySelector('[data-zoom="reset"]').addEventListener('click', reset);

  stage.addEventListener('wheel', (e) => { e.preventDefault(); scale = Math.min(5, Math.max(1, scale + (e.deltaY < 0 ? 0.15 : -0.15))); apply(); }, { passive: false });
  stage.addEventListener('mousedown', (e) => { dragging = true; startX = e.clientX - x; startY = e.clientY - y; stage.style.cursor='grabbing'; });
  window.addEventListener('mousemove', (e) => { if (!dragging) return; x = e.clientX - startX; y = e.clientY - startY; apply(); });
  window.addEventListener('mouseup', () => { dragging = false; stage.style.cursor='grab'; });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.classList.contains('hidden')) close(); });

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('.news-image[data-modal-src]');
    if (!trigger || !window.openImageModal) return;
    window.openImageModal(trigger);
  });
}

// Run initialisation immediately or defer to DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    try { initializePublications(); } catch (e) { console.error('Publications init failed:', e); }
    try { initializeNews(); } catch (e) { console.error('News init failed:', e); }
    try { initializeImageModal(); } catch (e) { console.error('Image modal init failed:', e); }
    try { initializeChatbot(); } catch (e) { console.error('Chatbot init failed:', e); }
  });
} else {
  try { initializePublications(); } catch (e) { console.error('Publications init failed:', e); }
  try { initializeNews(); } catch (e) { console.error('News init failed:', e); }
  try { initializeImageModal(); } catch (e) { console.error('Image modal init failed:', e); }
  try { initializeChatbot(); } catch (e) { console.error('Chatbot init failed:', e); }
}
