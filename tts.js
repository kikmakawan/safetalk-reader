// Read aloud (speechSynthesis), voice input (SpeechRecognition) and keyword matching for typed answers.
(() => {
  const synth = window.speechSynthesis;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  let voices = [];
  const loadVoices = () => { voices = synth ? synth.getVoices() : []; };
  if (synth) { loadVoices(); synth.onvoiceschanged = loadVoices; }
  const pickVoice = lang => voices.find(v => v.lang && v.lang.toLowerCase().replace("_", "-").startsWith(lang)) || null;

  let speakingBtn = null;
  function stop() {
    if (synth) synth.cancel();
    if (speakingBtn) { speakingBtn.classList.remove("on"); speakingBtn = null; }
  }
  // parts: array of strings; lang "en" | "th"
  function speak(parts, lang, btn) {
    if (!synth) return false;
    if (btn && speakingBtn === btn) { stop(); return true; }
    stop();
    const code = lang === "th" ? "th-TH" : "en-US", v = pickVoice(lang === "th" ? "th" : "en");
    const list = parts.map(p => String(p).replace(/[“”"]/g, "").trim()).filter(Boolean);
    list.forEach((p, i) => {
      const u = new SpeechSynthesisUtterance(p);
      u.lang = code; if (v) u.voice = v; u.rate = lang === "th" ? 1 : 0.95;
      if (i === list.length - 1) u.onend = u.onerror = () => { if (speakingBtn === btn) stop(); };
      synth.speak(u);
    });
    if (btn) { btn.classList.add("on"); speakingBtn = btn; }
    window.STATS && STATS.flag("listen");
    return true;
  }

  // voice input
  let rec = null;
  function listen(lang, onText, onState) {
    if (!SR) return false;
    if (rec) { rec.stop(); return true; }
    rec = new SR();
    rec.lang = lang === "th" ? "th-TH" : "en-US";
    rec.interimResults = true; rec.continuous = true;
    let finalText = "";
    rec.onresult = e => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalText += r[0].transcript + " "; else interim += r[0].transcript;
      }
      onText((finalText + interim).trim());
    };
    rec.onend = rec.onerror = () => { rec = null; onState(false); };
    rec.start(); onState(true);
    window.STATS && STATS.flag("talk");
    return true;
  }

  // keyword matching
  const STOP = new Set(("the and for are with from that this then than into when what which will shall should must have has been being their there they them your you our not only also each other such any all may can its it's out off per via under over upon about after before while where both more most some very just like used use using within without onto take give make made does done case cabin crew passenger passengers aircraft").split(" "));
  const seg = (() => { try { return new Intl.Segmenter("th", { granularity: "word" }); } catch { return null; } })();
  function words(text) {
    const out = [];
    const lower = String(text).toLowerCase();
    if (seg) {
      for (const s of seg.segment(lower)) if (s.isWordLike) out.push(s.segment);
    } else out.push(...lower.split(/[^a-z0-9฀-๿]+/));
    return out.filter(w => (/[฀-๿]/.test(w) ? w.length >= 2 : w.length >= 4) && !STOP.has(w));
  }
  const stem = w => w.replace(/(ing|ed|es|s)$/, "");
  function match(answer, reference) {
    const ref = [...new Set(words(reference).map(stem))];
    const mine = new Set(words(answer).map(stem));
    const hit = ref.filter(w => mine.has(w));
    const need = Math.max(Math.min(ref.length, 6), Math.min(20, Math.round(ref.length * 0.45)));
    return { hit, total: ref.length, need, pct: need ? Math.min(100, Math.round(hit.length / need * 100)) : 0 };
  }
  function highlight(text, hits) {
    const set = new Set(hits);
    const esc = s => s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    if (!seg) return esc(text);
    let h = "";
    for (const s of seg.segment(text)) h += s.isWordLike && set.has(stem(s.segment.toLowerCase())) ? `<mark>${esc(s.segment)}</mark>` : esc(s.segment);
    return h;
  }

  window.TTS = { ok: !!synth, speak, stop, srOk: !!SR, listen, match, highlight };
})();
