// Chatbot module

const { journalData = [], conferenceData = [], chapterData = [], newsData = [], profileContext = '' } = window.SiteData || {};

function initializeChatbot() {
  const messages = document.getElementById('chatbot-messages');
  const input = document.getElementById('chatbot-input');
  const send = document.getElementById('chatbot-send');
  const chips = document.querySelectorAll('.chatbot-chip');
  const fab = document.getElementById('chatbot-fab');
  const widget = document.getElementById('chatbot-widget');
  const closeBtn = document.getElementById('chatbot-close');
  const status = document.getElementById('chatbot-status');
  if (!messages || !input || !send || !fab || !widget) return;
  const statusEl = status || { textContent: '' };

  const allWorks = [
    ...journalData.map((w) => ({ ...w, type: 'Journal' })),
    ...conferenceData.map((w) => ({ ...w, type: 'Conference' })),
    ...chapterData.map((w) => ({ ...w, type: 'Chapter' }))
  ];
  const rag = window.FrancisRAG;
  const siteData = { journalData, conferenceData, chapterData, newsData, profileContext };

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

  function buildLocalFallback(question, retrieved) {
    const q = (question || '').toLowerCase();
    if (q.includes('contact') || q.includes('email') || q.includes('reach')) {
      return 'You can contact Dr. Francis Jesmar P. Montalbo via francismontalbo@ieee.org and francisjesmar.montalbo@g.batstate-u.edu.ph. Profiles: Google Scholar, Scopus, ORCID, LinkedIn, and ResearchGate are available on this page.';
    }
    if (q.includes('h-index') || q.includes('h index') || q.includes('citation') || q.includes('scopus') || q.includes('scholar')) {
      return 'For the latest metrics, please check the official profiles directly: Google Scholar (user=PV8dJDkAAAAJ) and Scopus (authorId=57221928564).';
    }
    if (retrieved && retrieved.length) {
      return `Based on available on-page data, the most relevant information is:\n• ${retrieved.slice(0, 4).join('\n• ')}`;
    }
    return 'I’m currently unable to reach the live model. Please try again in a moment, or ask about publications, recognitions, contact details, or profiles shown on this page.';
  }

  var chatHistory = window.__francisChatHistory || [];
  window.__francisChatHistory = chatHistory;
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
        statusEl.textContent = 'Checking live metrics...';
        try {
          const live = await fetchLiveMetricsSnapshot();
          const metricsReply = `Latest live snapshot I can retrieve right now:\n• Google Scholar h-index: ${live.scholarH || 'not detected'}\n• Google Scholar citations: ${live.scholarCitations || 'not detected'}\n• Scopus h-index: ${live.scopusH || 'not detected'}\n\nOfficial links:\n• Google Scholar: https://scholar.google.com/citations?user=PV8dJDkAAAAJ&hl=en\n• Scopus: https://www.scopus.com/authid/detail.uri?authorId=57221928564`;
          thinkingBubble.textContent = metricsReply;
          chatHistory.push({ role: 'assistant', content: metricsReply });
          statusEl.textContent = 'Online mode enabled.';
          return;
        } catch (metricError) {
          statusEl.textContent = 'Live metrics fetch failed; answering with known links.';
        }
      }
      const retrieved = rag ? rag.buildContext(question, siteData, 12) : [];
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
      statusEl.textContent = 'Thinking...';
      const text = await callLLM(payload);
      const finalText = text || buildLocalFallback(question, retrieved);
      thinkingBubble.textContent = finalText;
      chatHistory.push({ role: 'assistant', content: finalText });
      statusEl.textContent = 'Online mode enabled.';
    } catch (err) {
      const retrieved = rag ? rag.buildContext(question, siteData, 12) : [];
      thinkingBubble.textContent = buildLocalFallback(question, retrieved);
      statusEl.textContent = 'Live model unreachable; fallback mode active.';
    } finally {
      send.disabled = false;
    }
  }

  const openWidget = () => {
    widget.classList.remove('hidden');
    widget.style.display = 'block';
    fab.classList.add('hidden');
    fab.setAttribute('aria-expanded', 'true');
    if (!messages.dataset.booted) {
      addBubble('Hi! I’m Francis AI. Ask anything—especially about Francis, his works, and achievements.');
      messages.dataset.booted = '1';
    }
  };
  const closeWidget = () => {
    widget.classList.add('hidden');
    widget.style.display = '';
    fab.classList.remove('hidden');
    fab.setAttribute('aria-expanded', 'false');
  };

  fab.addEventListener('click', openWidget);
  fab.addEventListener('pointerdown', openWidget);
  if (closeBtn) closeBtn.addEventListener('click', closeWidget);

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


if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    try { initializeChatbot(); } catch (e) { console.error('Chatbot init failed:', e); }
  });
} else {
  try { initializeChatbot(); } catch (e) { console.error('Chatbot init failed:', e); }
}
