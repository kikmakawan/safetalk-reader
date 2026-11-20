// UI language: "en" (default) or "th". Use t("key", {var}) anywhere.
(() => {
  const KEY = "safetalk-lang";
  let lang = "en";
  try { lang = localStorage.getItem(KEY) || "en"; } catch {}
  const S = {
    en: {
      sub: "Safety · First Aid · Security review",
      m_read: "Read", m_cards: "Flashcards", m_game: "Games", m_pages: "Original",
      search: "Search e.g. turbulence, ELT, infant…",
      all: "✨ All", fleet: "✈️ Aircraft", fleet_all: "All",
      only_todo: "Only not memorized", shuffle: "Shuffle",
      no_match: "No questions match your search", sec_th: false,
      tab_manual: "📖 Manual", tab_th: "🇹🇭 Thai",
      ez: "💡 Simply put", tk: "🧠 Memory trick",
      got: "✓ Got it", ungot: "Undo “Got it”", page: "SafeTalk p.{p}", ccm: "📖 Cabin Crew Manual p.{p}",
      q: "Q{n}", known_tag: " · ✓ Got it", reveal: "👀 Tap to reveal the answer",
      notyet: "Not yet", gotit: "Got it", prev: "‹ Prev", next: "Next ›",
      all_done: "Great job! You've memorized every question here 🎉", none: "No questions",
      page_n: "Page {p}",
      // update
      upd_new: "New version", upd_go: "Update now", sh_cur: "Current version", sh_new: "Latest on server",
      sh_checking: "Checking…", sh_off: "Can't check (offline?)", sh_latest: " ✓ up to date", sh_whats: "What's new",
      sh_go: "⟳ Refresh to latest version", sh_loading: "Loading latest version…",
      sh_hint: "Clears the cache and reloads. Your progress and game scores are kept.", sh_close: "Close",
      toast_loaded: "Loaded version {v} ✓",
      // games
      g_pick: "Choose a game", g_pick_sub: "Every game has 3 levels · content from the Cabin Crew Manual",
      g_never: "Not played yet", g_fleet: "Aircraft", g_change: "(change in the Read tab)",
      g_other: "‹ Other games", g_quit: "‹ Quit", g_quit2: "Tap again to quit",
      lv_easy: "Easy", lv_medium: "Medium", lv_hard: "Hard",
      g_q: "Q {i}/{n}", g_pts: "pts", g_combo: "🔥 Combo x{m}",
      g_correct: "Correct!", g_pass: "Passed!", g_wrong: "Not quite", g_timeout: "⏰ Time's up!", g_order_wrong: "Wrong order",
      g_next: "Next ›", g_result: "See results", g_answer_is: "Answer: Q{no} · CCM {ref}", g_ans: "Answer: {a} · CCM {ref}",
      g_true: "True", g_false: "False", g_tf_q: "True or false?", g_mc_q: "Pick the correct answer",
      g_match_q: "Which question does this answer belong to?", g_zoom: "(tap image to zoom)",
      g_order_q: "Put the steps in order", g_part: "(part of the procedure)", g_miss: "Missed {n}×",
      g_sol: "Correct order:", g_end_great: "Awesome! Ready for take-off", g_end_pass: "Level cleared!", g_end_fail: "Out of hearts",
      g_best_new: "🏆 New high score!", g_best: "High score: {s}", g_right: "Correct", g_acc: "Accuracy", g_bstreak: "Best combo",
      g_review: "Review these", g_change_lv: "Change level", g_again: "Play again", g_other2: "Choose another game",
      g_empty: "No questions for the selected aircraft",
      // game names
      gn_match: "Answer Match", gd_match: "See an answer from the manual and pick the question it belongs to",
      gn_tf: "True or False", gd_tf: "Judge statements from the manual — fast",
      gn_order: "Step Order", gd_order: "Tap the steps in the right order: doors, ELT, fire…",
      gn_numbers: "Numbers to Know", gd_numbers: "Hours, minutes, kg, %, frequencies and acronyms",
      ld_match_easy: "3 options · no timer · 5 ❤️", ld_match_medium: "4 options · 25 s · 3 ❤️", ld_match_hard: "Same-section options · 12 s · 2 ❤️",
      ld_tf_easy: "10 items · no timer · 5 ❤️", ld_tf_medium: "15 items · 15 s · 3 ❤️", ld_tf_hard: "Includes trick items · 8 s · 2 ❤️",
      ld_order_easy: "Up to 4 steps · no timer · 2 slips/round", ld_order_medium: "Up to 6 steps · 75 s · 1 slip/round", ld_order_hard: "All steps · 50 s · no slips",
      ld_numbers_easy: "3 options · no timer · 5 ❤️", ld_numbers_medium: "4 options · 20 s · 3 ❤️", ld_numbers_hard: "4 options · 10 s · 2 ❤️",
      rounds: "{n} rounds",
      boards: "{n} boards",
      gn_memory: "Memory Pairs", gd_memory: "Flip cards and match each item with its number",
      gn_odd: "Odd One Out", gd_odd: "Spot the one that doesn't belong in the list",
      gn_sort: "Sort Rush", gd_sort: "Tap the right category as fast as you can",
      gn_marathon: "Marathon", gd_marathon: "All game types mixed — keep going until you run out of hearts",
      ld_memory_easy: "4 pairs · no timer", ld_memory_medium: "6 pairs · 70 s/board · 3 ❤️", ld_memory_hard: "8 pairs · 60 s/board · 2 ❤️",
      ld_odd_easy: "3 options · no timer · 5 ❤️", ld_odd_medium: "4 options · 20 s · 3 ❤️", ld_odd_hard: "4 options · 10 s · 2 ❤️",
      ld_sort_easy: "15 items · no timer · 5 ❤️", ld_sort_medium: "25 items · 7 s each · 3 ❤️", ld_sort_hard: "40 items · 4 s each · 3 ❤️",
      ld_marathon_easy: "Mixed · no timer · 5 ❤️", ld_marathon_medium: "Mixed · 15 s · 3 ❤️", ld_marathon_hard: "Mixed · 8 s · 1 ❤️ sudden death",
      g_mem_q: "Flip two cards — match each item with its value",
      g_odd_q: "Which one does NOT belong?",
      g_odd_ans: "Odd one: {x} (it's from “{from}”)",
    },
    th: {
      sub: "ทบทวน Safety · First Aid · Security",
      m_read: "อ่าน", m_cards: "แฟลชการ์ด", m_game: "เกม", m_pages: "หน้าต้นฉบับ",
      search: "ค้นหาไทยหรืออังกฤษ เช่น ประตู, ELT, ทารก…",
      all: "✨ ทั้งหมด", fleet: "✈️ เครื่อง", fleet_all: "ทั้งหมด",
      only_todo: "เฉพาะข้อที่ยังไม่จำ", shuffle: "สุ่มลำดับ",
      no_match: "ไม่พบคำถามที่ตรงกับการค้นหา", sec_th: true,
      tab_manual: "📖 คู่มือ (EN)", tab_th: "🇹🇭 แปลไทย",
      ez: "💡 เข้าใจง่ายๆ", tk: "🧠 ทริกจำไวๆ",
      got: "✓ จำได้แล้ว", ungot: "ยกเลิก “จำได้แล้ว”", page: "SafeTalk หน้า {p}", ccm: "📖 Cabin Crew Manual หน้า {p}",
      q: "ข้อ {n}", known_tag: " · ✓ จำได้แล้ว", reveal: "👀 แตะเพื่อดูคำตอบ",
      notyet: "ยังไม่แม่น", gotit: "จำได้แล้ว", prev: "‹ ก่อนหน้า", next: "ถัดไป ›",
      all_done: "เก่งมาก! จำได้ครบทุกข้อในหมวดนี้แล้ว 🎉", none: "ไม่พบคำถาม",
      page_n: "หน้า {p}",
      upd_new: "มีเวอร์ชันใหม่", upd_go: "อัปเดตเลย", sh_cur: "เวอร์ชันที่ใช้อยู่", sh_new: "เวอร์ชันล่าสุดบนเซิร์ฟเวอร์",
      sh_checking: "กำลังตรวจสอบ…", sh_off: "ตรวจสอบไม่ได้ (ออฟไลน์?)", sh_latest: " ✓ ล่าสุดแล้ว", sh_whats: "มีอะไรใหม่",
      sh_go: "⟳ รีเฟรชโหลดเวอร์ชันล่าสุด", sh_loading: "กำลังโหลดเวอร์ชันล่าสุด…",
      sh_hint: "ล้างแคชในเครื่องแล้วโหลดใหม่ทั้งหมด ความคืบหน้าและสถิติเกมยังอยู่ครบ", sh_close: "ปิด",
      toast_loaded: "โหลดเวอร์ชัน {v} แล้ว ✓",
      g_pick: "เลือกเกม", g_pick_sub: "ทุกเกมมี 3 ระดับ เนื้อหามาจาก Cabin Crew Manual",
      g_never: "ยังไม่เคยเล่น", g_fleet: "เครื่องบิน", g_change: "(เปลี่ยนได้ที่แท็บอ่าน)",
      g_other: "‹ เลือกเกมอื่น", g_quit: "‹ ออก", g_quit2: "แตะอีกครั้งเพื่อออก",
      lv_easy: "ง่าย", lv_medium: "กลาง", lv_hard: "ยาก",
      g_q: "ข้อ {i}/{n}", g_pts: "แต้ม", g_combo: "🔥 คอมโบ x{m}",
      g_correct: "ถูกต้อง!", g_pass: "ผ่าน!", g_wrong: "ยังไม่ใช่", g_timeout: "⏰ หมดเวลา!", g_order_wrong: "ลำดับยังไม่ถูก",
      g_next: "ข้อต่อไป ›", g_result: "ดูผลคะแนน", g_answer_is: "คำตอบคือข้อ {no} · CCM {ref}", g_ans: "คำตอบ: {a} · CCM {ref}",
      g_true: "ถูก", g_false: "ผิด", g_tf_q: "ข้อความนี้ถูกหรือผิด?", g_mc_q: "เลือกคำตอบที่ถูกต้อง",
      g_match_q: "คำตอบนี้มาจากคำถามข้อไหน?", g_zoom: "(แตะภาพเพื่อซูม)",
      g_order_q: "เรียงลำดับให้ถูก", g_part: "(ช่วงหนึ่งของขั้นตอน)", g_miss: "พลาด {n} ครั้ง",
      g_sol: "ลำดับที่ถูก:", g_end_great: "สุดยอด! พร้อมขึ้นบิน", g_end_pass: "ผ่านด่านแล้ว!", g_end_fail: "หัวใจหมดแล้ว",
      g_best_new: "🏆 สถิติใหม่!", g_best: "สถิติสูงสุด: {s}", g_right: "ตอบถูก", g_acc: "ความแม่น", g_bstreak: "คอมโบสูงสุด",
      g_review: "ข้อที่ควรทบทวน", g_change_lv: "เปลี่ยนระดับ", g_again: "เล่นอีกครั้ง", g_other2: "เลือกเกมอื่น",
      g_empty: "ไม่มีข้อสำหรับเครื่องที่เลือก",
      gn_match: "ทายภาพคำตอบ", gd_match: "ดูภาพคำตอบจากคู่มือ แล้วเลือกว่าเป็นของคำถามข้อไหน",
      gn_tf: "ถูกหรือผิด", gd_tf: "อ่านข้อความจากคู่มือ ตัดสินให้ไวว่าถูกหรือผิด",
      gn_order: "เรียงขั้นตอน", gd_order: "แตะขั้นตอนให้ถูกลำดับตามคู่มือ เช่น เปิดประตู ELT ดับไฟ",
      gn_numbers: "ตัวเลขต้องจำ", gd_numbers: "ชั่วโมง นาที กิโล เปอร์เซ็นต์ ความถี่ และตัวย่อที่ต้องจำ",
      ld_match_easy: "3 ตัวเลือก · ไม่จับเวลา · 5 ❤️", ld_match_medium: "4 ตัวเลือก · 25 วิ · 3 ❤️", ld_match_hard: "ตัวเลือกหมวดเดียวกัน · 12 วิ · 2 ❤️",
      ld_tf_easy: "10 ข้อ · ไม่จับเวลา · 5 ❤️", ld_tf_medium: "15 ข้อ · 15 วิ · 3 ❤️", ld_tf_hard: "รวมข้อหลอก · 8 วิ · 2 ❤️",
      ld_order_easy: "สูงสุด 4 ขั้น · ไม่จับเวลา · พลาดได้ 2 ครั้ง/ข้อ", ld_order_medium: "สูงสุด 6 ขั้น · 75 วิ · พลาดได้ 1 ครั้ง/ข้อ", ld_order_hard: "ครบทุกขั้น · 50 วิ · ห้ามพลาด",
      ld_numbers_easy: "3 ตัวเลือก · ไม่จับเวลา · 5 ❤️", ld_numbers_medium: "4 ตัวเลือก · 20 วิ · 3 ❤️", ld_numbers_hard: "4 ตัวเลือก · 10 วิ · 2 ❤️",
      rounds: "{n} ข้อ",
      boards: "{n} กระดาน",
      gn_memory: "จับคู่การ์ด", gd_memory: "เปิดการ์ดจับคู่หัวข้อกับตัวเลขที่ต้องจำ",
      gn_odd: "ตัวไหนไม่ใช่", gd_odd: "หาข้อที่ไม่เข้าพวกในรายการ",
      gn_sort: "แยกหมวดไว", gd_sort: "แตะเลือกหมวดให้ถูกและไวที่สุด",
      gn_marathon: "มาราธอน", gd_marathon: "รวมทุกเกม เล่นต่อเนื่องจนกว่าหัวใจจะหมด",
      ld_memory_easy: "4 คู่ · ไม่จับเวลา", ld_memory_medium: "6 คู่ · 70 วิ/กระดาน · 3 ❤️", ld_memory_hard: "8 คู่ · 60 วิ/กระดาน · 2 ❤️",
      ld_odd_easy: "3 ตัวเลือก · ไม่จับเวลา · 5 ❤️", ld_odd_medium: "4 ตัวเลือก · 20 วิ · 3 ❤️", ld_odd_hard: "4 ตัวเลือก · 10 วิ · 2 ❤️",
      ld_sort_easy: "15 ข้อ · ไม่จับเวลา · 5 ❤️", ld_sort_medium: "25 ข้อ · ข้อละ 7 วิ · 3 ❤️", ld_sort_hard: "40 ข้อ · ข้อละ 4 วิ · 3 ❤️",
      ld_marathon_easy: "รวมทุกเกม · ไม่จับเวลา · 5 ❤️", ld_marathon_medium: "รวมทุกเกม · 15 วิ · 3 ❤️", ld_marathon_hard: "รวมทุกเกม · 8 วิ · 1 ❤️ พลาดคือจบ",
      g_mem_q: "เปิดการ์ดทีละ 2 ใบ จับคู่หัวข้อกับค่าที่ถูกต้อง",
      g_odd_q: "ข้อไหนไม่เข้าพวก?",
      g_odd_ans: "ตัวที่ไม่ใช่: {x} (มาจาก “{from}”)",
    },
  };
  window.t = (k, v) => {
    let s = (S[lang] && S[lang][k]) ?? S.en[k] ?? k;
    if (v && typeof s === "string") for (const x in v) s = s.split("{" + x + "}").join(v[x]);
    return s;
  };
  window.LANG = () => lang;
  window.applyI18n = () => {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach(el => (el.textContent = t(el.dataset.i18n)));
    document.querySelectorAll("[data-i18n-ph]").forEach(el => (el.placeholder = t(el.dataset.i18nPh)));
    document.querySelectorAll("[data-lang]").forEach(b => b.classList.toggle("on", b.dataset.lang === lang));
  };
  window.setLang = l => {
    lang = l; try { localStorage.setItem(KEY, l); } catch {}
    applyI18n();
    document.dispatchEvent(new CustomEvent("langchange"));
  };
})();
