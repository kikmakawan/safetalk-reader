// Study statistics, daily goal, streak and badges. Stored on this device only.
(() => {
  const KEY = "safetalk-stats";
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
  const D = Object.assign({ q: {}, days: {}, goal: 10, exams: [], games: {}, flags: {}, badges: {} }, load());
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(D)); } catch {} };
  const day = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const qk = id => `${window.QID}:${id}`;

  function streak() {
    let n = 0; const d = new Date();
    if (!D.days[day(d)]) d.setDate(d.getDate() - 1); // today not started yet: count up to yesterday
    while (D.days[day(d)]) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }
  const today = () => D.days[day()] || 0;

  function act(n = 1) {
    const before = today();
    D.days[day()] = before + n;
    if (before < D.goal && before + n >= D.goal) { D.flags.goal = (D.flags.goal || 0) + 1; save(); celebrate("🎯", t("goal_hit", { n: D.goal })); }
    save(); check(); header();
  }
  function rec(id, ok) {
    const s = D.q[qk(id)] || (D.q[qk(id)] = { ok: 0, bad: 0 });
    ok ? s.ok++ : s.bad++; s.last = Date.now();
    act(1);
  }
  function game(gk, lv, r) {
    const g = D.games;
    g.played = g.played || {}; g.played[gk] = (g.played[gk] || 0) + 1;
    if (lv === "hard" && r.stars === 3) g.hard3 = true;
    if (gk === "marathon") g.maraBest = Math.max(g.maraBest || 0, r.right);
    save(); check();
  }
  function exam(r) {
    D.exams.unshift(r); D.exams = D.exams.slice(0, 30); save(); check();
  }
  function flag(k) { if (!D.flags[k]) { D.flags[k] = 1; save(); check(); } }

  // ---------- badges ----------
  const known = () => { try { return new Set((JSON.parse(localStorage.getItem(window.QKEY)) || {}).known || []); } catch { return new Set(); } };
  const total = () => Object.values(D.q).reduce((a, s) => a + s.ok + s.bad, 0);
  const items = () => window.SAFETALK.items;
  const secDone = sec => { const k = known(); const its = items().filter(i => i.sec === sec); return its.length && its.every(i => k.has(i.id)); };
  const BADGES = [
    ["first", "🐣", () => total() >= 1],
    ["r50", "📚", () => total() >= 50],
    ["r200", "🎓", () => total() >= 200],
    ["k10", "🌱", () => known().size >= 10],
    ["kall", "🏅", () => items().every(i => known().has(i.id))],
    ["safety", "🛟", () => secDone("safety")],
    ["firstaid", "🩹", () => secDone("firstaid")],
    ["security", "🛡️", () => secDone("security")],
    ["s3", "🔥", () => streak() >= 3],
    ["s7", "⚡", () => streak() >= 7],
    ["s30", "👑", () => streak() >= 30],
    ["goal", "🎯", () => (D.flags.goal || 0) >= 1],
    ["exam80", "✅", () => D.exams.some(e => e.pct >= 80)],
    ["exam100", "💯", () => D.exams.some(e => e.pct === 100 && e.n >= 10)],
    ["allgames", "🎮", () => ["match", "tf", "order", "numbers", "memory", "odd", "sort", "marathon"].every(k => (D.games.played || {})[k])],
    ["hard3", "🌟", () => !!D.games.hard3],
    ["mara30", "🏃", () => (D.games.maraBest || 0) >= 30],
    ["listen", "🔊", () => !!D.flags.listen],
    ["talk", "🎤", () => !!D.flags.talk],
  ];
  function check() {
    for (const [id, icon, test] of BADGES) {
      if (D.badges[id]) continue;
      let ok = false; try { ok = test(); } catch {}
      if (ok) { D.badges[id] = Date.now(); save(); celebrate(icon, t("badge_new", { b: t("b_" + id) })); }
    }
  }

  // ---------- UI helpers ----------
  const queue = [];
  function celebrate(icon, msg) {
    queue.push([icon, msg]);
    if (queue.length === 1) showNext();
  }
  function showNext() {
    if (!queue.length) return;
    const [icon, msg] = queue[0];
    let el = document.getElementById("pop");
    if (!el) { el = document.createElement("div"); el.id = "pop"; document.body.appendChild(el); }
    el.innerHTML = `<span class="pop-ico">${icon}</span><span>${msg}</span>`;
    el.className = "show";
    setTimeout(() => { el.className = ""; setTimeout(() => { queue.shift(); showNext(); }, 350); }, 2600);
  }
  function header() {
    const el = document.getElementById("streakChip");
    if (el) { const s = streak(); el.textContent = `🔥 ${s}`; el.classList.toggle("cold", s === 0); el.title = t("streak_days", { n: s }); }
  }

  window.STATS = { data: D, save, rec, act, game, exam, flag, streak, today, day, check, header, BADGES, qk,
    setGoal(n) { D.goal = n; save(); },
    reset() { Object.assign(D, { q: {}, days: {}, exams: [], games: {}, flags: {}, badges: {} }); save(); } };
  document.addEventListener("DOMContentLoaded", header);
  setTimeout(header, 0);
})();
