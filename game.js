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
  const LVN = { easy: "ง่าย", medium: "กลาง", hard: "ยาก" };
  const LVE = { easy: "🛫", medium: "✈️", hard: "🚀" };

  let fleet = "all", G = null, timer = null, view = "hub";
  const okFleet = x => fleet === "all" || !x.fleet || x.fleet === fleet;

  // ======================= game definitions =======================
  const GAMES = {
    match: {
      name: "ทายภาพคำตอบ", icon: "🖼️", color: "#2f7fc1",
      desc: "ดูภาพคำตอบจากคู่มือ แล้วเลือกว่าเป็นของคำถามข้อไหน",
      levels: {
        easy:   { rounds: 10, opts: 3, time: 0,  lives: 5, desc: "3 ตัวเลือก · ไม่จับเวลา · 5 หัวใจ" },
        medium: { rounds: 15, opts: 4, time: 25, lives: 3, desc: "4 ตัวเลือก · 25 วิ · 3 หัวใจ" },
        hard:   { rounds: 20, opts: 4, time: 12, lives: 2, same: true, desc: "ตัวเลือกหมวดเดียวกัน · 12 วิ · 2 หัวใจ" },
      },
      deck: L => shuffle(D.items.filter(okFleet)).slice(0, L.rounds),
      render(it, L) {
        let cand = D.items.filter(x => okFleet(x) && x.id !== it.id && x.q !== it.q);
        const same = cand.filter(x => x.sec === it.sec), other = cand.filter(x => x.sec !== it.sec);
        if (L.same && same.length >= L.opts - 1) cand = same;
        else if (G.lv === "easy" && other.length >= L.opts - 1) cand = other;
        G.opts = shuffle([it, ...shuffle(cand).slice(0, L.opts - 1)]);
        G.zoom = it.img.map(s => "img/" + s);
        return `<div class="g-card">
            <div class="g-ask">คำตอบนี้มาจากคำถามข้อไหน? <small>(แตะภาพเพื่อซูม)</small></div>
            <div class="g-imgs">${it.img.map((s, i) => `<img src="img/${s}" data-g-zoom="${i}" alt="">`).join("")}</div>
            ${it.note ? `<div class="note">${esc(it.note)}</div>` : ""}
          </div>
          <div class="g-opts">${G.opts.map((o, i) => `<button class="g-opt" data-g-pick="${i}"><span class="g-key">${"ABCD"[i]}</span><span>${fleetTag(o.fleet)}${esc(o.q)}</span></button>`).join("")}</div>`;
      },
      pick(i, it) { return { ok: G.opts[i] === it, right: G.opts.indexOf(it), info: `คำตอบคือข้อ ${it.no} · CCM ${it.ref}` }; },
      missLabel: it => `${fleetTag(it.fleet)}${esc(it.q)}`,
    },

    tf: {
      name: "ถูกหรือผิด", icon: "⚖️", color: "#2e8b57",
      desc: "อ่านข้อความจากคู่มือ ตัดสินให้ไวว่าถูกหรือผิด",
      levels: {
        easy:   { rounds: 10, time: 0,  lives: 5, desc: "10 ข้อ · ไม่จับเวลา · 5 หัวใจ" },
        medium: { rounds: 15, time: 15, lives: 3, desc: "15 ข้อ · 15 วิ · 3 หัวใจ" },
        hard:   { rounds: 25, time: 8,  lives: 2, tricky: true, desc: "รวมข้อหลอก · 8 วิ · 2 หัวใจ" },
      },
      deck(L) {
        let pool = GD.tf.filter(x => L.tricky || !x.h);
        if (L.tricky) pool = [...shuffle(pool.filter(x => x.h)), ...shuffle(pool.filter(x => !x.h))].slice(0, L.rounds);
        return shuffle(pool).slice(0, L.rounds);
      },
      render: it => `<div class="g-card g-tf">
          <div class="g-ask">ข้อความนี้ถูกหรือผิด?</div>
          <p class="g-state">“${esc(it.s)}”</p>
        </div>
        <div class="g-tfbtns">
          <button class="g-opt g-true" data-g-pick="1"><span>⭕</span> ถูก</button>
          <button class="g-opt g-false" data-g-pick="0"><span>❌</span> ผิด</button>
        </div>`,
      pick(i, it) { const ok = (i === 1) === it.v; return { ok, right: it.v ? 0 : 1, info: `${it.v ? "✅ ถูก" : "❌ ผิด"} — ${esc(it.x)} · CCM ${it.ref}` }; },
      missLabel: it => `“${esc(it.s)}” <small>→ ${it.v ? "ถูก" : "ผิด"}</small>`,
    },

    order: {
      name: "เรียงขั้นตอน", icon: "🔢", color: "#f2a541",
      desc: "แตะขั้นตอนให้ถูกลำดับตามคู่มือ เช่น เปิดประตู ELT ดับไฟ",
      levels: {
        easy:   { rounds: 5, max: 4, time: 0,  lives: 5, miss: 3, desc: "สูงสุด 4 ขั้น · ไม่จับเวลา · พลาดได้ 2 ครั้ง/ข้อ" },
        medium: { rounds: 6, max: 6, time: 75, lives: 3, miss: 2, desc: "สูงสุด 6 ขั้น · 75 วิ · พลาดได้ 1 ครั้ง/ข้อ" },
        hard:   { rounds: 8, max: 99, time: 50, lives: 2, miss: 1, desc: "ครบทุกขั้น · 50 วิ · ห้ามพลาด" },
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
            <div class="g-ask">เรียงลำดับให้ถูก ${it.part ? "<small>(ช่วงหนึ่งของขั้นตอน)</small>" : ""}</div>
            <p class="g-proc">${fleetTag(it.fleet)}${esc(it.t)}</p>
            <ol class="g-seq" id="gSeq"></ol>
          </div>
          <div class="g-opts" id="gSteps">${G.shuf.map((o, j) => `<button class="g-opt g-step" data-g-step="${j}"><span>${esc(o.s)}</span></button>`).join("")}</div>
          <div class="g-misses" id="gMiss"></div>`;
      },
      missLabel: it => `${fleetTag(it.fleet)}${esc(it.t)}`,
    },

    numbers: {
      name: "ตัวเลขต้องจำ", icon: "🧮", color: "#7a5bc0",
      desc: "ชั่วโมง นาที กิโล เปอร์เซ็นต์ ความถี่ และตัวย่อที่ต้องจำ",
      levels: {
        easy:   { rounds: 10, opts: 3, time: 0,  lives: 5, desc: "3 ตัวเลือก · ไม่จับเวลา · 5 หัวใจ" },
        medium: { rounds: 15, opts: 4, time: 20, lives: 3, desc: "4 ตัวเลือก · 20 วิ · 3 หัวใจ" },
        hard:   { rounds: 25, opts: 4, time: 10, lives: 2, desc: "4 ตัวเลือก · 10 วิ · 2 หัวใจ" },
      },
      deck: L => shuffle(GD.numbers).slice(0, L.rounds),
      render(it, L) {
        G.opts = shuffle([it.a, ...shuffle(it.w).slice(0, L.opts - 1)]);
        return `<div class="g-card"><div class="g-ask">เลือกคำตอบที่ถูกต้อง</div><p class="g-state">${esc(it.q)}</p></div>
          <div class="g-opts">${G.opts.map((o, i) => `<button class="g-opt" data-g-pick="${i}"><span class="g-key">${"ABCD"[i]}</span><span>${esc(o)}</span></button>`).join("")}</div>`;
      },
      pick(i, it) { return { ok: G.opts[i] === it.a, right: G.opts.indexOf(it.a), info: `คำตอบ: ${esc(it.a)} · CCM ${it.ref}` }; },
      missLabel: it => `${esc(it.q)} <small>→ ${esc(it.a)}</small>`,
    },
  };

  // ======================= screens =======================
  function hub() {
    stop(); view = "hub"; G = null;
    const b = bestAll();
    $("#game").innerHTML = `
      <div class="g-hero"><div class="g-plane">✈︎</div><h2>เลือกเกม</h2>
        <p>ทุกเกมมี 3 ระดับ เนื้อหามาจาก Cabin Crew Manual</p></div>
      <div class="g-games">${Object.entries(GAMES).map(([k, g]) => {
        const top = Math.max(0, ...["easy", "medium", "hard"].map(l => b[k + "-" + l] || 0));
        return `<button class="g-game" style="--gc:${g.color}" data-g-game="${k}">
          <span class="g-gi">${g.icon}</span><b>${g.name}</b><small>${g.desc}</small>
          <span class="g-gbest">${top ? "🏆 " + top.toLocaleString() : "ยังไม่เคยเล่น"}</span></button>`;
      }).join("")}</div>
      <p class="g-foot">เครื่องบิน: <b>${fleet === "all" ? "ทั้งหมด" : fleet === "A" ? "Airbus" : "Boeing"}</b> (เปลี่ยนได้ที่แท็บอ่าน)</p>`;
  }

  function levels(gk) {
    stop(); view = "levels"; G = { gk };
    const g = GAMES[gk], b = bestAll();
    $("#game").innerHTML = `
      <button class="g-back" data-g-hub>‹ เลือกเกมอื่น</button>
      <div class="g-hero"><div class="g-big-ico">${g.icon}</div><h2>${g.name}</h2><p>${g.desc}</p></div>
      <div class="g-levels">${Object.entries(g.levels).map(([k, L]) => `
        <button class="g-level lv-${k}" data-g-start="${k}">
          <span class="g-emo">${LVE[k]}</span>
          <span class="g-lt"><b>${LVN[k]}</b><small>${L.desc}</small></span>
          <span class="g-best">${b[gk + "-" + k] ? "🏆 " + b[gk + "-" + k].toLocaleString() : ""}</span>
        </button>`).join("")}</div>`;
  }

  function start(gk, lv) {
    const g = GAMES[gk], L = g.levels[lv], deck = g.deck(L);
    if (!deck.length) { $("#game").innerHTML = `<p class="empty">ไม่มีข้อสำหรับเครื่องที่เลือก</p>`; return; }
    G = { gk, g, lv, L, deck, i: 0, score: 0, lives: L.lives, streak: 0, bestStreak: 0, right: 0, missed: [], locked: false };
    view = "play"; round();
  }

  const mult = () => (G.streak >= 5 ? 3 : G.streak >= 2 ? 2 : 1);
  function hud() {
    return `<div class="g-top"><button class="g-back" data-g-quit>‹ ออก</button><span class="g-tag">${G.g.icon} ${G.g.name} · ${LVN[G.lv]}</span></div>
      <div class="g-hud">
        <span class="g-hearts">${"❤️".repeat(Math.max(0, G.lives))}${"🤍".repeat(Math.max(0, G.L.lives - G.lives))}</span>
        <span class="g-prog">ข้อ ${G.i + 1}/${G.deck.length}</span>
        <span class="g-score">${G.score.toLocaleString()} <small>แต้ม</small></span>
      </div>
      ${G.L.time ? `<div class="g-timer"><i id="gBar"></i></div>` : ""}
      ${G.streak >= 2 ? `<div class="g-combo">🔥 คอมโบ x${mult()}</div>` : ""}`;
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
        if (left <= 0) finish(false, -1, "⏰ หมดเวลา!");
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
      $("#gMiss").textContent = `พลาด ${G.miss} ครั้ง`;
      if (G.miss >= G.L.miss) finish(false, 0, "ลำดับยังไม่ถูก");
    }
  }

  function finish(ok, i, label, info, isOrder) {
    if (G.locked) return;
    G.locked = true; stop();
    const it = G.cur;
    if (G.gk === "order") {
      document.querySelectorAll(".g-step").forEach(b => (b.disabled = true));
      if (!ok || G.done < it.use.length) {
        info = `ลำดับที่ถูก:<ol class="g-sol">${it.use.map(s => `<li>${esc(s)}</li>`).join("")}</ol>CCM ${it.ref}`;
      } else info = `CCM ${it.ref}`;
      if (i === -1) document.querySelectorAll("[data-g-pick]").forEach(b => (b.disabled = true));
    } else if (i === -1) {
      document.querySelectorAll("[data-g-pick]").forEach(b => (b.disabled = true));
      const r = G.g.pick(-1, it); const btn = document.querySelectorAll("[data-g-pick]")[r.right];
      if (btn) btn.classList.add("right"); info = r.info;
    }
    let msg;
    if (ok) {
      G.streak++; G.right++; G.bestStreak = Math.max(G.bestStreak, G.streak);
      let base = 100 + Math.round(timeLeft() * 10);
      if (G.gk === "order") base = 60 * it.use.length - 40 * G.miss + Math.round(timeLeft() * 4);
      const pts = Math.max(10, Math.round(base * mult()));
      G.score += pts;
      msg = `<div class="g-fb ok">${G.gk === "order" && G.miss ? "ผ่าน!" : "ถูกต้อง!"} +${pts}${mult() > 1 ? ` (x${mult()})` : ""}</div>`;
    } else {
      G.streak = 0; G.lives--; G.missed.push(it);
      msg = `<div class="g-fb no">${label || "ยังไม่ใช่"} −❤️</div>`;
    }
    const last = G.lives <= 0 || G.i >= G.deck.length - 1;
    $("#gFeedback").innerHTML = msg + (info ? `<div class="g-info">${info}</div>` : "") +
      `<button class="btn ok g-next" data-g-next>${last ? "ดูผลคะแนน" : "ข้อต่อไป ›"}</button>`;
    $("#gFeedback").scrollIntoView({ behavior: "smooth", block: "nearest" });
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
        <h2>${cleared ? (stars === 3 ? "สุดยอด! พร้อมขึ้นบิน" : "ผ่านด่านแล้ว!") : "หัวใจหมดแล้ว"}</h2>
        <div class="g-big">${G.score.toLocaleString()}<small> แต้ม</small></div>
        ${isBest && G.score ? `<div class="g-new">🏆 สถิติใหม่!</div>` : `<div class="g-sub">สถิติสูงสุด: ${Math.max(best, G.score).toLocaleString()}</div>`}
        <div class="g-stats">
          <div><b>${G.right}/${answered}</b><small>ตอบถูก</small></div>
          <div><b>${acc}%</b><small>ความแม่น</small></div>
          <div><b>${G.bestStreak}</b><small>คอมโบสูงสุด</small></div>
        </div>
        ${G.missed.length ? `<div class="g-missed"><h3>ข้อที่ควรทบทวน</h3>${G.missed.map(m => `<div class="g-miss">${G.g.missLabel(m)}</div>`).join("")}</div>` : ""}
        <div class="cardnav">
          <button class="btn" data-g-game="${G.gk}">เปลี่ยนระดับ</button>
          <button class="btn ok" data-g-start="${G.lv}">เล่นอีกครั้ง</button>
        </div>
        <button class="btn ghost g-full" data-g-hub>เลือกเกมอื่น</button>
      </div>`;
    if (stars === 3) confetti();
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
  function stop() { if (timer) { clearInterval(timer); timer = null; } }

  document.addEventListener("click", e => {
    const t = e.target.closest("[data-g-game],[data-g-start],[data-g-pick],[data-g-step],[data-g-next],[data-g-hub],[data-g-quit],[data-g-zoom]");
    if (!t || !t.closest("#game")) return;
    const d = t.dataset;
    if (d.gGame) levels(d.gGame);
    else if (d.gStart) start(G.gk, d.gStart);
    else if (d.gPick !== undefined) pick(+d.gPick);
    else if (d.gStep !== undefined) step(+d.gStep);
    else if (d.gNext !== undefined) next();
    else if (d.gHub !== undefined) hub();
    else if (d.gQuit !== undefined) { if (G.locked || confirmQuit()) levels(G.gk); }
    else if (d.gZoom !== undefined && window.STViewer) window.STViewer(G.zoom, +d.gZoom);
  });
  function confirmQuit() {
    // no browser dialogs: second tap within 2s confirms
    const b = document.querySelector("[data-g-quit]");
    if (b.dataset.armed) return true;
    b.dataset.armed = 1; b.textContent = "แตะอีกครั้งเพื่อออก"; setTimeout(() => { if (b) { delete b.dataset.armed; b.textContent = "‹ ออก"; } }, 2000);
    return false;
  }

  window.STGame = {
    show(f) {
      const changed = f !== fleet; fleet = f;
      if (changed || view === "hub" || !$("#game").childElementCount || (view === "play" && !G)) hub();
    },
    hide() { if (view === "play" && G && !G.locked && G.L.time) { stop(); hub(); } },
  };
})();
