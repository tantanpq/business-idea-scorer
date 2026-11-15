#!/usr/bin/env node
// Owner decision (2026-11-14): planned channel tests cannot earn C14 > 50.
// Run: node --test test/test-c14-strict.js
const assert = require("node:assert/strict");
const { test } = require("node:test");
const PB = require("../prompt-builder.js");

const c14 = PB.CRITERIA.find(c => c.id === "C14");

test("C14 ownership requires actual separate channel tests for 75 or 100", () => {
  assert.match(c14.ownership, /Scores of 75 or 100 require real, separate channel tests/);
  assert.match(c14.ownership, /actual evidence from tests run on each channel/);
});

test("C14 caps a testable hypothesis at 50 and keeps it in Tracked Bets", () => {
  assert.match(c14.ownership, /testable hypothesis alone.*capped at 50/);
  assert.match(c14.ownership, /Tracked Bets/);
  assert.match(c14.anchors[50], /testable hypothesis alone is capped at 50/);
});

test("C14 anchor 50 keeps the evidenced-funnel case and states the hypothesis cap as an alternative", () => {
  assert.match(c14.anchors[50], /^A specific channel and buying process are evidenced, with an initial funnel but uncertain repeatability\. Alternatively, /);
});

test("C14 anchor 100 also requires the per-channel test evidence", () => {
  assert.match(c14.anchors[100], /^Meets the 75 evidence requirement \(actual evidence from tests run on each channel\)/);
  assert.match(c14.anchors[100], /reproducible across relevant cohorts.*resilience to concentration or access changes/);
});

test("C14 anchor 75 requires executed tests with results for each channel", () => {
  assert.match(c14.anchors[75], /Real, separate channel tests/);
  assert.match(c14.anchors[75], /actual evidence from tests run on each channel/);
  assert.match(c14.anchors[75], /reproducible process.*conversion stages.*sales-cycle constraints/);
});

for (const researchEvidence of [undefined, "External acquisition-channel benchmarks."]) {
  test(`generated prompt preserves the strict C14 rule ${researchEvidence ? "with" : "without"} research`, () => {
    const prompt = PB.buildPrompt({ researchEvidence });
    assert.ok(prompt.includes(`Ownership: ${c14.ownership}`));
    assert.ok(prompt.includes(`50: ${c14.anchors[50]}`));
    assert.ok(prompt.includes(`75: ${c14.anchors[75]}`));
    assert.match(prompt, /Scores of 75 or 100 require real, separate channel tests/);
    assert.match(prompt, /testable hypothesis alone.*capped at 50/);
    assert.doesNotMatch(prompt, /may anchor 75 instead of defaulting to 50|50-and-forget is not permitted/);
    assert.match(prompt, /An OPEN bet adds ZERO points/);
    assert.match(prompt, /If a criterion has NO usable evidence, score it 50, set status to "MISSING"/);
  });
}
