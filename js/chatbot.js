// Chatbot module

const { journalData = [], conferenceData = [], chapterData = [], newsData = [], profileContext = '' } = window.SiteData || {};
const DEFAULT_GEMINI_MODEL = 'gemini-flash-latest';
const GEMINI_TIMEOUT_MS = 25000;
const DEFAULT_THINKING_BUDGET = 1024;
const GEMINI_API_KEY_STORAGE_KEY = 'francis-ai-gemini-api-key';
const CHAT_INPUT_LIMITS = {
  maxCharacters: 800,
  maxLines: 12,
  maxUrls: 3,
  maxRepeatedCharacterRun: 40,
  maxMessagesPerWindow: 6,
  windowMs: 60000,
  minIntervalMs: 1200,
  duplicateWindowMs: 30000,
  cooldownMs: 15000
};
const SEARCH_TRIGGER_TERMS = [
  'latest', 'current', 'today', 'now', 'recent', 'updated', 'search', 'web', 'internet',
  'source', 'sources', 'verify', 'citation', 'citations', 'h-index', 'h index',
  'google scholar', 'scopus', 'news', 'award', 'recognition'
];

function readLocalSetting(key) {
  try {
    return window.localStorage ? window.localStorage.getItem(key) : '';
  } catch (error) {
    return '';
  }
}

function getConfiguredNumber(value, fallback) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function includesTriggerTerm(text, term) {
  const pattern = escapeRegExp(term).replace(/\s+/g, '\\s+');
  return new RegExp(`(^|[^a-z0-9])${pattern}([^a-z0-9]|$)`).test(text);
}

function cleanAssistantText(text) {
  return String(text || '')
    .replace(/\*\*/g, '')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/[ \t]+\n/g, '\n')
    .trim();
}

function splitTrailingLinkPunctuation(rawHref) {
  let href = String(rawHref || '');
  let trailing = '';

  while (/[.,!?;:]$/.test(href)) {
    trailing = href.slice(-1) + trailing;
    href = href.slice(0, -1);
  }

  while (
    href.endsWith(')') &&
    (href.match(/\(/g) || []).length < (href.match(/\)/g) || []).length
  ) {
    trailing = ')' + trailing;
    href = href.slice(0, -1);
  }

  return { href, trailing };
}

function normalizeAssistantHref(rawHref) {
  const href = String(rawHref || '').trim();
  if (!href || /[\u0000-\u001f\s<>]/.test(href)) return '';
  if (href.startsWith('#')) return /^#[a-z][\w-]*$/i.test(href) ? href : '';

  try {
    const baseUrl = window.location?.href || 'https://francismontalbo.github.io/';
    const url = new URL(href, baseUrl);
    if (url.protocol === 'http:' || url.protocol === 'https:' || url.protocol === 'mailto:') {
      return url.href;
    }
  } catch (error) {
    return '';
  }

  return '';
}

function appendTextSegment(segments, text) {
  if (!text) return;
  const last = segments[segments.length - 1];
  if (last?.type === 'text') {
    last.text += text;
  } else {
    segments.push({ type: 'text', text });
  }
}

function appendEmailSegments(segments, text) {
  const emailPattern = /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/gi;
  let cursor = 0;
  let match;

  while ((match = emailPattern.exec(text))) {
    appendTextSegment(segments, text.slice(cursor, match.index));
    const email = match[0];
    const href = normalizeAssistantHref(`mailto:${email}`);
    if (href) {
      segments.push({ type: 'link', text: email, href });
    } else {
      appendTextSegment(segments, email);
    }
    cursor = match.index + email.length;
  }

  appendTextSegment(segments, text.slice(cursor));
}

function appendAutoLinkedSegments(segments, text) {
  const autoLinkPattern = /\b(?:https?:\/\/|mailto:)[^\s<]+/gi;
  let cursor = 0;
  let match;

  while ((match = autoLinkPattern.exec(text))) {
    appendEmailSegments(segments, text.slice(cursor, match.index));
    const rawMatch = match[0];
    const { href: hrefWithoutTrailing, trailing } = splitTrailingLinkPunctuation(rawMatch);
    const href = normalizeAssistantHref(hrefWithoutTrailing);
    if (href) {
      segments.push({ type: 'link', text: hrefWithoutTrailing, href });
    } else {
      appendTextSegment(segments, rawMatch);
    }
    appendTextSegment(segments, trailing);
    cursor = match.index + rawMatch.length;
  }

  appendEmailSegments(segments, text.slice(cursor));
}

function parseAssistantSegments(text) {
  const cleaned = cleanAssistantText(text);
  const segments = [];
  const markdownLinkPattern = /\[([^\]\n]{1,160})\]\(([^)\s]+)\)/g;
  let cursor = 0;
  let match;

  while ((match = markdownLinkPattern.exec(cleaned))) {
    appendAutoLinkedSegments(segments, cleaned.slice(cursor, match.index));
    const label = cleanAssistantText(match[1]);
    const href = normalizeAssistantHref(match[2]);
    if (href && label) {
      segments.push({ type: 'link', text: label, href });
    } else {
      appendTextSegment(segments, label || match[0]);
    }
    cursor = match.index + match[0].length;
  }

  appendAutoLinkedSegments(segments, cleaned.slice(cursor));
  return segments;
}

function renderAssistantContent(container, text) {
  container.textContent = '';
  parseAssistantSegments(text).forEach((segment) => {
    if (segment.type !== 'link') {
      container.appendChild(document.createTextNode(segment.text));
      return;
    }

    const link = document.createElement('a');
    link.href = segment.href;
    link.textContent = segment.text;
    link.className = 'text-accent2 underline underline-offset-2 hover:text-accent break-words';
    if (!segment.href.startsWith('mailto:') && !segment.href.startsWith('#')) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }
    container.appendChild(link);
  });
}

function setBubbleContent(bubble, text, role = 'assistant') {
  if (role === 'assistant') {
    renderAssistantContent(bubble, text);
    return;
  }
  bubble.textContent = text;
}

function buildGuardMessage(reason, details = {}) {
  if (reason === 'empty') return 'Please type a question first.';
  if (reason === 'too_long') return `Please keep messages under ${details.maxCharacters || CHAT_INPUT_LIMITS.maxCharacters} characters so the assistant stays fast and affordable.`;
  if (reason === 'too_many_lines') return `Please keep pasted text to ${details.maxLines || CHAT_INPUT_LIMITS.maxLines} lines or fewer.`;
  if (reason === 'repeated_characters') return 'Please avoid repeated-character floods. Ask the question in normal text and I can help.';
  if (reason === 'too_many_links') return `Please send at most ${details.maxUrls || CHAT_INPUT_LIMITS.maxUrls} links at a time.`;
  if (reason === 'duplicate') return 'That looks like the same message again. Give me a slightly different question if you want me to try another angle.';
  if (reason === 'too_fast') return 'Please wait a moment before sending another message.';
  if (reason === 'rate_limited' || reason === 'cooldown') {
    const seconds = Math.max(1, Math.ceil((details.retryAfterMs || CHAT_INPUT_LIMITS.cooldownMs) / 1000));
    return `Too many messages in a short burst. Please try again in about ${seconds} seconds.`;
  }
  return 'I could not send that message. Please shorten it or try again in a moment.';
}

function validateChatInput(input, options = {}) {
  const limits = { ...CHAT_INPUT_LIMITS, ...options };
  const normalized = (input || '').replace(/\r\n?/g, '\n').trim();

  if (!normalized) {
    return { allowed: false, reason: 'empty', message: buildGuardMessage('empty'), normalized };
  }

  if (normalized.length > limits.maxCharacters) {
    return {
      allowed: false,
      reason: 'too_long',
      message: buildGuardMessage('too_long', limits),
      normalized: normalized.slice(0, limits.maxCharacters)
    };
  }

  if (normalized.split('\n').length > limits.maxLines) {
    return {
      allowed: false,
      reason: 'too_many_lines',
      message: buildGuardMessage('too_many_lines', limits),
      normalized
    };
  }

  if (new RegExp(`(.)\\1{${limits.maxRepeatedCharacterRun},}`).test(normalized)) {
    return {
      allowed: false,
      reason: 'repeated_characters',
      message: buildGuardMessage('repeated_characters'),
      normalized
    };
  }

  const urls = normalized.match(/https?:\/\/\S+/gi) || [];
  if (urls.length > limits.maxUrls) {
    return {
      allowed: false,
      reason: 'too_many_links',
      message: buildGuardMessage('too_many_links', limits),
      normalized
    };
  }

  return { allowed: true, reason: 'ok', message: '', normalized };
}

function createChatAbuseGuard(options = {}) {
  const limits = { ...CHAT_INPUT_LIMITS, ...options };
  const state = {
    acceptedAt: [],
    blockedUntil: 0,
    lastMessage: '',
    lastAcceptedAt: 0,
    lastAttemptAt: 0
  };

  return {
    check(input, now = Date.now()) {
      const validation = validateChatInput(input, limits);
      if (!validation.allowed) return validation;

      if (state.blockedUntil > now) {
        const retryAfterMs = state.blockedUntil - now;
        return {
          allowed: false,
          reason: 'cooldown',
          message: buildGuardMessage('cooldown', { retryAfterMs }),
          retryAfterMs,
          normalized: validation.normalized
        };
      }

      const normalizedKey = validation.normalized.toLowerCase().replace(/\s+/g, ' ');
      if (state.lastMessage === normalizedKey && now - state.lastAcceptedAt < limits.duplicateWindowMs) {
        state.lastAttemptAt = now;
        return {
          allowed: false,
          reason: 'duplicate',
          message: buildGuardMessage('duplicate'),
          normalized: validation.normalized
        };
      }

      if (state.lastAttemptAt && now - state.lastAttemptAt < limits.minIntervalMs) {
        const retryAfterMs = limits.minIntervalMs - (now - state.lastAttemptAt);
        state.lastAttemptAt = now;
        return {
          allowed: false,
          reason: 'too_fast',
          message: buildGuardMessage('too_fast'),
          retryAfterMs,
          normalized: validation.normalized
        };
      }

      state.acceptedAt = state.acceptedAt.filter((timestamp) => now - timestamp < limits.windowMs);
      if (state.acceptedAt.length >= limits.maxMessagesPerWindow) {
        state.blockedUntil = now + limits.cooldownMs;
        return {
          allowed: false,
          reason: 'rate_limited',
          message: buildGuardMessage('rate_limited', { retryAfterMs: limits.cooldownMs }),
          retryAfterMs: limits.cooldownMs,
          normalized: validation.normalized
        };
      }

      state.acceptedAt.push(now);
      state.lastAcceptedAt = now;
      state.lastAttemptAt = now;
      state.lastMessage = normalizedKey;
      return validation;
    },
    reset() {
      state.acceptedAt = [];
      state.blockedUntil = 0;
      state.lastMessage = '';
      state.lastAcceptedAt = 0;
      state.lastAttemptAt = 0;
    }
  };
}

function getGeminiConfig() {
  const config = window.FrancisAIConfig || {};
  return {
    apiKey: config.geminiApiKey || readLocalSetting(GEMINI_API_KEY_STORAGE_KEY) || '',
    model: config.geminiModel || DEFAULT_GEMINI_MODEL,
    enableSearchGrounding: config.enableSearchGrounding !== false,
    thinkingBudget: getConfiguredNumber(config.thinkingBudget, DEFAULT_THINKING_BUDGET)
  };
}

function buildGeminiRequest(messagesPayload, options = {}) {
  const systemText = messagesPayload
    .filter((message) => message.role === 'system' && message.content)
    .map((message) => message.content.trim())
    .filter(Boolean)
    .join('\n\n');

  const contents = messagesPayload
    .filter((message) => message.role !== 'system' && message.content)
    .map((message) => ({
      role: message.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: message.content.trim() }]
    }))
    .filter((message) => message.parts[0].text);

  const request = {
    ...(systemText ? { systemInstruction: { parts: [{ text: systemText }] } } : {}),
    contents,
    generationConfig: {
      temperature: 0.35,
      topP: 0.9,
      maxOutputTokens: 1200
    }
  };

  const thinkingBudget = getConfiguredNumber(options.thinkingBudget, NaN);
  if (Number.isFinite(thinkingBudget)) {
    request.generationConfig.thinkingConfig = { thinkingBudget };
  }

  if (options.useSearch) {
    request.tools = [{ google_search: {} }];
  }

  return request;
}

function extractGeminiResponse(data) {
  if (data?.error) {
    throw new Error(data.error.message || 'Gemini request failed');
  }

  const text = data?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || '')
    .filter(Boolean)
    .join('\n')
    .trim();

  if (!text) {
    const finishReason = data?.candidates?.[0]?.finishReason;
    throw new Error(finishReason ? `Gemini returned no text (${finishReason})` : 'Gemini returned no text');
  }

  const groundingMetadata = data?.candidates?.[0]?.groundingMetadata || {};
  const seenSources = new Set();
  const sources = (groundingMetadata.groundingChunks || [])
    .map((chunk) => chunk?.web)
    .filter((web) => web?.uri)
    .map((web) => ({
      title: web.title || web.uri,
      uri: web.uri
    }))
    .filter((source) => {
      if (seenSources.has(source.uri)) return false;
      seenSources.add(source.uri);
      return true;
    });

  return {
    text,
    sources,
    searchQueries: groundingMetadata.webSearchQueries || []
  };
}

function extractGeminiText(data) {
  return extractGeminiResponse(data).text;
}

function formatGeminiReply(response) {
  const text = cleanAssistantText(response?.text || '');
  const sources = (response?.sources || [])
    .filter((source) => source?.uri && !text.includes(source.uri))
    .slice(0, 4);

  if (!sources.length) return text;

  const sourceLines = sources.map((source) => `- ${cleanAssistantText(source.title || 'Source')}: ${source.uri}`);
  return `${text}\n\nSources:\n${sourceLines.join('\n')}`;
}

function shouldUseSearch(question, retrieved = []) {
  const normalized = (question || '').toLowerCase();
  if (!normalized.trim()) return false;
  if (/^(hi|hello|hey|thanks|thank you)\b/.test(normalized.trim())) return false;
  if (SEARCH_TRIGGER_TERMS.some((term) => includesTriggerTerm(normalized, term))) return true;
  return retrieved.length < 2 && normalized.split(/\s+/).filter(Boolean).length > 3;
}

async function callGemini(messagesPayload, options = {}) {
  const { apiKey, model, thinkingBudget } = getGeminiConfig();
  if (!apiKey) throw new Error('Missing Gemini API key');

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timeoutId = controller ? setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS) : null;
  const sendRequest = async (requestOptions) => {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': apiKey
      },
      body: JSON.stringify(buildGeminiRequest(messagesPayload, {
        useSearch: requestOptions.useSearch,
        thinkingBudget: requestOptions.thinkingBudget
      })),
      ...(controller ? { signal: controller.signal } : {})
    });
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const error = new Error(data?.error?.message || `Gemini request failed (${response.status})`);
      error.status = response.status;
      throw error;
    }

    window.__francisLastGeminiUsedSearch = Boolean(requestOptions.useSearch);
    return formatGeminiReply(extractGeminiResponse(data));
  };

  try {
    try {
      return await sendRequest({
        useSearch: options.useSearch,
        thinkingBudget: options.thinkingBudget ?? thinkingBudget
      });
    } catch (error) {
      if (options.useSearch && (error.status === 429 || error.status >= 500)) {
        return await sendRequest({
          useSearch: false,
          thinkingBudget: options.thinkingBudget ?? thinkingBudget
        });
      }
      throw error;
    }
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

window.FrancisChatbotInternals = {
  buildGeminiRequest,
  cleanAssistantText,
  extractGeminiResponse,
  extractGeminiText,
  formatGeminiReply,
  getGeminiConfig,
  normalizeAssistantHref,
  parseAssistantSegments,
  renderAssistantContent,
  shouldUseSearch,
  validateChatInput,
  createChatAbuseGuard,
  callGemini
};

function initializeChatbot() {
  const messages = document.getElementById('chatbot-messages');
  let input = document.getElementById('chatbot-input');
  let send = document.getElementById('chatbot-send');
  const chips = document.querySelectorAll('.chatbot-chip');
  const fab = document.getElementById('chatbot-fab');
  const widget = document.getElementById('chatbot-widget');
  const closeBtn = document.getElementById('chatbot-close');
  const expandBtn = document.getElementById('chatbot-expand');
  const status = document.getElementById('chatbot-status');
  if (!messages || !input || !send || !fab || !widget) return;
  if (send.dataset.boundLive === '1') return;
  if (send.dataset.boundFallback === '1') {
    const freshSend = send.cloneNode(true);
    const freshInput = input.cloneNode(true);
    send.replaceWith(freshSend);
    input.replaceWith(freshInput);
    send = freshSend;
    input = freshInput;
    delete send.dataset.boundFallback;
  }
  send.dataset.boundLive = '1';
  fab.dataset.boundLiveToggle = '1';
  widget.dataset.boundLiveToggle = '1';
  const statusEl = status || { textContent: '' };

  const allWorks = [
    ...journalData.map((w) => ({ ...w, type: 'Journal' })),
    ...conferenceData.map((w) => ({ ...w, type: 'Conference' })),
    ...chapterData.map((w) => ({ ...w, type: 'Chapter' }))
  ];
  const rag = window.FrancisRAG;
  const siteData = { journalData, conferenceData, chapterData, newsData, profileContext };
  const abuseGuard = createChatAbuseGuard();
  input.setAttribute('maxlength', String(CHAT_INPUT_LIMITS.maxCharacters));

  function setupBotCursorTracking() {
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let pointerX = window.innerWidth / 2;
    let pointerY = window.innerHeight / 2;
    let frame = 0;
    const vars = [
      ['--bot-hair-x', '--bot-hair-y', -2, -1.6],
      ['--bot-head-x', '--bot-head-y', 3.8, 3],
      ['--bot-face-x', '--bot-face-y', 6.4, 4.8],
      ['--bot-expression-x', '--bot-expression-y', 12, 8.4],
      ['--bot-eye-x', '--bot-eye-y', 3.8, 2.4],
      ['--bot-mouth-x', '--bot-mouth-y', 1.6, 1.1]
    ];

    const setTrackingVars = (dirX = 0, dirY = 0, influence = 0) => {
      vars.forEach(([xVar, yVar, maxX, maxY]) => {
        fab.style.setProperty(xVar, `${(dirX * maxX * influence).toFixed(2)}px`);
        fab.style.setProperty(yVar, `${(dirY * maxY * influence).toFixed(2)}px`);
      });
    };

    const updateTracking = () => {
      frame = 0;
      if (fab.classList.contains('hidden')) return;
      const rect = fab.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = pointerX - centerX;
      const deltaY = pointerY - centerY;
      const distance = Math.hypot(deltaX, deltaY);
      if (distance < 1) {
        setTrackingVars();
        return;
      }
      const influence = Math.min(distance / 260, 1);
      setTrackingVars(deltaX / distance, deltaY / distance, influence);
    };

    const handlePointer = (event) => {
      if (event.pointerType && !['mouse', 'pen'].includes(event.pointerType)) return;
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (!frame) frame = window.requestAnimationFrame(updateTracking);
    };

    document.addEventListener('pointermove', (event) => {
      handlePointer(event);
    }, { passive: true });
    document.addEventListener('mousemove', (event) => {
      handlePointer(event);
    }, { passive: true });

    window.addEventListener('blur', () => setTrackingVars());
  }

  setupBotCursorTracking();

  const speechMotion = (() => {
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const active = new Map();
    let frame = 0;
    const getNow = () => (window.performance && typeof window.performance.now === 'function'
      ? window.performance.now()
      : Date.now());
    const requestTalkFrame = (callback) => {
      if (typeof window.requestAnimationFrame === 'function') {
        return window.requestAnimationFrame(callback);
      }
      return window.setTimeout(() => callback(getNow()), 33);
    };

    const pattern = [
      [0, 0],
      [0.1, 0.1],
      [0.24, 0.88],
      [0.36, 0.54],
      [0.48, 0.94],
      [0.6, 0.16],
      [0.74, 0.72],
      [0.86, 1],
      [0.95, 0.34],
      [1, 0]
    ];
    const clampUnit = (value) => Math.min(Math.max(value, 0), 1);
    const smoothStep = (value) => value * value * (3 - 2 * value);
    const samplePattern = (phase) => {
      for (let i = 0; i < pattern.length - 1; i += 1) {
        const [fromPhase, fromOpen] = pattern[i];
        const [toPhase, toOpen] = pattern[i + 1];
        if (phase >= fromPhase && phase <= toPhase) {
          const progress = smoothStep((phase - fromPhase) / (toPhase - fromPhase));
          return fromOpen + (toOpen - fromOpen) * progress;
        }
      }
      return 0;
    };
    const setMouthVars = (target, open) => {
      const openness = clampUnit(open);
      const smile = Math.max(0.08, 1 - openness * 1.28);
      const scale = 0.22 + openness * 1.38;
      const wide = 1.1 - openness * 0.08;
      const smileWide = 1 + (1 - openness) * 0.04;
      target.style.setProperty('--chatbot-talk-open', openness.toFixed(3));
      target.style.setProperty('--chatbot-talk-scale', scale.toFixed(3));
      target.style.setProperty('--chatbot-talk-wide', wide.toFixed(3));
      target.style.setProperty('--chatbot-talk-smile', smile.toFixed(3));
      target.style.setProperty('--chatbot-talk-smile-wide', smileWide.toFixed(3));
      target.style.setProperty('--chatbot-talk-jaw', `${(openness * 1.8).toFixed(2)}px`);
    };
    const tick = (time) => {
      if (!active.size) {
        frame = 0;
        return;
      }
      active.forEach((meta, target) => {
        const phase = ((time - meta.startedAt + meta.offset) % meta.cycle) / meta.cycle;
        const pulse = samplePattern(phase);
        const tinyVariation = Math.sin((time + meta.offset) / 130) * 0.025
          + Math.sin((time + meta.offset) / 220) * 0.018;
        setMouthVars(target, pulse + tinyVariation);
      });
      frame = requestTalkFrame(tick);
    };
    const start = (target) => {
      if (!target || prefersReducedMotion) return;
      if (!active.has(target)) {
        active.set(target, {
          cycle: 1120 + Math.floor(Math.random() * 260),
          offset: Math.floor(Math.random() * 360),
          startedAt: getNow()
        });
      }
      if (!frame) frame = requestTalkFrame(tick);
    };
    const stop = (target) => {
      if (!target) return;
      active.delete(target);
      setMouthVars(target, 0);
    };
    return { start, stop };
  })();

  function setupGreetingRotation() {
    const titleEl = document.getElementById('chatbot-greeting-title');
    const copyEl = document.getElementById('chatbot-greeting-copy');
    if (!titleEl || !copyEl) return;
    const greetings = [
      ['Curious?', 'Click for a quick research tour.'],
      ['Need a shortcut?', 'I can summarize Dr. Montalbo fast.'],
      ['Tiny guide here.', 'Big AI research story inside.'],
      ['Research tour?', 'Ask me about his works and awards.'],
      ['Quick fact:', 'His page maps AI, deep learning, and health informatics.'],
      ['Publication path?', 'I know where the good links are.'],
      ['Respectfully nerdy:', 'His work list keeps me busy.'],
      ['Want highlights?', 'Click for Dr. Montalbo\'s research profile.'],
      ['Scholar mode?', 'I can point you to profiles and publications.'],
      ['Small bot, big notes.', 'Let me show why his work stands out.']
    ];
    let index = 0;
    let speechTimer = 0;
    const speakBriefly = (duration = 1800) => {
      window.clearTimeout(speechTimer);
      fab.classList.add('chatbot-speaking');
      speechMotion.start(fab);
      speechTimer = window.setTimeout(() => {
        fab.classList.remove('chatbot-speaking');
        speechMotion.stop(fab);
      }, duration);
    };
    const setGreeting = () => {
      const [title, copy] = greetings[index % greetings.length];
      titleEl.textContent = title;
      copyEl.textContent = copy;
      index += 1;
      speakBriefly();
    };
    setGreeting();
    window.setInterval(setGreeting, 5200);
    fab.addEventListener('mouseenter', setGreeting, { passive: true });
    fab.addEventListener('focus', setGreeting, { passive: true });
  }

  setupGreetingRotation();

  const dragStorage = {
    get(key) {
      try {
        return JSON.parse(window.localStorage.getItem(key) || 'null');
      } catch (_) {
        return null;
      }
    },
    set(key, value) {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (_) {
        // Position memory is a convenience only.
      }
    }
  };
  const FAB_POSITION_KEY = 'francisChatbotFabPosition';
  const WIDGET_POSITION_KEY = 'francisChatbotWidgetPosition';
  const DRAG_MARGIN = 12;
  const DRAG_THRESHOLD = 6;

  const isMobileChatLayout = () => window.matchMedia && window.matchMedia('(max-width: 767.98px)').matches;
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const clearPositionStyles = (el) => {
    ['left', 'top', 'right', 'bottom', 'transform'].forEach((prop) => el.style.removeProperty(prop));
  };
  const setFixedPosition = (el, left, top) => {
    const maxLeft = Math.max(DRAG_MARGIN, window.innerWidth - el.offsetWidth - DRAG_MARGIN);
    const maxTop = Math.max(DRAG_MARGIN, window.innerHeight - el.offsetHeight - DRAG_MARGIN);
    const nextLeft = clamp(left, DRAG_MARGIN, maxLeft);
    const nextTop = clamp(top, DRAG_MARGIN, maxTop);
    el.style.setProperty('left', `${Math.round(nextLeft)}px`, 'important');
    el.style.setProperty('top', `${Math.round(nextTop)}px`, 'important');
    el.style.setProperty('right', 'auto', 'important');
    el.style.setProperty('bottom', 'auto', 'important');
    return { left: Math.round(nextLeft), top: Math.round(nextTop) };
  };
  const saveElementPosition = (el, key) => {
    const inlineLeft = parseFloat(el.style.getPropertyValue('left'));
    const inlineTop = parseFloat(el.style.getPropertyValue('top'));
    if (Number.isFinite(inlineLeft) && Number.isFinite(inlineTop)) {
      dragStorage.set(key, { left: Math.round(inlineLeft), top: Math.round(inlineTop) });
      return;
    }
    const rect = el.getBoundingClientRect();
    dragStorage.set(key, { left: Math.round(rect.left), top: Math.round(rect.top) });
  };
  const applySavedPosition = (el, key) => {
    const saved = dragStorage.get(key);
    if (!saved || !Number.isFinite(saved.left) || !Number.isFinite(saved.top)) return false;
    setFixedPosition(el, saved.left, saved.top);
    return true;
  };
  const positionWidgetNearFab = () => {
    if (isMobileChatLayout()) {
      clearPositionStyles(widget);
      return;
    }
    if (applySavedPosition(widget, WIDGET_POSITION_KEY)) return;
    const fabRect = fab.getBoundingClientRect();
    const widgetWidth = widget.offsetWidth || 392;
    const widgetHeight = widget.offsetHeight || 560;
    const left = clamp(fabRect.left, DRAG_MARGIN, window.innerWidth - widgetWidth - DRAG_MARGIN);
    const preferredTop = fabRect.top - widgetHeight - 16;
    const fallbackTop = fabRect.bottom + 16;
    const top = preferredTop >= DRAG_MARGIN ? preferredTop : fallbackTop;
    setFixedPosition(widget, left, top);
  };
  const positionFabNearWidget = () => {
    if (isMobileChatLayout()) return;
    const widgetRect = widget.getBoundingClientRect();
    const fabWidth = fab.offsetWidth || 76;
    const fabHeight = fab.offsetHeight || 76;
    const left = clamp(widgetRect.left, DRAG_MARGIN, window.innerWidth - fabWidth - DRAG_MARGIN);
    const top = clamp(widgetRect.bottom + 14, DRAG_MARGIN, window.innerHeight - fabHeight - DRAG_MARGIN);
    setFixedPosition(fab, left, top);
    saveElementPosition(fab, FAB_POSITION_KEY);
  };
  const clampSavedPositions = () => {
    if (!fab.classList.contains('hidden')) saveElementPosition(fab, FAB_POSITION_KEY);
    if (!widget.classList.contains('hidden') && !isMobileChatLayout()) saveElementPosition(widget, WIDGET_POSITION_KEY);
    if (applySavedPosition(fab, FAB_POSITION_KEY) && !fab.classList.contains('hidden')) return;
    if (!widget.classList.contains('hidden') && isMobileChatLayout()) clearPositionStyles(widget);
  };

  applySavedPosition(fab, FAB_POSITION_KEY);

  function addBubble(text, role = 'assistant') {
    const row = document.createElement('div');
    row.className = `chatbot-message-row ${role === 'user' ? 'chatbot-message-user' : 'chatbot-message-assistant'}`;
    const avatar = document.createElement('div');
    avatar.className = 'chatbot-avatar';
    if (role === 'user') {
      avatar.textContent = 'You';
    } else {
      avatar.innerHTML = '<span class="chatbot-avatar-bot" aria-hidden="true"><span class="chatbot-avatar-bot-eye"></span><span class="chatbot-avatar-bot-eye"></span><span class="chatbot-avatar-bot-mouth"></span></span><span class="sr-only">AI</span>';
    }
    const bubble = document.createElement('div');
    bubble.className = 'chatbot-message-bubble';
    bubble.style.whiteSpace = 'pre-line';
    setBubbleContent(bubble, text, role);
    row.appendChild(avatar);
    row.appendChild(bubble);
    messages.appendChild(row);
    messages.scrollTop = messages.scrollHeight;
    return bubble;
  }

  function buildLocalFallback(question, retrieved) {
    const q = (question || '').toLowerCase();
    if (q.includes('contact') || q.includes('email') || q.includes('reach')) {
      return 'You can contact Dr. Francis Jesmar P. Montalbo at francismontalbo@ieee.org or francisjesmar.montalbo@g.batstate-u.edu.ph.\n\nProfiles:\n- Google Scholar: https://scholar.google.com/citations?user=PV8dJDkAAAAJ&hl=en\n- Scopus: https://www.scopus.com/authid/detail.uri?authorId=57221928564\n- ORCID: https://orcid.org/0000-0002-1493-5080\n- LinkedIn: https://www.linkedin.com/in/sirjmmontalbo/\n- ResearchGate: https://www.researchgate.net/profile/Francis_Jesmar_Montalbo';
    }
    if (q.includes('h-index') || q.includes('h index') || q.includes('citation') || q.includes('scopus') || q.includes('scholar')) {
      return 'For the latest metrics, please check the official profiles directly:\n- Google Scholar: https://scholar.google.com/citations?user=PV8dJDkAAAAJ&hl=en\n- Scopus: https://www.scopus.com/authid/detail.uri?authorId=57221928564';
    }
    if (retrieved && retrieved.length) {
      return `Based on available on-page data, the most relevant information is:\n- ${retrieved.slice(0, 4).join('\n- ')}`;
    }
    return "I am currently unable to reach the live model. Please try again in a moment, or ask about publications, recognitions, contact details, or profiles shown on this page.";
  }

  var chatHistory = window.__francisChatHistory || [];
  window.__francisChatHistory = chatHistory;

  let assistantSpeechTimer = 0;
  let assistantSpeechRow = null;
  const animateAssistantSpeech = (row, text = '') => {
    if (!row) return;
    window.clearTimeout(assistantSpeechTimer);
    if (assistantSpeechRow && assistantSpeechRow !== row) {
      assistantSpeechRow.classList.remove('chatbot-message-speaking');
      speechMotion.stop(assistantSpeechRow);
    }
    assistantSpeechRow = row;
    row.classList.add('chatbot-message-speaking');
    widget.classList.add('chatbot-speaking');
    speechMotion.start(row);
    const duration = Math.min(2600, Math.max(900, String(text || '').length * 14));
    assistantSpeechTimer = window.setTimeout(() => {
      if (assistantSpeechRow === row) {
        row.classList.remove('chatbot-message-speaking');
        widget.classList.remove('chatbot-speaking');
        speechMotion.stop(row);
        assistantSpeechRow = null;
      }
      assistantSpeechTimer = 0;
    }, duration);
  };

  async function ask() {
    const guardResult = abuseGuard.check(input.value);
    if (!guardResult.allowed) {
      if (guardResult.reason !== 'empty') {
        addBubble(guardResult.message);
        statusEl.textContent = 'Message blocked by chat safety limits.';
      }
      return;
    }

    const question = guardResult.normalized;
    addBubble(question, 'user');
    input.value = '';
    const thinkingBubble = addBubble('Thinking...');
    const thinkingRow = thinkingBubble.closest('.chatbot-message-row');
    animateAssistantSpeech(thinkingRow, 'Thinking...');
    send.disabled = true;
    try {
      const retrieved = rag ? rag.buildContext(question, siteData, 12) : [];
      const config = getGeminiConfig();
      const useSearch = config.enableSearchGrounding && shouldUseSearch(question, retrieved);
      const grounding = `PROFILE:\n${profileContext}\n\nRETRIEVED_CONTEXT:\n${retrieved.length ? retrieved.join('\n') : 'No highly relevant matches found.'}`;
      chatHistory.push({ role: 'user', content: question });
      const payload = [
        {
          role: 'system',
          content: `You are Francis AI, a modern assistant for this portfolio website.
Speak naturally like a thoughtful human: warm, direct, and conversational.
Think carefully before answering, but do not reveal hidden chain-of-thought. Share a brief reason only when it helps the user.
Use PROFILE and RETRIEVED_CONTEXT first for questions about Francis, his work, achievements, publications, and contact details.
If retrieved context is thin, stale, or the user asks for current facts, use Google Search grounding when available and include useful sources.
Do not use Markdown bold markers like **. Prefer clean plain text, short paragraphs, and complete URLs when a source or profile link is useful.
Do not invent publications, metrics, awards, roles, dates, links, or contact details. If something cannot be verified, say what is missing.
${grounding}`
        },
        ...chatHistory.slice(-8)
      ];
      statusEl.textContent = useSearch ? 'Searching with Gemini...' : 'Thinking with Gemini...';
      const text = await callGemini(payload, { useSearch });
      const finalText = text || buildLocalFallback(question, retrieved);
      setBubbleContent(thinkingBubble, finalText);
      animateAssistantSpeech(thinkingRow, finalText);
      chatHistory.push({ role: 'assistant', content: finalText });
      statusEl.textContent = useSearch && window.__francisLastGeminiUsedSearch
        ? 'Gemini online with search grounding.'
        : `Gemini online with ${config.model}.`;
    } catch (err) {
      const retrieved = rag ? rag.buildContext(question, siteData, 12) : [];
      if ((err?.message || '').includes('Missing Gemini API key')) {
        const fallback = `Gemini is ready, but it needs an API key configured before I can answer live.\n\n${buildLocalFallback(question, retrieved)}`;
        setBubbleContent(thinkingBubble, fallback);
        animateAssistantSpeech(thinkingRow, fallback);
        statusEl.textContent = 'Gemini key missing; local fallback active.';
      } else {
        const fallback = buildLocalFallback(question, retrieved);
        setBubbleContent(thinkingBubble, fallback);
        animateAssistantSpeech(thinkingRow, fallback);
        statusEl.textContent = 'Live model unreachable; fallback mode active.';
      }
    } finally {
      send.disabled = false;
    }
  }

  const openWidget = () => {
    widget.classList.remove('hidden');
    widget.style.display = 'flex';
    positionWidgetNearFab();
    fab.classList.add('hidden');
    fab.setAttribute('aria-expanded', 'true');
    if (!messages.dataset.booted) {
      const welcome = "Hi! I'm Francis AI. Ask anything, especially about Francis, his works, and achievements.";
      const welcomeBubble = addBubble(welcome);
      animateAssistantSpeech(welcomeBubble.closest('.chatbot-message-row'), welcome);
      messages.dataset.booted = '1';
    }
  };
  const closeWidget = () => {
    if (!widget.classList.contains('chatbot-expanded')) positionFabNearWidget();
    widget.classList.add('hidden');
    widget.classList.remove('chatbot-expanded');
    widget.style.display = '';
    widget.style.removeProperty('transform');
    fab.classList.remove('hidden');
    fab.setAttribute('aria-expanded', 'false');
    if (expandBtn) {
      expandBtn.setAttribute('aria-expanded', 'false');
      expandBtn.setAttribute('aria-label', 'Expand Francis AI assistant');
      const icon = expandBtn.querySelector('i');
      if (icon) icon.className = 'fa-solid fa-up-right-and-down-left-from-center';
    }
  };

  const toggleExpanded = () => {
    const expanded = !widget.classList.contains('chatbot-expanded');
    widget.classList.toggle('chatbot-expanded', expanded);
    if (expanded) {
      clearPositionStyles(widget);
    } else {
      positionWidgetNearFab();
    }
    if (expandBtn) {
      expandBtn.setAttribute('aria-expanded', String(expanded));
      expandBtn.setAttribute('aria-label', expanded ? 'Shrink Francis AI assistant' : 'Expand Francis AI assistant');
      const icon = expandBtn.querySelector('i');
      if (icon) {
        icon.className = expanded
          ? 'fa-solid fa-down-left-and-up-right-to-center'
          : 'fa-solid fa-up-right-and-down-left-from-center';
      }
    }
    messages.scrollTop = messages.scrollHeight;
  };

  function setupChatbotDrag() {
    let activeDrag = null;
    let dragFrame = 0;

    const markDragged = (el) => {
      el.dataset.draggingRecent = '1';
      window.setTimeout(() => { delete el.dataset.draggingRecent; }, 420);
    };

    const updateDragPosition = (event) => {
      dragFrame = 0;
      if (!activeDrag) return;
      const deltaX = event.clientX - activeDrag.startX;
      const deltaY = event.clientY - activeDrag.startY;
      if (Math.abs(deltaX) > DRAG_THRESHOLD || Math.abs(deltaY) > DRAG_THRESHOLD) {
        activeDrag.hasMoved = true;
      }
      if (activeDrag.kind === 'widget' && isMobileChatLayout()) {
        const pullDistance = Math.max(0, deltaY);
        widget.style.setProperty('transform', `translateY(${Math.min(pullDistance, window.innerHeight * 0.42)}px)`, 'important');
        return;
      }
      setFixedPosition(activeDrag.el, activeDrag.baseLeft + deltaX, activeDrag.baseTop + deltaY);
    };

    const onDragMove = (event) => {
      if (!activeDrag) return;
      event.preventDefault();
      if (!dragFrame) {
        dragFrame = window.requestAnimationFrame(() => updateDragPosition(event));
      }
    };

    const endDrag = (event) => {
      if (!activeDrag) return;
      event.preventDefault();
      const drag = activeDrag;
      activeDrag = null;
      if (dragFrame) {
        window.cancelAnimationFrame(dragFrame);
        dragFrame = 0;
      }
      drag.el.classList.remove('chatbot-dragging');
      document.removeEventListener('pointermove', onDragMove);
      document.removeEventListener('pointerup', endDrag);
      document.removeEventListener('pointercancel', endDrag);
      try { drag.handle.releasePointerCapture(event.pointerId); } catch (_) {}

      if (drag.kind === 'fab') {
        if (drag.hasMoved) {
          markDragged(fab);
          fab.dataset.ignoreNextClick = '1';
          saveElementPosition(fab, FAB_POSITION_KEY);
        } else {
          fab.dataset.ignoreNextClick = '1';
          openWidget();
        }
        window.setTimeout(() => { delete fab.dataset.ignoreNextClick; }, 180);
        return;
      }

      if (drag.kind === 'widget' && isMobileChatLayout()) {
        const pullDistance = Math.max(0, event.clientY - drag.startY);
        widget.style.removeProperty('transform');
        if (drag.hasMoved && pullDistance > 120) {
          markDragged(widget);
          closeWidget();
        }
        return;
      }

      if (drag.hasMoved) {
        markDragged(widget);
        saveElementPosition(widget, WIDGET_POSITION_KEY);
      }
    };

    const startDrag = (kind, el, handle, event) => {
      if (event.button != null && event.button !== 0) return;
      if (kind === 'widget' && widget.classList.contains('chatbot-expanded')) return;
      if (kind === 'widget' && event.target.closest('button, a, input, textarea, select, label')) return;
      event.preventDefault();
      event.stopPropagation();
      try { handle.setPointerCapture(event.pointerId); } catch (_) {}
      const rect = el.getBoundingClientRect();
      activeDrag = {
        kind,
        el,
        handle,
        startX: event.clientX,
        startY: event.clientY,
        baseLeft: rect.left,
        baseTop: rect.top,
        hasMoved: false
      };
      el.classList.add('chatbot-dragging');
      document.addEventListener('pointermove', onDragMove, { passive: false });
      document.addEventListener('pointerup', endDrag, { passive: false });
      document.addEventListener('pointercancel', endDrag, { passive: false });
    };

    fab.addEventListener('pointerdown', (event) => startDrag('fab', fab, fab, event), { passive: false });
    const header = widget.querySelector('.chatbot-header');
    if (header) {
      header.addEventListener('pointerdown', (event) => startDrag('widget', widget, header, event), { passive: false });
    }
    window.addEventListener('resize', clampSavedPositions, { passive: true });
  }

  setupChatbotDrag();
  fab.addEventListener('click', (event) => {
    if (fab.dataset.ignoreNextClick === '1' || fab.dataset.draggingRecent === '1') {
      event.preventDefault();
      return;
    }
    openWidget();
  });
  if (closeBtn) closeBtn.addEventListener('click', closeWidget);
  if (expandBtn) expandBtn.addEventListener('click', toggleExpanded);

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

function loadOptionalChatbotConfig() {
  if (window.FrancisAIConfig || !document.head || typeof document.createElement !== 'function') {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'js/chatbot-config.local.js';
    script.async = false;
    script.onload = resolve;
    script.onerror = resolve;
    document.head.appendChild(script);
  });
}

function bootChatbot() {
  loadOptionalChatbotConfig().then(() => {
    try { initializeChatbot(); } catch (e) { console.error('Chatbot init failed:', e); }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootChatbot);
} else {
  bootChatbot();
}
