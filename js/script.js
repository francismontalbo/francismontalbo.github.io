/*
 * Custom JavaScript for francismontalbo.github.io remake.
 * This script populates the publications section dynamically using
 * arrays defined below and provides search and year-filter functionality.
 */

// Data arrays for scholarly works. Each object can contain optional
// properties such as volume, pages, location, doi, doiUrl, codeUrl, and publisher.
const journalData = [
  {
    year: 2025,
    authors: "FJP Montalbo",
    title:
      "TUMbRAIN: A transformer with a unified mobile residual attention inverted network for diagnosing brain tumors from magnetic resonance scans",
    journal: "Neurocomputing",
    volume: "611",
    date: "January 1, 2025",
    doi: "10.1016/j.neucom.2024.128583",
    doiUrl: "https://doi.org/10.1016/j.neucom.2024.128583",
    codeUrl: "https://github.com/francismontalbo/tumbrain",
    publisher: "Elsevier"
  },
  {
    year: 2024,
    authors: "FJP Montalbo",
    title:
      "DySARNet: a lightweight self‑attention deep learning model for diagnosing dysarthria from speech recordings",
    journal: "Multimedia Tools and Applications",
    date: "August 31, 2024",
    doi: "10.1007/s11042-024-20053-w",
    doiUrl: "https://doi.org/10.1007/s11042-024-20053-w",
    publisher: "Springer"
  },
  {
    year: 2024,
    authors: "ALP De Ocampo, FJP Montalbo",
    title:
      "A Multi‑Vision Monitoring Framework for Simultaneous Real‑Time Unmanned Aerial Monitoring of Farmer Activity and Crop Health",
    journal: "Smart Agricultural Technology",
    date: "May 16, 2024",
    doi: "10.1016/j.atech.2024.100466",
    doiUrl: "https://doi.org/10.1016/j.atech.2024.100466",
    publisher: "Elsevier"
  },
  {
    year: 2024,
    authors: "RD Maalihan, JCV Aggari, AS Alon, RB Latayan, FJP Montalbo, AD Javier",
    title:
      "On the optimized fused filament fabrication of polylactic acid using multiresponse central composite design and desirability function algorithm",
    journal: "Journal of Process Mechanical Engineering",
    date: "April 24, 2024",
    doi: "10.1177/09544089241247454",
    doiUrl: "https://doi.org/10.1177/09544089241247454",
    publisher: "SAGE"
  },
  {
    year: 2024,
    authors: "FJP Montalbo",
    title:
      "S3AR U‑Net: A Separable Squeezed Similarity Attention‑gated Residual U‑Net for Glottis Segmentation",
    journal: "Biomedical Signal Processing and Control",
    date: "February 21, 2024",
    doi: "10.1016/j.bspc.2024.106047",
    doiUrl: "https://doi.org/10.1016/j.bspc.2024.106047",
    publisher: "Elsevier"
  },
  {
    year: 2023,
    authors: "FJP Montalbo",
    title:
      "Automating Mosquito Taxonomy by Compressing and Enhancing a Feature Fused EfficientNet with Knowledge Distillation and a Novel Residual Skip Block",
    journal: "MethodsX",
    date: "February 14, 2023",
    doi: "10.1016/j.mex.2023.102072",
    doiUrl: "https://doi.org/10.1016/j.mex.2023.102072",
    publisher: "Elsevier"
  },
  // 2022 entries
  {
    year: 2022,
    authors: "FJP Montalbo",
    title:
      "Machine‑based Mosquito Taxonomy with a Lightweight Network‑fused Efficient Dual ConvNet with Residual Learning and Knowledge Distillation",
    journal: "Applied Soft Computing",
    date: "December 16, 2022",
    doi: "10.1016/j.asoc.2022.109913",
    doiUrl: "https://doi.org/10.1016/j.asoc.2022.109913",
    publisher: "Elsevier"
  },
  {
    year: 2022,
    authors: "FJP Montalbo",
    title:
      "Fusing Compressed Deep ConvNets with a Self‑Normalizing Residual Block and Alpha Dropout for a Cost‑Efficient Classification and Diagnosis of Gastrointestinal Tract Diseases",
    journal: "MethodsX",
    date: "November 2022",
    doi: "10.1016/j.mex.2022.101925",
    doiUrl: "https://doi.org/10.1016/j.mex.2022.101925",
    publisher: "Elsevier"
  },
  {
    year: 2022,
    authors:
      "R. G. Kerry, FJP Montalbo, R. Das, S. Patra, G. P. Mahaptra, G. K. Maurya, V. Nayak, A. B. Jena, K. E. Ukhurebor, R. C. Jena, S. Gouda, S. Majhi, J. R. Rout",
    title: "An overview of remote monitoring methods in biodiversity conservation",
    journal: "Environmental Science and Pollution Research",
    date: "2022",
    doi: "10.1007/s11356-022-23242-y",
    doiUrl: "https://doi.org/10.1007/s11356-022-23242-y",
    publisher: "Springer"
  },
  {
    year: 2022,
    authors:
      "N. Z. Rashed, S. K. H. Ahammad, M. G. Daher, S. H. Zyoud, V. Sorathiya, FJP Montalbo, S. Asaduzzaman, H. Rehana, A. Zuhayer",
    title:
      "Various transmission codes for the control of bit error rate in both optical wired and wireless communication channels",
    journal: "Journal of Optical Communications",
    date: "July 18, 2022",
    doi: "10.1515/joc-2022-0044",
    doiUrl: "https://doi.org/10.1515/joc-2022-0044",
    publisher: "De Gruyter"
  },
  {
    year: 2022,
    authors:
      "N. Z. Rashed, M. G. Daher, S. K. H. Ahammad, FJP Montalbo, V. Sorathiya, S. Asaduzzaman, H. Rehana, A. Zuhayer",
    title:
      "Non return to zero line coding with suppressed carrier in FSO transceiver systems under light rain conditions",
    journal: "Journal of Optical Communications",
    date: "July 13, 2022",
    doi: "10.1515/joc-2022-0039",
    doiUrl: "https://doi.org/10.1515/joc-2022-0039",
    publisher: "De Gruyter"
  },
  {
    year: 2022,
    authors: "FJP Montalbo",
    title:
      "Diagnosing Gastrointestinal Diseases from Endoscopy Images through a Multi‑Fused CNN with Auxiliary Layers, Alpha Dropouts, and a Fusion Residual Block",
    journal: "Biomedical Signal Processing and Control",
    volume: "76",
    date: "July 2022",
    doi: "10.1016/j.bspc.2022.103683",
    doiUrl: "https://doi.org/10.1016/j.bspc.2022.103683",
    publisher: "Elsevier"
  },
  {
    year: 2022,
    authors: "FJP Montalbo",
    title:
      "Truncating Fined‑Tuned Vision‑Based Models to Lightweight Deployable Diagnostic Tools for SARS‑CoV‑2 Infected Chest X‑Rays and CT‑Scans",
    journal: "Multimedia Tools and Applications",
    date: "2022",
    doi: "10.1007/s11042-022-12484-0",
    doiUrl: "https://doi.org/10.1007/s11042-022-12484-0",
    publisher: "Springer"
  },
  {
    year: 2022,
    authors: "FJP Montalbo",
    title:
      "Automated Diagnosis of Diverse Coffee Leaf Images through a Stage‑Wise Aggregated Triple Deep Convolutional Neural Network",
    journal: "Machine Vision and Applications",
    volume: "33, no. 1, pp. 1–22",
    date: "2022",
    doi: "10.1007/s00138-022-01277-y",
    doiUrl: "https://doi.org/10.1007/s00138-022-01277-y",
    publisher: "Springer"
  },
  // 2021 entries
  {
    year: 2021,
    authors: "FJP Montalbo",
    title:
      "Truncating a Densely Connected Convolutional Neural Network with Partial Layer Freezing and Feature Fusion for Diagnosing COVID‑19 from Chest X‑Rays",
    journal: "MethodsX",
    volume: "8, 101408",
    date: "2021",
    doi: "10.1016/j.mex.2021.101408",
    doiUrl: "https://doi.org/10.1016/j.mex.2021.101408",
    publisher: "Elsevier"
  },
  {
    year: 2021,
    authors: "FJP Montalbo",
    title:
      "Diagnosing Covid‑19 Chest X‑Rays with a Lightweight Truncated DenseNet with Partial Layer Freezing and Feature Fusion",
    journal: "Biomedical Signal Processing and Control",
    volume: "68, 102583",
    date: "2021",
    doi: "10.1016/j.bspc.2021.102583",
    doiUrl: "https://doi.org/10.1016/j.bspc.2021.102583",
    publisher: "Elsevier"
  },
  {
    year: 2021,
    authors: "FJP Montalbo, A. S. Alon",
    title:
      "Empirical Analysis of a Fine‑Tuned Deep Convolutional Model in Classifying and Detecting Malaria Parasites from Blood Smears",
    journal: "KSII Transactions on Internet & Information Systems (TIIS)",
    volume: "15, no. 1, pp. 147–165",
    date: "2021",
    doi: "10.3837/tiis.2021.01.009",
    doiUrl: "https://doi.org/10.3837/tiis.2021.01.009",
    publisher: "KSII"
  },
  // 2020 entries
  {
    year: 2020,
    authors: "FJP Montalbo",
    title:
      "A Computer‑Aided Diagnosis of Brain Tumors Using a Fine‑Tuned YOLO‑based Model with Transfer Learning",
    journal: "KSII Transactions on Internet & Information Systems (TIIS)",
    volume: "14, no. 12, pp. 4816–4834",
    date: "2020",
    doi: "10.3837/tiis.2020.12.011",
    doiUrl: "https://doi.org/10.3837/tiis.2020.12.011",
    publisher: "KSII"
  },
  {
    year: 2020,
    authors: "FJP Montalbo, A. A. Hernandez",
    title:
      "Classifying Barako coffee leaf diseases using deep convolutional models",
    journal: "International Journal of Advances in Intelligent Informatics (IJAIN)",
    volume: "6, no. 2, p. 197",
    date: "2020",
    doi: "10.26555/ijain.v6i2.495",
    doiUrl: "https://doi.org/10.26555/ijain.v6i2.495",
    publisher: "IJAIN"
  }
];

const conferenceData = [
  {
    year: 2024,
    authors: "FJP Montalbo, LP Palad, RL Castillo, KI Marasigan, ALP De Ocampo",
    title:
      "CT Scan Liver and Liver Tumor 2D Segmentation: A Deep Learning Review and Empirical Analysis",
    venue: "2024 IEEE 12th Conference on Systems, Process & Control (ICSPC)",
    location: "Malacca, Malaysia",
    pages: "pp. 35–40",
    doi: "10.1109/ICSPC63060.2024.10862188",
    doiUrl: "https://doi.org/10.1109/ICSPC63060.2024.10862188"
  },
  {
    year: 2024,
    authors: "ALP De Ocampo, AS Alon, FJP Montalbo, JR Macalisang, JCV Aggari",
    title:
      "Intelligent Control for Automated Fish Feeding System in an Aquaponic Environment",
    venue:
      "2024 7th International Conference on Informatics and Computational Sciences (ICICoS)",
    location: "Semarang, Indonesia",
    pages: "pp. 273–278",
    doi: "10.1109/ICICoS62600.2024.10636920",
    doiUrl: "https://doi.org/10.1109/ICICoS62600.2024.10636920"
  },
  {
    year: 2023,
    authors: "FJP Montalbo",
    title:
      "Performance Analysis of Lightweight Vision Transformers and Deep Convolutional Neural Networks in Detecting Brain Tumors in MRI Scans: An Empirical Approach",
    venue:
      "Proceedings of the 2023 8th International Conference on Biomedical Imaging, Signal Processing",
    doi: "10.1145/3634875.3634878",
    doiUrl: "https://doi.org/10.1145/3634875.3634878"
  },
  {
    year: 2020,
    authors: "–",
    title: "System for University Classrooms",
    venue: "2020 International Symposium on Educational Technology (ISET)",
    location: "Bangkok, Thailand",
    pages: "pp. 3–7",
    doi: "10.1109/ISET49818.2020.00011",
    doiUrl: "https://doi.org/10.1109/ISET49818.2020.00011"
  },
  {
    year: 2020,
    authors: "FJP Montalbo, A. A. Hernandez",
    title:
      "An Optimized Classification Model for Coffea Liberica Disease using Deep Convolutional Neural Networks",
    venue:
      "2020 16th IEEE International Colloquium on Signal Processing & Its Applications (CSPA)",
    location: "Langkawi, Malaysia",
    pages: "pp. 213–218",
    doi: "10.1109/CSPA48992.2020.9068683",
    doiUrl: "https://doi.org/10.1109/CSPA48992.2020.9068683"
  },
  {
    year: 2019,
    authors: "FJP Montalbo, DPY Barfeh",
    title:
      "Classification of Stenography using Convolutional Neural Networks and Canny Edge Detection Algorithm",
    venue:
      "2019 International Conference on Computational Intelligence and Knowledge Economy (ICCIKE)",
    location: "Dubai, United Arab Emirates",
    pages: "pp. 305–310",
    doi: "10.1109/ICCIKE47802.2019.9004359",
    doiUrl: "https://doi.org/10.1109/ICCIKE47802.2019.9004359"
  },
  {
    year: 2019,
    authors: "FJP Montalbo, A. A. Hernandez",
    title:
      "Classification of Fish Species with Augmented Data using Deep Convolutional Neural Network",
    venue:
      "2019 IEEE 9th International Conference on System Engineering and Technology (ICSET)",
    location: "Shah Alam, Malaysia",
    pages: "pp. 396–401",
    doi: "10.1109/ICSEngT.2019.8906433",
    doiUrl: "https://doi.org/10.1109/ICSEngT.2019.8906433"
  },
  {
    year: 2019,
    authors: "FJP Montalbo, E. D. Festijo",
    title:
      "Comparative Analysis of Ensemble Learning Methods in Classifying Network Intrusions",
    venue:
      "2019 IEEE 9th International Conference on System Engineering and Technology (ICSET)",
    location: "Shah Alam, Malaysia",
    pages: "pp. 431–436",
    doi: "10.1109/ICSEngT.2019.8906310",
    doiUrl: "https://doi.org/10.1109/ICSEngT.2019.8906310"
  }
];

const chapterData = [
  {
    authors:
      "Kingsley Eghonghon Ukhurebor, Uyiosa Osagie Aigbe, Joseph Onyeka Emegha, Lucky Evbuomwan, Bamikole Olaleye Akinsehinde, Olusoji Anthony Ayeleso, Rout George Kerry, Benedict Okundaye, Atala Bihari Jena, Francis Jesmar P Montalbo, Grace Jokthan, Aizebeoje Balogun Vincent, Ahmed El Nemr",
    title: "Environmental Applications of Magnetic Sorbents",
    book: "Environmental Applications of Magnetic Sorbents",
    year: "2024",
    pages: "pp. 8-1 – 8-15",
    publisher: "IOP Publishing",
    isbn: "978-0-7503-5909-2",
    url: "https://iopscience.iop.org/book/edit/978-0-7503-5909-2"
  },
  {
    authors: "FJP Montalbo et al.",
    title:
      "The challenges of, and perspectives on adsorption applications for environmental sustainability",
    book: "Adsorption Applications for Environmental Sustainability",
    year: "2023",
    publisher: "IOP Publishing",
    isbn: "978-0-7503-5598-8",
    url: "https://iopscience.iop.org/book/edit/978-0-7503-5598-8.pdf"
  }
];

// Mapping of publishers to custom badge classes for color coding
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
      col.setAttribute(
        'data-text',
        (entry.title + ' ' + entry.authors).toLowerCase()
      );
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
      // code button: apply custom class for styling
      if (entry.codeUrl) {
        html += `<a href="${entry.codeUrl}" target="_blank" class="badge badge-code"><i class="fab fa-github me-1"></i>Code</a>`;
      }
      // publisher badge with color coding
      if (entry.publisher) {
        const pubClass = publisherBadgeMap[entry.publisher] || 'badge-default';
        html += `<span class="badge ${pubClass}">${entry.publisher}</span>`;
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
  // Initialize publication sections
  initSection(
    journalData,
    'journal-publications',
    'journal-search',
    'journal-year-filter',
    'journal-count'
  );
  initSection(
    conferenceData,
    'conference-publications',
    'conf-search',
    'conf-year-filter',
    'conf-count'
  );
  initSection(
    chapterData,
    'book-chapters',
    'chapters-search',
    'chapters-year-filter',
    'chapters-count'
  );

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

  // Additional interactive features could be initialized here in the future.
});
