const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

function loadChatbot(options = {}) {
  const rows = [];
  const testFetch = options.fetch || fetch;
  const createNode = (tagName = '') => ({
    tagName: tagName ? tagName.toUpperCase() : undefined,
    children: [],
    attributes: {},
    className: '',
    href: '',
    rel: '',
    target: '',
    textContent: '',
    appendChild(child) {
      this.children.push(child);
      this.textContent += child.textContent || '';
      return child;
    },
    setAttribute(name, value) {
      this.attributes[name] = value;
      this[name] = value;
    }
  });
  const sandbox = {
    console,
    fetch: testFetch,
    setTimeout,
    clearTimeout,
    AbortController,
    URL,
    document: {
      readyState: 'complete',
      getElementById: () => null,
      querySelectorAll: () => rows,
      createElement: (tagName) => createNode(tagName),
      createTextNode: (text) => ({ nodeType: 3, textContent: text }),
      addEventListener: () => {}
    },
    window: {
      SiteData: {},
      FrancisAIConfig: options.config || { geminiApiKey: 'test-key' },
      location: { href: 'https://francismontalbo.github.io/' },
      addEventListener: () => {}
    }
  };
  sandbox.window.window = sandbox.window;
  sandbox.window.document = sandbox.document;
  sandbox.globalThis = sandbox;

  const code = fs.readFileSync(path.join(__dirname, '..', 'js', 'chatbot.js'), 'utf8');
  vm.runInNewContext(code, sandbox, { filename: 'js/chatbot.js' });
  return sandbox.window.FrancisChatbotInternals;
}

function loadRag() {
  const sandbox = {
    URL,
    window: {}
  };
  sandbox.window.location = { href: 'https://francismontalbo.github.io/' };
  sandbox.globalThis = sandbox;

  const code = fs.readFileSync(path.join(__dirname, '..', 'js', 'rag.js'), 'utf8');
  vm.runInNewContext(code, sandbox, { filename: 'js/rag.js' });
  return sandbox.window.FrancisRAG;
}

test('getGeminiConfig defaults to the requested Gemini Flash latest model', () => {
  const internals = loadChatbot();

  assert.equal(internals.getGeminiConfig().model, 'gemini-flash-latest');
});

test('buildGeminiRequest converts chat messages to Gemini format', () => {
  const internals = loadChatbot();

  const request = internals.buildGeminiRequest([
    { role: 'system', content: 'Use only grounded context.' },
    { role: 'user', content: 'Who is Francis?' },
    { role: 'assistant', content: 'Francis is a researcher.' }
  ]);

  assert.equal(request.systemInstruction.parts[0].text, 'Use only grounded context.');
  assert.deepEqual(request.contents.map((item) => item.role), ['user', 'model']);
  assert.equal(request.contents[0].parts[0].text, 'Who is Francis?');
  assert.equal(request.contents[1].parts[0].text, 'Francis is a researcher.');
  assert.equal(request.generationConfig.temperature, 0.35);
});

test('buildGeminiRequest enables thinking and Google Search grounding when requested', () => {
  const internals = loadChatbot();

  const request = internals.buildGeminiRequest([
    { role: 'system', content: 'Be accurate.' },
    { role: 'user', content: 'What is the latest citation count?' }
  ], { useSearch: true, thinkingBudget: 1024 });

  assert.deepEqual(JSON.parse(JSON.stringify(request.tools)), [{ google_search: {} }]);
  assert.equal(request.generationConfig.thinkingConfig.thinkingBudget, 1024);
});

test('extractGeminiText returns joined candidate text', () => {
  const internals = loadChatbot();

  const text = internals.extractGeminiText({
    candidates: [{
      content: {
        parts: [
          { text: 'First paragraph.' },
          { text: 'Second paragraph.' }
        ]
      }
    }]
  });

  assert.equal(text, 'First paragraph.\nSecond paragraph.');
});

test('extractGeminiResponse includes grounded web sources', () => {
  const internals = loadChatbot();

  const response = internals.extractGeminiResponse({
    candidates: [{
      content: {
        parts: [{ text: 'Francis has updated citation metrics.' }]
      },
      groundingMetadata: {
        webSearchQueries: ['Francis Montalbo citations'],
        groundingChunks: [
          { web: { title: 'Google Scholar', uri: 'https://scholar.google.com/citations?user=PV8dJDkAAAAJ' } },
          { web: { title: 'Scopus', uri: 'https://www.scopus.com/authid/detail.uri?authorId=57221928564' } }
        ]
      }
    }]
  });

  assert.equal(response.text, 'Francis has updated citation metrics.');
  assert.deepEqual(response.searchQueries, ['Francis Montalbo citations']);
  assert.deepEqual(JSON.parse(JSON.stringify(response.sources)), [
    { title: 'Google Scholar', uri: 'https://scholar.google.com/citations?user=PV8dJDkAAAAJ' },
    { title: 'Scopus', uri: 'https://www.scopus.com/authid/detail.uri?authorId=57221928564' }
  ]);
});

test('formatGeminiReply appends sources without duplicating URLs', () => {
  const internals = loadChatbot();

  const text = internals.formatGeminiReply({
    text: 'Use the official Google Scholar profile: https://scholar.google.com/citations?user=PV8dJDkAAAAJ',
    sources: [
      { title: 'Google Scholar', uri: 'https://scholar.google.com/citations?user=PV8dJDkAAAAJ' },
      { title: 'Scopus', uri: 'https://www.scopus.com/authid/detail.uri?authorId=57221928564' }
    ],
    searchQueries: []
  });

  assert.equal(text.includes('Sources:'), true);
  assert.equal((text.match(/https:\/\/scholar\.google\.com/g) || []).length, 1);
  assert.equal(text.includes('Scopus: https://www.scopus.com/authid/detail.uri?authorId=57221928564'), true);
});

test('formatGeminiReply removes awkward bold markdown from model replies', () => {
  const internals = loadChatbot();

  const text = internals.formatGeminiReply({
    text: '**Francis** focuses on **efficient AI** for medical imaging.',
    sources: []
  });

  assert.equal(text, 'Francis focuses on efficient AI for medical imaging.');
});

test('parseAssistantSegments converts safe URLs, emails, and markdown links into link segments', () => {
  const internals = loadChatbot();

  const segments = internals.parseAssistantSegments(
    'Email francismontalbo@ieee.org or visit [Scholar](https://scholar.google.com/citations?user=PV8dJDkAAAAJ). Also see https://www.scopus.com/authid/detail.uri?authorId=57221928564.'
  );
  const links = segments.filter((segment) => segment.type === 'link');

  assert.deepEqual(JSON.parse(JSON.stringify(links.map((link) => link.text))), [
    'francismontalbo@ieee.org',
    'Scholar',
    'https://www.scopus.com/authid/detail.uri?authorId=57221928564'
  ]);
  assert.deepEqual(JSON.parse(JSON.stringify(links.map((link) => link.href))), [
    'mailto:francismontalbo@ieee.org',
    'https://scholar.google.com/citations?user=PV8dJDkAAAAJ',
    'https://www.scopus.com/authid/detail.uri?authorId=57221928564'
  ]);
});

test('parseAssistantSegments leaves unsafe link schemes as plain text', () => {
  const internals = loadChatbot();

  const segments = internals.parseAssistantSegments('Do not open [bad](javascript:alert(1)) or javascript:alert(2).');

  assert.equal(segments.some((segment) => segment.type === 'link'), false);
  assert.equal(segments.map((segment) => segment.text).join('').includes('bad'), true);
});

test('renderAssistantContent creates real safe anchors without injecting HTML', () => {
  const internals = loadChatbot();
  const container = {
    children: [],
    textContent: 'old',
    appendChild(child) {
      this.children.push(child);
      this.textContent += child.textContent || '';
      return child;
    }
  };

  internals.renderAssistantContent(
    container,
    'Email francismontalbo@ieee.org and visit [Scholar](https://scholar.google.com/citations?user=PV8dJDkAAAAJ). Do not open [bad](javascript:alert(1)).'
  );

  const anchors = container.children.filter((child) => child.tagName === 'A');
  assert.equal(container.textContent.includes('**'), false);
  assert.equal(anchors.length, 2);
  assert.equal(anchors[0].href, 'mailto:francismontalbo@ieee.org');
  assert.equal(anchors[0].target, '');
  assert.equal(anchors[1].href, 'https://scholar.google.com/citations?user=PV8dJDkAAAAJ');
  assert.equal(anchors[1].target, '_blank');
  assert.equal(anchors[1].rel, 'noopener noreferrer');
  assert.equal(anchors.some((anchor) => anchor.href.startsWith('javascript:')), false);
});

test('shouldUseSearch returns true for fresh questions and thin RAG context', () => {
  const internals = loadChatbot();

  assert.equal(internals.shouldUseSearch('What is his latest h-index today?', ['Profile context']), true);
  assert.equal(internals.shouldUseSearch('Tell me about his early research areas', [
    'Profile context',
    '2019 | Journal | Deep learning paper',
    '2020 | Journal | Medical imaging paper'
  ]), false);
  assert.equal(internals.shouldUseSearch('Tell me about quantum awards', []), true);
});

test('validateChatInput rejects oversized pasted text before Gemini is called', () => {
  const internals = loadChatbot();
  const longPrompt = 'Please summarize this. ' + 'x'.repeat(900);

  const result = internals.validateChatInput(longPrompt);

  assert.equal(result.allowed, false);
  assert.equal(result.reason, 'too_long');
  assert.equal(result.normalized.length <= 800, true);
});

test('validateChatInput rejects repeated-character floods and too many links', () => {
  const internals = loadChatbot();

  assert.equal(internals.validateChatInput('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa').reason, 'repeated_characters');
  assert.equal(internals.validateChatInput('check https://a.test https://b.test https://c.test https://d.test').reason, 'too_many_links');
});

test('createChatAbuseGuard blocks duplicate and rapid-fire messages', () => {
  const internals = loadChatbot();
  const guard = internals.createChatAbuseGuard();

  assert.equal(guard.check('What are his research areas?', 1000).allowed, true);
  assert.equal(guard.check('What are his research areas?', 2000).reason, 'duplicate');
  assert.equal(guard.check('Another question?', 2300).reason, 'too_fast');
});

test('createChatAbuseGuard applies a short cooldown after too many messages', () => {
  const internals = loadChatbot();
  const guard = internals.createChatAbuseGuard({ maxMessagesPerWindow: 3, windowMs: 60000, minIntervalMs: 0, cooldownMs: 15000 });

  assert.equal(guard.check('one', 1000).allowed, true);
  assert.equal(guard.check('two', 2000).allowed, true);
  assert.equal(guard.check('three', 3000).allowed, true);
  assert.equal(guard.check('four', 4000).reason, 'rate_limited');
  assert.equal(guard.check('five', 5000).reason, 'cooldown');
});

test('callGemini retries without search grounding when search is rate limited', async () => {
  const requests = [];
  const fakeFetch = async (url, options) => {
    requests.push(JSON.parse(options.body));
    if (requests.length === 1) {
      return {
        ok: false,
        status: 429,
        json: async () => ({ error: { message: 'Too Many Requests' } })
      };
    }
    return {
      ok: true,
      json: async () => ({
        candidates: [{
          content: { parts: [{ text: 'Gemini answered without search.' }] }
        }]
      })
    };
  };
  const internals = loadChatbot({ fetch: fakeFetch });

  const text = await internals.callGemini([
    { role: 'user', content: 'What is his latest h-index today?' }
  ], { useSearch: true });

  assert.equal(text, 'Gemini answered without search.');
  assert.equal(requests.length, 2);
  assert.deepEqual(JSON.parse(JSON.stringify(requests[0].tools)), [{ google_search: {} }]);
  assert.equal(requests[1].tools, undefined);
});

test('buildPageCorpus indexes visible page sections and contact links', () => {
  const rag = loadRag();
  const sections = [
    {
      id: 'experience',
      textContent: 'Experience Research Scientist at Center for Artificial Intelligence and Smart Technologies. Associate Professor at Batangas State University.',
      getAttribute: () => null,
      querySelector: () => ({ textContent: 'Experience & Education' })
    },
    {
      id: 'contact',
      textContent: 'Contact Direct Channels francismontalbo@ieee.org Collaboration Speaking Consultancy.',
      getAttribute: () => null,
      querySelector: () => ({ textContent: 'Contact' })
    }
  ];
  const links = [
    {
      textContent: 'Google Scholar',
      href: 'https://scholar.google.com/citations?user=PV8dJDkAAAAJ',
      getAttribute: (name) => (name === 'href' ? 'https://scholar.google.com/citations?user=PV8dJDkAAAAJ' : null)
    },
    {
      textContent: 'IEEE Email',
      href: 'mailto:francismontalbo@ieee.org',
      getAttribute: (name) => (name === 'href' ? 'mailto:francismontalbo@ieee.org' : null)
    },
    {
      textContent: 'Unsafe',
      href: 'javascript:alert(1)',
      getAttribute: (name) => (name === 'href' ? 'javascript:alert(1)' : null)
    }
  ];
  const root = {
    querySelectorAll: (selector) => {
      if (selector === 'section[id], footer') return sections;
      if (selector === 'a[href]') return links;
      return [];
    }
  };

  const docs = rag.buildPageCorpus(root);
  const payload = docs.map((doc) => doc.payload).join('\n');

  assert.equal(payload.includes('Experience & Education'), true);
  assert.equal(payload.includes('Research Scientist'), true);
  assert.equal(payload.includes('Google Scholar: https://scholar.google.com/citations?user=PV8dJDkAAAAJ'), true);
  assert.equal(payload.includes('IEEE Email: mailto:francismontalbo@ieee.org'), true);
  assert.equal(payload.includes('javascript:alert'), false);
});

test('buildContext uses page corpus for contact and work details beyond curated publication data', () => {
  const rag = loadRag();

  const context = rag.buildContext('How can I contact Francis about consulting?', {
    profileContext: 'Name: Dr. Francis Jesmar P. Montalbo',
    pageCorpus: [
      {
        type: 'page-section',
        title: 'Contact',
        text: 'Contact collaborations consulting invited talks francismontalbo@ieee.org',
        payload: 'Page section | Contact: collaborations, consulting, invited talks, francismontalbo@ieee.org'
      },
      {
        type: 'page-link',
        title: 'LinkedIn',
        text: 'LinkedIn professional profile https://www.linkedin.com/in/sirjmmontalbo/',
        payload: 'Page link | LinkedIn: https://www.linkedin.com/in/sirjmmontalbo/'
      }
    ]
  }, 4);

  assert.equal(context.some((item) => item.includes('Contact: collaborations')), true);
  assert.equal(context.some((item) => item.includes('LinkedIn')), true);
});
