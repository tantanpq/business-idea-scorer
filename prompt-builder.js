/* Business Idea Scoring — prompt builder (SPEC V3, approved by Tân 2026-10-10; weights provisional, not simlab-calibrated)
 * Shared by: index.html (browser) and test/run-test.js (node).
 * Weights: C1-C14 = 7/12/7/5/8/8/10/7/8/8/4/5/3/8. Anchors: 0/25/50/75/100 only.
 * Key V3 changes: C9 split into C10 (Market Demand Reality, 8) + C11 (Founder Traction, 4);
 * C5 split into C5 (model, 8) + C6 (unit economics, 8); new C12 (capital, 5), C13 (M&A, 3);
 * C3 = full Porter 5 forces; C9 = 5-category risk register; C8 += effort/time.
 */
(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) module.exports = factory();
  else root.BizIdeaPrompt = factory();
})(typeof self !== "undefined" ? self : this, function () {

const SPEC_VERSION = "BUSINESS_IDEA_SPEC_V3 — approved by founder 2026-10-10; weights provisional, not simlab-calibrated";

const CRITERIA = [
  { id: "C1", name: "Market trend & timing", weight: 7,
    ownership: "External change and readiness within the stated horizon",
    anchors: {
      "0": "Verified external conditions make the proposed launch timing untenable, with no credible enabling change inside the horizon.",
      "25": "The proposed catalyst is real but target buyers or enabling infrastructure are substantially unready.",
      "50": "The environment is stable or mixed; the solution is feasible now, but no strong time-specific advantage is established.",
      "75": "A dated enabling change aligns with demonstrated segment readiness and a realistic entry window.",
      "100": "Several independently evidenced changes reinforce each other, with clear near-term readiness and a credible explanation for why the opportunity was previously blocked."
    } },
  { id: "C2", name: "Market size, demand depth & growth trajectory", weight: 12,
    ownership: "Addressable opportunity, real buyer spending (demand depth), and 3-5y trajectory",
    anchors: {
      "0": "Credible sizing contradicts the objective AND demand depth is absent (buyers not spending on this problem category).",
      "25": "A real segment exists but attainable revenue is weak, OR demand depth is thin (interest without spending), OR trajectory is declining.",
      "50": "Plausible SAM/SOM with mixed price acceptance; demand depth partially evidenced; trajectory flat or uncertain.",
      "75": "Bottom-up SAM + bounded SOM support the objective; independent WTP evidence shows buyers already pay for alternatives; 3-5y trajectory growing with cited sources.",
      "100": "Triangulated sizing survives downside cases; repeated WTP evidence across segments; strong multi-source growth trajectory; pricing resilient to alternatives."
    } },
  { id: "C3", name: "Industry structure — Porter 5 forces", weight: 7,
    ownership: "Threat of entry, supplier power, buyer power, substitutes, rivalry — all five forces explicitly",
    anchors: {
      "0": "Hostile structure on multiple forces: concentrated buyers, powerful suppliers, low entry barriers with active entrants, strong substitutes, intense rivalry — no credible position.",
      "25": "Two or more forces materially adverse; modest differentiation does not offset structural pressure.",
      "50": "Mixed structure: some forces favorable, others adverse; recognizable value position with real countervailing pressure.",
      "75": "Structure net-favorable or a documented structural gap (underserved segment, weak incumbents); credible response to each adverse force.",
      "100": "Structurally attractive industry for a new entrant with this model: weak rivalry in target segment, manageable buyer/supplier power, meaningful entry friction the founder can build on, substitutes covered."
    } },
  { id: "C4", name: "Defensibility & moat potential", weight: 5,
    ownership: "Durability, imitation barriers, and control of resources (tie-break role)",
    anchors: {
      "0": "Observed resources and offer are readily replicable, with no credible control or durability mechanism.",
      "25": "A temporary head start exists, but replication or substitution is straightforward.",
      "50": "A specific defensibility mechanism is plausible and partly established, but important VRIO conditions remain unproven.",
      "75": "At least one mechanism has demonstrated value, meaningful replication friction, and organizational control.",
      "100": "A robust mechanism or reinforcing set of mechanisms withstands credible imitation and substitution tests within the stated horizon."
    } },
  { id: "C5", name: "Business model viability", weight: 8,
    ownership: "Payer, value exchange, revenue mechanism, operating requirements (unit math lives in C6)",
    anchors: {
      "0": "No coherent path from value delivered to value captured; payer undefined or unwilling in principle.",
      "25": "A revenue mechanism exists on paper but payer/value-exchange logic has major gaps.",
      "50": "Coherent model with identified payer and revenue mechanism; key assumptions untested.",
      "75": "Model demonstrated in a pilot or comparable: payer pays, value exchange clear, operating requirements understood.",
      "100": "Proven model with repeatable value capture across segments; operating requirements fully mapped."
    } },
  { id: "C6", name: "Unit economics & path to profitability", weight: 8,
    ownership: "Contribution margin, CAC, LTV, payback, dated path to operating profitability",
    anchors: {
      "0": "Credible evidence of structurally negative unit economics with no evidenced remedy (contribution negative after full variable costs).",
      "25": "Revenue exists but CAC exceeds contribution LTV, or payback exceeds any reasonable horizon, with unproven fix.",
      "50": "Coherent unit math on paper; key inputs (CAC, retention, support cost) untested or mixed.",
      "75": "Measured cohort economics: positive contribution, CAC payback within a modeled window, costed path to cover fixed costs.",
      "100": "Reconciled multi-cohort economics; LTV/CAC healthy with downside scenarios; clear path to operating profitability with dated milestones."
    } },
  { id: "C7", name: "Founder-market fit", weight: 10,
    ownership: "Team-specific knowledge, capability, access, and learning",
    anchors: {
      "0": "Observed fundamental capability gaps block the opportunity, with no credible way to address them.",
      "25": "The team has some useful capability, but large opportunity-specific gaps remain without a concrete response.",
      "50": "Relevant knowledge and some execution capability are demonstrated, with important coverage or access gaps.",
      "75": "The team demonstrates strong domain insight, key execution capabilities, customer access, and evidence-responsive learning.",
      "100": "Opportunity-specific insight and complementary capabilities are repeatedly demonstrated through difficult execution and learning tasks."
    } },
  { id: "C8", name: "Scalability, effort & time to revenue", weight: 7,
    ownership: "Delivery repeatability PLUS founder effort/time cost: time to MVP, time to revenue, runway fit",
    anchors: {
      "0": "Delivery cannot scale to the objective under any tested model; or time-to-revenue exceeds founder runway with no mitigation.",
      "25": "Works small; scaling is disproportionately effortful; or MVP-to-revenue path exceeds 2x the founder's available runway.",
      "50": "Repeatable core with credible scaling design; bottlenecks partly tested; effort/time estimates exist but unvalidated.",
      "75": "Capacity tests pass with manageable resource growth; time-to-MVP and time-to-revenue evidenced by comparable builds; founder time commitment explicitly modeled.",
      "100": "Replication proven across conditions/cohorts; measured effort, capital, staffing per unit of scale; time-to-revenue demonstrated or tightly bounded."
    } },
  { id: "C9", name: "Risk register — 5 categories", weight: 8,
    ownership: "Regulatory, technology, market, execution, financial — each checked; score the worst material residual",
    anchors: {
      "0": "A verified critical blocker in any category prevents operation (e.g. permission unavailable, technology infeasible).",
      "25": "A substantial documented exposure in >=1 category could stop execution; mitigation unproven or under-resourced.",
      "50": "All five categories examined; material risks identified with plausible but undemonstrated mitigations.",
      "75": "Top risks in each relevant category have evidenced mitigations and named owners; residual exposure bounded.",
      "100": "Critical risks independently checked; contingencies rehearsed; residual exposure explicitly bounded per category."
    } },
  { id: "C10", name: "Market demand reality", weight: 8,
    ownership: "Is the market REAL? Are buyers spending on alternatives TODAY? Independent of this founder's traction.",
    anchors: {
      "0": "Evidence shows buyers do not spend on this problem category; alternatives are free and satisfactory; no budget exists.",
      "25": "Some spending exists but thin, declining, or confined to a segment that does not match the target.",
      "50": "Buyers demonstrably pay for alternatives; depth (how much, how often, how many) is mixed or partly evidenced.",
      "75": "Strong evidence of real spending: competitors with revenue, funded alternatives, documented budgets, repeat purchase in the category.",
      "100": "Deep, growing category spend with multiple independent revenue proofs; buyers actively seeking better solutions (intent data, waitlists, expansion spend)."
    } },
  { id: "C11", name: "Founder traction & validation", weight: 4,
    ownership: "What THIS founder has demonstrated. Low weight by design: no traction must not sink a real-market idea.",
    anchors: {
      "0": "Behavioral tests contradict the hypothesis (users reject trials, churn immediately).",
      "25": "Interest without commitment (praise, signups) but no meaningful use or payment.",
      "50": "Some engagement; early prototype use; no traction yet — the normal pre-launch state. NOT a penalty.",
      "75": "Paid pilot or binding commitments from target customers; repeat use observed.",
      "100": "Replicated traction across cohorts; retention/expansion; contrary evidence examined."
    } },
  { id: "C12", name: "Capital requirements & financing fit", weight: 5,
    ownership: "How much capital to revenue? to profitability? bootstrap/VC/debt fit for this founder?",
    anchors: {
      "0": "Capital required exceeds any accessible source for this founder; no financing path.",
      "25": "Heavy capital need; financing path speculative or mismatched to the model.",
      "50": "Capital need estimated with ranges; plausible financing route (bootstrap/angel/VC/debt) but uncommitted.",
      "75": "Costed path to revenue and to profitability; financing fit matches founder resources and model.",
      "100": "Lean capital path evidenced by comparables; committed or highly accessible financing; milestone-based funding plan."
    } },
  { id: "C13", name: "M&A & strategic exit potential", weight: 3,
    ownership: "Strategic acquirers, precedent transactions, multiples — upside optionality, small weight by design",
    anchors: {
      "0": "No plausible acquirer; industry has no acquisition activity in this category.",
      "25": "Acquirers exist in theory but no precedent transactions in the segment.",
      "50": "Precedent acquisitions in adjacent categories with disclosed multiples; strategic logic plausible.",
      "75": "Named strategic acquirers with acquisition history in this exact category; precedent multiples support attractive exit math.",
      "100": "Active acquirer market with recent precedents at strong multiples; the idea maps to a known 'missing piece' for 2+ named strategics."
    } },
  { id: "C14", name: "Go-to-market access & repeatability", weight: 8,
    ownership: "Reachable customers, conversion process, and repeatable channels",
    anchors: {
      "0": "Evidence shows that the proposed route cannot reach or convert the required buyers, with no credible alternative.",
      "25": "Some access exists, but acquisition is ad hoc or dependent on exceptional founder connections.",
      "50": "A specific channel and buying process are evidenced, with an initial funnel but uncertain repeatability.",
      "75": "Separate channel tests demonstrate a reproducible process with understood conversion stages and sales-cycle constraints.",
      "100": "The principal route remains reproducible across relevant cohorts, with credible resilience to concentration or access changes."
    } }
];

const QUALITY_ANCHORS =
  "q (evidence quality): 0.25 = traceable but weak (self-report/limited observation, significant weaknesses); " +
  "0.50 = direct qualitative work or single relevant test with transparent method but sampling/replication limits; " +
  "0.75 = credible direct measurement or authoritative external data with clear provenance and corroboration; " +
  "1.00 = reproducible or independently corroborated evidence with appropriate sampling and contradiction checks.";

const APPLICABILITY_ANCHORS =
  "a (applicability to this exact segment/geography/model/stage/horizon): 0.25 = remote analogue, large transfer uncertainty; " +
  "0.50 = related setting with important mismatches; 0.75 = mostly matched with limited justified transfer; " +
  "1.00 = directly matched and current.";

function buildPrompt(inp) {
  const criteriaText = CRITERIA.map(c => {
    const anchorLines = Object.entries(c.anchors).map(([s, d]) => `    ${s}: ${d}`).join("\n");
    return `### ${c.id}. ${c.name} (weight ${c.weight})\nOwnership: ${c.ownership}\n${anchorLines}`;
  }).join("\n\n");

  const researchSection = inp.researchEvidence
    ? `\n## DEEP RESEARCH EVIDENCE (web-researched with sources and dates — treat as observed/external, assess q/a on provenance)\n${inp.researchEvidence}\n`
    : `\n## DEEP RESEARCH EVIDENCE\n(none — user did not run deep research; market/competitor/M&A claims below are user-supplied only)\n`;

  return `You are an evidence-based business idea evaluator. Score the business idea below using ${SPEC_VERSION}.

ASSESSMENT DATE: ${inp.date || "2026-10-10"}

## THE IDEA
Title: ${inp.title}
Description: ${inp.description}
Customer / payer: ${inp.customer}
Problem: ${inp.problem}
Proposed solution: ${inp.solution}
Alternatives the customer has today: ${inp.alternatives || "(not stated)"}
Geography: ${inp.geography}
Business model: ${inp.businessModel}
Stage: ${inp.stage}
Commercialization horizon: ${inp.horizon}
Founder's commercial objective: ${inp.objective}
Founder/team background (for founder-market fit): ${inp.founder || "(not stated)"}
Capital available / financing situation: ${inp.capital || "(not stated)"}
User-supplied evidence (market data, validation, costs, channels): ${inp.evidence || "(none supplied)"}
${researchSection}
## SCORING RULES (follow strictly)
1. Score exactly these 14 criteria, using ONLY the anchor values 0, 25, 50, 75, 100. Select the HIGHEST anchor fully supported by the material evidence. Read each anchor as a whole.
2. CRITICAL — the Tan rule: C10 (Market Demand Reality) and C11 (Founder Traction) are SEPARATE. A real market with zero founder traction must score C10 on the market evidence alone — NEVER punish C10 for lack of traction. C11 at 50 (no traction yet) is the normal pre-launch state, not a penalty; its weight is only 4 by design.
3. If a criterion has NO usable evidence, score it 50, set status to "MISSING" (imputed, not observed). Distinguish observed 50 (genuinely mixed) from imputed 50.
4. A 0 or 25 requires adverse or clearly unfavorable evidence. Lack of information alone is MISSING = 50, never 0.
5. One scoring owner per raw fact: do not award or deduct points twice for the same observation across criteria.
6. For each OBSERVED criterion, also provide q and a:
${QUALITY_ANCHORS}
${APPLICABILITY_ANCHORS}
   For MISSING criteria set q = 0 and a = 0.
7. Research evidence with cited sources/dates counts as observed/external (q up to 0.75-1.0 depending on provenance). User-supplied claims without corroboration are self-reported (q <= 0.5).
8. For C9, briefly note the status of each of the 5 risk categories (regulatory/technology/market/execution/financial) in the evidence field.
9. For C3, briefly note each of the 5 forces in the evidence field.
10. Record any CRITICAL BLOCKER separately; it coexists with the score and does not change the math.
11. Propose up to 3 validation priorities: concrete questions/experiments that would most change the assessment.

## CRITERIA AND ANCHORS
${criteriaText}

## REQUIRED OUTPUT — strict JSON only, no other text
{
  "criteria": [
    {"id": "C1", "score": 75, "status": "observed", "evidence": "1-2 sentence summary", "rationale": "why this anchor and not the next one up", "q": 0.75, "a": 1.0},
    ... (all 14, in order C1..C14)
  ],
  "blockers": ["critical blocker text, or empty array"],
  "strengths": ["top 2-3 strongest criteria with one-line reason each"],
  "weaknesses": ["bottom 2-3 weakest criteria with one-line reason each"],
  "validation_priorities": [
    {"question": "...", "hypothesis": "...", "observable": "...", "decision": "..."}
  ]
}`;
}

return { SPEC_VERSION, CRITERIA, buildPrompt };
});
