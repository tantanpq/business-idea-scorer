#!/usr/bin/env node
/* V3 E2E test: verifies Tân's core rule — a GOOD idea with a REAL market but
 * ZERO founder traction must NOT be unfairly punished.
 * GOOD idea: strong market demand reality (C10), no traction (C11=50, weight 4).
 * BAD idea: weak market + adverse evidence.
 * Uses Codex CLI as the LLM judge. SPEC V3 PROPOSAL (not yet approved).
 */
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const PB = require("../prompt-builder.js");
const BM = require("../scoring-math.js");
const DR = require("../deep-research.js");

const CODEX = "/home/hatch/workspace/bin/codex";

const IDEAS = [
  {
    name: "GOOD-NO-TRACTION — Stability Engine (real market, zero traction)",
    input: {
      title: "Stability Engine — QA & governance for SMB AI agents",
      description: "A monitoring and regression-testing service for small/mid businesses deploying AI customer-service agents. Every agent action is logged with an evidence trail; the service flags hallucinations, policy violations, and cost anomalies, and sends a weekly quality scorecard. Priced as a monthly subscription per monitored agent.",
      customer: "US SMBs (50–500 employees) using AI chat/voice agents for customer support or sales",
      geography: "United States",
      problem: "SMBs lose customer trust and revenue when AI agents hallucinate or go off-policy, and they have no in-house QA team.",
      solution: "Drop-in monitoring layer: evidence log per agent action, anomaly alerts, weekly quality scorecard. No code changes required to the agent.",
      alternatives: "Braintrust / LangSmith (built for developers, too complex and expensive for SMBs); manual spot-checks; doing nothing and absorbing failures",
      businessModel: "Subscription (SaaS)",
      stage: "Concept / pre-build — NO product yet, NO pilot, NO customers",
      horizon: "3–5 years",
      objective: "Durable owner-operated business",
      founder: "3 years as CMM metrology programmer (measurement science); built 20+ simlab-calibrated scoring rubrics; operates AI agent lanes 24/7 with evidence-trail discipline",
      capital: "Founder has ~$15k savings allocatable; no outside funding; needs bootstrap-able path",
      evidence: "NO traction yet — product not built. Market reality only.",
      researchEvidence: DR.formatResearchEvidence([
        { criterion: "C1", fact: "Gartner Q3 2026: over 40% of agentic AI projects will be cancelled by end of 2027 due to unclear value and governance failures", source: "Gartner via press coverage", date: "2026-10-10", caveat: "secondary reporting" },
        { criterion: "C2", fact: "AI agents market $10.91B (2026) projected $42.7–50.3B by 2030, CAGR ~42-46%", source: "Grand View / Mordor Intelligence via web search", date: "2026-10-10", caveat: "analyst estimates vary" },
        { criterion: "C2", fact: "KPMG Q3 2026: 62% of large enterprises have deployed or are developing AI agents", source: "KPMG survey via press", date: "2026-10-10", caveat: "enterprise, not SMB segment" },
        { criterion: "C10", fact: "Braintrust raised at ~$800M valuation; LangSmith/Langfuse well-funded — enterprises paying for agent observability today", source: "tech press funding reports", date: "2026-10-10", caveat: "enterprise tier, not SMB pricing" },
        { criterion: "C10", fact: "SMB AI support-agent adoption growing; no SMB-focused QA/monitoring product identified in competitor scan", source: "web search competitor scan", date: "2026-10-10", caveat: "absence of evidence, not evidence of absence" },
        { criterion: "C13", fact: "Observability/QA tooling acquisitions active: e.g. enterprise monitoring consolidation ongoing 2024-2026", source: "tech M&A press", date: "2026-10-10", caveat: "no SMB-agent-QA precedent found" }
      ]),
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
      capital: "No capital; expects to raise VC on the idea",
      evidence: "Concept test (Aug 2026): showed mockups to 20 parents; 0 would pay; 17 said 'my toddler cannot use a phone wallet'; 3 concerned about screen time.",
      researchEvidence: DR.formatResearchEvidence([
        { criterion: "C1", fact: "NFT collectible trading volume down 93% from 2022 peak", source: "DappRadar 2026 via web search", date: "2026-10-10" },
        { criterion: "C9", fact: "Apple App Store guideline 3.1.1 (2024): NFT apps targeting children face enhanced review; 2 comparable kids' NFT apps removed in 2025", source: "App Store guidelines + press", date: "2026-10-10" },
        { criterion: "C9", fact: "COPPA: collecting data from under-13s requires verifiable parental consent with significant compliance cost; no compliance plan exists", source: "FTC COPPA rule", date: "2026-10-10" },
        { criterion: "C10", fact: "Zero parents of 20 would pay in concept test; no evidence of buyer spending on toddler NFT collectibles", source: "founder concept test (self-reported)", date: "2026-10-10", caveat: "small sample, self-reported" }
      ]),
      date: "2026-10-10"
    }
  }
];

function extractJson(raw) {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("no JSON object found in judge output");
  return JSON.parse(raw.slice(start, end + 1));
}

function judgeWithCodex(prompt) {
  const sys = "You are a strict evidence-based business idea evaluator. Output ONLY valid JSON matching the required schema. No markdown, no commentary.";
  const full = sys + "\n\n" + prompt;
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
  // verify research plan generation works
  const plan = DR.buildResearchPlan(idea.input);
  console.log(`research plan: ${plan.length} criterion groups`);
  let llm;
  try {
    const raw = judgeWithCodex(prompt);
    const tag = idea.name.startsWith("GOOD") ? "good-v3" : "bad-v3";
    fs.writeFileSync(path.join(__dirname, `judge-raw-${tag}.txt`), raw);
    llm = extractJson(raw);
  } catch (e) {
    console.log("JUDGE FAILED:", e.message);
    results.push({ name: idea.name, error: e.message });
    continue;
  }
  const nCrit = (llm.criteria || []).length;
  console.log(`criteria returned: ${nCrit} (expected 14)`);
  const r = BM.computeResults(llm);
  console.log(`SCORE: ${r.score.toFixed(1)} | Confidence: ${r.confidence.toFixed(1)}%`);
  console.log(`Bounds: ${r.bounds.lower.toFixed(1)}–${r.bounds.upper.toFixed(1)}`);
  console.log("Rows:", r.rows.map(x => `${x.id}=${x.score}${x.status === "MISSING" ? "(M)" : ""}`).join(" "));
  const c10 = r.rows.find(x => x.id === "C10");
  const c11 = r.rows.find(x => x.id === "C11");
  console.log(`TAN-RULE CHECK: C10 (demand reality) = ${c10.score} [${c10.status}] | C11 (traction) = ${c11.score} [${c11.status}]`);
  console.log("Blockers:", (r.blockers || []).join(" | ") || "(none)");
  if (r.errors.length) console.log("MATH NOTES:", r.errors.join("; "));
  results.push({ name: idea.name, score: r.score, confidence: r.confidence, rows: r.rows, blockers: r.blockers });
}

console.log("=".repeat(70));
console.log("V3 DISCRIMINATION + TAN-RULE CHECK");
const good = results.find(r => r.name.startsWith("GOOD"));
const bad = results.find(r => r.name.startsWith("BAD"));
if (good && bad && good.score !== undefined && bad.score !== undefined) {
  const gap = good.score - bad.score;
  console.log(`GOOD (no traction): ${good.score.toFixed(1)}  BAD: ${bad.score.toFixed(1)}  GAP: ${gap.toFixed(1)}`);
  console.log(gap >= 15 ? "PASS — discriminated (gap ≥ 15)" : "FAIL — gap too small");
  const g10 = good.rows.find(x => x.id === "C10");
  const g11 = good.rows.find(x => x.id === "C11");
  const tanRule = g10.score >= 50 && g11.score === 50;
  console.log(`TAN RULE: C10=${g10.score} (market real, should be >=50) C11=${g11.score} (no traction, should be 50/MISSING not 0/25)`);
  console.log(tanRule ? "PASS — no unfair traction penalty" : "FAIL — traction penalty detected");
} else {
  console.log("FAIL — one or both scorings errored");
}
fs.writeFileSync(path.join(__dirname, "test-results-v3.json"), JSON.stringify(results, null, 1));
console.log("results saved to test/test-results-v3.json");
