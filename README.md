# Business Idea Scorer

Evidence-based 0–100 business idea assessment for end users.
Implements **BUSINESS_IDEA_SPEC_V2** (weights simlab-calibrated 2026-10-10; thresholds provisional).

## How it works

1. User fills in the idea form (idea, customer, problem, solution, geography, business model, stage, horizon, objective, founder background, evidence).
2. The app builds a structured evaluation prompt (see `prompt-builder.js` — the 10 criteria with V2 anchors baked in).
3. The prompt is sent to an **OpenAI-compatible chat completions API** using the user's own API key (stored only in the browser's localStorage; never sent anywhere else).
4. The AI judge returns strict JSON: 10 criterion scores (0/25/50/75/100) + status + evidence + q/a + blockers + validation priorities.
5. `scoring-math.js` computes Score, Coverage, Quality, Applicability, Confidence, and missing-data bounds — exactly per SPEC V2 §5–§6.

## Files

| File | Role |
|---|---|
| `index.html` | The web app (form → API call → results). No build step. |
| `prompt-builder.js` | SPEC V2 criteria/anchors + prompt construction. Shared by browser and tests. |
| `scoring-math.js` | Score/Confidence math. Shared by browser and tests. Verified against SPEC §7.1 worked example (63.0 / 69.8% / 59.5–66.5). |
| `vercel.json` | Static deploy config. |
| `test/run-test.js` | E2E test: 2 sample ideas through Codex CLI as judge. |

## Deploy (Vercel)

Option A — static site: push this folder to a repo, import in Vercel as a static site (no build command, output = `.`).
Option B — quick: `npx vercel` inside this folder.

The app is a single static page; the only runtime dependency is the user's own LLM API endpoint.

## Use

1. Open the app, expand "AI judge settings", enter your API base URL + key + model (any OpenAI-compatible endpoint: OpenAI, Groq, OpenRouter, local Ollama…).
2. Fill in the idea form — the more concrete evidence you supply, the higher the Confidence.
3. Click **Score this idea**. Results: total /100, Confidence %, 10-criterion table, strongest/weakest, critical blockers, 3 validation priorities, and a copyable calibration record.

## Honesty rules (from the skill, enforced in UI)

- The score is decision support, **not** a probability of success, investment recommendation, or valuation.
- Criteria with no evidence are imputed at **50** and marked **MISSING** — neutral, not proof of average quality.
- Confidence is separate from Score; never multiply them.
- Weights/anchors are fixed V2. Any revision needs founder approval and a new SPEC version.

## Test

`node test/run-test.js` — runs 2 sample ideas (1 strong, 1 weak) through Codex CLI as the judge and checks score discrimination (gap ≥ 15). See `TEST_REPORT.md`.
