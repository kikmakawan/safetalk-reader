// Picks the active SafeTalk quarter. To add a new quarter, add its data/th/en/ans files
// (registering under a new id such as "2026Q4") and include them in index.html and sw.js.
(() => {
  const Q = window.QUARTERS || {};
  const ids = Object.keys(Q).sort();
  let id = null;
  try { id = localStorage.getItem("safetalk-quarter"); } catch {}
  if (!Q[id]) id = ids[ids.length - 1];
  window.QID = id;
  window.QIDS = ids;
  window.SAFETALK = Q[id];
  window.TH = (window.TH_Q || {})[id] || {};
  window.EN = (window.EN_Q || {})[id] || {};
  window.ANS = (window.ANS_Q || {})[id] || {};
  window.setQuarter = q => { try { localStorage.setItem("safetalk-quarter", q); } catch {} location.reload(); };
})();
