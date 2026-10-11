/* Business Idea Scoring — math (SPEC V3, approved by Tân 2026-10-10; weights provisional, not simlab-calibrated)
 * Score = Σ(w_i × s_i)/100. Confidence = Coverage × Quality × Applicability.
 * Shared by: index.html (browser) and test/run-test.js (node).
 */
(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) module.exports = factory();
  else root.BizIdeaMath = factory();
})(typeof self !== "undefined" ? self : this, function () {

const WEIGHTS = { C1: 7, C2: 12, C3: 7, C4: 5, C5: 8, C6: 8, C7: 10, C8: 7, C9: 8, C10: 8, C11: 4, C12: 5, C13: 3, C14: 8 };
const ORDER = ["C1","C2","C3","C4","C5","C6","C7","C8","C9","C10","C11","C12","C13","C14"];
const VALID_SCORES = [0, 25, 50, 75, 100];

function computeResults(llm) {
  const rows = [];
  const errors = [];
  for (const id of ORDER) {
    const c = (llm.criteria || []).find(x => x.id === id);
    if (!c) { errors.push(`missing criterion ${id} in LLM output`); continue; }
    let score = Number(c.score);
    if (!VALID_SCORES.includes(score)) {
      errors.push(`${id}: score ${c.score} not a valid anchor — coerced to nearest`);
      score = VALID_SCORES.reduce((a, b) => Math.abs(b - score) < Math.abs(a - score) ? b : a);
    }
    const observed = String(c.status || "").toLowerCase() !== "missing";
    const w = WEIGHTS[id];
    const q = observed ? clamp01(Number(c.q)) : 0;
    const a = observed ? clamp01(Number(c.a)) : 0;
    rows.push({
      id, weight: w, score,
      contribution: w * score / 100,
      status: observed ? "observed" : "MISSING",
      evidence: c.evidence || "",
      rationale: c.rationale || "",
      q: observed ? q : null,
      a: observed ? a : null
    });
  }

  const W_observed = rows.reduce((s, r) => s + (r.status === "observed" ? r.weight : 0), 0);
  const score = rows.reduce((s, r) => s + r.contribution, 0);
  const coverage = W_observed / 100;
  let quality = 0, applicability = 0;
  if (W_observed > 0) {
    quality = rows.reduce((s, r) => s + (r.status === "observed" ? r.weight * r.q : 0), 0) / W_observed;
    applicability = rows.reduce((s, r) => s + (r.status === "observed" ? r.weight * r.a : 0), 0) / W_observed;
  }
  const confidence = coverage * quality * applicability;
  const W_missing = 100 - W_observed;
  const lower = score - 0.5 * W_missing;
  const upper = score + 0.5 * W_missing;

  const observedRows = rows.filter(r => r.status === "observed");
  const sorted = [...rows].sort((a, b) => b.score - a.score || b.weight - a.weight);

  return {
    score: round1(score),
    coverage: pct(coverage),
    quality: pct(quality),
    applicability: pct(applicability),
    confidence: pct(confidence),
    bounds: { lower: round1(Math.max(0, lower)), upper: round1(Math.min(100, upper)) },
    wObserved: W_observed,
    wMissing: W_missing,
    rows,
    strongest: sorted.slice(0, 3).map(r => r.id),
    weakest: sorted.slice(-3).reverse().map(r => r.id),
    blockers: llm.blockers || [],
    strengths: llm.strengths || [],
    weaknesses: llm.weaknesses || [],
    validationPriorities: llm.validation_priorities || [],
    errors
  };
}

function clamp01(x) {
  if (isNaN(x)) return 0;
  return Math.min(1, Math.max(0, x));
}
function round1(x) { return Math.round(x * 10) / 10; }
function pct(x) { return round1(x * 100); }

return { WEIGHTS, ORDER, computeResults };
});
