const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

function createClassList() {
  const values = new Set();
  return {
    add: (...names) => names.forEach((name) => values.add(name)),
    remove: (...names) => names.forEach((name) => values.delete(name)),
    contains: (name) => values.has(name),
    toggle(name, force) {
      if (force === true) {
        values.add(name);
        return true;
      }
      if (force === false) {
        values.delete(name);
        return false;
      }
      if (values.has(name)) {
        values.delete(name);
        return false;
      }
      values.add(name);
      return true;
    }
  };
}

function createElement(id = '') {
  const listeners = {};
  const element = {
    id,
    dataset: {},
    attributes: {},
    classList: createClassList(),
    style: {},
    disabled: false,
    value: '',
    offsetWidth: 48,
    offsetHeight: 48,
    scrollTop: 0,
    scrollHeight: 0,
    addEventListener(type, handler) {
      listeners[type] ||= [];
      listeners[type].push(handler);
    },
    dispatchEvent(event) {
      const nextEvent = {
        target: element,
        preventDefault() {},
        stopPropagation() {},
        ...event
      };
      (listeners[nextEvent.type] || []).forEach((handler) => handler(nextEvent));
    },
    setAttribute(name, value) {
      this.attributes[name] = String(value);
    },
    getAttribute(name) {
      return this.attributes[name] || null;
    },
    removeAttribute(name) {
      delete this.attributes[name];
    },
    appendChild(child) {
      return child;
    },
    contains(target) {
      return target === element;
    },
    matches() {
      return false;
    },
    querySelector(selector) {
      if (selector === 'i') return this.icon || null;
      if (selector === '.bgm-panel') return this.panel || null;
      return null;
    },
    querySelectorAll() {
      return [];
    },
    focus() {}
  };
  return element;
}

function loadMainWithBgm() {
  const documentListeners = {};
  const elements = {};
  const storage = new Map();

  const bgmControl = createElement('bgm-control');
  const bgmPanel = createElement('bgm-panel');
  bgmControl.panel = bgmPanel;

  const bgmAudio = createElement('bgm-audio');
  bgmAudio.dataset.src = 'test-song.mp3';
  bgmAudio.currentSrc = '';
  bgmAudio.paused = true;
  bgmAudio.muted = false;
  bgmAudio.volume = 0.18;
  bgmAudio.playCalls = 0;
  bgmAudio.pauseCalls = 0;
  bgmAudio.load = () => {};
  bgmAudio.play = () => {
    bgmAudio.playCalls += 1;
    bgmAudio.paused = false;
    return Promise.resolve();
  };
  bgmAudio.pause = () => {
    bgmAudio.pauseCalls += 1;
    bgmAudio.paused = true;
  };

  const bgmShell = createElement('bgm-shell');
  const bgmPlayToggle = createElement('bgm-play-toggle');
  bgmPlayToggle.icon = createElement('play-icon');
  const bgmMuteToggle = createElement('bgm-mute-toggle');
  bgmMuteToggle.icon = createElement('mute-icon');
  const bgmVolume = createElement('bgm-volume');
  const backToTop = createElement('backToTop');
  const year = createElement('year');

  Object.assign(elements, {
    'bgm-control': bgmControl,
    'bgm-audio': bgmAudio,
    'bgm-shell': bgmShell,
    'bgm-play-toggle': bgmPlayToggle,
    'bgm-mute-toggle': bgmMuteToggle,
    'bgm-volume': bgmVolume,
    backToTop,
    year
  });

  const document = {
    readyState: 'loading',
    getElementById(id) {
      return elements[id] || null;
    },
    createElement,
    addEventListener(type, handler) {
      documentListeners[type] ||= [];
      documentListeners[type].push(handler);
    },
    dispatchEvent(event) {
      (documentListeners[event.type] || []).forEach((handler) => handler(event));
    },
    querySelector() {
      return null;
    },
    querySelectorAll() {
      return [];
    }
  };

  const windowListeners = {};
  const sandbox = {
    console,
    document,
    AOS: undefined,
    window: {
      innerWidth: 1280,
      innerHeight: 720,
      scrollY: 0,
      localStorage: {
        getItem: (key) => storage.get(key) ?? null,
        setItem: (key, value) => storage.set(key, String(value))
      },
      addEventListener(type, handler) {
        windowListeners[type] ||= [];
        windowListeners[type].push(handler);
      },
      clearTimeout() {},
      setTimeout() {
        return 1;
      },
      requestAnimationFrame(callback) {
        callback();
        return 1;
      },
      cancelAnimationFrame() {},
      scrollTo() {},
      matchMedia() {
        return { matches: false, addEventListener() {}, removeEventListener() {} };
      }
    }
  };
  sandbox.window.document = document;
  sandbox.window.window = sandbox.window;
  sandbox.globalThis = sandbox;

  const code = fs.readFileSync(path.join(__dirname, '..', 'js', 'main.js'), 'utf8');
  vm.runInNewContext(code, sandbox, { filename: 'js/main.js' });

  return {
    bgmControl,
    bgmAudio,
    bgmPlayToggle,
    document,
    outsideTarget: {
      closest: () => null
    }
  };
}

test('outside page clicks do not restart background music after the user pauses it', () => {
  const { bgmAudio, bgmPlayToggle, document, outsideTarget } = loadMainWithBgm();

  bgmAudio.paused = false;
  bgmPlayToggle.dispatchEvent({ type: 'click' });
  assert.equal(bgmAudio.paused, true);

  document.dispatchEvent({ type: 'pointerdown', target: outsideTarget });

  assert.equal(bgmAudio.paused, true);
  assert.equal(bgmAudio.playCalls, 0);
});

test('touch-style pointer movement does not expand the background music widget', () => {
  const { bgmControl } = loadMainWithBgm();

  assert.equal(bgmControl.dataset.expanded, 'false');

  bgmControl.dispatchEvent({ type: 'pointermove' });

  assert.equal(bgmControl.dataset.expanded, 'false');
});

test('compact mobile background music widget keeps the equalizer visible', () => {
  const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'styles.css'), 'utf8');
  const start = css.indexOf('@media (max-width: 419.98px)');
  const end = css.indexOf('@media (max-width: 379.98px)', start);
  const compactMobileBlock = start === -1 || end === -1 ? '' : css.slice(start, end);

  assert.ok(compactMobileBlock, 'Expected compact mobile BGM media query to exist');
  assert.doesNotMatch(compactMobileBlock, /\.bgm-meter\s*\{\s*display\s*:\s*none/i);
  assert.match(compactMobileBlock, /\.bgm-meter\s*\{[\s\S]*display\s*:\s*inline-flex/i);
});
