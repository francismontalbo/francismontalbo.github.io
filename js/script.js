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
const workTypeIconMap = {
  'Journal Article': 'fa-regular fa-newspaper',
  'Conference Paper': 'fa-solid fa-users-rectangle',
  'Book Chapter': 'fa-solid fa-book-open'
};


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

  function repopulateYearOptions(items) {
    if (!yearSelect) return;
    const current = yearSelect.value || 'all';
    yearSelect.innerHTML = '';
    const allOpt = document.createElement('option');
    allOpt.value = 'all';
    allOpt.textContent = 'All Years';
    yearSelect.appendChild(allOpt);

    const dynamicYears = Array.from(new Set(items.map((d) => d.year).filter(Boolean))).sort((a, b) => b - a);
    dynamicYears.forEach((y) => {
      const opt = document.createElement('option');
      opt.value = y;
      opt.textContent = y;
      yearSelect.appendChild(opt);
    });

    yearSelect.value = dynamicYears.some((y) => String(y) === current) ? current : 'all';
  }

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
        const workTypeIcon = workTypeIconMap[entry.workType] || 'fa-regular fa-file-lines';
        html += `<span class="badge badge-default badge-static"><i class="${workTypeIcon} me-1"></i>${entry.workType}</span>`;
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
    loadMoreBtn.hidden = hiddenCount <= 0;
    loadMoreBtn.style.display = hiddenCount > 0 ? 'flex' : 'none';
    if (hiddenCount > 0) {
      loadMoreBtn.classList.remove('load-more-animate');
      void loadMoreBtn.offsetWidth;
      loadMoreBtn.classList.add('load-more-animate');
      const nextBatch = Math.min(INITIAL_VISIBLE, hiddenCount);
      loadMoreBtn.innerHTML = `<i class="fa-solid fa-angles-down me-2" aria-hidden="true"></i>Load ${nextBatch} more works <span class="load-more-meta">(${shownCount} of ${items.length} shown)</span>`;
      loadMoreBtn.setAttribute('aria-label', `Load ${nextBatch} more works. ${hiddenCount} remaining.`);
      loadMoreBtn.title = `${hiddenCount} works remaining`;
    } else {
      loadMoreBtn.classList.remove('load-more-animate');
      loadMoreBtn.innerHTML = '';
      loadMoreBtn.removeAttribute('title');
      loadMoreBtn.setAttribute('aria-label', '');
    }
  }

  // Search and filter logic
  function applyFilter() {
    const term = (searchInput?.value || '').trim().toLowerCase();
    const publisher = publisherSelect?.value || 'all';
    const sortMode = sortSelect?.value || 'latest';

    const scopedByPublisher = normalizedData.filter((entry) => (publisher === 'all' || (entry.publisher || '') === publisher));
    repopulateYearOptions(scopedByPublisher);

    const year = yearSelect?.value || 'all';
    const filtered = scopedByPublisher.filter((entry) => {
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


function renderWorksAnalytics(journalData, conferenceData, chapterData) {
  const chart = document.getElementById('works-analytics-chart');
  const legend = document.getElementById('works-analytics-legend');
  const summary = document.getElementById('works-analytics-summary');
  if (!chart || !legend || !summary) return;

  const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 1024;
  const compactChart = viewportWidth < 480;
  const narrowChart = viewportWidth >= 480 && viewportWidth < 768;
  const chartSize = compactChart
    ? { w: 430, h: 300, px: 34, py: 30, barWidth: 18 }
    : narrowChart
      ? { w: 640, h: 340, px: 44, py: 32, barWidth: 24 }
      : { w: 900, h: 340, px: 54, py: 30, barWidth: 30 };

  const bucket = new Map();
  const add = (arr, key) => arr.forEach((x) => {
    const y = Number(x.year || 0);
    if (!y) return;
    if (!bucket.has(y)) bucket.set(y, { journal: 0, conference: 0, chapter: 0, total: 0 });
    bucket.get(y)[key] += 1;
    bucket.get(y).total += 1;
  });
  add(journalData, 'journal');
  add(conferenceData, 'conference');
  add(chapterData, 'chapter');

  const years = Array.from(bucket.keys()).sort((a, b) => a - b);
  const totals = years.map((y) => bucket.get(y).total);
  const maxTotal = Math.max(1, ...totals);
  const { w, h, px, py, barWidth } = chartSize;
  const cw = w - px * 2; const ch = h - py * 2;
  const stepX = years.length > 1 ? cw / (years.length - 1) : cw;

  const points = years.map((y, i) => {
    const x = px + i * stepX;
    const yPos = py + (1 - (bucket.get(y).total / maxTotal)) * ch;
    return `${x},${yPos}`;
  }).join(' ');
  const areaPoints = `${px},${py + ch} ${points} ${px + cw},${py + ch}`;
  const trendCaps = years.map((y, i) => {
    const d = bucket.get(y);
    const x = px + i * stepX;
    const yPos = py + (1 - (d.total / maxTotal)) * ch;
    const capWidth = compactChart ? 10 : 14;
    return `<g class="trend-cap" aria-hidden="true"><line x1="${x - capWidth / 2}" y1="${yPos}" x2="${x + capWidth / 2}" y2="${yPos}"/><circle cx="${x}" cy="${yPos}" r="${compactChart ? 3.8 : 4.8}"/></g>`;
  }).join('');

  const yearBars = years.map((y, i) => {
    const d = bucket.get(y);
    const x = px + i * stepX - (barWidth / 2);
    const baseY = py + ch;
    const unit = ch / maxTotal;
    const hJ = d.journal * unit;
    const hC = d.conference * unit;
    const hB = d.chapter * unit;
    const yJ = baseY - hJ;
    const yC = yJ - hC;
    const yB = yC - hB;
    const label = `${y}: ${d.total} total works, ${d.journal} journals, ${d.conference} conferences, ${d.chapter} chapters`;
    return `<g class="bar" data-year="${y}" tabindex="0" role="button" aria-label="${label}" transform="translate(${x},0)"><rect x="0" y="${yJ}" width="${barWidth}" height="${hJ}" class="seg-j"/><rect x="0" y="${yC}" width="${barWidth}" height="${hC}" class="seg-c"/><rect x="0" y="${yB}" width="${barWidth}" height="${hB}" class="seg-b"/><title>${label}</title></g>`;
  }).join('');

  const xLabels = years.map((y, i) => `<text x="${px + i * stepX}" y="${h - 6}" text-anchor="middle" class="axis-label">${y}</text>`).join('');
  const yGuides = Array.from({ length: Math.min(maxTotal, 5) + 1 }, (_, i) => {
    const val = Math.round((maxTotal / Math.min(maxTotal, 5)) * i);
    const y = py + ch - (val / maxTotal) * ch;
    return `<line x1="${px}" y1="${y}" x2="${px + cw}" y2="${y}" class="grid-line"/><text x="${px - 8}" y="${y + 4}" text-anchor="end" class="axis-label">${val}</text>`;
  }).join('');

  chart.innerHTML = `<svg viewBox="0 0 ${w} ${h}" class="works-ds-plot" aria-label="Publication analytics by year"><defs><linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#60a5fa" stop-opacity="0.45"/><stop offset="100%" stop-color="#60a5fa" stop-opacity="0.04"/></linearGradient></defs>${yGuides}<polygon points="${areaPoints}" class="trend-area"/>${yearBars}<polyline points="${points}" class="trend-line"/>${trendCaps}${xLabels}</svg><div id="works-analytics-tooltip" class="works-analytics-tooltip" aria-live="polite"><span class="callout-item"><span class="k">Year</span><span id="wa-year" class="v">-</span></span><span class="callout-item"><span class="k">Total</span><span id="wa-total" class="v">-</span></span><span class="callout-item"><span class="k">Journals</span><span id="wa-j" class="v">-</span></span><span class="callout-item"><span class="k">Conferences</span><span id="wa-c" class="v">-</span></span><span class="callout-item"><span class="k">Chapters</span><span id="wa-b" class="v">-</span></span></div>`;

  const total = totals.reduce((a, b) => a + b, 0);
  const topYear = years.slice().sort((a, b) => bucket.get(b).total - bucket.get(a).total)[0];
  summary.innerHTML = `<span class="metric-panel"><span class="metric-value">${total}</span><span class="metric-label">total works</span></span><span class="metric-panel"><span class="metric-value">${years.length}</span><span class="metric-label">active years</span></span><span class="metric-panel"><span class="metric-label">Peak year</span><span class="metric-value">${topYear}</span><span class="metric-sub">(${bucket.get(topYear).total} works)</span></span>`;
  legend.innerHTML = `<span><span class="dot j"></span>Journals (${journalData.length})</span><span><span class="dot c"></span>Conferences (${conferenceData.length})</span><span><span class="dot b"></span>Chapters (${chapterData.length})</span><span><span class="line t"></span>Trend line (total/year)</span>`;

  const tooltip = document.getElementById('works-analytics-tooltip');
  const yearEl = document.getElementById('wa-year');
  const totalEl = document.getElementById('wa-total');
  const jEl = document.getElementById('wa-j');
  const cEl = document.getElementById('wa-c');
  const bEl = document.getElementById('wa-b');
  chart.querySelectorAll('.bar').forEach((bar) => {
    const year = bar.getAttribute('data-year');
    const d = bucket.get(Number(year));
    const activate = () => {
      if (tooltip) tooltip.classList.add('active');
      if (yearEl) yearEl.textContent = year;
      if (totalEl) totalEl.textContent = String(d.total);
      if (jEl) jEl.textContent = String(d.journal);
      if (cEl) cEl.textContent = String(d.conference);
      if (bEl) bEl.textContent = String(d.chapter);
      bar.classList.add('active');
    };
    const deactivate = () => { bar.classList.remove('active'); };
    bar.addEventListener('mouseenter', activate);
    bar.addEventListener('focus', activate);
    bar.addEventListener('click', activate);
    bar.addEventListener('mouseleave', deactivate);
    bar.addEventListener('blur', deactivate);
  });
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
  renderWorksAnalytics(journalData, conferenceData, chapterData);
  let analyticsResizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(analyticsResizeTimer);
    analyticsResizeTimer = setTimeout(() => {
      renderWorksAnalytics(journalData, conferenceData, chapterData);
    }, 150);
  }, { passive: true });
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
    AOS.init({
      once: true,
      disable: () => window.innerWidth < 768
    });
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

  const canonicalUrl = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'https://francismontalbo.github.io/'
    : new URL('/', window.location.origin).href;
  const personId = `${canonicalUrl}#dr-francis-jesmar-montalbo`;
  const profilePageId = `${canonicalUrl}#profile-page`;
  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const toIsoDateTime = (date) => `${date}T00:00:00+08:00`;
  const toAbsoluteUrl = (url) => {
    if (!url) return undefined;
    try {
      return new URL(url, canonicalUrl).href;
    } catch (e) {
      return undefined;
    }
  };
  const slugify = (text) => String(text || '')
    .toLowerCase()
    .replace(/&amp;/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 72);

  const sorted = [...newsData].sort((a, b) => {
    if (Boolean(b.pinned) !== Boolean(a.pinned)) return b.pinned ? 1 : -1;
    return new Date(b.date) - new Date(a.date);
  });

  function render(items) {
    list.innerHTML = '';
    items.forEach((item, index) => {
      const isFeatured = index === 0;
      const safeTitle = escapeHtml(item.title);
      const safeSummary = escapeHtml(item.summary);
      const safeExpanded = escapeHtml(item.expandedSummary || '');
      const safeSource = escapeHtml(item.sourceName || 'Verified source');
      const safeImpact = escapeHtml(item.impact || 'Research visibility');
      const safeProof = escapeHtml(item.proof || 'Source-backed update');
      const safeLinkLabel = escapeHtml(item.linkLabel || 'Open source');
      const safeImage = escapeHtml(item.image || '');
      const safeImageAlt = escapeHtml(item.imageAlt || item.title);
      const articleId = `news-${item.date}-${slugify(item.title)}`;
      const tags = (item.tags || []).map((tag) => `<span class="news-tag">#${escapeHtml(tag)}</span>`).join('');
      const media = (item.image || item.videoEmbed) ? `
        <div class="news-media-row ${(item.videoEmbed && item.image && item.mediaLayout === 'side-by-side') ? 'has-video' : ''}">
          ${item.image ? `<button class="news-media news-image-wrap" type="button" aria-label="Open image for ${safeTitle}"><img src="${safeImage}" alt="${safeImageAlt}" class="news-image" loading="lazy" itemprop="image" data-modal-src="${safeImage}" /></button>` : ''}
          ${item.videoEmbed ? `<div class="news-media news-video-wrap">${item.videoEmbed}</div>` : ''}
        </div>
      ` : '';
      const article = document.createElement('article');
      const summaryId = `news-expanded-${index}-${item.date}`.replace(/[^a-zA-Z0-9-_]/g, '');
      article.id = articleId;
      article.className = `news-card${isFeatured ? ' news-card-featured' : ''}`;
      article.setAttribute('itemscope', '');
      article.setAttribute('itemtype', 'https://schema.org/NewsArticle');
      article.innerHTML = `
        <div class="news-card-inner">
          <div class="news-card-body">
            <div class="news-meta">
              <span class="news-source">${safeSource}</span>
              <time datetime="${item.date}" itemprop="datePublished">${formatDate(item.date)}</time>
              ${item.pinned ? '<span>Featured</span>' : ''}
            </div>
            <h3 itemprop="headline">${safeTitle}</h3>
            <p class="news-summary" itemprop="description">${safeSummary}</p>
            <div class="news-evidence" aria-label="Why this update matters">
              <span><strong>Impact</strong>${safeImpact}</span>
              <span><strong>Proof</strong>${safeProof}</span>
            </div>
            ${safeExpanded && safeExpanded !== safeSummary ? `
              <details class="news-details">
                <summary>Read context</summary>
                <p id="${summaryId}">${safeExpanded}</p>
              </details>
            ` : ''}
            <div class="news-tags" aria-label="News topics">${tags}</div>
          </div>
          ${media}
          ${item.link ? `<a href="${escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer" class="news-source-link">${safeLinkLabel}<i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i></a>` : ''}
          <meta itemprop="author" content="Dr. Francis Jesmar P. Montalbo" />
          <meta itemprop="dateModified" content="${item.date}" />
          <meta itemprop="mainEntityOfPage" content="${canonicalUrl}#news" />
        </div>`;
      list.appendChild(article);
    });
    count.textContent = `${items.length} verified update${items.length === 1 ? '' : 's'}`;
  }
  render(sorted);

  const personNode = {
    "@id": personId,
    "@type": "Person",
    name: "Francis Jesmar P. Montalbo",
    honorificPrefix: "Dr.",
    alternateName: [
      "Dr. Francis Jesmar P. Montalbo",
      "FJP Montalbo",
      "Francis Montalbo"
    ],
    jobTitle: [
      "Associate Professor",
      "Research Scientist",
      "Software Engineer",
      "AI and Deep Learning Specialist"
    ],
    affiliation: {
      "@type": "CollegeOrUniversity",
      name: "Batangas State University"
    },
    memberOf: [
      {
        "@type": "Organization",
        name: "IEEE"
      },
      {
        "@type": "Organization",
        name: "National Research Council of the Philippines"
      }
    ],
    award: [
      "ICBSP 2023 Best Presenter",
      "Batangas State University Scopus h-index research impact recognition",
      "OneNews feature connected to Stanford-listed scientists"
    ],
    hasCredential: [
      {
        "@type": "EducationalOccupationalCredential",
        name: "Huawei Certified Network Associate, Routing & Switching"
      },
      {
        "@type": "EducationalOccupationalCredential",
        name: "Huawei Certified Academy Instructor, Routing & Switching"
      },
      {
        "@type": "EducationalOccupationalCredential",
        name: "Certified Cisco Networking Academy Instructor"
      },
      {
        "@type": "EducationalOccupationalCredential",
        name: "IT Passport, Japan IT Standards Examination"
      },
      {
        "@type": "EducationalOccupationalCredential",
        name: "Computer Systems Servicing NC II"
      }
    ],
    description: "AI research scientist, associate professor, and software engineer focused on deep learning, biomedical signal processing, medical imaging AI, computer vision, and applied intelligent systems.",
    image: `${canonicalUrl}assets/img/profile-hero-cutout.png`,
    url: canonicalUrl,
    sameAs: [
      "https://scholar.google.com/citations?user=PV8dJDkAAAAJ&hl=en",
      "https://www.scopus.com/authid/detail.uri?authorId=57221928564",
      "https://orcid.org/0000-0002-1493-5080",
      "https://www.linkedin.com/in/sirjmmontalbo/",
      "https://www.github.com/francismontalbo",
      "https://www.researchgate.net/profile/Francis_Jesmar_Montalbo"
    ],
    knowsAbout: [
      "Artificial intelligence",
      "Deep learning",
      "Biomedical signal processing",
      "Medical imaging",
      "Computer vision",
      "Smart agriculture",
      "Software engineering"
    ]
  };

  const articleNodes = sorted.map((item) => {
    const articleId = `${canonicalUrl}#news-${item.date}-${slugify(item.title)}`;
    return {
      "@id": articleId,
      "@type": "NewsArticle",
      headline: item.title,
      description: item.summary,
      datePublished: toIsoDateTime(item.date),
      dateModified: toIsoDateTime(item.date),
      image: item.image ? [toAbsoluteUrl(item.image)] : undefined,
      url: item.link || `${canonicalUrl}#news`,
      mainEntityOfPage: `${canonicalUrl}#news`,
      keywords: [
        "Dr. Francis Jesmar P. Montalbo",
        "Francis Jesmar Montalbo",
        ...(item.tags || [])
      ].join(', '),
      author: { "@id": personId },
      publisher: { "@id": personId },
      about: [
        { "@id": personId },
        "AI research",
        "deep learning",
        "biomedical signal processing",
        "research impact"
      ],
      mentions: [
        item.sourceName ? { "@type": "Organization", name: item.sourceName } : undefined,
        item.impact ? { "@type": "Thing", name: item.impact } : undefined
      ].filter(Boolean),
      isPartOf: { "@id": profilePageId }
    };
  });

  const newsJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@id": profilePageId,
        "@type": "ProfilePage",
        name: "Dr. Francis Jesmar P. Montalbo official research profile",
        url: canonicalUrl,
        dateModified: toIsoDateTime(sorted[0]?.date || new Date().toISOString().slice(0, 10)),
        description: "Official profile and news updates for Dr. Francis Jesmar P. Montalbo, highlighting AI research impact, recognitions, publications, and applied innovation.",
        mainEntity: { "@id": personId },
        hasPart: articleNodes.map((article) => ({ "@id": article["@id"] }))
      },
      personNode,
      ...articleNodes
    ]
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
  });
} else {
  try { initializePublications(); } catch (e) { console.error('Publications init failed:', e); }
  try { initializeNews(); } catch (e) { console.error('News init failed:', e); }
  try { initializeImageModal(); } catch (e) { console.error('Image modal init failed:', e); }
}
