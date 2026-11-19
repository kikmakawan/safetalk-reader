// SafeTalk game: see an answer from the manual, pick the question it belongs to.
(() => {
  const D = window.SAFETALK;
  const $ = s => document.querySelector(s);
  const KEY = "safetalk-q3-2026-game";
  const LEVELS = {
    easy:   { name: "ง่าย",  emoji: "🛫", rounds: 10, opts: 3, time: 0,  lives: 5, same: false,
              desc: "3 ตัวเลือก · ไม่จับเวลา · 5 หัวใจ" },
    medium: { name: "กลาง", emoji: "✈️", rounds: 15, opts: 4, time: 25, lives: 3, same: false,
              desc: "4 ตัวเลือก · 25 วินาที · 3 หัวใจ" },
    hard:   { name: "ยาก",  emoji: "🚀", rounds: 20, opts: 4, time: 12, lives: 2, same: true,
              desc: "4 ตัวเลือกหมวดเดียวกัน · 12 วินาที · 2 หัวใจ" },
  };
  const esc = s => s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
  const saveBest = (lv, v) => { try { const b = load(); b[lv] = v; localStorage.setItem(KEY, JSON.stringify(b)); } catch {} };

  let G = null, timer = null, fleet = "all";

  const pool = () => D.items.filter(it => fleet === "all" || !it.fleet || it.fleet === fleet);
  const fleetTag = it => it.fleet ? `<span class="badge ${it.fleet}">${it.fleet === "A" ? "Airbus" : "Boeing"}</span>` : "";

  function menu() {
    stop();
    const best = load();
    $("#game").innerHTML = `
      <div class="g-hero">
        <div class="g-plane">✈︎</div>
        <h2>ภาพนี้ตอบคำถามข้อไหน?</h2>
        <p>ดูคำตอบจากคู่มือ แล้วเลือกคำถามให้ถูก ตอบถูกติดกันได้คอมโบ ยิ่งตอบไวยิ่งได้โบนัส</p>
      </div>
      <div class="g-levels">
        ${Object.entries(LEVELS).map(([k, L]) => `
          <button class="g-level lv-${k}" data-g-start="${k}">
            <span class="g-emo">${L.emoji}</span>
            <span class="g-lt"><b>${L.name}</b><small>${L.rounds} ข้อ · ${L.desc}</small></span>
            <span class="g-best">${best[k] ? `🏆 ${best[k]}` : ""}</span>
          </button>`).join("")}
      </div>
      <p class="g-foot">เล่นเฉพาะเครื่อง: <b>${fleet === "all" ? "ทั้งหมด" : fleet === "A" ? "Airbus" : "Boeing"}</b> (เปลี่ยนได้ที่แท็บอ่าน)</p>`;
  }

  function start(lv) {
    const L = LEVELS[lv], items = pool();
    G = { lv, L, deck: shuffle(items.slice()).slice(0, Math.min(L.rounds, items.length)),
          i: 0, score: 0, lives: L.lives, streak: 0, bestStreak: 0, right: 0, missed: [], locked: false };
    round();
  }

  function options(it) {
    const L = G.L;
    let cand = pool().filter(x => x.id !== it.id && x.q !== it.q);
    if (L.same) {
      const same = cand.filter(x => x.sec === it.sec);
      if (same.length >= L.opts - 1) cand = same;
    } else if (G.lv === "easy") {
      const other = cand.filter(x => x.sec !== it.sec);
      if (other.length >= L.opts - 1) cand = other;
    }
    return shuffle([it, ...shuffle(cand).slice(0, L.opts - 1)]);
  }

  function hud() {
    const L = G.L;
    return `<div class="g-hud">
      <span class="g-hearts">${"❤️".repeat(G.lives)}${"🤍".repeat(Math.max(0, L.lives - G.lives))}</span>
      <span class="g-prog">ข้อ ${G.i + 1}/${G.deck.length}</span>
      <span class="g-score">${G.score.toLocaleString()} <small>แต้ม</small></span>
    </div>
    ${L.time ? `<div class="g-timer"><i id="gBar"></i></div>` : ""}
    ${G.streak >= 2 ? `<div class="g-combo">🔥 คอมโบ x${mult()}</div>` : ""}`;
  }
  const mult = () => (G.streak >= 5 ? 3 : G.streak >= 2 ? 2 : 1);

  function round() {
    stop();
    const it = G.deck[G.i];
    G.cur = it; G.opts = options(it); G.locked = false;
    $("#game").innerHTML = `${hud()}
      <div class="g-card">
        <div class="g-ask">คำตอบนี้มาจากคำถามข้อไหน? <small>(แตะภาพเพื่อซูม)</small></div>
        <div class="g-imgs">${it.img.map((s, i) => `<img src="img/${s}" data-g-zoom="${i}" alt="">`).join("")}</div>
        ${it.note ? `<div class="note">${esc(it.note)}</div>` : ""}
      </div>
      <div class="g-opts">${G.opts.map((o, i) => `
        <button class="g-opt" data-g-pick="${i}"><span class="g-key">${"ABCD"[i]}</span><span>${fleetTag(o)}${esc(o.q)}</span></button>`).join("")}
      </div>
      <div id="gFeedback"></div>`;
    $("#game").scrollIntoView({ block: "start" });
    scrollTo(0, 0);
    if (G.L.time) {
      G.t0 = performance.now();
      timer = setInterval(() => {
        const left = G.L.time - (performance.now() - G.t0) / 1000;
        const bar = $("#gBar");
        if (bar) { bar.style.width = Math.max(0, left / G.L.time * 100) + "%"; bar.classList.toggle("low", left < G.L.time * 0.3); }
        if (left <= 0) pick(-1);
      }, 100);
    }
  }

  function pick(i) {
    if (G.locked) return;
    G.locked = true; stop();
    const it = G.cur, ok = i >= 0 && G.opts[i] === it;
    const btns = document.querySelectorAll(".g-opt");
    btns.forEach((b, j) => { b.disabled = true; if (G.opts[j] === it) b.classList.add("right"); else if (j === i) b.classList.add("wrong"); });
    let msg;
    if (ok) {
      G.streak++; G.right++; G.bestStreak = Math.max(G.bestStreak, G.streak);
      const left = G.L.time ? Math.max(0, G.L.time - (performance.now() - G.t0) / 1000) : 0;
      const pts = Math.round((100 + left * 10) * mult());
      G.score += pts;
      msg = `<div class="g-fb ok">ถูกต้อง! +${pts}${mult() > 1 ? ` (x${mult()})` : ""}</div>`;
    } else {
      G.streak = 0; G.lives--; G.missed.push(it);
      msg = `<div class="g-fb no">${i < 0 ? "⏰ หมดเวลา!" : "ยังไม่ใช่"} — คำตอบคือข้อ ${it.no} (${secName(it.sec)})</div>`;
    }
    const last = G.lives <= 0 || G.i >= G.deck.length - 1;
    $("#gFeedback").innerHTML = msg + `<button class="btn ok g-next" data-g-next>${last ? "ดูผลคะแนน" : "ข้อต่อไป ›"}</button>`;
    $("#gFeedback").scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
  const secName = id => D.sections.find(s => s.id === id).name;

  function next() {
    if (G.lives <= 0 || G.i >= G.deck.length - 1) return end();
    G.i++; round();
  }

  function end() {
    stop();
    const best = load()[G.lv] || 0, isBest = G.score > best;
    if (isBest) saveBest(G.lv, G.score);
    const answered = G.right + G.missed.length;
    const acc = answered ? Math.round(G.right / answered * 100) : 0;
    const cleared = G.lives > 0;
    const stars = !cleared ? 0 : acc >= 90 ? 3 : acc >= 70 ? 2 : 1;
    $("#game").innerHTML = `
      <div class="g-end">
        <div class="g-stars">${[1, 2, 3].map(n => `<span class="${n <= stars ? "on" : ""}">★</span>`).join("")}</div>
        <h2>${cleared ? (stars === 3 ? "สุดยอด! พร้อมขึ้นบิน" : "ผ่านด่านแล้ว!") : "หัวใจหมดแล้ว"}</h2>
        <div class="g-big">${G.score.toLocaleString()}<small> แต้ม</small></div>
        ${isBest && G.score ? `<div class="g-new">🏆 สถิติใหม่ระดับ${G.L.name}!</div>` : `<div class="g-sub">สถิติสูงสุด: ${Math.max(best, G.score).toLocaleString()}</div>`}
        <div class="g-stats">
          <div><b>${G.right}/${answered}</b><small>ตอบถูก</small></div>
          <div><b>${acc}%</b><small>ความแม่น</small></div>
          <div><b>${G.bestStreak}</b><small>คอมโบสูงสุด</small></div>
        </div>
        ${G.missed.length ? `<div class="g-missed"><h3>ข้อที่ควรทบทวน</h3>${G.missed.map(m =>
          `<div class="g-miss"><span class="num">${m.no}</span><span>${fleetTag(m)}${esc(m.q)}</span></div>`).join("")}</div>` : ""}
        <div class="cardnav">
          <button class="btn" data-g-menu>เลือกระดับ</button>
          <button class="btn ok" data-g-start="${G.lv}">เล่นอีกครั้ง</button>
        </div>
      </div>`;
    if (stars === 3) confetti();
    scrollTo(0, 0);
  }

  function confetti() {
    const box = document.createElement("div"); box.className = "g-confetti";
    const colors = ["#ffb38a", "#e4572e", "#2f7fc1", "#7a5bc0", "#2e8b57", "#f2c14e"];
    for (let i = 0; i < 70; i++) {
      const p = document.createElement("i");
      p.style.left = Math.random() * 100 + "%";
      p.style.background = colors[i % colors.length];
      p.style.animationDelay = Math.random() * 0.6 + "s";
      p.style.animationDuration = 1.8 + Math.random() * 1.4 + "s";
      p.style.transform = `rotate(${Math.random() * 360}deg)`;
      box.appendChild(p);
    }
    document.body.appendChild(box);
    setTimeout(() => box.remove(), 3800);
  }

  function stop() { if (timer) { clearInterval(timer); timer = null; } }

  document.addEventListener("click", e => {
    const t = e.target.closest("[data-g-start],[data-g-pick],[data-g-next],[data-g-menu],[data-g-zoom]");
    if (!t) return;
    const d = t.dataset;
    if (d.gStart) start(d.gStart);
    else if (d.gPick !== undefined) pick(+d.gPick);
    else if (d.gNext !== undefined) next();
    else if (d.gMenu !== undefined) menu();
    else if (d.gZoom !== undefined && window.STViewer) window.STViewer(G.cur.img.map(s => "img/" + s), +d.gZoom);
  });

  window.STGame = {
    show(f) { const changed = f !== fleet; fleet = f; if (!G || changed || !$("#game").childElementCount) menu(); },
    hide() { stop(); if (G && !G.locked && G.L.time) { G = null; } },
  };
})();
