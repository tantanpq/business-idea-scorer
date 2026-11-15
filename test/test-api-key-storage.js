const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");

const KEY = "bizidea_f_apikey";
const REMEMBER = "bizidea_remember_apikey";
// Deliberately fake values; these tests never contact an API.
const KEY_A = "test-key-a";
const KEY_B = "test-key-b";

function storage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: name => data.get(name) ?? null,
    setItem: (name, value) => { data.set(name, String(value)); },
    removeItem: name => { data.delete(name); }
  };
}

function createStore(local = storage(), session = storage()) {
  return require("../api-key-storage.js").createStore(name =>
    name === "localStorage" ? local : session);
}

test("new keys stay in the tab by default, including across reloads", () => {
  const local = storage();
  const session = storage();
  const store = createStore(local, session);
  assert.deepEqual(store.read(), { key: "", remember: false });
  store.save(KEY_A);
  assert.equal(local.getItem(KEY), null);
  assert.equal(local.getItem(REMEMBER), null);
  assert.equal(session.getItem(KEY), KEY_A);
  assert.deepEqual(createStore(local, session).read(), { key: KEY_A, remember: false });
  assert.equal(createStore(local, storage()).read().key, "");
});

test("legacy keys migrate immediately without assuming consent", () => {
  const local = storage({ [KEY]: KEY_A });
  const session = storage();
  assert.deepEqual(createStore(local, session).read(), { key: KEY_A, remember: false });
  assert.equal(local.getItem(KEY), null);
  assert.equal(local.getItem(REMEMBER), null);
  assert.equal(session.getItem(KEY), KEY_A);
  assert.equal(createStore(local, session).read().key, KEY_A);
  assert.equal(createStore(local, storage()).read().key, "");
});

test("only explicit opt-in persists a key and restores consent", () => {
  const local = storage();
  const store = createStore(local);
  assert.deepEqual(store.save(KEY_A, true), { key: KEY_A, remember: true });
  assert.equal(local.getItem(KEY), KEY_A);
  assert.equal(local.getItem(REMEMBER), "true");
  assert.deepEqual(createStore(local).read(), { key: KEY_A, remember: true });
});

test("opting out removes the stored key immediately but keeps it for the tab", () => {
  const local = storage({ [KEY]: KEY_A, [REMEMBER]: "true" });
  const session = storage();
  const store = createStore(local, session);
  assert.deepEqual(store.save(KEY_A, false), { key: KEY_A, remember: false });
  assert.equal(local.getItem(KEY), null);
  assert.equal(local.getItem(REMEMBER), null);
  assert.equal(createStore(local, session).read().key, KEY_A);
});

test("editing and clearing a remembered key update or remove all copies", () => {
  const local = storage();
  const session = storage();
  const store = createStore(local, session);
  store.save(KEY_A, true);
  store.save(KEY_B, true);
  assert.equal(local.getItem(KEY), KEY_B);
  assert.equal(session.getItem(KEY), KEY_B);
  assert.deepEqual(store.save("", true), { key: "", remember: false });
  assert.equal(local.getItem(KEY), null);
  assert.equal(local.getItem(REMEMBER), null);
  assert.equal(session.getItem(KEY), null);
  assert.equal(createStore(local, session).read().key, "");
});

test("a false or invalid consent marker does not preserve a legacy key", () => {
  for (const marker of ["false", "1", "yes"]) {
    const local = storage({ [KEY]: KEY_A, [REMEMBER]: marker });
    assert.deepEqual(createStore(local).read(), { key: KEY_A, remember: false });
    assert.equal(local.getItem(KEY), null);
    assert.equal(local.getItem(REMEMBER), null);
  }
});

test("orphaned consent is removed and never authorizes a future key", () => {
  const local = storage({ [REMEMBER]: "true" });
  const store = createStore(local);
  assert.deepEqual(store.read(), { key: "", remember: false });
  assert.equal(local.getItem(REMEMBER), null);
  store.save(KEY_A, false);
  assert.equal(local.getItem(KEY), null);
});

test("session key takes precedence over an unconsented legacy value", () => {
  const local = storage({ [KEY]: KEY_A });
  assert.equal(createStore(local, storage({ [KEY]: KEY_B })).read().key, KEY_B);
  assert.equal(local.getItem(KEY), null);
});

test("blocked storage getters fall back to memory", () => {
  const store = require("../api-key-storage.js").createStore(() => {
    throw new Error("Storage unavailable");
  });
  assert.deepEqual(store.save(KEY_A, true), { key: KEY_A, remember: false });
  assert.deepEqual(store.read(), { key: KEY_A, remember: false });
});

test("blocked session writes still permit in-memory migration", () => {
  const local = storage({ [KEY]: KEY_A });
  const session = storage();
  session.setItem = () => { throw new Error("Quota exceeded"); };
  const store = createStore(local, session);
  assert.deepEqual(store.read(), { key: KEY_A, remember: false });
  assert.equal(local.getItem(KEY), null);
});

test("failed opt-in rolls back partial persistent writes", () => {
  for (const blockedName of [KEY, REMEMBER]) {
    const local = storage();
    const setItem = local.setItem;
    local.setItem = (name, value) => {
      if (name === blockedName) throw new Error("Quota exceeded");
      setItem(name, value);
    };
    const store = createStore(local);
    assert.deepEqual(store.save(KEY_A, true), { key: KEY_A, remember: false });
    assert.equal(local.getItem(KEY), null);
    assert.equal(local.getItem(REMEMBER), null);
  }
});

test("storage failures on read and removal do not break the current tab", () => {
  const blocked = {
    getItem() { throw new Error("Storage denied"); },
    setItem() { throw new Error("Storage denied"); },
    removeItem() { throw new Error("Storage denied"); }
  };
  const store = createStore(blocked, blocked);
  assert.deepEqual(store.save(KEY_A, false), { key: KEY_A, remember: false });
  assert.equal(store.read().key, KEY_A);
});

// Execute the actual page scripts with a small DOM fixture to cover the wiring.
function page(local = storage(), session = storage(), overrides = {}) {
  const html = fs.readFileSync(path.join(__dirname, "../index.html"), "utf8");
  const elements = {};
  for (const match of html.matchAll(/\bid="([^"]+)"/g)) {
    elements[match[1]] = {
      value: "", checked: false, textContent: "", innerHTML: "", style: {},
      classList: { remove() {} }, scrollIntoView() {},
      listeners: {},
      addEventListener(event, listener) { this.listeners[event] = listener; }
    };
  }
  const context = vm.createContext({
    document: { getElementById: id => elements[id] },
    localStorage: local, sessionStorage: session, ...overrides
  });
  context.window = context;
  for (const script of html.matchAll(/<script(?: src="([^"]+)")?>([\s\S]*?)<\/script>/g)) {
    const code = script[1]
      ? fs.readFileSync(path.join(__dirname, "..", script[1]), "utf8")
      : script[2];
    vm.runInContext(code, context);
  }
  return {
    elements, html,
    event(id, name) { elements[id].listeners[name](); },
    score() { return vm.runInContext("runScoring()", context); }
  };
}

test("page migrates a legacy key at startup and exposes an unchecked warning", () => {
  const local = storage({ [KEY]: KEY_A });
  const app = page(local);
  assert.equal(app.elements.f_apikey.value, KEY_A);
  assert.equal(local.getItem(KEY), null);
  assert.equal(app.elements.f_remember_apikey.checked, false);
  assert.match(app.html, /Remember on this device/);
  assert.match(app.html, /stored in this browser/);
});

test("page typing, scoring, opt-in and opt-out honor the checkbox immediately", async () => {
  const local = storage();
  const session = storage();
  const app = page(local, session);
  app.elements.f_apikey.value = KEY_A;
  app.event("f_apikey", "input");
  assert.equal(session.getItem(KEY), KEY_A);
  assert.equal(local.getItem(KEY), null);
  // Validation exits before any API call, after the settings-save path.
  await app.score();
  assert.equal(local.getItem(KEY), null);
  app.elements.f_remember_apikey.checked = true;
  app.event("f_remember_apikey", "change");
  assert.equal(local.getItem(KEY), KEY_A);
  assert.equal(page(local).elements.f_remember_apikey.checked, true);
  app.elements.f_remember_apikey.checked = false;
  app.event("f_remember_apikey", "change");
  assert.equal(local.getItem(KEY), null);
  assert.equal(local.getItem(REMEMBER), null);
  await app.score();
  assert.equal(local.getItem(KEY), null);
});

test("page scoring never persists a newly entered key by default", async () => {
  const local = storage();
  const app = page(local);
  app.elements.f_apikey.value = KEY_A;
  await app.score();
  assert.equal(local.getItem(KEY), null);
});

test("non-secret model and base URL settings still persist and restore", async () => {
  const local = storage();
  const app = page(local);
  app.elements.f_baseurl.value = "https://api.example.invalid/v1";
  app.elements.f_model.value = "test-model";
  await app.score();
  const reloaded = page(local);
  assert.equal(reloaded.elements.f_baseurl.value, "https://api.example.invalid/v1");
  assert.equal(reloaded.elements.f_model.value, "test-model");
});

test("page reports failed persistent opt-in and leaves the checkbox unchecked", () => {
  const local = storage();
  local.setItem = () => { throw new Error("Quota exceeded"); };
  const app = page(local);
  app.elements.f_apikey.value = KEY_A;
  app.elements.f_remember_apikey.checked = true;
  app.event("f_remember_apikey", "change");
  assert.equal(app.elements.f_remember_apikey.checked, false);
  assert.match(app.elements.apiKeyStorageStatus.textContent, /could not remember/);
  assert.equal(local.getItem(KEY), null);
});

test("migrated session keys still authorize scoring with the configured endpoint", async () => {
  const local = storage({ [KEY]: KEY_A });
  const requests = [];
  const app = page(local, storage(), {
    async fetch(url, options) {
      requests.push({ url, options });
      const criteria = require("../scoring-math.js").ORDER.map(id => ({
        id, score: 50, status: "observed", evidence: "Test evidence",
        rationale: "Test rationale", q: 0.5, a: 0.5
      }));
      return {
        ok: true,
        async json() {
          return { choices: [{ message: { content: JSON.stringify({ criteria }) } }] };
        }
      };
    }
  });
  app.elements.f_baseurl.value = "https://api.example.invalid/v1/";
  app.elements.f_description.value = "A fictional test idea";
  await app.score();
  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, "https://api.example.invalid/v1/chat/completions");
  assert.equal(requests[0].options.headers.Authorization, "Bearer " + KEY_A);
  assert.equal(app.elements.status.textContent, "Done.");
  assert.equal(app.elements.btnScore.disabled, false);
  assert.equal(local.getItem(KEY), null);
});
