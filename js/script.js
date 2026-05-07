/*
 * Custom JavaScript for francismontalbo.github.io remake.
 * This script populates the publications section dynamically using
 * arrays defined below and provides search and year‑filter functionality.
 */

// Data arrays for scholarly works. Each object can contain optional
// properties such as volume, pages, location, doi, doiUrl, codeUrl,
// publisher, access ("open" or "closed"), and pubmedUrl (link to PubMed if available).

const journalData = [
  {
    year: 2026,
    authors: "FJP Montalbo",
    title:
      "MHADFormer: A Cost-Efficient Multiscale Hybrid Transformer Mixer Model for Automating Alzheimer’s Disease Diagnosis from MRI Scans",
    journal: "Applied Soft Computing",
    volume: "114624",
    date: "2026",
    doi: "10.1016/j.asoc.2026.114624",
    doiUrl: "https://doi.org/10.1016/j.asoc.2026.114624",
    codeUrl: "https://github.com/francismontalbo/mhadformer",
    publisher: "Elsevier"
  },
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
    doiUrl: "https://doi.org/10.1109/ICSPC63060.2024.10862188",
    publisher: "IEEE"
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
    doiUrl: "https://doi.org/10.1109/ICICoS62600.2024.10636920",
    publisher: "IEEE"
  },
  {
    year: 2023,
    authors: "FJP Montalbo",
    title:
      "Performance Analysis of Lightweight Vision Transformers and Deep Convolutional Neural Networks in Detecting Brain Tumors in MRI Scans: An Empirical Approach",
    venue:
      "Proceedings of the 2023 8th International Conference on Biomedical Imaging, Signal Processing",
    doi: "10.1145/3634875.3634878",
    doiUrl: "https://doi.org/10.1145/3634875.3634878",
    publisher: "ACM"
  },
  {
    year: 2021,
    authors: "Francis Jesmar Montalbo; Erwin Enriquez",
    title:
      "An IoT Smart Lighting System for University Classrooms",
    venue: "IEEE International Conference on IoT Systems for Education",
    location: "Philippines",
    pages: "",
    doi: "",
    doiUrl: "",
    publisher: "IEEE"
  },
  {
    year: 2020,
    authors: "–",
    title: "System for University Classrooms",
    venue: "2020 International Symposium on Educational Technology (ISET)",
    location: "Bangkok, Thailand",
    pages: "pp. 3–7",
    doi: "10.1109/ISET49818.2020.00011",
    doiUrl: "https://doi.org/10.1109/ISET49818.2020.00011",
    publisher: "IEEE"
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
    doiUrl: "https://doi.org/10.1109/CSPA48992.2020.9068683",
    publisher: "IEEE"
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
    doiUrl: "https://doi.org/10.1109/ICCIKE47802.2019.9004359",
    publisher: "IEEE"
  },
  {
    year: 2019,
    authors: "FJP Montalbo, A. A. Hernandez",
    title:
      "Classification of Fish Species with Augmented Data using Deep Convolutional Neural Network",
    venue: "2019 IEEE 9th International Conference on System Engineering and Technology (ICSET)",
    location: "Shah Alam, Malaysia",
    pages: "pp. 396–401",
    doi: "10.1109/ICSEngT.2019.8906433",
    doiUrl: "https://doi.org/10.1109/ICSEngT.2019.8906433",
    publisher: "IEEE"
  },
  {
    year: 2019,
    authors: "FJP Montalbo, E. D. Festijo",
    title:
      "Comparative Analysis of Ensemble Learning Methods in Classifying Network Intrusions",
    venue: "2019 IEEE 9th International Conference on System Engineering and Technology (ICSET)",
    location: "Shah Alam, Malaysia",
    pages: "pp. 431–436",
    doi: "10.1109/ICSEngT.2019.8906310",
    doiUrl: "https://doi.org/10.1109/ICSEngT.2019.8906310",
    publisher: "IEEE"
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

// News posts (easy content management: add newest items here).
const newsData = [
  {
    date: "2026-05-05",
    title: "National Spotlight: Recognized in OneNews Stanford Scientists Feature",
    summary: "Dr. Francis Jesmar P. Montalbo is recognized in OneNews’ Stanford scientists coverage, reinforcing his position among high-impact Filipino researchers with internationally visible contributions in artificial intelligence, biomedical signal processing, and medical imaging innovation.",
    expandedSummary: "The OneNews feature strengthens the public profile of Dr. Francis Jesmar P. Montalbo as a globally competitive AI research scientist from the Philippines. His inclusion in the Stanford scientists context highlights sustained excellence, international research visibility, and trusted expertise—key indicators for universities, industry partners, and institutions seeking strategic collaboration in advanced AI and biomedical technologies.",
    tags: ["media-feature", "stanford-top-2%", "research-impact"],
    link: "https://www.onenews.ph/articles/phl-has-fewest-scientists-in-asean-stanford-list",
    linkLabel: "Read feature",
    image: "assets/img/achievements.jpg",
    imageAlt: "Dr. Francis Jesmar P. Montalbo achievements and recognitions photo",
    pinned: true
  },
  {
    date: "2023-10-22",
    title: "ICBSP 2023: Selected as One of the Best Presenters",
    summary: "Dr. Francis Jesmar P. Montalbo was selected as one of the Best Presenters at ICBSP 2023 in Singapore, underscoring his research excellence and international leadership in biomedical imaging, signal processing, and applied artificial intelligence.",
    expandedSummary: "This international conference distinction positions Dr. Francis Jesmar P. Montalbo among top-performing global presenters in a competitive scientific forum. With ICBSP proceedings published by ACM and recognized in major indexing ecosystems, this achievement amplifies his authority, credibility, and strategic value for global research partnerships, keynote engagements, and cross-border innovation programs.",
    tags: ["best-presenter", "international-conference", "ai-research"],
    link: "https://www.icbsp.org/icbsp2023.html",
    linkLabel: "Conference page",
    image: "assets/img/experience.jpg",
    imageAlt: "Dr. Francis Jesmar P. Montalbo international conference and research experience photo",
    pinned: true
  }
];

const profileContext = `
Name: Dr. Francis Jesmar P. Montalbo
Roles: Associate Professor, Research Scientist, AI & Deep Learning Specialist, Software Engineer
Affiliation: Batangas State University
Research: medical imaging AI, deep learning, biomedical signal processing, computer vision
Education: Doctorate in Information Technology (Technological Institute of the Philippines-Manila)
Selected Achievements: OneNews Stanford scientists feature; ICBSP 2023 best presenter
Contact Emails: francismontalbo@ieee.org; francisjesmar.montalbo@g.batstate-u.edu.ph
Profiles: Scopus https://www.scopus.com/authid/detail.uri?authorId=57221928564 | Google Scholar https://scholar.google.com/citations?user=PV8dJDkAAAAJ&hl=en | ORCID https://orcid.org/0000-0002-1493-5080 | LinkedIn https://www.linkedin.com/in/sirjmmontalbo/ | ResearchGate https://www.researchgate.net/profile/Francis_Jesmar_Montalbo
When asked for contact, give exact email addresses and links above.
`;

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

  // Populate year dropdown with unique years
  const years = Array.from(new Set(normalizedData.map((d) => d.year))).sort((a, b) => b - a);
  years.forEach((y) => {
    const opt = document.createElement('option');
    opt.value = y;
    opt.textContent = y;
    yearSelect.appendChild(opt);
  });
  const publishers = Array.from(new Set(normalizedData.map((d) => d.publisher).filter(Boolean))).sort();
  publishers.forEach((publisher) => {
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
    const term = searchInput.value.trim().toLowerCase();
    const year = yearSelect.value;
    const publisher = publisherSelect.value;
    const sortMode = sortSelect.value;
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

  searchInput.addEventListener('input', applyFilter);
  yearSelect.addEventListener('change', applyFilter);
  publisherSelect.addEventListener('change', applyFilter);
  sortSelect.addEventListener('change', applyFilter);
  clearButton.addEventListener('click', () => {
    searchInput.value = '';
    yearSelect.value = 'all';
    publisherSelect.value = 'all';
    sortSelect.value = 'latest';
    applyFilter();
  });
  applyFilter();
}

// Initialise publications once DOM is ready
function initializePublications() {
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
  const list = document.getElementById('news-list');
  const search = document.getElementById('news-search');
  const yearFilter = document.getElementById('news-year-filter');
  const clearBtn = document.getElementById('news-clear');
  const count = document.getElementById('news-count');

  if (!list || !search || !yearFilter || !clearBtn || !count) return;

  const sorted = [...newsData].sort((a, b) => {
    if (Boolean(b.pinned) !== Boolean(a.pinned)) return b.pinned ? 1 : -1;
    return new Date(b.date) - new Date(a.date);
  });

  const years = Array.from(new Set(sorted.map((n) => new Date(n.date).getFullYear()))).sort((a, b) => b - a);
  years.forEach((year) => {
    const opt = document.createElement('option');
    opt.value = String(year);
    opt.textContent = String(year);
    yearFilter.appendChild(opt);
  });

  function render(items) {
    list.innerHTML = '';
    items.forEach((item, index) => {
      const tags = (item.tags || []).map((tag) => `<span class="badge badge-default">#${tag}</span>`).join(' ');
      const article = document.createElement('article');
      const summaryId = `news-expanded-${index}-${item.date}`.replace(/[^a-zA-Z0-9-_]/g, '');
      article.className = 'publication-card';
      article.innerHTML = `
        <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
          <div class="w-full">
            ${item.image ? `<img src="${item.image}" alt="${item.imageAlt || item.title}" class="w-full max-h-72 object-cover rounded-lg border border-primary mb-3" loading="lazy" />` : ''}
            <p class="text-xs text-accent2">${new Date(item.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}${item.pinned ? ' · <strong>Featured</strong>' : ''}</p>
            <h3 class="text-lg font-semibold mt-1">${item.title}</h3>
            <p class="text-sm text-gray-200 mt-2">${item.summary}</p>
            <details class="mt-3">
              <summary class="cursor-pointer text-sm text-accent">Expand: detailed summary</summary>
              <p id="${summaryId}" class="text-sm text-gray-300 mt-2">${item.expandedSummary || item.summary}</p>
            </details>
            <div class="flex flex-wrap gap-2 mt-3">${tags}</div>
          </div>
          ${item.link ? `<a href="${item.link}" target="_blank" class="badge badge-code whitespace-nowrap mt-1">${item.linkLabel || 'Read more'}</a>` : ''}
        </div>`;
      list.appendChild(article);
    });
    count.textContent = `${items.length} post${items.length === 1 ? '' : 's'}`;
  }

  function apply() {
    const term = search.value.trim().toLowerCase();
    const selectedYear = yearFilter.value;
    const filtered = sorted.filter((item) => {
      const year = String(new Date(item.date).getFullYear());
      const haystack = `${item.title} ${item.summary} ${(item.tags || []).join(' ')}`.toLowerCase();
      return (selectedYear === 'all' || selectedYear === year) && haystack.includes(term);
    });
    render(filtered);
  }

  search.addEventListener('input', apply);
  yearFilter.addEventListener('change', apply);
  clearBtn.addEventListener('click', () => {
    search.value = '';
    yearFilter.value = 'all';
    apply();
  });

  apply();
}

function initializeChatbot() {
  const messages = document.getElementById('chatbot-messages');
  const input = document.getElementById('chatbot-input');
  const send = document.getElementById('chatbot-send');
  const chips = document.querySelectorAll('.chatbot-chip');
  const fab = document.getElementById('chatbot-fab');
  const widget = document.getElementById('chatbot-widget');
  const closeBtn = document.getElementById('chatbot-close');
  const status = document.getElementById('chatbot-status');
  if (!messages || !input || !send || !fab || !widget || !closeBtn || !status) return;

  const allWorks = [
    ...journalData.map((w) => ({ ...w, type: 'Journal' })),
    ...conferenceData.map((w) => ({ ...w, type: 'Conference' })),
    ...chapterData.map((w) => ({ ...w, type: 'Chapter' }))
  ];
  const ragCorpus = [
    ...journalData.map((item) => ({
      type: 'journal',
      title: item.title || '',
      text: `${item.year || ''} ${item.authors || ''} ${item.title || ''} ${item.journal || ''} ${item.doi || ''}`,
      payload: `${item.year || ''} | Journal | ${item.title || ''}${item.journal ? ` (${item.journal})` : ''}`
    })),
    ...conferenceData.map((item) => ({
      type: 'conference',
      title: item.title || '',
      text: `${item.year || ''} ${item.authors || ''} ${item.title || ''} ${item.venue || ''} ${item.doi || ''}`,
      payload: `${item.year || ''} | Conference | ${item.title || ''}${item.venue ? ` (${item.venue})` : ''}`
    })),
    ...chapterData.map((item) => ({
      type: 'chapter',
      title: item.title || '',
      text: `${item.year || ''} ${item.authors || ''} ${item.title || ''} ${item.book || ''}`,
      payload: `${item.year || ''} | Chapter | ${item.title || ''}${item.book ? ` (${item.book})` : ''}`
    })),
    ...newsData.map((item) => ({
      type: 'news',
      title: item.title || '',
      text: `${item.date || ''} ${item.title || ''} ${item.summary || ''} ${(item.tags || []).join(' ')}`,
      payload: `${item.date || ''} | News | ${item.title || ''} — ${item.summary || ''}`
    }))
  ];

  function tokenize(text) {
    return (text || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((t) => t.length > 2);
  }

  function retrieveContext(query, limit = 8) {
    const qTokens = tokenize(query);
    const qSet = new Set(qTokens);
    if (!qSet.size) return [];
    const scored = ragCorpus.map((doc) => {
      const tokens = tokenize(doc.text);
      let score = 0;
      tokens.forEach((token) => {
        if (qSet.has(token)) score += 1;
      });
      if (qTokens.some((t) => (doc.title || '').toLowerCase().includes(t))) score += 3;
      if (doc.type === 'news' && qTokens.some((t) => ['news', 'award', 'recognition', 'feature'].includes(t))) score += 2;
      return { ...doc, score };
    }).filter((doc) => doc.score > 0);
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit).map((doc) => doc.payload);
  }

  function addBubble(text, role = 'assistant') {
    const row = document.createElement('div');
    row.className = `flex items-start gap-2 ${role === 'user' ? 'justify-end' : ''}`;
    const avatar = document.createElement('div');
    avatar.className = `w-8 h-8 rounded-full flex items-center justify-center font-bold ${role === 'user' ? 'bg-accent2 text-dark order-2' : 'bg-accent text-dark'}`;
    avatar.textContent = role === 'user' ? 'You' : 'AI';
    const bubble = document.createElement('div');
    bubble.className = role === 'user'
      ? 'max-w-[80%] rounded-2xl rounded-tr-sm px-4 py-3 bg-accent2 text-dark shadow'
      : 'max-w-[80%] rounded-2xl rounded-tl-sm px-4 py-3 bg-tertiary text-gray-100 shadow';
    bubble.textContent = text;
    row.appendChild(avatar);
    row.appendChild(bubble);
    messages.appendChild(row);
    messages.scrollTop = messages.scrollHeight;
    return bubble;
  }

  async function callLLM(messagesPayload) {
    const prompt = messagesPayload.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');
    const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}`);
    if (!response.ok) {
      throw new Error(`LLM request failed (${response.status})`);
    }
    return (await response.text()).trim();
  }

  const chatHistory = [];
  const liveMetricsTriggers = ['h-index', 'h index', 'citations', 'google scholar', 'scopus', 'metrics'];

  async function fetchLiveMetricsSnapshot() {
    const scholarUrl = 'https://scholar.google.com/citations?user=PV8dJDkAAAAJ&hl=en';
    const scopusUrl = 'https://www.scopus.com/authid/detail.uri?authorId=57221928564';
    const [scholarText, scopusText] = await Promise.all([
      fetch(`https://r.jina.ai/http://${scholarUrl.replace(/^https?:\/\//, '')}`).then((r) => r.text()),
      fetch(`https://r.jina.ai/http://${scopusUrl.replace(/^https?:\/\//, '')}`).then((r) => r.text())
    ]);
    const hIndexPatterns = [/h-index[^0-9]{0,20}(\d{1,3})/i, /h index[^0-9]{0,20}(\d{1,3})/i];
    const citePatterns = [/citations[^0-9]{0,20}(\d{1,7})/i, /cited by[^0-9]{0,20}(\d{1,7})/i];
    const extract = (text, patterns) => {
      for (const p of patterns) {
        const m = text.match(p);
        if (m && m[1]) return m[1];
      }
      return null;
    };
    return {
      scholarH: extract(scholarText, hIndexPatterns),
      scholarCitations: extract(scholarText, citePatterns),
      scopusH: extract(scopusText, hIndexPatterns)
    };
  }

  async function ask() {
    const question = input.value.trim();
    if (!question) return;
    addBubble(question, 'user');
    input.value = '';
    const thinkingBubble = addBubble('Thinking…');
    send.disabled = true;
    try {
      const qLower = question.toLowerCase();
      if (liveMetricsTriggers.some((t) => qLower.includes(t))) {
        status.textContent = 'Checking live metrics...';
        try {
          const live = await fetchLiveMetricsSnapshot();
          const metricsReply = `Latest live snapshot I can retrieve right now:\n• Google Scholar h-index: ${live.scholarH || 'not detected'}\n• Google Scholar citations: ${live.scholarCitations || 'not detected'}\n• Scopus h-index: ${live.scopusH || 'not detected'}\n\nOfficial links:\n• Google Scholar: https://scholar.google.com/citations?user=PV8dJDkAAAAJ&hl=en\n• Scopus: https://www.scopus.com/authid/detail.uri?authorId=57221928564`;
          thinkingBubble.textContent = metricsReply;
          chatHistory.push({ role: 'assistant', content: metricsReply });
          status.textContent = 'Online mode enabled.';
          return;
        } catch (metricError) {
          status.textContent = 'Live metrics fetch failed; answering with known links.';
        }
      }
      const retrieved = retrieveContext(question, 10);
      const grounding = `PROFILE:\n${profileContext}\n\nRETRIEVED_CONTEXT:\n${retrieved.length ? retrieved.join('\n') : 'No highly relevant matches found.'}`;
      chatHistory.push({ role: 'user', content: question });
      const payload = [
        {
          role: 'system',
          content: `You are Francis AI, a modern assistant for this portfolio website.
Prioritize accuracy and clarity.
Use RETRIEVED_CONTEXT first when answering profile-related queries.
If context is insufficient, explicitly say so instead of inventing details.
${grounding}`
        },
        ...chatHistory.slice(-8)
      ];
      status.textContent = 'Thinking...';
      const text = await callLLM(payload);
      const finalText = text || 'I could not generate a response right now. Please try again.';
      thinkingBubble.textContent = finalText;
      chatHistory.push({ role: 'assistant', content: finalText });
      status.textContent = 'Online mode enabled.';
    } catch (err) {
      thinkingBubble.textContent = err.message || 'The LLM service is temporarily unavailable. Please try again in a moment.';
      status.textContent = 'Connection error. Please try again.';
    } finally {
      send.disabled = false;
    }
  }

  fab.addEventListener('click', () => {
    widget.classList.remove('hidden');
    fab.classList.add('hidden');
    if (!messages.dataset.booted) {
      addBubble('Hi! I’m Francis AI. Ask anything—especially about Francis, his works, and achievements.');
      messages.dataset.booted = '1';
    }
  });
  closeBtn.addEventListener('click', () => {
    widget.classList.add('hidden');
    fab.classList.remove('hidden');
  });

  send.addEventListener('click', ask);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') ask();
  });
  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      input.value = chip.dataset.question || '';
      ask();
    });
  });
}

// Run initialisation immediately or defer to DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initializePublications();
    initializeNews();
    initializeChatbot();
  });
} else {
  initializePublications();
  initializeNews();
  initializeChatbot();
}
