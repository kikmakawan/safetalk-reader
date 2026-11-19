// Version label, update check and hard refresh
(() => {
  const V = window.APP_VERSION;
  const $ = s => document.querySelector(s);
  $("#verTxt").textContent = V.v;
  $("#shCur").textContent = `${V.v} (${V.date})`;
  const notes = () => ($("#shNotes").innerHTML = (V.notes[LANG()] || V.notes.en || V.notes).map(n => `<li>${n}</li>`).join(""));
  notes(); document.addEventListener("langchange", notes);

  const newer = (a, b) => { // is a > b ?
    const x = a.split(".").map(Number), y = b.split(".").map(Number);
    for (let i = 0; i < 3; i++) { if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) > (y[i] || 0); }
    return false;
  };
  async function latest() {
    try {
      const r = await fetch("version.json?t=" + Date.now(), { cache: "no-store" });
      return r.ok ? await r.json() : null;
    } catch { return null; }
  }
  function toast(msg) {
    const el = $("#toast"); el.textContent = msg; el.hidden = false;
    clearTimeout(toast.h); toast.h = setTimeout(() => (el.hidden = true), 2600);
  }
  async function hardRefresh() {
    $("#shGo").disabled = true; $("#shGo").textContent = t("sh_loading");
    try {
      if ("serviceWorker" in navigator) for (const r of await navigator.serviceWorker.getRegistrations()) await r.unregister();
      if (window.caches) for (const k of await caches.keys()) await caches.delete(k);
    } catch {}
    location.replace(location.pathname + "?v=" + Date.now());
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

  $("#verBtn").onclick = () => { $("#sheet").hidden = false; $("#shNew").textContent = t("sh_checking"); check(false); };
  $("#shClose").onclick = () => ($("#sheet").hidden = true);
  $("#sheet").onclick = e => { if (e.target.id === "sheet") $("#sheet").hidden = true; };
  $("#shGo").onclick = hardRefresh;
  $("#updGo").onclick = hardRefresh;
  $("#updX").onclick = () => ($("#updBar").hidden = true);

  // clean the ?v= from the address bar after a refresh, and say which version loaded
  if (/[?&]v=\d+/.test(location.search)) {
    history.replaceState(null, "", location.pathname);
    setTimeout(() => toast(t("toast_loaded", { v: V.v })), 400);
  }
  check(true);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) check(true); });
})();
