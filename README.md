# Business Idea Scorer

Evidence-based 0–100 business idea assessment for end users.
Implements **BUSINESS_IDEA_SPEC_V4** (approved by Tán 2026-10-10, revised after simlab; F3 weight provisional and explicitly uncalibrated; thresholds provisional).

## How it works

1. User fills in the idea form (idea, customer, problem, solution, geography, business model, stage, horizon, objective, founder background, evidence).
2. The app builds a structured evaluation prompt (see `prompt-builder.js` — the 15 criteria (C1–C14 + F3) with V4 anchors baked in).
3. The prompt is sent to an **OpenAI-compatible chat completions API** using the user's own API key (stored only in the browser's localStorage; never sent anywhere else).
4. The AI judge returns strict JSON: 15 criterion scores (0/25/50/75/100) + status + evidence + q/a + blockers + validation priorities.
5. `scoring-math.js` computes Score, Coverage, Quality, Applicability, Confidence, and missing-data bounds — exactly per SPEC V4 §5–§6.

## Files

| File | Role |
|---|---|
| `index.html` | The web app (form → API call → results). No build step. |
| `prompt-builder.js` | SPEC V4 criteria/anchors + prompt construction. Shared by browser and tests. |
| `scoring-math.js` | Score/Confidence math (V4 weights sum to 100). Shared by browser and tests. Deterministic math + missing-data regression tests: `test/test-missing-imputation.js`. |
| `vercel.json` | Static deploy config. |
| `test/run-test.js` | E2E test: 2 sample ideas through Codex CLI as judge. |

## Deploy (Vercel)

Option A — static site: push this folder to a repo, import in Vercel as a static site (no build command, output = `.`).
Option B — quick: `npx vercel` inside this folder.

The app is a single static page; the only runtime dependency is the user's own LLM API endpoint.

## Use

1. Open the app, expand "AI judge settings", enter your API base URL + key + model (any OpenAI-compatible endpoint: OpenAI, Groq, OpenRouter, local Ollama…).
2. Fill in the idea form — the more concrete evidence you supply, the higher the Confidence.
3. Click **Score this idea**. Results: total /100, Confidence %, 15-criterion table, strongest/weakest, critical blockers, 3 validation priorities, and a copyable calibration record.

## Honesty rules (from the skill, enforced in UI)

- The score is decision support, **not** a probability of success, investment recommendation, or valuation.
- Criteria with no evidence are imputed at **50** and marked **MISSING** — neutral, not proof of average quality.
- Confidence is separate from Score; never multiply them.
- Weights/anchors are fixed V4 (F3 provisional and uncalibrated). Any revision needs founder approval and a new SPEC version.

## Test

`node test/run-test.js` — runs 2 sample ideas (1 strong, 1 weak) through Codex CLI as the judge and checks score discrimination (gap ≥ 15). See `TEST_REPORT.md`.
`node test/test-missing-imputation.js` — deterministic regression test for the SPEC V4 missing-data rule (judge-omitted or MISSING-flagged criteria are imputed at 50, never dropped from the denominator).

## Support

This project is built and maintained independently, in the open. If it saves you time, you can support its development with a voluntary donation:

**[Support PAI / Zline via Stripe](https://donate.stripe.com/5kQ6oG7YIcWdf51cUv7bW05)**

Support is a donation, not a purchase — no product or service is delivered in return, and everything here stays free either way.
