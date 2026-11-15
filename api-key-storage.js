/* API key storage shared by the browser and deterministic Node tests. */
(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) module.exports = factory();
  else root.BizIdeaKeyStorage = factory();
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const KEY = "bizidea_f_apikey";
  const REMEMBER = "bizidea_remember_apikey";

  // Resolve storage lazily: even accessing window.localStorage can throw.
  function createStore(getStorage) {
    function get(storage, name) {
      try { return getStorage(storage).getItem(name); } catch (e) { return null; }
    }
    function set(storage, name, value) {
      try { getStorage(storage).setItem(name, value); return true; } catch (e) { return false; }
    }
    function remove(storage, name) {
      try { getStorage(storage).removeItem(name); } catch (e) { /* Memory still works. */ }
    }

    let key = "";
    let remember = false;
    function read() { return { key, remember }; }
    function save(value, optIn) {
      key = value;
      remember = false;
      if (key) {
        set("sessionStorage", KEY, key);
        if (optIn === true) {
          remember = set("localStorage", KEY, key) && set("localStorage", REMEMBER, "true");
        }
      } else {
        remove("sessionStorage", KEY);
      }
      if (!remember) {
        // Also rolls back partial writes if remembering fails.
        remove("localStorage", REMEMBER);
        remove("localStorage", KEY);
      }
      return read();
    }

    const stored = get("localStorage", KEY) || "";
    const optedIn = get("localStorage", REMEMBER) === "true" && !!stored;
    // Legacy keys are usable in this tab, but never imply consent to persist.
    save(optedIn ? stored : get("sessionStorage", KEY) || stored, optedIn);
    return { read, save };
  }

  return { createStore };
});
