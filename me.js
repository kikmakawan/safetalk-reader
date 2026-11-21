// "Me" tab: progress stats, badges, daily goal, settings, backup, quarter picker.
(() => {
  const $ = s => document.querySelector(s);
  const PKEY = "safetalk-prefs";
  const prefs = (() => { try { return JSON.parse(localStorage.getItem(PKEY)) || {}; } catch { return {}; } })();
  const savePrefs = () => { try { localStorage.setItem(PKEY, JSON.stringify(prefs)); } catch {} };
  const SIZES = { s: 0.9, m: 1, l: 1.12, xl: 1.25 };
  function applyPrefs() {
    document.documentElement.style.setProperty("--z", SIZES[prefs.size || "m"]);
    if (prefs.theme && prefs.theme !== "auto") document.documentElement.dataset.theme = prefs.theme;
    else delete document.documentElement.dataset.theme;
    const dark = prefs.theme === "dark" || (prefs.theme !== "light" && matchMedia("(prefers-color-scheme: dark)").matches);
    const m = document.querySelector('meta[name="theme-color"]'); if (m) m.content = dark ? "#3b2f4a" : "#ffd6e2";
  }
  applyPrefs();

  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const el = () => $("#me");
  const known = () => ST.S.known;

  function seg(key, opts, cur) {
    return `<div class="seg">${opts.map(([v, l]) => `<button data-me-set="${key}" data-v="${v}" class="${String(cur) === String(v) ? "on" : ""}">${l}</button>`).join("")}</div>`;
  }

  function show() {
    const S = STATS.data, items = ST.D.items, k = known();
    const streak = STATS.streak(), today = STATS.today(), goal = S.goal;
    const total = Object.entries(S.q).filter(([key]) => key.startsWith(QID + ":")).reduce((a, [, s]) => a + s.ok + s.bad, 0);
    const okAll = Object.entries(S.q).filter(([key]) => key.startsWith(QID + ":")).reduce((a, [, s]) => a + s.ok, 0);
    // sections
    const secs = ST.D.sections.map(sec => {
      const its = items.filter(i => i.sec === sec.id);
      const kn = its.filter(i => k.has(i.id)).length;
      let ok = 0, bad = 0; its.forEach(i => { const s = S.q[STATS.qk(i.id)]; if (s) { ok += s.ok; bad += s.bad; } });
      return { sec, n: its.length, kn, acc: ok + bad ? Math.round(ok / (ok + bad) * 100) : null };
    });
    // weakest
    const weak = items.map(i => ({ i, s: S.q[STATS.qk(i.id)] })).filter(x => x.s && x.s.bad)
      .sort((a, b) => (b.s.bad - b.s.ok * 0.5) - (a.s.bad - a.s.ok * 0.5)).slice(0, 5);
    // last 7 days
    const days = []; for (let d = 6; d >= 0; d--) { const x = new Date(); x.setDate(x.getDate() - d); days.push({ k: STATS.day(x), lbl: x.toLocaleDateString(LANG() === "th" ? "th-TH" : "en-US", { weekday: "short" }), v: S.days[STATS.day(x)] || 0 }); }
    const maxD = Math.max(goal, ...days.map(d => d.v));
    const exams = S.exams.filter(e => e.qid === QID).slice(0, 5);
    const best = (() => { try { return JSON.parse(localStorage.getItem("safetalk-q3-2026-game")) || {}; } catch { return {}; } })();
    const got = STATS.BADGES.filter(([id]) => S.badges[id]).length;

    el().innerHTML = `
      <div class="me-hero">
        <div class="me-streak ${streak ? "" : "cold"}"><span>🔥</span><b>${streak}</b><small>${t("me_streak")}</small></div>
        <div class="me-goal">
          <div class="me-goal-h"><b>${t("me_today")}</b><span>${today}/${goal}</span></div>
          <div class="me-bar"><i style="width:${Math.min(100, today / goal * 100)}%"></i></div>
          <small>${today >= goal ? t("me_goal_done") : t("me_goal_left", { n: goal - today })}</small>
        </div>
      </div>
      <div class="me-kpis">
        <div><b>${k.size}/${items.length}</b><small>${t("me_known")}</small></div>
        <div><b>${total}</b><small>${t("me_reviews")}</small></div>
        <div><b>${total ? Math.round(okAll / total * 100) + "%" : "–"}</b><small>${t("me_acc")}</small></div>
      </div>

      <div class="me-card"><h3>📊 ${t("me_by_sec")}</h3>
        ${secs.map(x => `<div class="me-sec" data-sec="${x.sec.id}">
          <div class="me-sec-h"><span>${ST.SEC_ICON[x.sec.id]} ${ST.isTH() ? x.sec.th : x.sec.name}</span><span>${x.kn}/${x.n}${x.acc !== null ? ` · ${t("me_acc_s", { p: x.acc })}` : ""}</span></div>
          <div class="me-bar"><i style="width:${x.kn / x.n * 100}%"></i></div></div>`).join("")}
      </div>

      <div class="me-card"><h3>📅 ${t("me_week")}</h3>
        <div class="me-week">${days.map(d => `<div class="me-day ${d.v >= goal ? "hit" : ""}"><span class="me-dv">${d.v || ""}</span><i style="height:${d.v / maxD * 100}%"></i><small>${d.lbl}</small></div>`).join("")}</div>
      </div>

      ${weak.length ? `<div class="me-card"><h3>🎯 ${t("me_weak")}</h3>${weak.map(x => `
        <button class="me-weak" data-me-open="${x.i.id}"><span class="num" data-sec="${x.i.sec}">${x.i.no}</span>
          <span class="me-wq">${esc(ST.isTH() && ST.TH[x.i.id] ? ST.TH[x.i.id].q : x.i.q)}</span>
          <span class="me-wr">✗${x.s.bad} ✓${x.s.ok}</span></button>`).join("")}</div>` : ""}

      <div class="me-card"><h3>📝 ${t("me_exams")}</h3>
        ${exams.length ? exams.map(e => `<div class="me-exam ${e.pct >= 80 ? "pass" : ""}"><span>${new Date(e.d).toLocaleDateString(LANG() === "th" ? "th-TH" : "en-GB", { day: "numeric", month: "short" })}</span>
          <span>${e.type === "mcq" ? "🔘" : "✍️"} ${e.score}/${e.n}</span><b>${e.pct}%</b></div>`).join("") : `<p class="me-empty">${t("me_no_exam")}</p>`}
        <button class="btn ghost me-full" data-mode="exam">${t("me_go_exam")}</button>
      </div>

      <div class="me-card"><h3>🏅 ${t("me_badges")} <small>${got}/${STATS.BADGES.length}</small></h3>
        <div class="me-badges">${STATS.BADGES.map(([id, icon]) => `<div class="me-badge ${S.badges[id] ? "got" : ""}" title="${esc(t("bd_" + id))}">
          <span>${icon}</span><b>${t("b_" + id)}</b><small>${t("bd_" + id)}</small></div>`).join("")}</div>
      </div>

      <div class="me-card"><h3>🎮 ${t("me_games")}</h3>
        <div class="me-gbest">${["match", "tf", "order", "numbers", "memory", "odd", "sort", "marathon"].map(g => {
          const top = Math.max(0, ...["easy", "medium", "hard"].map(l => best[g + "-" + l] || 0));
          return `<div><span>${t("gn_" + g)}</span><b>${top ? top.toLocaleString() : "–"}</b></div>`; }).join("")}</div>
      </div>

      <div class="me-card me-settings"><h3>⚙️ ${t("me_settings")}</h3>
        <label>${t("set_lang")}</label>${seg("lang", [["en", "English"], ["th", "ไทย"]], LANG())}
        <label>${t("set_quarter")}</label><button class="btn ghost me-full" data-me="quarter">📚 SafeTalk ${esc(ST.D.short)} ▾</button>
        <label>${t("set_size")}</label>${seg("size", [["s", "A−"], ["m", "A"], ["l", "A+"], ["xl", "A++"]], prefs.size || "m")}
        <label>${t("set_theme")}</label>${seg("theme", [["auto", t("set_auto")], ["light", "☀️ " + t("set_light")], ["dark", "🌙 " + t("set_dark")]], prefs.theme || "auto")}
        <label>${t("set_goal")}</label>${seg("goal", [[5, "5"], [10, "10"], [20, "20"], [30, "30"]], goal)}
        <label>${t("set_backup")}</label>
        <div class="cardnav"><button class="btn ghost" data-me="export">⬆️ ${t("set_export")}</button><button class="btn ghost" data-me="import">⬇️ ${t("set_import")}</button></div>
        <div id="meBox"></div>
        <button class="btn ghost me-full me-danger" data-me="reset">🗑️ ${t("set_reset")}</button>
      </div>`;
  }

  // ---------- backup ----------
  function dump() {
    const o = {};
    for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.startsWith("safetalk")) o[k] = localStorage.getItem(k); }
    return btoa(unescape(encodeURIComponent(JSON.stringify({ app: "safetalk", v: 1, at: Date.now(), data: o }))));
  }
  function restore(code) {
    const o = JSON.parse(decodeURIComponent(escape(atob(code.trim()))));
    if (o.app !== "safetalk" || !o.data) throw new Error("bad");
    for (const [k, v] of Object.entries(o.data)) localStorage.setItem(k, v);
  }
  function exportBox() {
    const code = dump();
    $("#meBox").innerHTML = `<div class="me-box"><p>${t("set_export_h")}</p><textarea readonly rows="4">${code}</textarea>
      <div class="cardnav"><button class="btn ok" data-me="copy">📋 ${t("set_copy")}</button><button class="btn ghost" data-me="download">💾 ${t("set_file")}</button></div></div>`;
  }
  function importBox() {
    $("#meBox").innerHTML = `<div class="me-box"><p>${t("set_import_h")}</p><textarea id="meCode" rows="4" placeholder="…"></textarea>
      <input type="file" id="meFile" accept=".txt,.json,text/plain" hidden>
      <div class="cardnav"><button class="btn ghost" data-me="pickfile">📂 ${t("set_from_file")}</button><button class="btn ok" data-me="doimport">${t("set_import")}</button></div></div>`;
    $("#meFile").onchange = e => { const f = e.target.files[0]; if (f) f.text().then(x => ($("#meCode").value = x)); };
  }
  function toast(msg) { const x = $("#toast"); x.textContent = msg; x.hidden = false; clearTimeout(toast.h); toast.h = setTimeout(() => (x.hidden = true), 2400); }

  // ---------- quarter sheet ----------
  function quarterSheet() {
    let sh = $("#qSheet");
    if (!sh) { sh = document.createElement("div"); sh.id = "qSheet"; document.body.appendChild(sh); }
    sh.hidden = false;
    sh.innerHTML = `<div class="sheet-card"><h3>📚 ${t("q_pick")}</h3>
      ${QIDS.slice().reverse().map(id => { const q = QUARTERS[id]; return `<button class="q-row ${id === QID ? "on" : ""}" data-q="${id}">
        <b>SafeTalk ${esc(q.short)}</b><small>${q.items.length} ${t("q_items")}${id === QID ? " · " + t("q_current") : ""}</small></button>`; }).join("")}
      <p class="sheet-hint">${t("q_more")}</p>
      <button class="btn ghost sheet-close" data-qclose>${t("sh_close")}</button></div>`;
    sh.onclick = e => {
      if (e.target === sh || e.target.closest("[data-qclose]")) { sh.hidden = true; return; }
      const r = e.target.closest("[data-q]"); if (r && r.dataset.q !== QID) setQuarter(r.dataset.q); else if (r) sh.hidden = true;
    };
  }

  document.addEventListener("click", e => {
    const b = e.target.closest("[data-me],[data-me-set],[data-me-open]");
    if (!b || !b.closest("#me")) return;
    const d = b.dataset;
    if (d.meOpen) { ST.openItem(d.meOpen); return; }
    if (d.meSet) {
      const v = d.v;
      if (d.meSet === "lang") { setLang(v); return; }
      if (d.meSet === "goal") STATS.setGoal(+v);
      else { prefs[d.meSet] = v; savePrefs(); applyPrefs(); }
      show(); return;
    }
    switch (d.me) {
      case "quarter": quarterSheet(); break;
      case "export": exportBox(); break;
      case "import": importBox(); break;
      case "copy": { const ta = $("#meBox textarea"); ta.select(); (navigator.clipboard ? navigator.clipboard.writeText(ta.value) : Promise.reject()).then(() => toast(t("set_copied")), () => { document.execCommand("copy"); toast(t("set_copied")); }); break; }
      case "download": { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([dump()], { type: "text/plain" })); a.download = `safetalk-backup-${STATS.day()}.txt`; a.click(); break; }
      case "pickfile": $("#meFile").click(); break;
      case "doimport": try { restore($("#meCode").value); toast(t("set_imported")); setTimeout(() => location.reload(), 900); } catch { toast(t("set_bad")); } break;
      case "reset":
        if (b.dataset.armed) {
          for (const k of Object.keys(localStorage)) if (k.startsWith("safetalk") && k !== "safetalk-lang" && k !== PKEY) localStorage.removeItem(k);
          location.reload();
        } else { b.dataset.armed = 1; b.textContent = "⚠️ " + t("set_reset2"); setTimeout(() => { if (b.isConnected) { delete b.dataset.armed; b.textContent = "🗑️ " + t("set_reset"); } }, 2500); }
        break;
    }
  });
  matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", applyPrefs);

  window.STMe = { show, quarterSheet };
})();
