(() => {
  const D = window.SAFETALK;
  const $ = (s, el = document) => el.querySelector(s);
  const KEY = "safetalk-q3-2026";
  const store = (() => {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
  })();
  const S = {
    mode: store.mode || "read",
    sec: store.sec || "all",
    fleet: store.fleet || "all",
    known: new Set(store.known || []),
    q: "",
    open: new Set(),
    order: null,
    idx: 0,
    revealed: false,
    onlyTodo: !!store.onlyTodo,
    atab: store.atab || "th",
  };
  const save = () => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ mode: S.mode, sec: S.sec, fleet: S.fleet, known: [...S.known], onlyTodo: S.onlyTodo, atab: S.atab }));
    } catch {}
  };
  const secOf = id => D.sections.find(s => s.id === id);
  const esc = s => s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const fleetName = f => (f === "A" ? "Airbus" : "Boeing");

  // ---------- filtering ----------
  function visible() {
    const q = S.q.trim().toLowerCase();
    return D.items.filter(it =>
      (S.sec === "all" || it.sec === S.sec) &&
      (S.fleet === "all" || !it.fleet || it.fleet === S.fleet) &&
      (!q || hay(it).includes(q))
    );
  }

  const TH = window.TH || {};
  const hay = it => { const t = TH[it.id] || {}; return [it.q, it.note, secOf(it.sec).name, secOf(it.sec).th, t.q, (t.a || []).join(" "), t.ez, t.tk].join(" ").toLowerCase(); };
  const SEC_ICON = { safety: "🛟", firstaid: "🩹", security: "🛡️" };

  // ---------- progress ring ----------
  function ring() {
    const pool = D.items.filter(it => S.fleet === "all" || !it.fleet || it.fleet === S.fleet);
    const k = pool.filter(it => S.known.has(it.id)).length;
    $("#ringTxt").textContent = `${k}/${pool.length}`;
    $("#ringFg").style.strokeDashoffset = 97.4 * (1 - k / pool.length);
  }

  // ---------- chips ----------
  function chips() {
    const counts = id => D.items.filter(it => (id === "all" || it.sec === id) && (S.fleet === "all" || !it.fleet || it.fleet === S.fleet)).length;
    const list = [{ id: "all", th: "ทั้งหมด" }, ...D.sections];
    $("#secChips").innerHTML = list.map(s =>
      `<button data-sec="${s.id}" class="${S.sec === s.id ? "on" : ""}">${s.id === "all" ? "✨ ทั้งหมด" : SEC_ICON[s.id] + " " + s.name}<small>${counts(s.id)}</small></button>`
    ).join("");
    document.querySelectorAll("#fleetChips button").forEach(b => b.classList.toggle("on", b.dataset.fleet === S.fleet));
  }

  function thList(lines) {
    let h = "", open = false;
    for (const l of lines) {
      if (l.startsWith("# ")) { if (open) { h += "</ul>"; open = false; } h += `<h4>${esc(l.slice(2))}</h4>`; }
      else { if (!open) { h += "<ul>"; open = true; } h += `<li>${esc(l)}</li>`; }
    }
    return h + (open ? "</ul>" : "");
  }
  function answerHTML(it) {
    const t = TH[it.id], tab = t ? S.atab : "img";
    const imgs = it.img.map((src, i) => `<img loading="lazy" src="img/${src}" data-id="${it.id}" data-i="${i}" alt="คำตอบข้อ ${it.no}">`).join("") +
      (it.note ? `<div class="note">${esc(it.note)}</div>` : "") + `<div class="src">📖 Cabin Crew Manual หน้า ${it.ref}</div>`;
    if (!t) return imgs;
    return `<div class="atabs">
        <button data-atab="th" class="${tab === "th" ? "on" : ""}">🇹🇭 แปลไทย</button>
        <button data-atab="img" class="${tab === "img" ? "on" : ""}">📖 คู่มือ (EN)</button>
      </div>
      <div class="apane" data-pane="th" ${tab === "th" ? "" : "hidden"}>${thList(t.a)}</div>
      <div class="apane" data-pane="img" ${tab === "img" ? "" : "hidden"}>${imgs}</div>
      ${t.ez ? `<div class="sticky ez"><b>💡 เข้าใจง่ายๆ</b>${esc(t.ez)}</div>` : ""}
      ${t.tk ? `<div class="sticky tk"><b>🧠 ทริกจำไวๆ</b>${esc(t.tk)}</div>` : ""}`;
  }

  const headHTML = it => {
    const t = TH[it.id], b = it.fleet ? `<span class="badge ${it.fleet}">${fleetName(it.fleet)}</span>` : "";
    return t ? `<span class="q-th">${b}${esc(t.q)}</span><span class="q-en">${esc(it.q)}</span>` : `<span class="q-th">${b}${esc(it.q)}</span>`;
  };

  // ---------- read mode ----------
  function renderRead() {
    const items = visible();
    if (!items.length) { $("#read").innerHTML = `<p class="empty">ไม่พบคำถามที่ตรงกับการค้นหา</p>`; return; }
    let html = "", cur = null;
    for (const it of items) {
      if (it.sec !== cur) {
        cur = it.sec;
        const s = secOf(cur);
        html += `<div class="sechead" data-sec="${cur}"><span class="s-ico">${SEC_ICON[cur]}</span><div><h2>${s.th}</h2><span>${s.name}</span></div></div>`;
      }
      const open = S.open.has(it.id);
      html += `<article class="item ${S.known.has(it.id) ? "known" : ""} ${open ? "open" : ""}" data-sec="${it.sec}" data-id="${it.id}">
        <button class="qrow" data-toggle="${it.id}" aria-expanded="${open}">
          <span class="num">${S.known.has(it.id) ? "✓" : it.no}</span><span class="qtxt">${headHTML(it)}</span><span class="chev">▾</span>
        </button>
        ${open ? `<div class="ans">${answerHTML(it)}
          <div class="actions">
            <button class="btn ${S.known.has(it.id) ? "" : "ok"}" data-known="${it.id}">${S.known.has(it.id) ? "ยกเลิก “จำได้แล้ว”" : "✓ จำได้แล้ว"}</button>
            <span class="meta">SafeTalk หน้า ${it.page}</span>
          </div></div>` : ""}
      </article>`;
    }
    $("#read").innerHTML = html;
  }

  // ---------- flashcards ----------
  function deck() {
    let items = visible();
    if (S.onlyTodo) items = items.filter(it => !S.known.has(it.id));
    if (S.order) {
      const pos = new Map(S.order.map((id, i) => [id, i]));
      items = items.slice().sort((a, b) => (pos.get(a.id) ?? 1e9) - (pos.get(b.id) ?? 1e9));
    }
    return items;
  }
  function renderCards() {
    $("#onlyTodo").checked = S.onlyTodo;
    const items = deck();
    if (!items.length) {
      $("#card").innerHTML = `<p class="empty">${S.onlyTodo ? "เก่งมาก! จำได้ครบทุกข้อในหมวดนี้แล้ว 🎉" : "ไม่พบคำถาม"}</p>`;
      return;
    }
    if (S.idx >= items.length) S.idx = 0;
    if (S.idx < 0) S.idx = items.length - 1;
    const it = items[S.idx], s = secOf(it.sec);
    $("#card").innerHTML = `<div class="flash" data-sec="${it.sec}">
      <div class="tag">${SEC_ICON[it.sec]} ${s.th} · ข้อ ${it.no}${S.known.has(it.id) ? " · ✓ จำได้แล้ว" : ""}</div>
      <h3>${headHTML(it)}</h3>
      ${S.revealed ? `<div class="ans">${answerHTML(it)}</div>
        <div class="cardnav">
          <button class="btn" data-grade="0">ยังไม่แม่น</button>
          <button class="btn ok" data-grade="1">จำได้แล้ว</button>
        </div>` : `<button class="reveal" id="reveal">👀 แตะเพื่อดูคำตอบ</button>`}
      </div>
      <div class="cardnav">
        <button class="btn ghost" data-step="-1">‹ ก่อนหน้า</button>
        <button class="btn ghost" data-step="1">ถัดไป ›</button>
      </div>
      <div class="counter">${S.idx + 1} / ${items.length}</div>`;
  }

  // ---------- pages ----------
  function renderPages() {
    if ($("#pages").childElementCount) return;
    let h = "";
    for (let p = 1; p <= D.pages; p++)
      h += `<div class="ptitle">หน้า ${p}</div><img loading="lazy" src="pages/page-${p}.jpg" data-page="${p}" alt="SafeTalk หน้า ${p}">`;
    $("#pages").innerHTML = h;
  }

  function render() {
    document.querySelectorAll(".modes button").forEach(b => b.classList.toggle("on", b.dataset.mode === S.mode));
    $("#filters").hidden = S.mode === "pages" || S.mode === "game";
    $("#game").hidden = S.mode !== "game";
    $("#read").hidden = S.mode !== "read";
    $("#cards").hidden = S.mode !== "cards";
    $("#pages").hidden = S.mode !== "pages";
    chips(); ring();
    if (S.mode === "read") renderRead();
    else if (S.mode === "cards") renderCards();
    else if (S.mode === "game") window.STGame.show(S.fleet);
    else renderPages();
    if (S.mode !== "game") window.STGame.hide();
  }

  // ---------- viewer ----------
  const V = { list: [], i: 0, z: 1 };
  function openViewer(list, i) {
    V.list = list; V.i = i; V.z = 1;
    $("#viewer").hidden = false;
    document.body.style.overflow = "hidden";
    showV();
  }
  function showV() {
    const img = $("#vImg");
    img.onload = fitV;
    img.src = V.list[V.i];
    $("#vCount").textContent = V.list.length > 1 ? `${V.i + 1}/${V.list.length}` : "";
    $("#vPrev").hidden = $("#vNext").hidden = V.list.length < 2;
    if (img.complete) fitV();
  }
  function fitV() {
    const img = $("#vImg"), box = $("#vScroll");
    if (!img.naturalWidth) return;
    const base = Math.min(box.clientWidth / img.naturalWidth, box.clientHeight / img.naturalHeight);
    img.style.width = img.naturalWidth * base * V.z + "px";
  }
  window.STViewer = openViewer;
  function closeV() { $("#viewer").hidden = true; document.body.style.overflow = ""; }
  $("#vIn").onclick = () => { V.z = Math.min(V.z * 1.5, 6); fitV(); };
  $("#vOut").onclick = () => { V.z = Math.max(V.z / 1.5, 1); fitV(); };
  $("#vClose").onclick = closeV;
  $("#vPrev").onclick = () => { V.i = (V.i - 1 + V.list.length) % V.list.length; V.z = 1; showV(); };
  $("#vNext").onclick = () => { V.i = (V.i + 1) % V.list.length; V.z = 1; showV(); };
  $("#vImg").ondblclick = () => { V.z = V.z > 1 ? 1 : 2.5; fitV(); };
  addEventListener("resize", () => !$("#viewer").hidden && fitV());
  addEventListener("keydown", e => {
    if ($("#viewer").hidden) return;
    if (e.key === "Escape") closeV();
    if (e.key === "ArrowRight") $("#vNext").click();
    if (e.key === "ArrowLeft") $("#vPrev").click();
  });

  // ---------- events ----------
  document.addEventListener("click", e => {
    const t = e.target.closest("button, img");
    if (!t) return;
    const d = t.dataset;
    if (d.mode) { S.mode = d.mode; save(); render(); scrollTo(0, 0); return; }
    if (d.sec) { S.sec = d.sec; S.idx = 0; S.revealed = false; save(); render(); return; }
    if (d.fleet) { S.fleet = d.fleet; S.idx = 0; S.revealed = false; save(); render(); return; }
    if (d.atab) {
      S.atab = d.atab; save();
      const box = t.closest(".ans") || t.closest(".flash");
      box.querySelectorAll("[data-atab]").forEach(b => b.classList.toggle("on", b.dataset.atab === d.atab));
      box.querySelectorAll("[data-pane]").forEach(p => (p.hidden = p.dataset.pane !== d.atab));
      return;
    }
    if (d.toggle) { S.open.has(d.toggle) ? S.open.delete(d.toggle) : S.open.add(d.toggle); renderRead(); return; }
    if (d.known) {
      S.known.has(d.known) ? S.known.delete(d.known) : S.known.add(d.known);
      if (S.known.has(d.known)) S.open.delete(d.known);
      save(); ring(); renderRead(); return;
    }
    if (t.id === "reveal") { S.revealed = true; renderCards(); return; }
    if (d.grade) {
      const it = deck()[S.idx];
      if (d.grade === "1") S.known.add(it.id); else S.known.delete(it.id);
      save(); ring();
      S.revealed = false;
      if (!(S.onlyTodo && d.grade === "1")) S.idx++;
      renderCards(); return;
    }
    if (d.step) { S.idx += +d.step; S.revealed = false; renderCards(); return; }
    if (t.id === "shuffle") {
      S.order = D.items.map(it => it.id).sort(() => Math.random() - 0.5);
      S.idx = 0; S.revealed = false; renderCards(); return;
    }
    if (t.tagName === "IMG" && d.id) {
      const it = D.items.find(x => x.id === d.id);
      openViewer(it.img.map(s => "img/" + s), +d.i); return;
    }
    if (t.tagName === "IMG" && d.page) {
      openViewer(Array.from({ length: D.pages }, (_, i) => `pages/page-${i + 1}.jpg`), +d.page - 1); return;
    }
  });
  $("#onlyTodo").onchange = e => { S.onlyTodo = e.target.checked; S.idx = 0; S.revealed = false; save(); renderCards(); };
  $("#q").addEventListener("input", e => { S.q = e.target.value; S.idx = 0; S.revealed = false; S.mode === "cards" ? renderCards() : renderRead(); });

  render();

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
})();
