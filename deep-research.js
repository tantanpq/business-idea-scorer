/* Business Idea Scoring — deep research protocol (SPEC V3, approved 2026-10-10)
 * The tool must RESEARCH before scoring, not just score user input.
 * This module: (1) generates targeted search queries per criterion from the idea input,
 * (2) defines the evidence schema each researched fact must carry,
 * (3) formats researched facts into the RESEARCH EVIDENCE block the judge prompt consumes.
 * v1: queries are executed by the host agent (web search); API search integration later.
 * Shared by: index.html (browser) and test/run-test.js (node).
 */
(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) module.exports = factory();
  else root.BizIdeaResearch = factory();
})(typeof self !== "undefined" ? self : this, function () {

/**
 * Build a per-criterion research query set from the idea input.
 * Returns: [{criterion: "C2", queries: [...], want: "what evidence would move this criterion"}]
 */
function buildResearchPlan(inp) {
  const cat = guessCategory(inp);
  const q = (t) => t.replace(/\s+/g, " ").trim();
  return [
    { criterion: "C1", want: "Dated enabling changes + adoption readiness in target segment",
      queries: [q(`${cat} market trends 2025 2026`), q(`${cat} adoption statistics 2026`)] },
    { criterion: "C2", want: "Market size reports, CAGR, segment growth trajectory",
      queries: [q(`${cat} market size TAM SAM report 2025 2026`), q(`${cat} market CAGR forecast 2030`)] },
    { criterion: "C3", want: "Competitor list, funding/revenue, industry structure",
      queries: [q(`${cat} competitors list`), q(`${cat} top startups funding revenue 2025 2026`)] },
    { criterion: "C4", want: "Moat / competitive advantage analysis of incumbents",
      queries: [q(`${cat} competitive advantage moat analysis`)] },
    { criterion: "C5/C6", want: "Pricing benchmarks, margins, unit economics of comparables",
      queries: [q(`${cat} pricing benchmarks`), q(`${cat} SaaS gross margin CAC LTV benchmarks`)] },
    { criterion: "C9", want: "Regulatory, failure-mode, and risk evidence",
      queries: [q(`${cat} regulatory risk 2025 2026`), q(`${cat} startup failure reasons`)] },
    { criterion: "C10", want: "Proof buyers spend on alternatives TODAY (revenue, customers, budgets)",
      queries: [q(`${cat} software revenue customers 2025 2026`), q(`${cat} buyer spending statistics`)] },
    { criterion: "C12", want: "Capital requirements, typical round sizes",
      queries: [q(`${cat} startup average seed round 2025 2026`), q(`${cat} startup costs`)] },
    { criterion: "C13", want: "Precedent M&A transactions and multiples",
      queries: [q(`${cat} acquisitions 2024 2025 2026`), q(`${cat} M&A multiples`)] },
    { criterion: "C14", want: "Acquisition channels and CAC benchmarks",
      queries: [q(`${cat} customer acquisition channels`), q(`${cat} CAC benchmarks`)] }
  ];
}

/** Crude category guess from title+description for query building. */
function guessCategory(inp) {
  const text = ((inp.title || "") + " " + (inp.description || "")).toLowerCase();
  if (/agent|ai (qa|monitor|governance)/.test(text)) return "AI agent QA monitoring";
  if (/music|song/.test(text)) return "AI music generation";
  if (/food|restaurant/.test(text)) return "restaurant tech";
  if (/travel|trip/.test(text)) return "travel tech";
  if (/creator|short.video|tiktok|reels/.test(text)) return "creator tools";
  if (/skill|credential|hiring/.test(text)) return "skills credentialing";
  return inp.title || "startup";
}

/**
 * Format researched facts into the evidence block.
 * facts: [{criterion, fact, source, date, caveat}]
 */
function formatResearchEvidence(facts) {
  if (!facts || !facts.length) return "";
  const lines = facts.map(f =>
    `- [${f.criterion}] ${f.fact} (Source: ${f.source}, accessed ${f.date}${f.caveat ? `; caveat: ${f.caveat}` : ""})`
  );
  return "Researched evidence (each item carries source + date; assess q/a on provenance):\n" + lines.join("\n");
}

/** Evidence discipline reminder embedded in UI. */
const EVIDENCE_RULES = [
  "Every researched fact needs: source URL, access date, quoted figure, caveat.",
  "No figure without a source. Unusable search results -> criterion stays MISSING.",
  "User-supplied claims without corroboration are self-reported (q <= 0.5)."
];

return { buildResearchPlan, formatResearchEvidence, EVIDENCE_RULES };
});
