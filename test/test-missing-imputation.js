#!/usr/bin/env node
/* Regression test — SPEC V4 missing-data rule (deterministic, no LLM).
 * A criterion the judge omits entirely, or flags MISSING, must be imputed at 50
 * with its full weight retained — never dropped from the denominator.
 * Guards the bug found 2026-10-30: omitted criteria vanished from the rows, so
 * an all-missing run scored 0.0, and a dropped F3 lost its weighted contribution.
 * Run: node test/test-missing-imputation.js   (exit 0 = all pass)
 */
const assert = require("node:assert");
const BM = require("../scoring-math.js");

const ALL = BM.ORDER;
function crit(id, score, status, q = 0.8, a = 0.9) {
  return { id, score, status: status || "observed", evidence: "ev", rationale: "why", q, a };
}

let passed = 0;
function check(name, fn) { fn(); passed++; console.log("PASS", name); }

// 1. Judge omits F3 entirely; the other 14 are observed at 75.
check("omitted F3 is imputed at 50 with full weight", () => {
  const llm = { criteria: ALL.filter(id => id !== "F3").map(id => crit(id, 75)) };
  const r = BM.computeResults(llm);
  const f3 = r.rows.find(x => x.id === "F3");
  assert.ok(f3, "F3 row must exist");
  assert.strictEqual(f3.status, "MISSING");
  assert.strictEqual(f3.score, 50);
  assert.strictEqual(f3.contribution, 3.0);
  assert.strictEqual(r.wMissing, 6);
  assert.strictEqual(r.score, 73.5); // (75*94 + 50*6)/100
  assert.ok(r.errors.some(e => e.includes("F3")), "imputation must be surfaced in errors/notes");
});

// 2. Judge returns NO criteria at all — the old code scored this 0.0.
check("empty judge output scores 50.0, never 0", () => {
  const r = BM.computeResults({ criteria: [] });
  assert.strictEqual(r.rows.length, 15);
  assert.ok(r.rows.every(x => x.status === "MISSING" && x.score === 50));
  assert.strictEqual(r.score, 50.0);
  assert.strictEqual(r.coverage, 0);
  assert.strictEqual(r.wMissing, 100);
});

// 3. Criteria flagged MISSING are imputed at 50 even if a score rides along.
check("MISSING flag forces 50 regardless of supplied score", () => {
  const llm = { criteria: ALL.map(id => crit(id, 0, "missing")) };
  const r = BM.computeResults(llm);
  assert.ok(r.rows.every(x => x.score === 50 && x.status === "MISSING"));
  assert.strictEqual(r.score, 50.0);
  assert.strictEqual(r.coverage, 0);
});

// 4. Mixed: C2 observed at 100, F3 omitted, the rest flagged missing.
check("mixed observed + omitted + missing", () => {
  const llm = { criteria: ALL.filter(id => id !== "F3").map(id =>
    id === "C2" ? crit(id, 100) : crit(id, 25, "missing")) };
  const r = BM.computeResults(llm);
  assert.strictEqual(r.score, 56.0); // (12*100 + 88*50)/100
  assert.strictEqual(r.coverage, 12);
});

// 5. Sanity: fully observed input is unchanged by the fix.
check("fully observed at 50 scores 50 with full coverage", () => {
  const r = BM.computeResults({ criteria: ALL.map(id => crit(id, 50)) });
  assert.strictEqual(r.score, 50.0);
  assert.strictEqual(r.coverage, 100);
  assert.strictEqual(r.errors.length, 0);
});

console.log(`\n${passed}/5 missing-data regression checks PASS`);
