// Version label, update check, safe refresh and offline status.
// The version on the device never changes by itself: new versions download in the background
// and are only switched in when the user taps Update. Refresh never deletes the offline copy.
(() => {
  const V = window.APP_VERSION;
  const $ = s => document.querySelector(s);
  $("#verTxt").textContent = V.v;
  $("#shCur").textContent = `${V.v} (${V.date})`;
  const notes = () => ($("#shNotes").innerHTML = (V.notes[LANG()] || V.notes.en || V.notes).map(n => `<li>${n}</li>`).join(""));
  notes(); document.addEventListener("langchange", notes);

  const sw = "serviceWorker" in navigator && location.protocol !== "file:";
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const newer = (a, b) => { // is a > b ?
    const x = a.split(".").map(Number), y = b.split(".").map(Number);
    for (let i = 0; i < 3; i++) { if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) > (y[i] || 0); }
    return false;
  };
  async function latest() {
    if (navigator.onLine === false) return null;
    try {
      const ctl = new AbortController(); const tm = setTimeout(() => ctl.abort(), 5000);
      const r = await fetch("version.json?t=" + Date.now(), { cache: "no-store", signal: ctl.signal });
      clearTimeout(tm);
      if (!r.ok) return null;
      const j = await r.json();          // a captive-portal page fails here
      return j && j.v ? j : null;
    } catch { return null; }
  }
  function toast(msg, ms = 2800) {
    const el = $("#toast"); el.textContent = msg; el.hidden = false;
    clearTimeout(toast.h); toast.h = setTimeout(() => (el.hidden = true), ms);
  }

  // ---------- offline status (asks the service worker how many files are stored) ----------
  async function offlineStatus() {
    if (!sw || !navigator.serviceWorker.controller) return null;
    return new Promise(res => {
      const ch = new MessageChannel(); const tm = setTimeout(() => res(null), 2000);
      ch.port1.onmessage = e => { clearTimeout(tm); res(e.data); };
      navigator.serviceWorker.controller.postMessage({ type: "status" }, [ch.port2]);
    });
  }
  function paint(s) {
    const el = $("#shOff"), btn = $("#shFill"); if (!el) return;
    if (!s) { el.textContent = t("off_none"); el.className = "warn"; btn.hidden = true; return; }
    const ready = s.have >= s.total;
    el.textContent = ready ? t("off_ready", { n: s.total }) : t("off_partial", { h: s.have, n: s.total });
    el.className = ready ? "ok" : "warn";
    btn.hidden = ready;
  }
  async function showOffline() { const s = await offlineStatus(); paint(s); return s; }
  // download every missing file (answer images, pages…) for offline use
  let filling = false;
  async function fillOffline(manual) {
    if (filling || !sw || !navigator.serviceWorker.controller) return;
    if (navigator.onLine === false) { if (manual) toast(t("off_cant")); return; }
    filling = true;
    const btn = $("#shFill"); btn.disabled = true; btn.textContent = t("off_dl_ing");
    await new Promise(res => {
      const ch = new MessageChannel(); let tm;
      const arm = () => { clearTimeout(tm); tm = setTimeout(res, 60000); };
      ch.port1.onmessage = e => { arm(); const d = e.data || {}; if (d.have) paint(d); if (d.done) { clearTimeout(tm); res(); } };
      arm(); navigator.serviceWorker.controller.postMessage({ type: "fill" }, [ch.port2]);
    });
    filling = false; btn.disabled = false; btn.textContent = t("off_dl");
    const s = await showOffline();
    if (s && s.have >= s.total) announce(s.version); else if (manual && s) toast(t("off_some", { n: s.total - s.have }), 4000);
  }
  function announce(v) {
    try { if (localStorage.getItem("safetalk-offline-ok") !== v) { localStorage.setItem("safetalk-offline-ok", v); toast(t("off_toast")); } } catch {}
  }
  // on start: if anything is missing and we're online, top it up quietly
  async function autoFill() {
    for (let i = 0; i < 10 && !navigator.serviceWorker.controller; i++) await sleep(1000);
    const s = await offlineStatus();
    if (!s) return;
    if (s.have >= s.total) announce(s.version); else fillOffline(false);
  }

  // ---------- update only when the user asks ----------
  // A new version is downloaded in the background by the service worker and waits.
  // Nothing changes on the device until the user taps Update; then the waiting version is switched in.
  const waitState = (w, states, ms) => new Promise(res => {
    const tm = setTimeout(() => res(w.state), ms);
    const chk = () => { if (states.includes(w.state)) { clearTimeout(tm); res(w.state); } };
    w.addEventListener("statechange", chk); chk();
  });
  async function activate(w) {
    let reloaded = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (reloaded) return; reloaded = true;
      try { sessionStorage.setItem("safetalk-just-updated", "1"); } catch {}
      location.reload();
    });
    const ch = new MessageChannel(); w.postMessage({ type: "skip" }, [ch.port2]);
    const st = await waitState(w, ["activated", "redundant"], 15000);
    if (st === "activated" && !reloaded) { reloaded = true; location.reload(); }
    return st === "activated";
  }
  let busy = false;
  async function safeRefresh() {
    if (busy) return; busy = true;
    const btn = $("#shGo"), label = btn.textContent;
    const done = msg => { busy = false; btn.disabled = false; btn.textContent = label; if (msg) toast(msg, 3500); };
    btn.disabled = true; btn.textContent = t("sh_loading");
    if (!sw) { const L = await latest(); if (!L) return done(t("off_cant")); location.reload(); return; }
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (!reg) { const L = await latest(); if (!L) return done(t("off_cant")); location.reload(); return; }
      // already downloaded and waiting? switch now (works even offline)
      if (reg.waiting) { if (!(await activate(reg.waiting))) done(t("upd_fail")); return; }
      const L = await latest();
      if (!L) return done(t("off_cant"));            // offline / in-flight Wi-Fi: keep everything
      if (!newer(L.v, V.v)) return done(t("upd_none", { v: V.v }));
      await reg.update().catch(() => {});
      const w = reg.installing || reg.waiting;
      if (!w) return done(t("upd_fail"));
      const st = await waitState(w, ["installed", "activated", "redundant"], 180000);
      if (st === "redundant" || !reg.waiting) return done(t("upd_fail"));
      if (!(await activate(reg.waiting))) done(t("upd_fail"));
    } catch { done(t("upd_fail")); }
  }
  // show the banner when a downloaded version is waiting
  async function watchWaiting() {
    if (!sw) return;
    const reg = await navigator.serviceWorker.getRegistration(); if (!reg) return;
    const showReady = () => { if (reg.waiting && navigator.serviceWorker.controller) { $("#updBar").hidden = false; $("#updV").textContent = ""; $("#updBar").classList.add("ready"); } };
    showReady();
    reg.addEventListener("updatefound", () => { const w = reg.installing; if (w) w.addEventListener("statechange", showReady); });
  }

  // ---------- keep the offline copy: ask the browser not to clear our storage ----------
  async function persist() {
    try {
      if (!navigator.storage || !navigator.storage.persist) return null;
      if (await navigator.storage.persisted()) return true;
      return await navigator.storage.persist();
    } catch { return null; }
  }
  async function showPersist() {
    const el = $("#shKeep"); if (!el) return;
    let p = null; try { p = navigator.storage && navigator.storage.persisted ? await navigator.storage.persisted() : null; } catch {}
    el.textContent = p === true ? t("keep_yes") : p === false ? t("keep_no") : t("keep_na");
    el.className = p === true ? "ok" : "warn";
  }

  async function check(silent) {
    const L = await latest();
    if (!L) { if (!silent) $("#shNew").textContent = t("sh_off"); return; }
    $("#shNew").textContent = `${L.v} (${L.date})`;
    const up = newer(L.v, V.v);
    if (up) { $("#updV").textContent = "v" + L.v; $("#updBar").hidden = false; }
    if (!silent) $("#shNew").classList.toggle("hot", up);
    if (!silent && !up) $("#shNew").textContent += t("sh_latest");
  }

  $("#verBtn").onclick = () => { $("#sheet").hidden = false; $("#shNew").textContent = t("sh_checking"); check(false); showOffline(); persist().then(showPersist); };
  $("#shClose").onclick = () => ($("#sheet").hidden = true);
  $("#sheet").onclick = e => { if (e.target.id === "sheet") $("#sheet").hidden = true; };
  $("#shGo").onclick = safeRefresh;
  $("#shFill").onclick = () => fillOffline(true);
  $("#updGo").onclick = () => { $("#sheet").hidden = false; check(false); showOffline(); showPersist(); safeRefresh(); };
  $("#updX").onclick = () => ($("#updBar").hidden = true);

  // tidy the address bar after old-style refreshes, and confirm the loaded version
  if (/[?&]v=\d+/.test(location.search)) history.replaceState(null, "", location.pathname);
  try { if (sessionStorage.getItem("safetalk-just-updated")) { sessionStorage.removeItem("safetalk-just-updated"); setTimeout(() => toast(t("toast_loaded", { v: V.v })), 400); } } catch {}

  check(true);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) check(true); });
  if (sw) navigator.serviceWorker.ready.then(() => { setTimeout(autoFill, 1500); watchWaiting(); persist(); }).catch(() => {});
  addEventListener("online", () => setTimeout(autoFill, 2000));
})();
