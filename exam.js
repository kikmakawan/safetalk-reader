// Mock exam: written (self-checked with keyword hints) or multiple choice (auto-graded).
(() => {
  const $ = s => document.querySelector(s);
  const SKEY = "safetalk-exam-setup";
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  let setup = { type: "mcq", n: 20, mins: 20, sec: "all" };
  try { Object.assign(setup, JSON.parse(localStorage.getItem(SKEY)) || {}); } catch {}
  let E = null, timer = null, fleet = "all";
  const el = () => $("#exam");
  const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
  const pool = () => ST.D.items.filter(it => (fleet === "all" || !it.fleet || it.fleet === fleet) && (setup.sec === "all" || it.sec === setup.sec));
  const ez = it => ((ST.isTH() ? ST.TH : ST.EN)[it.id] || {}).ez || "";

  function chipRow(key, opts) {
    return `<div class="chips ex-chips">${opts.map(([v, l]) => `<button data-ex-set="${key}" data-v="${v}" class="${String(setup[key]) === String(v) ? "on" : ""}">${l}</button>`).join("")}</div>`;
  }
  function showSetup() {
    stop(); E = null;
    const last = (STATS.data.exams || []).filter(x => x.qid === QID)[0];
    el().innerHTML = `
      <div class="g-hero"><div class="g-big-ico">📝</div><h2>${t("ex_title")}</h2><p>${t("ex_sub")}</p></div>
      <div class="ex-card">
        <h4>${t("ex_type")}</h4>
        <div class="ex-types">
          <button data-ex-set="type" data-v="mcq" class="ex-type ${setup.type === "mcq" ? "on" : ""}"><b>🔘 ${t("ex_mcq")}</b><small>${t("ex_mcq_d")}</small></button>
          <button data-ex-set="type" data-v="written" class="ex-type ${setup.type === "written" ? "on" : ""}"><b>✍️ ${t("ex_written")}</b><small>${t("ex_written_d")}</small></button>
        </div>
        <h4>${t("ex_count")}</h4>${chipRow("n", [[10, "10"], [20, "20"], [30, "30"], [999, t("ex_all")]])}
        <h4>${t("ex_time")}</h4>${chipRow("mins", [[0, t("ex_notime")], [10, t("ex_min", { n: 10 })], [20, t("ex_min", { n: 20 })], [30, t("ex_min", { n: 30 })]])}
        <h4>${t("ex_sec")}</h4>${chipRow("sec", [["all", t("all")], ...ST.D.sections.map(s => [s.id, ST.SEC_ICON[s.id] + " " + s.name])])}
        <button class="btn ok ex-start" data-ex="start">${t("ex_start", { n: Math.min(setup.n, pool().length) })}</button>
        <p class="g-foot">${t("ex_pass")} · ${t("g_fleet")}: <b>${fleet === "all" ? t("fleet_all") : fleet === "A" ? "Airbus" : "Boeing"}</b></p>
      </div>
      ${last ? `<p class="g-foot">${t("ex_last", { p: last.pct, s: last.score, n: last.n })}</p>` : ""}`;
  }

  function start(list) {
    const items = list || shuffle(pool()).slice(0, setup.n);
    if (!items.length) return;
    E = { type: setup.type, list: items, i: 0, ans: items.map(() => ({ text: "", pick: -1, grade: null })), t0: Date.now(),
          end: setup.mins ? Date.now() + setup.mins * 60000 : 0 };
    if (E.type === "mcq") E.list.forEach((it, k) => {
      const same = shuffle(ST.D.items.filter(x => x.id !== it.id && x.sec === it.sec && ez(x) && ez(x) !== ez(it)));
      const other = shuffle(ST.D.items.filter(x => x.id !== it.id && x.sec !== it.sec && ez(x)));
      E.ans[k].opts = shuffle([it, ...[...same, ...other].slice(0, 3)]).map(x => x.id);
    });
    tick(); timer = setInterval(tick, 500);
    run();
  }
  function tick() {
    if (!E || !E.end) return;
    const left = Math.max(0, (E.end - Date.now()) / 1000), x = $("#exClock");
    if (x) { x.textContent = "⏱ " + fmt(left); x.classList.toggle("low", left < 60); }
    if (left <= 0) { stop(); finish(true); }
  }

  function run() {
    E.view = "run";
    const it = E.list[E.i], a = E.ans[E.i], last = E.i === E.list.length - 1;
    const done = E.ans.filter(x => (E.type === "mcq" ? x.pick >= 0 : x.text.trim())).length;
    el().innerHTML = `
      <div class="g-top"><button class="g-back" data-ex="quit">${t("g_quit")}</button>
        <span class="g-tag">📝 ${t(E.type === "mcq" ? "ex_mcq" : "ex_written")}</span>
        <span class="ex-clock" id="exClock">${E.end ? "" : "⏱ " + t("ex_notime")}</span></div>
      <div class="ex-prog"><i style="width:${(E.i + 1) / E.list.length * 100}%"></i></div>
      <div class="ex-meta"><span>${t("ex_q", { i: E.i + 1, n: E.list.length })}</span><span>${t("ex_done", { n: done })}</span></div>
      <div class="flash" data-sec="${it.sec}">
        <div class="tag"><span>${ST.SEC_ICON[it.sec]} ${ST.isTH() ? ST.secOf(it.sec).th : ST.secOf(it.sec).name}</span>${TTS.ok ? `<button class="say" data-ex-say="1">🔊</button>` : ""}</div>
        <h3>${ST.headHTML(it)}</h3>
        ${E.type === "written" ? `<div class="myans"><textarea id="exAns" rows="5" placeholder="${t("my_ph")}">${ST.esc(a.text)}</textarea>
            ${TTS.srOk ? `<button class="mic" id="exMic">🎤</button>` : ""}</div>`
          : `<div class="g-opts">${a.opts.map((id, j) => { const o = ST.D.items.find(x => x.id === id);
              return `<button class="g-opt ${a.pick === j ? "sel" : ""}" data-ex-pick="${j}"><span class="g-key">${"ABCD"[j]}</span><span>${ST.esc(ez(o))}</span></button>`; }).join("")}</div>`}
      </div>
      <div class="cardnav">
        <button class="btn ghost" data-ex="prev" ${E.i ? "" : "disabled"}>${t("prev")}</button>
        ${last ? `<button class="btn ok" data-ex="finish">${t("ex_finish")}</button>` : `<button class="btn ok" data-ex="next">${t("next")}</button>`}
      </div>
      <div class="ex-dots">${E.ans.map((x, k) => `<button class="${k === E.i ? "cur" : ""} ${(E.type === "mcq" ? x.pick >= 0 : x.text.trim()) ? "done" : ""}" data-ex-go="${k}">${k + 1}</button>`).join("")}</div>`;
    tick(); scrollTo(0, 0);
  }

  function finish() {
    stop(); TTS.stop();
    if (E.type === "mcq") {
      E.ans.forEach((a, k) => { a.grade = a.pick >= 0 && a.opts[a.pick] === E.list[k].id; STATS.rec(E.list[k].id, a.grade); });
      result();
    } else { E.i = 0; review(); }
  }

  function review() {
    E.view = "review";
    const it = E.list[E.i], a = E.ans[E.i];
    const m = a.text.trim() ? TTS.match(a.text, ST.refText(it, a.text)) : null;
    el().innerHTML = `
      <div class="g-top"><span class="g-tag">✍️ ${t("ex_review")}</span><span class="g-tag">${E.i + 1}/${E.list.length}</span></div>
      <div class="ex-prog"><i style="width:${(E.i + 1) / E.list.length * 100}%"></i></div>
      <div class="flash" data-sec="${it.sec}">
        <h3>${ST.headHTML(it)}</h3>
        <div class="cmp ${m ? (m.pct >= 60 ? "good" : m.pct >= 30 ? "mid" : "low") : "low"}">
          <div class="cmp-h"><b>${t("my_yours")}</b>${m ? `<span>${t("my_score", { h: m.hit.length, n: m.need, p: m.pct })}</span>` : ""}</div>
          <p>${m ? TTS.highlight(a.text, m.hit) : `<i>${t("ex_blank")}</i>`}</p>
        </div>
        <div class="ans">${ST.answerHTML(it)}</div>
        <p class="ex-ask">${t("ex_grade_q")}</p>
        <div class="cardnav">
          <button class="btn" data-ex-grade="0">✗ ${t("ex_wrong")}</button>
          <button class="btn ok" data-ex-grade="1">✓ ${t("ex_right")}</button>
        </div>
      </div>`;
    scrollTo(0, 0);
  }

  function result() {
    E.view = "result";
    const n = E.list.length, score = E.ans.filter(a => a.grade).length, pct = Math.round(score / n * 100);
    const secs = Math.round((Date.now() - E.t0) / 1000), pass = pct >= 80;
    STATS.exam({ d: Date.now(), qid: QID, n, score, pct, type: E.type, secs });
    el().innerHTML = `
      <div class="g-end">
        <div class="ex-ring ${pass ? "pass" : "fail"}" style="--p:${pct}"><b>${pct}%</b></div>
        <h2>${pass ? t("ex_passed") : t("ex_failed")}</h2>
        <div class="g-sub">${t("ex_summary", { s: score, n, time: fmt(secs) })}</div>
        <div class="ex-list">${E.list.map((it, k) => `
          <button class="ex-row ${E.ans[k].grade ? "ok" : "bad"}" data-ex-open="${it.id}">
            <span class="ex-mark">${E.ans[k].grade ? "✓" : "✗"}</span>
            <span class="ex-rq">${ST.headHTML(it)}</span></button>`).join("")}</div>
        <div class="cardnav">
          ${score < n ? `<button class="btn" data-ex="retry">${t("ex_retry", { n: n - score })}</button>` : ""}
          <button class="btn ok" data-ex="new">${t("ex_new")}</button>
        </div>
      </div>`;
    if (pct === 100) document.dispatchEvent(new CustomEvent("st-confetti"));
    scrollTo(0, 0);
  }

  document.addEventListener("click", e => {
    const b = e.target.closest("[data-ex],[data-ex-set],[data-ex-pick],[data-ex-go],[data-ex-grade],[data-ex-open],[data-ex-say],#exMic");
    if (!b || !b.closest("#exam")) return;
    const d = b.dataset;
    const keep = () => { const a = $("#exAns"); if (a && E) E.ans[E.i].text = a.value; };
    if (d.exSet) { setup[d.exSet] = isNaN(+d.v) ? d.v : +d.v; try { localStorage.setItem(SKEY, JSON.stringify(setup)); } catch {} showSetup(); return; }
    if (d.exPick) { E.ans[E.i].pick = +d.exPick; run(); return; }
    if (d.exGo) { keep(); E.i = +d.exGo; run(); return; }
    if (b.id === "exMic") { TTS.listen(LANG(), txt => { E.ans[E.i].text = txt; const a = $("#exAns"); if (a) a.value = txt; }, on => b.classList.toggle("on", on)); return; }
    if (d.exSay) { TTS.speak(ST.readParts(E.list[E.i], false), LANG(), b); return; }
    if (d.exGrade) {
      const ok = d.exGrade === "1"; E.ans[E.i].grade = ok; STATS.rec(E.list[E.i].id, ok);
      if (E.i < E.list.length - 1) { E.i++; review(); } else result();
      return;
    }
    if (d.exOpen) { ST.openItem(d.exOpen); return; }
    switch (d.ex) {
      case "start": start(); break;
      case "next": keep(); E.i++; run(); break;
      case "prev": keep(); E.i--; run(); break;
      case "finish": keep(); finish(); break;
      case "quit":
        if (b.dataset.armed) { stop(); showSetup(); }
        else { b.dataset.armed = 1; b.textContent = t("g_quit2"); setTimeout(() => { if (b.isConnected) { delete b.dataset.armed; b.textContent = t("g_quit"); } }, 2000); }
        break;
      case "retry": start(shuffle(E.list.filter((_, k) => !E.ans[k].grade))); break;
      case "new": showSetup(); break;
    }
  });
  document.addEventListener("input", e => { if (e.target.id === "exAns" && E) E.ans[E.i].text = e.target.value; });

  window.STExam = {
    show(f) {
      const changed = f !== fleet; fleet = f;
      if (!E || changed) showSetup();
      else if (E.view === "run") run(); else if (E.view === "review") review();
    },
  };
  document.addEventListener("langchange", () => { if (!E) { if (el().childElementCount) showSetup(); } });
})();
