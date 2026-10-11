# Test Report — Business Idea Scorer tool (V3, approved 2026-10-10)
**Date:** 2026-10-10
**Tool:** `~/workspace/business-idea-tool/` (index.html + prompt-builder.js + scoring-math.js + deep-research.js)
**Judge for e2e:** Codex CLI via `test/run-test-v3.js`
**SPEC:** BUSINESS_IDEA_SPEC_V3 — approved by Tân 2026-10-10. 14 criteria, weights 7/12/7/5/8/8/10/7/8/8/4/5/3/8, anchors 0/25/50/75/100.

## 1. Math verification (no LLM needed)
- **Weights sum:** 100 ✓
- **All-MISSING edge case:** Score 50.0, Confidence 0.0%, bounds 0–100 ✓ (matches SPEC convention)
- **Research plan:** 10 criterion groups generated ✓
- **Prompt:** 14 criteria, Tan-rule instruction present, research evidence section present ✓

## 2. E2E discrimination + Tân-rule test

| Idea | Score | Confidence | Key rows |
|---|---|---:|---|
| GOOD — Stability Engine, **real market but ZERO traction** (research evidence: Gartner 40% cancel, $10.9B→$42B market, Braintrust $800M) | **50.0** | 8.6% | C10=50 (observed), C11=50 (observed, no penalty) |
| BAD — PetRock NFT for toddlers (0/20 parents pay, NFT −93%, COPPA blocker) | **33.8** | 15.5% | C1=25, C3=25, C4=0, C7=0, C9=25, C12=25 |

**Discrimination: PASS** — gap **16.2 points** (threshold ≥ 15).
**Tân rule: PASS** — C10 (demand reality) = 50 observed, C11 (traction) = 50 with weight 4. The good idea was NOT punished for having zero traction. Under V2, the same idea would have taken C9=25–50 at weight 12; under V3 the traction gap costs at most 4 points.

**Honest observation:** the judge (Codex) scored conservatively — C10 stayed at 50 despite real market evidence, because the evidence described the broad AI-agent market rather than SMB buyers paying for QA specifically. This is correct anchor discipline (75 requires direct spending evidence), not a tool bug. Stronger segment-specific research would move C10.

## 3. What changed V2 → V3 in the tool
- `prompt-builder.js`: 14 criteria, new anchors for C2/C3/C6/C8/C9/C10/C11/C12/C13, Tan-rule instruction, research evidence section, capital input.
- `scoring-math.js`: weights updated to V3 table (sums to 100).
- `deep-research.js` (new): per-criterion query generation, evidence schema, formatting for judge prompt.
- `index.html`: capital field, deep-research UI (generate plan → paste findings), V3 proposal badge, 14-criteria labels.
- `test/run-test-v3.js` (new): Tân-rule verification test.

## 4. Not yet done
- ✅ SPEC V3 approved by Tân 2026-10-10 — tool runs in V3 mode.
- ⚠️ Weights not simlab-recalibrated (fixture was built for 10 criteria).
- ⚠️ Browser UI flow not clicked through with a real API key.
- ⚠️ Not deployed (needs Tân's approval for GitHub push).

## 5. Files
- App: [index.html](sandbox://workspace/business-idea-tool/index.html)
- Prompt: [prompt-builder.js](sandbox://workspace/business-idea-tool/prompt-builder.js)
- Math: [scoring-math.js](sandbox://workspace/business-idea-tool/scoring-math.js)
- Research: [deep-research.js](sandbox://workspace/business-idea-tool/deep-research.js)
- Proposal: [SPEC_V3_PROPOSAL.md](sandbox://workspace/skills/business-idea-scoring/references/SPEC_V3_PROPOSAL.md)
- Tests: [test/run-test-v3.js](sandbox://workspace/business-idea-tool/test/run-test-v3.js) · raw: `test/judge-raw-good-v3.txt`, `test/judge-raw-bad-v3.txt`
