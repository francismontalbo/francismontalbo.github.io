/*
 * Custom JavaScript for francismontalbo.github.io remake.
 * This script populates the publications section dynamically using
 * arrays defined below and provides search and year-filter functionality.
 */

// Data arrays for scholarly works. Each object can contain optional
// properties such as volume, pages, location, doi, doiUrl, codeUrl, and publisher.
const journalData = [
  { year: 2025, authors: "FJP Montalbo", title: "TUMbRAIN: A transformer with a unified mobile residual attention inverted network for diagnosing brain tumors from magnetic resonance scans", journal: "Neurocomputing", volume: "611", date: "January 1, 2025", doi: "10.1016/j.neucom.2024.128583", doiUrl: "https://doi.org/10.1016/j.neucom.2024.128583", codeUrl: "https://github.com/francismontalbo/tumbrain", publisher: "Elsevier" },
  { year: 2024, authors: "FJP Montalbo", title: "DySARNet: a lightweight self‑attention deep learning model for diagnosing dysarthria from speech recordings", journal: "Multimedia Tools and Applications", date: "August 31, 2024", doi: "10.1007/s11042-024-20053-w", doiUrl: "https://doi.org/10.1007/s11042-024-20053-w", publisher: "Springer" },
  /* … (all the other journal entries) … */
  { year: 2020, authors: "FJP Montalbo, A. A. Hernandez", title: "Classifying Barako coffee leaf diseases using deep convolutional models", journal: "International Journal of Advances in Intelligent Informatics (IJAIN)", volume: "6, no. 2, p. 197", date: "2020", doi: "10.26555/ijain.v6i2.495", doiUrl: "https://doi.org/10.26555/ijain.v6i2.495", publisher: "IJAIN" }
];

const conferenceData = [
  { year: 2024, authors: "FJP Montalbo, LP Palad, RL Castillo, KI Marasigan, ALP De Ocampo", title: "CT Scan Liver and Liver Tumor 2D Segmentation: A Deep Learning Review and Empirical Analysis", venue: "2024 IEEE 12th Conference on Systems, Process & Control (ICSPC)", location: "Malacca, Malaysia", pages: "pp. 35–40", doi: "10.1109/ICSPC63060.2024.10862188", doiUrl: "https://doi.org/10.1109/ICSPC63060.2024.10862188" },
  { year: 2024, authors: "ALP De Ocampo, AS Alon, FJP Montalbo, JR Macalisang, JCV Aggari", title: "Intelligent Control for Automated Fish Feeding System in an Aquaponic Environment", venue: "2024 7th International Conference on Informatics and Computational Sciences (ICICoS)", location: "Semarang, Indonesia", pages: "pp. 273–278", doi: "10.1109/ICICoS62600.2024.10636920", doiUrl: "https://doi.org/10.1109/ICICoS62600.2024.10636920" },
  /* … (other conference entries) … */
  { year: 2019, authors: "FJP Montalbo, E. D. Festijo", title: "Comparative Analysis of Ensemble Learning Methods in Classifying Network Intrusions", venue: "2019 IEEE 9th International Conference on System Engineering and Technology (ICSET)", location: "Shah Alam, Malaysia", pages: "pp. 431–436", doi: "10.1109/ICSEngT.2019.8906310", doiUrl: "https://doi.org/10.1109/ICSEngT.2019.8906310" }
];

const chapterData = [
  { authors: "Kingsley Eghonghon Ukhurebor, Uyiosa Osagie Aigbe, Joseph Onyeka Emegha, Lucky Evbuomwan, Bamikole Olaleye Akinsehinde, Olusoji Anthony Ayeleso, Rout George Kerry, Benedict Okundaye, Atala Bihari Jena, Francis Jesmar P Montalbo, Grace Jokthan, Aizebeoje Balogun Vincent, Ahmed El Nemr", title: "Environmental Applications of Magnetic Sorbents", book: "Environmental Applications of Magnetic Sorbents", year: "2024", pages: "pp. 8-1 – 8-15", publisher: "IOP Publishing", isbn: "978-0-7503-5909-2", url: "https://iopscience.iop.org/book/edit/978-0-7503-5909-2" },
  { authors: "FJP Montalbo et al.", title: "The challenges of, and perspectives on adsorption applications for environmental sustainability", book: "Adsorption Applications for Environmental Sustainability", year: "2023", publisher: "IOP Publishing", isbn: "978-0-7503-5598-8", url: "https://iopscience.iop.org/book/edit/978-0-7503-5598-8.pdf" }
];

/*
 * Populate a publications section with data, search box and year filter.
 * data: array of objects representing publications
 * containerId: DOM element id for the card container
 * searchId: DOM id for text input used to search within titles and authors
 * filterId: DOM id for select element used to filter by year
 * countId: DOM id of span where total count should be displayed
 */
function initSection(data, containerId, searchId, filterId, countId) {
  const container = document.getElementById(containerId);
  const searchInput = document.getElementById(searchId);
  const yearSelect = document.getElementById(filterId);
  const countSpan = document.getElementById(countId);

  // populate year filter with unique years sorted descending
  const years = Array.from(new Set(data.map((d) => d.year))).sort((a, b) => b - a);
  years.forEach((y) => {
    const opt = document.createElement('option');
    opt.value = y;
    opt.textContent = y;
    yearSelect.appendChild(opt);
  });

  // display total count
  if (countSpan) {
    countSpan.textContent = data.length;
  }

  // helper to render a single publication entry
  function renderCards(items) {
    container.innerHTML = '';
    items.forEach((entry) => {
      const col = document.createElement('div');
      col.className = 'col-md-6';
      col.setAttribute('data-year', entry.year);
      col.setAttribute('data-text', (entry.title + ' ' + entry.authors).toLowerCase());
      // Build card HTML
      let html = '<div class="publication-card card h-100">';
      html += '<div class="card-body">';
      html += `<h5 class="card-title">${entry.title}</h5>`;
      // Compose citation string
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
      // action badges: publisher, code link
      html += '<div class="d-flex flex-wrap gap-2">';
      if (entry.codeUrl) {
        html += `<a href="${entry.codeUrl}" target="_blank" class="badge bg-dark text-white"><i class="fab fa-github me-1"></i>Code</a>`;
      }
      if (entry.publisher) {
        html += `<span class="badge bg-primary">${entry.publisher}</span>`;
      }
      html += '</div>';
      html += '</div>'; // card-body
      html += '</div>'; // card
      col.innerHTML = html;
      container.appendChild(col);
    });
  }

  // initial render
  renderCards(data);

  // apply filter on input or select change
  function applyFilter() {
    const term = searchInput.value.trim().toLowerCase();
    const year = yearSelect.value;
    Array.from(container.children).forEach((col) => {
      const matchesText = col.dataset.text.includes(term);
      const matchesYear = year === 'all' || col.dataset.year === year;
      col.style.display = matchesText && matchesYear ? '' : 'none';
    });
  }

  searchInput.addEventListener('input', applyFilter);
  yearSelect.addEventListener('change', applyFilter);
}

// Initialize all publication sections once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initSection(journalData, 'journal-publications', 'journal-search', 'journal-year-filter', 'journal-count');
  initSection(conferenceData, 'conference-publications', 'conf-search', 'conf-year-filter', 'conf-count');
  initSection(chapterData, 'book-chapters', 'chapters-search', 'chapters-year-filter', 'chapters-count');

  // Initialize AOS animations if available
  if (typeof AOS !== 'undefined') {
    AOS.init({ once: true });
  }

  // Back-to-top button functionality
  const backToTopBtn = document.getElementById('backToTop');
  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 200) {
        backToTopBtn.classList.add('show');
      } else {
        backToTopBtn.classList.remove('show');
      }
    });
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Set current year in footer
  const yearElement = document.getElementById('year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
});
