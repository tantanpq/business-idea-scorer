#!/usr/bin/env node
/* E2E test: 2 sample ideas (1 strong, 1 weak) through the real scoring pipeline.
 * Uses Codex CLI as the LLM judge (same role as the browser app's API call).
 * Verifies: valid JSON output, correct math, and score discrimination.
 */
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const PB = require("../prompt-builder.js");
const BM = require("../scoring-math.js");

const CODEX = "/home/hatch/workspace/bin/codex";

const IDEAS = [
  {
    name: "GOOD — Stability Engine (QA for SMB AI agents)",
    input: {
      title: "Stability Engine — QA & governance for SMB AI agents",
      description: "A monitoring and regression-testing service for small/mid businesses deploying AI customer-service agents. Every agent action is logged with an evidence trail; the service flags hallucinations, policy violations, and cost anomalies, and sends a weekly quality scorecard with rollback recommendations. Priced as a monthly subscription per monitored agent.",
      customer: "US SMBs (50–500 employees) using AI chat/voice agents for customer support or sales",
      geography: "United States",
      problem: "Gartner (Q3 2026): over 40% of agentic AI projects will be cancelled by end of 2027 due to unclear value and governance failures. SMBs lose customer trust and revenue when agents hallucinate or go off-policy, and they have no in-house QA team.",
      solution: "Drop-in monitoring layer: evidence log per agent action, anomaly alerts, weekly quality scorecard, rollback recommendations. No code changes required to the agent.",
      alternatives: "Braintrust / LangSmith (built for developers, too complex and expensive for SMBs); manual spot-checks; doing nothing and absorbing failures",
      businessModel: "Subscription (SaaS)",
      stage: "Prototype / MVP",
      horizon: "3–5 years",
      objective: "Durable owner-operated business",
      founder: "3 years as CMM metrology programmer (measurement science); built 20+ simlab-calibrated scoring rubrics; operates AI agent lanes 24/7 with evidence-trail discipline; shipped 3 production tools; documented post-mortems from 2 previous AI agent deployments",
      evidence: "Pilot (Sep 2026): 5 SMBs trialed the monitoring prototype for 4 weeks; 3 converted to paid at $299/mo; all 3 cited 'caught 11+ hallucinations in week 1' as the reason; 0 churned in 60 days. Bottom-up SAM: ~40,000 US SMBs (50–500 emp) running AI support agents × $3,600/yr = $144M SAM; SOM year 3: 500 monitored agents × $3,600 = $1.8M ARR. Cost: ~$40/mo compute per agent at current volume; CAC $450 via SMB community partnerships (measured over 30 acquired trials). Gartner Q3 2026: 40%+ agentic AI projects cancelled by end-2027 (governance failures). AI agents market $10.9B (2026) → $42–50B by 2030.",
      date: "2026-10-10"
    }
  },
  {
    name: "BAD — PetRock NFT for toddlers",
    input: {
      title: "PetRock NFT — AI-generated virtual pet rocks for toddlers",
      description: "A mobile app where toddlers (ages 2–4) collect AI-generated pictures of pet rocks minted as NFTs on a blockchain. Parents buy blind packs of rock NFTs; rarer rocks unlock sticker animations.",
      customer: "Toddlers aged 2–4 (payer: their parents)",
      geography: "Global",
      problem: "Toddlers get bored with existing toys and parents want novel digital collectibles.",
      solution: "AI-generated pet rock images minted as NFTs, sold in blind packs with rarity tiers.",
      alternatives: "Physical toys, free kids' apps, stickers",
      businessModel: "One-time product sale (NFT packs)",
      stage: "Concept (no build yet)",
      horizon: "1–2 years",
      objective: "Venture-scale company",
      founder: "Idea-stage solo founder; no software, blockchain, or children's-product experience; no access to parent communities",
      evidence: "Concept test (Aug 2026): showed mockups to 20 parents; 0 would pay; 17 said 'my toddler cannot use a phone wallet'; 3 concerned about screen time. Apple App Store guideline 3.1.1 (2024): NFT apps targeting children face enhanced review; 2 comparable kids' NFT apps removed in 2025. NFT collectible trading volume down 93% from 2022 peak (DappRadar 2026). COPPA: collecting data from under-13s requires verifiable parental consent with significant compliance cost; no compliance plan exists.",
      date: "2026-10-10"
    }
  }
];

function extractJson(raw) {
  // find the largest {...} block
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("no JSON object found in judge output");
  return JSON.parse(raw.slice(start, end + 1));
}

function judgeWithCodex(prompt) {
  const sys = "You are a strict evidence-based business idea evaluator. Output ONLY valid JSON matching the required schema. No markdown, no commentary.";
  const full = sys + "\n\n" + prompt;
  // pass via argv; stdin closed per codex lesson
  const out = execFileSync(CODEX,
    ["exec", "--skip-git-repo-check", full],
    { input: "", encoding: "utf8", timeout: 600000, maxBuffer: 64 * 1024 * 1024,
      stdio: ["ignore", "pipe", "pipe"] });
  return out;
}

const results = [];
for (const idea of IDEAS) {
  console.log("=".repeat(70));
  console.log("SCORING:", idea.name);
  const prompt = PB.buildPrompt(idea.input);
  console.log(`prompt chars: ${prompt.length}`);
  let llm;
  try {
    const raw = judgeWithCodex(prompt);
    fs.writeFileSync(path.join(__dirname, `judge-raw-${idea.name.startsWith("GOOD") ? "good" : "bad"}.txt`), raw);
    llm = extractJson(raw);
  } catch (e) {
    console.log("JUDGE FAILED:", e.message);
    results.push({ name: idea.name, error: e.message });
    continue;
  }
  const nCrit = (llm.criteria || []).length;
  console.log(`criteria returned: ${nCrit}`);
  const r = BM.computeResults(llm);
  console.log(`SCORE: ${r.score.toFixed(1)} | Confidence: ${r.confidence.toFixed(1)}% ` +
    `(Cov ${r.coverage.toFixed(1)} / Q ${r.quality.toFixed(1)} / A ${r.applicability.toFixed(1)})`);
  console.log(`Bounds: ${r.bounds.lower.toFixed(1)}–${r.bounds.upper.toFixed(1)}`);
  console.log("Rows:", r.rows.map(x => `${x.id}=${x.score}${x.status === "MISSING" ? "(M)" : ""}`).join(" "));
  console.log("Blockers:", (r.blockers || []).join(" | ") || "(none)");
  if (r.errors.length) console.log("MATH NOTES:", r.errors.join("; "));
  results.push({ name: idea.name, score: r.score, confidence: r.confidence, rows: r.rows, blockers: r.blockers });
}

console.log("=".repeat(70));
console.log("DISCRIMINATION CHECK");
const good = results.find(r => r.name.startsWith("GOOD"));
const bad = results.find(r => r.name.startsWith("BAD"));
if (good && bad && good.score !== undefined && bad.score !== undefined) {
  const gap = good.score - bad.score;
  console.log(`GOOD: ${good.score.toFixed(1)}  BAD: ${bad.score.toFixed(1)}  GAP: ${gap.toFixed(1)}`);
  console.log(gap >= 15 ? "PASS — ideas clearly discriminated (gap ≥ 15)" : "FAIL — gap too small, investigate anchors/prompt");
} else {
  console.log("FAIL — one or both scorings errored");
}
fs.writeFileSync(path.join(__dirname, "test-results.json"), JSON.stringify(results, null, 1));
console.log("results saved to test/test-results.json");
