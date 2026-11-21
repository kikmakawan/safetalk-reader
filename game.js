// SafeTalk game hub: 4 games x 3 levels, shared hearts / timer / combo / scoring.
(() => {
  const D = window.SAFETALK, GD = window.GAMEDATA;
  const $ = s => document.querySelector(s);
  const KEY = "safetalk-q3-2026-game";
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const bestAll = () => {
    try {
      const b = JSON.parse(localStorage.getItem(KEY)) || {};
      for (const k of ["easy", "medium", "hard"]) if (b[k] && !b["match-" + k]) { b["match-" + k] = b[k]; delete b[k]; } // migrate v1.2
      return b;
    } catch { return {}; }
  };
  const saveBest = (k, v) => { try { const b = bestAll(); b[k] = v; localStorage.setItem(KEY, JSON.stringify(b)); } catch {} };
  const fleetTag = f => f ? `<span class="badge ${f}">${f === "A" ? "Airbus" : "Boeing"}</span>` : "";
  const LVN = new Proxy({}, { get: (_, k) => t("lv_" + k) });
  const LVE = { easy: "🛫", medium: "✈️", hard: "🚀" };

  let fleet = "all", G = null, timer = null, view = "hub";
  const okFleet = x => fleet === "all" || !x.fleet || x.fleet === fleet;

  // ======================= game definitions =======================
  const GAMES = {
    match: {
      get name() { return t("gn_match"); }, icon: "🖼️", color: "#2f7fc1",
      get desc() { return t("gd_match"); },
      levels: {
        easy:   { rounds: 10, opts: 3, time: 0,  lives: 5, dk: "ld_match_easy" },
        medium: { rounds: 15, opts: 4, time: 25, lives: 3, dk: "ld_match_medium" },
        hard:   { rounds: 20, opts: 4, time: 12, lives: 2, same: true, dk: "ld_match_hard" },
      },
      deck: L => shuffle(D.items.filter(okFleet)).slice(0, L.rounds),
      render(it, L) {
        let cand = D.items.filter(x => okFleet(x) && x.id !== it.id && x.q !== it.q);
        const same = cand.filter(x => x.sec === it.sec), other = cand.filter(x => x.sec !== it.sec);
        if (L.same && same.length >= L.opts - 1) cand = same;
        else if (G.lv === "easy" && other.length >= L.opts - 1) cand = other;
        G.opts = shuffle([it, ...shuffle(cand).slice(0, L.opts - 1)]);
        G.zoom = it.img.map(s => (D.imgBase || "img/") + s);
        return `<div class="g-card">
            <div class="g-ask">${t("g_match_q")} <small>${t("g_zoom")}</small></div>
            <div class="g-imgs">${it.img.map((s, i) => `<img src="${D.imgBase || "img/"}${s}" data-g-zoom="${i}" alt="">`).join("")}</div>
            ${it.note ? `<div class="note">${esc(it.note)}</div>` : ""}
          </div>
          <div class="g-opts">${G.opts.map((o, i) => `<button class="g-opt" data-g-pick="${i}"><span class="g-key">${"ABCD"[i]}</span><span>${fleetTag(o.fleet)}${esc(o.q)}${LANG() === "th" && window.TH && TH[o.id] ? `<span class="g-th">${esc(TH[o.id].q)}</span>` : ""}</span></button>`).join("")}</div>`;
      },
      pick(i, it) { return { ok: G.opts[i] === it, right: G.opts.indexOf(it), info: t("g_answer_is", { no: it.no, ref: it.ref }) }; },
      missLabel: it => { const n = (LANG() === "th" ? window.TH : window.EN) || {}; return `${fleetTag(it.fleet)}${esc(it.q)}${n[it.id] ? `<br><small>🧠 ${esc(n[it.id].tk)}</small>` : ""}`; },
    },

    tf: {
      get name() { return t("gn_tf"); }, icon: "⚖️", color: "#2e8b57",
      get desc() { return t("gd_tf"); },
      levels: {
        easy:   { rounds: 10, time: 0,  lives: 5, dk: "ld_tf_easy" },
        medium: { rounds: 15, time: 15, lives: 3, dk: "ld_tf_medium" },
        hard:   { rounds: 25, time: 8,  lives: 2, tricky: true, dk: "ld_tf_hard" },
      },
      deck(L) {
        let pool = GD.tf.filter(x => L.tricky || !x.h);
        if (L.tricky) pool = [...shuffle(pool.filter(x => x.h)), ...shuffle(pool.filter(x => !x.h))].slice(0, L.rounds);
        return shuffle(pool).slice(0, L.rounds);
      },
      render: it => `<div class="g-card g-tf">
          <div class="g-ask">${t("g_tf_q")}</div>
          <p class="g-state">“${esc(it.s)}”</p>
        </div>
        <div class="g-tfbtns">
          <button class="g-opt g-true" data-g-pick="1"><span>⭕</span> ${t("g_true")}</button>
          <button class="g-opt g-false" data-g-pick="0"><span>❌</span> ${t("g_false")}</button>
        </div>`,
      pick(i, it) { const ok = (i === 1) === it.v; return { ok, right: it.v ? 0 : 1, info: `${it.v ? "✅ " + t("g_true") : "❌ " + t("g_false")} — ${esc(it.x)} · CCM ${it.ref}` }; },
      missLabel: it => `“${esc(it.s)}” <small>→ ${it.v ? t("g_true") : t("g_false")}</small>`,
    },

    order: {
      get name() { return t("gn_order"); }, icon: "🔢", color: "#f2a541",
      get desc() { return t("gd_order"); },
      levels: {
        easy:   { rounds: 5, max: 4, time: 0,  lives: 5, miss: 3, dk: "ld_order_easy" },
        medium: { rounds: 6, max: 6, time: 75, lives: 3, miss: 2, dk: "ld_order_medium" },
        hard:   { rounds: 8, max: 99, time: 50, lives: 2, miss: 1, dk: "ld_order_hard" },
      },
      deck(L) {
        return shuffle(GD.order.filter(okFleet)).slice(0, L.rounds).map(p => {
          let steps = p.steps;
          if (steps.length > L.max) { const s = Math.random() * (steps.length - L.max + 1) | 0; steps = steps.slice(s, s + L.max); }
          return { ...p, use: steps, part: steps.length < p.steps.length };
        });
      },
      render(it) {
        G.done = 0; G.miss = 0; G.shuf = shuffle(it.use.map((s, i) => ({ s, i })));
        return `<div class="g-card">
            <div class="g-ask">${t("g_order_q")} ${it.part ? `<small>${t("g_part")}</small>` : ""}</div>
            <p class="g-proc">${fleetTag(it.fleet)}${esc(it.t)}</p>
            <ol class="g-seq" id="gSeq"></ol>
          </div>
          <div class="g-opts" id="gSteps">${G.shuf.map((o, j) => `<button class="g-opt g-step" data-g-step="${j}"><span>${esc(o.s)}</span></button>`).join("")}</div>
          <div class="g-misses" id="gMiss"></div>`;
      },
      missLabel: it => `${fleetTag(it.fleet)}${esc(it.t)}`,
    },

    numbers: {
      get name() { return t("gn_numbers"); }, icon: "🧮", color: "#7a5bc0",
      get desc() { return t("gd_numbers"); },
      levels: {
        easy:   { rounds: 10, opts: 3, time: 0,  lives: 5, dk: "ld_numbers_easy" },
        medium: { rounds: 15, opts: 4, time: 20, lives: 3, dk: "ld_numbers_medium" },
        hard:   { rounds: 25, opts: 4, time: 10, lives: 2, dk: "ld_numbers_hard" },
      },
      deck: L => shuffle(GD.numbers).slice(0, L.rounds),
      render(it, L) {
        G.opts = shuffle([it.a, ...shuffle(it.w).slice(0, L.opts - 1)]);
        return `<div class="g-card"><div class="g-ask">${t("g_mc_q")}</div><p class="g-state">${esc(it.q)}</p></div>
          <div class="g-opts">${G.opts.map((o, i) => `<button class="g-opt" data-g-pick="${i}"><span class="g-key">${"ABCD"[i]}</span><span>${esc(o)}</span></button>`).join("")}</div>`;
      },
      pick(i, it) { return { ok: G.opts[i] === it.a, right: G.opts.indexOf(it.a), info: t("g_ans", { a: esc(it.a), ref: it.ref }) }; },
      missLabel: it => `${esc(it.q)} <small>→ ${esc(it.a)}</small>`,
    },

    memory: {
      get name() { return t("gn_memory"); }, icon: "🃏", color: "#ff8fab",
      get desc() { return t("gd_memory"); },
      levels: {
        easy:   { rounds: 3, pairs: 4, time: 0,  lives: 3, dk: "ld_memory_easy" },
        medium: { rounds: 4, pairs: 6, time: 70, lives: 3, dk: "ld_memory_medium" },
        hard:   { rounds: 5, pairs: 8, time: 60, lives: 2, dk: "ld_memory_hard" },
      },
      deck(L) {
        const boards = [];
        for (let r = 0; r < L.rounds; r++) {
          const used = new Set(), pick = [];
          for (const p of shuffle(GD.pairs)) { if (!used.has(p.b)) { used.add(p.b); pick.push(p); } if (pick.length === L.pairs) break; }
          boards.push({ pairs: pick });
        }
        return boards;
      },
      render(it) {
        G.cards = shuffle(it.pairs.flatMap((p, k) => [{ k, s: p.a, side: "a" }, { k, s: p.b, side: "b" }]));
        G.open = []; G.matched = 0; G.miss = 0;
        return `<div class="g-card"><div class="g-ask">${t("g_mem_q")}</div></div>
          <div class="g-mem g-mem-${it.pairs.length}">${G.cards.map((c, j) => `
            <button class="g-mc" data-g-mem="${j}"><span class="g-mc-in"><span class="g-mc-back">✈︎</span><span class="g-mc-front ${c.side}">${esc(c.s)}</span></span></button>`).join("")}
          </div>
          <div class="g-misses" id="gMiss"></div>`;
      },
      missLabel: it => it.pairs.map(p => `${esc(p.a)} <small>→ ${esc(p.b)}</small>`).join("<br>"),
    },

    odd: {
      get name() { return t("gn_odd"); }, icon: "🕵️", color: "#9b86f0",
      get desc() { return t("gd_odd"); },
      levels: {
        easy:   { rounds: 10, opts: 3, time: 0,  lives: 5, dk: "ld_odd_easy" },
        medium: { rounds: 15, opts: 4, time: 20, lives: 3, dk: "ld_odd_medium" },
        hard:   { rounds: 20, opts: 4, time: 10, lives: 2, dk: "ld_odd_hard" },
      },
      deck(L) {
        const STOP = new Set(["with", "from", "that", "this", "your", "into", "against", "only", "both", "signs", "after", "until", "fully"]);
        const words = x => x.toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter(w => w.length >= 4 && !STOP.has(w));
        const out = [];
        for (const list of shuffle(GD.odd)) {
          const others = GD.odd.filter(o => o !== list && o.g === list.g);
          const lw = new Set(list.m.flatMap(words));
          const cand = shuffle(others.flatMap(o => o.m.map(x => ({ x, from: o.t }))))
            .filter(c => !list.m.includes(c.x) && !(list.x || []).includes(c.x) && !words(c.x).some(w => lw.has(w)));
          if (!cand.length || list.m.length < L.opts - 1) continue;
          out.push({ list, members: shuffle(list.m).slice(0, L.opts - 1), odd: cand[0] });
          if (out.length >= L.rounds) break;
        }
        return out;
      },
      render(it) {
        G.opts = shuffle([...it.members, it.odd.x]);
        return `<div class="g-card"><div class="g-ask">${t("g_odd_q")}</div><p class="g-state">${esc(it.list.t)}</p></div>
          <div class="g-opts">${G.opts.map((o, i) => `<button class="g-opt" data-g-pick="${i}"><span class="g-key">${"ABCD"[i]}</span><span>${esc(o)}</span></button>`).join("")}</div>`;
      },
      pick(i, it) { return { ok: G.opts[i] === it.odd.x, right: G.opts.indexOf(it.odd.x), info: t("g_odd_ans", { x: esc(it.odd.x), from: esc(it.odd.from) }) + ` · CCM ${it.list.ref}` }; },
      missLabel: it => `${esc(it.list.t)} <small>→ ✗ ${esc(it.odd.x)}</small>`,
    },

    sort: {
      get name() { return t("gn_sort"); }, icon: "🗂️", color: "#38b98a",
      get desc() { return t("gd_sort"); },
      auto: true,
      levels: {
        easy:   { rounds: 15, time: 0,   lives: 5, dk: "ld_sort_easy" },
        medium: { rounds: 25, time: 7,   lives: 3, dk: "ld_sort_medium" },
        hard:   { rounds: 40, time: 4,   lives: 3, dk: "ld_sort_hard" },
      },
      deck: L => shuffle(GD.sort.flatMap(set => set.i.map(([x, k]) => ({ set, x, k })))).slice(0, L.rounds),
      render: it => `<div class="g-card g-sortcard"><div class="g-ask">${esc(it.set.t)}</div><p class="g-state g-sortx">${esc(it.x)}</p></div>
        <div class="g-buckets g-b${it.set.b.length}">${it.set.b.map((b, i) => `<button class="g-opt g-bucket" data-g-pick="${i}">${esc(b)}</button>`).join("")}</div>`,
      pick(i, it) { return { ok: i === it.k, right: it.k, info: `${esc(it.x)} → <b>${esc(it.set.b[it.k])}</b> · CCM ${it.set.ref}` }; },
      missLabel: it => `${esc(it.x)} <small>→ ${esc(it.set.b[it.k])}</small>`,
    },

    marathon: {
      get name() { return t("gn_marathon"); }, icon: "🔥", color: "#f0648a",
      get desc() { return t("gd_marathon"); },
      endless: true,
      levels: {
        easy:   { rounds: "∞", opts: 3, time: 0,  lives: 5, dk: "ld_marathon_easy" },
        medium: { rounds: "∞", opts: 4, time: 15, lives: 3, dk: "ld_marathon_medium" },
        hard:   { rounds: "∞", opts: 4, time: 8,  lives: 1, dk: "ld_marathon_hard" },
      },
      deck(L) {
        const sub = { ...L, rounds: 999, same: L.lives === 1, tricky: true };
        const mix = [];
        for (const k of ["tf", "numbers", "odd", "sort", "match"]) for (const it of GAMES[k].deck(sub)) mix.push({ k, it });
        return shuffle(mix);
      },
      render(x, L) { G.sub = x.k; return `<div class="g-subtag">${GAMES[x.k].icon} ${GAMES[x.k].name}</div>` + GAMES[x.k].render(x.it, L); },
      pick(i, x) { return GAMES[x.k].pick(i, x.it); },
      missLabel: x => GAMES[x.k].missLabel(x.it),
    },
  };

  // ======================= screens =======================
  function hub() {
    stop(); view = "hub"; G = null;
    const b = bestAll();
    $("#game").innerHTML = `
      <div class="g-hero"><div class="g-plane">✈︎</div><h2>${t("g_pick")}</h2>
        <p>${t("g_pick_sub")}</p></div>
      <div class="g-games">${Object.entries(GAMES).map(([k, g]) => {
        const top = Math.max(0, ...["easy", "medium", "hard"].map(l => b[k + "-" + l] || 0));
        return `<button class="g-game" style="--gc:${g.color}" data-g-game="${k}">
          <span class="g-gi">${g.icon}</span><b>${g.name}</b><small>${g.desc}</small>
          <span class="g-gbest">${top ? "🏆 " + top.toLocaleString() : t("g_never")}</span></button>`;
      }).join("")}</div>
      <p class="g-foot">${t("g_fleet")}: <b>${fleet === "all" ? t("fleet_all") : fleet === "A" ? "Airbus" : "Boeing"}</b> ${t("g_change")}</p>`;
  }

  function levels(gk) {
    stop(); view = "levels"; G = { gk };
    const g = GAMES[gk], b = bestAll();
    $("#game").innerHTML = `
      <button class="g-back" data-g-hub>${t("g_other")}</button>
      <div class="g-hero"><div class="g-big-ico">${g.icon}</div><h2>${g.name}</h2><p>${g.desc}</p></div>
      <div class="g-levels">${Object.entries(g.levels).map(([k, L]) => `
        <button class="g-level lv-${k}" data-g-start="${k}">
          <span class="g-emo">${LVE[k]}</span>
          <span class="g-lt"><b>${LVN[k]}</b><small>${g.endless ? "∞" : t(gk === "memory" ? "boards" : "rounds", { n: L.rounds })} · ${t(L.dk)}</small></span>
          <span class="g-best">${b[gk + "-" + k] ? "🏆 " + b[gk + "-" + k].toLocaleString() : ""}</span>
        </button>`).join("")}</div>`;
  }

  function start(gk, lv) {
    const g = GAMES[gk], L = g.levels[lv], deck = g.deck(L);
    if (!deck.length) { $("#game").innerHTML = `<p class="empty">${t("g_empty")}</p>`; return; }
    G = { gk, g, lv, L, deck, i: 0, score: 0, lives: L.lives, streak: 0, bestStreak: 0, right: 0, missed: [], locked: false };
    view = "play"; round();
  }

  const mult = () => (G.streak >= 5 ? 3 : G.streak >= 2 ? 2 : 1);
  function hud() {
    return `<div class="g-top"><button class="g-back" data-g-quit>${t("g_quit")}</button><span class="g-tag">${G.g.icon} ${G.g.name} · ${LVN[G.lv]}</span></div>
      <div class="g-hud">
        <span class="g-hearts">${"❤️".repeat(Math.max(0, G.lives))}${"🤍".repeat(Math.max(0, G.L.lives - G.lives))}</span>
        <span class="g-prog">${G.g.endless ? "#" + (G.i + 1) : t("g_q", { i: G.i + 1, n: G.deck.length })}</span>
        <span class="g-score">${G.score.toLocaleString()} <small>${t("g_pts")}</small></span>
      </div>
      ${G.L.time ? `<div class="g-timer"><i id="gBar"></i></div>` : ""}
      ${G.streak >= 2 ? `<div class="g-combo">${t("g_combo", { m: mult() })}</div>` : ""}`;
  }

  function round() {
    stop();
    G.cur = G.deck[G.i]; G.locked = false;
    $("#game").innerHTML = hud() + G.g.render(G.cur, G.L) + `<div id="gFeedback"></div>`;
    scrollTo(0, 0);
    if (G.L.time) {
      G.t0 = performance.now();
      timer = setInterval(() => {
        const left = G.L.time - (performance.now() - G.t0) / 1000, bar = $("#gBar");
        if (bar) { bar.style.width = Math.max(0, left / G.L.time * 100) + "%"; bar.classList.toggle("low", left < G.L.time * 0.3); }
        if (left <= 0) finish(false, -1, t("g_timeout"));
      }, 100);
    } else G.t0 = performance.now();
  }
  const timeLeft = () => (G.L.time ? Math.max(0, G.L.time - (performance.now() - G.t0) / 1000) : 0);

  // single-answer games
  function pick(i) {
    if (G.locked || !G.g.pick) return;
    const r = G.g.pick(i, G.cur);
    document.querySelectorAll("[data-g-pick]").forEach((b, j) => {
      b.disabled = true;
      if (j === r.right) b.classList.add("right"); else if (j === i) b.classList.add("wrong");
    });
    finish(r.ok, i, null, r.info);
  }

  // order game
  function step(j) {
    if (G.locked) return;
    const o = G.shuf[j], btn = document.querySelector(`[data-g-step="${j}"]`);
    if (o.i === G.done) {
      G.done++;
      btn.classList.add("used"); btn.disabled = true;
      $("#gSeq").insertAdjacentHTML("beforeend", `<li>${esc(o.s)}</li>`);
      if (G.done === G.cur.use.length) finish(true, 0);
    } else {
      G.miss++;
      btn.classList.remove("wrong"); void btn.offsetWidth; btn.classList.add("wrong");
      $("#gMiss").textContent = t("g_miss", { n: G.miss });
      if (G.miss >= G.L.miss) finish(false, 0, t("g_order_wrong"));
    }
  }

  // memory game
  function mem(j) {
    if (G.locked || G.busy) return;
    const c = G.cards[j], btn = document.querySelector(`[data-g-mem="${j}"]`);
    if (c.done || G.open.includes(j)) return;
    btn.classList.add("flip"); G.open.push(j);
    if (G.open.length < 2) return;
    const [a, b] = G.open.map(x => G.cards[x]);
    const btns = G.open.map(x => document.querySelector(`[data-g-mem="${x}"]`));
    if (a.k === b.k) {
      a.done = b.done = true; G.open = []; G.matched++;
      btns.forEach(x => x.classList.add("match"));
      if (G.matched === G.cur.pairs.length) setTimeout(() => finish(true, 0), 350);
    } else {
      G.miss++; G.busy = true;
      btns.forEach(x => x.classList.add("nope"));
      $("#gMiss").textContent = t("g_miss", { n: G.miss });
      setTimeout(() => { btns.forEach(x => x.classList.remove("flip", "nope")); G.open = []; G.busy = false; }, 800);
    }
  }

  function finish(ok, i, label, info, isOrder) {
    if (G.locked) return;
    G.locked = true; stop();
    const it = G.cur;
    if (G.gk === "order") {
      document.querySelectorAll(".g-step").forEach(b => (b.disabled = true));
      if (!ok || G.done < it.use.length) {
        info = `${t("g_sol")}<ol class="g-sol">${it.use.map(s => `<li>${esc(s)}</li>`).join("")}</ol>CCM ${it.ref}`;
      } else info = `CCM ${it.ref}`;
      if (i === -1) document.querySelectorAll("[data-g-pick]").forEach(b => (b.disabled = true));
    } else if (G.gk === "memory") {
      document.querySelectorAll(".g-mc").forEach(b => { b.disabled = true; b.classList.add("flip"); });
      info = null;
    } else if (i === -1) {
      document.querySelectorAll("[data-g-pick]").forEach(b => (b.disabled = true));
      const r = G.g.pick(-1, it); const btn = document.querySelectorAll("[data-g-pick]")[r.right];
      if (btn) btn.classList.add("right"); info = r.info;
    }
    if (window.STATS) {
      const qid = G.gk === "match" ? it.id : G.gk === "marathon" && it.k === "match" ? it.it.id : null;
      qid ? STATS.rec(qid, ok) : STATS.act(1);
    }
    let msg;
    if (ok) {
      G.streak++; G.right++; G.bestStreak = Math.max(G.bestStreak, G.streak);
      let base = 100 + Math.round(timeLeft() * 10);
      if (G.gk === "order") base = 60 * it.use.length - 40 * G.miss + Math.round(timeLeft() * 4);
      if (G.gk === "memory") base = 80 * it.pairs.length - 15 * G.miss + Math.round(timeLeft() * 4);
      if (G.gk === "sort") base = 50 + Math.round(timeLeft() * 10);
      const pts = Math.max(10, Math.round(base * mult()));
      G.score += pts;
      msg = `<div class="g-fb ok">${(G.gk === "order" || G.gk === "memory") && G.miss ? t("g_pass") : t("g_correct")} +${pts}${mult() > 1 ? ` (x${mult()})` : ""}</div>`;
    } else {
      G.streak = 0; G.lives--; G.missed.push(it);
      msg = `<div class="g-fb no">${label || t("g_wrong")} −❤️</div>`;
    }
    const last = G.lives <= 0 || G.i >= G.deck.length - 1;
    $("#gFeedback").innerHTML = msg + (info ? `<div class="g-info">${info}</div>` : "") +
      `<button class="btn ok g-next" data-g-next>${last ? t("g_result") : t("g_next")}</button>`;
    $("#gFeedback").scrollIntoView({ behavior: "smooth", block: "nearest" });
    if (ok && G.g.auto && !last) { const at = G.i; setTimeout(() => { if (G && view === "play" && G.i === at && G.locked) next(); }, 650); }
  }

  function next() {
    if (G.lives <= 0 || G.i >= G.deck.length - 1) return end();
    G.i++; round();
  }

  function end() {
    stop(); view = "end";
    const key = G.gk + "-" + G.lv, best = bestAll()[key] || 0, isBest = G.score > best;
    if (isBest) saveBest(key, G.score);
    const answered = G.right + G.missed.length, acc = answered ? Math.round(G.right / answered * 100) : 0;
    const cleared = G.lives > 0, stars = !cleared ? 0 : acc >= 90 ? 3 : acc >= 70 ? 2 : 1;
    $("#game").innerHTML = `
      <div class="g-end">
        <div class="g-tag">${G.g.icon} ${G.g.name} · ${LVN[G.lv]}</div>
        <div class="g-stars">${[1, 2, 3].map(n => `<span class="${n <= stars ? "on" : ""}">★</span>`).join("")}</div>
        <h2>${cleared ? (stars === 3 ? t("g_end_great") : t("g_end_pass")) : t("g_end_fail")}</h2>
        <div class="g-big">${G.score.toLocaleString()}<small> ${t("g_pts")}</small></div>
        ${isBest && G.score ? `<div class="g-new">${t("g_best_new")}</div>` : `<div class="g-sub">${t("g_best", { s: Math.max(best, G.score).toLocaleString() })}</div>`}
        <div class="g-stats">
          <div><b>${G.right}/${answered}</b><small>${t("g_right")}</small></div>
          <div><b>${acc}%</b><small>${t("g_acc")}</small></div>
          <div><b>${G.bestStreak}</b><small>${t("g_bstreak")}</small></div>
        </div>
        ${G.missed.length ? `<div class="g-missed"><h3>${t("g_review")}</h3>${G.missed.map(m => `<div class="g-miss">${G.g.missLabel(m)}</div>`).join("")}</div>` : ""}
        <div class="cardnav">
          <button class="btn" data-g-game="${G.gk}">${t("g_change_lv")}</button>
          <button class="btn ok" data-g-start="${G.lv}">${t("g_again")}</button>
        </div>
        <button class="btn ghost g-full" data-g-hub>${t("g_other2")}</button>
      </div>`;
    if (stars === 3) confetti();
    window.STATS && STATS.game(G.gk, G.lv, { stars, score: G.score, right: G.right });
    scrollTo(0, 0);
  }

  function confetti() {
    const box = document.createElement("div"); box.className = "g-confetti";
    const colors = ["#ffb38a", "#e4572e", "#2f7fc1", "#7a5bc0", "#2e8b57", "#f2c14e"];
    for (let i = 0; i < 70; i++) {
      const p = document.createElement("i");
      p.style.left = Math.random() * 100 + "%"; p.style.background = colors[i % colors.length];
      p.style.animationDelay = Math.random() * 0.6 + "s"; p.style.animationDuration = 1.8 + Math.random() * 1.4 + "s";
      box.appendChild(p);
    }
    document.body.appendChild(box); setTimeout(() => box.remove(), 3800);
  }
  window.STConfetti = confetti;
  document.addEventListener("st-confetti", confetti);
  function stop() { if (timer) { clearInterval(timer); timer = null; } }

  document.addEventListener("click", e => {
    const el = e.target.closest("[data-g-game],[data-g-start],[data-g-pick],[data-g-step],[data-g-mem],[data-g-next],[data-g-hub],[data-g-quit],[data-g-zoom]");
    if (!el || !el.closest("#game")) return;
    const d = el.dataset;
    if (d.gGame) levels(d.gGame);
    else if (d.gStart) start(G.gk, d.gStart);
    else if (d.gPick !== undefined) pick(+d.gPick);
    else if (d.gStep !== undefined) step(+d.gStep);
    else if (d.gMem !== undefined) mem(+d.gMem);
    else if (d.gNext !== undefined) next();
    else if (d.gHub !== undefined) hub();
    else if (d.gQuit !== undefined) { if (G.locked || confirmQuit()) levels(G.gk); }
    else if (d.gZoom !== undefined && window.STViewer) window.STViewer(G.zoom, +d.gZoom);
  });
  function confirmQuit() {
    // no browser dialogs: second tap within 2s confirms
    const b = document.querySelector("[data-g-quit]");
    if (b.dataset.armed) return true;
    b.dataset.armed = 1; b.textContent = t("g_quit2"); setTimeout(() => { if (b) { delete b.dataset.armed; b.textContent = t("g_quit"); } }, 2000);
    return false;
  }

  window.STGame = {
    show(f) {
      const changed = f !== fleet; fleet = f;
      if (changed || view === "hub" || !$("#game").childElementCount || (view === "play" && !G)) hub();
    },
    relang() { if (view === "hub") hub(); else if (view === "levels") levels(G.gk); else if (view === "end") { /* keep */ } },
    hide() { if (view === "play" && G && !G.locked && G.L.time) { stop(); hub(); } },
  };
})();
