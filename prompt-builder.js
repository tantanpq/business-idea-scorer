/* Business Idea Scoring — prompt builder (SPEC V4-revised, approved by Tân 2026-10-10, applied 2026-10-10)
 * Shared by: index.html (browser) and test/run-test.js (node).
 * Weights: C1 7 / C2 12 / C3 7 / C4 4 / C5 7 / C6 8 / C7 10 / C8 7 / C9 6 /
 *           C10 8 / C11 4 / C12 5 / C13 2 / C14 7 / F3 6 = 100.
 * Anchors: 0/25/50/75/100 only.
 * V4 vs V3: F3 (Category Trajectory Forecast 3–5y, 6) is new — weight is Tân's
 * decision but explicitly UNCALIBRATED; −6 redistributed from C4/C5/C9/C13/C14.
 * Part A adds the Asymmetric Upside lens + Tracked Bets register (no score math).
 * C1 folds in the 8-signal why-now checklist; C2 folds in market-frame discipline.
 */
(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) module.exports = factory();
  else root.BizIdeaPrompt = factory();
})(typeof self !== "undefined" ? self : this, function () {

const SPEC_VERSION = "BUSINESS_IDEA_SPEC_V4 — approved by founder 2026-10-10 (revised after simlab); F3 weight provisional and explicitly uncalibrated";

const CRITERIA = [
  { id: "C1", name: "Market trend & why now", weight: 7,
    ownership: "External change and readiness within the stated horizon; run the 8-signal why-now checklist (enabling-cost crossover, infrastructure readiness, behavior evidence, regulatory window, hype-cycle position, incumbent blind spot, crisis/supply shock, 5-year asymmetry test)",
    anchors: {
      "0": "No why-now signal: costs have not crossed affordability, infrastructure unready, no behavior evidence, no regulatory window — or regulation blocks. (Too early is the same as wrong.)",
      "25": "Only a weak signal (hype) without economic/behavioral signals; or arriving late into a saturated market.",
      "50": "2-3 middling signals (behavior evidence or near-ready infra) but cost crossover not within runway; or contradictory signals.",
      "75": "Clear timing stack: 2+ strong signals (in-runway cost crossover + behavior evidence, or fixed-date regulatory window); can answer 'why not 5 years ago/later'.",
      "100": "Full timing stack with asymmetry: cost crossover inside the ramp, infra >50%, strong behavior evidence, dated regulatory tailwind, named incumbent blind spot."
    } },
  { id: "C2", name: "Market frame & size", weight: 12,
    ownership: "Frame BEFORE sizing: buyer-unit arithmetic, bottom-up SAM/SOM, expansion pool kept separate with barrier arithmetic",
    anchors: {
      "0": "No countable buyer unit; sizing is only top-down '% of a giant market' (market adjacency fallacy); or the frame is contradicted by evidence (no broken world).",
      "25": "Weak buyer-unit count; SAM/SOM are % guesses; expansion pool not separated; adjacency-fallacy sizing caps here.",
      "50": "Bottom-up SAM/SOM from dated counted sources; SOM tied to CAC/capacity; expansion hypothesis named and logged as a Tracked Bet but untriggered (MISSING-tracked).",
      "75": "Clear buyer unit + at least one independent counted source; passes the derived-bar test (SOM clears target revenue at ≤30% leader share); expansion pool separated with barrier arithmetic.",
      "100": "Triangulated: 2+ independent counted sources; expansion pool has early evidence (non-buyers paying for workarounds); frame survives downside reframe."
    } },
  { id: "C3", name: "Industry structure — Porter 5 forces", weight: 7,
    ownership: "Threat of entry, supplier power, buyer power, substitutes, rivalry — all five forces explicitly. When ≥2 forces are adverse BECAUSE entry barriers are low, write the offensive counter-hypothesis ('low barriers let us win via…' embedded distribution / data flywheel / user affinity) with a cheap test, logged as a Tracked Bet.",
    anchors: {
      "0": "Hostile structure on multiple forces: concentrated buyers, powerful suppliers, low entry barriers with active entrants, strong substitutes, intense rivalry — no credible position.",
      "25": "Two or more forces materially adverse; modest differentiation does not offset structural pressure.",
      "50": "Mixed structure: some forces favorable, others adverse; recognizable value position with real countervailing pressure.",
      "75": "Structure net-favorable or a documented structural gap (underserved segment, weak incumbents); credible response to each adverse force.",
      "100": "Structurally attractive industry for a new entrant with this model: weak rivalry in target segment, manageable buyer/supplier power, meaningful entry friction the founder can build on, substitutes covered."
    } },
  { id: "C4", name: "Defensibility & moat potential", weight: 4,
    ownership: "Durability, imitation barriers, and control of resources. Demonstrable user-affinity mechanisms (measured developer NPS, viral-loop unit math from a real pilot, tested trust-design prototypes) count as partial moat evidence — anchor 50 reachable without patents/data exclusivity.",
    anchors: {
      "0": "Observed resources and offer are readily replicable, with no credible control or durability mechanism.",
      "25": "A temporary head start exists, but replication or substitution is straightforward.",
      "50": "A specific defensibility mechanism is plausible and partly established, but important VRIO conditions remain unproven.",
      "75": "At least one mechanism has demonstrated value, meaningful replication friction, and organizational control.",
      "100": "A robust mechanism or reinforcing set of mechanisms withstands credible imitation and substitution tests within the stated horizon."
    } },
  { id: "C5", name: "Business model viability", weight: 7,
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
  { id: "C9", name: "Risk register — 5 categories", weight: 6,
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
  { id: "C13", name: "M&A & strategic exit potential", weight: 2,
    ownership: "Strategic acquirers, precedent transactions, multiples — upside optionality, small weight by design",
    anchors: {
      "0": "No plausible acquirer; industry has no acquisition activity in this category.",
      "25": "Acquirers exist in theory but no precedent transactions in the segment.",
      "50": "Precedent acquisitions in adjacent categories with disclosed multiples; strategic logic plausible.",
      "75": "Named strategic acquirers with acquisition history in this exact category; precedent multiples support attractive exit math.",
      "100": "Active acquirer market with recent precedents at strong multiples; the idea maps to a known 'missing piece' for 2+ named strategics."
    } },
  { id: "C14", name: "Go-to-market access & repeatability", weight: 7,
    ownership: "Reachable customers, conversion process, and repeatable channels. A named distribution hypothesis testable within the validation budget ('hypothesis + test defined' in Tracked Bets) may anchor 75 instead of defaulting to 50 — 50-and-forget is not permitted when a testable hypothesis exists.",
    anchors: {
      "0": "Evidence shows that the proposed route cannot reach or convert the required buyers, with no credible alternative.",
      "25": "Some access exists, but acquisition is ad hoc or dependent on exceptional founder connections.",
      "50": "A specific channel and buying process are evidenced, with an initial funnel but uncertain repeatability.",
      "75": "Separate channel tests demonstrate a reproducible process with understood conversion stages and sales-cycle constraints.",
      "100": "The principal route remains reproducible across relevant cohorts, with credible resilience to concentration or access changes."
    } },
  { id: "F3", name: "Category trajectory forecast — 3–5y (UNCALIBRATED)", weight: 6,
    ownership: "Quality of the FORECAST DISCIPLINE for this exact category: cost curves, adoption leading indicators, fixed policy dates. Forecast inputs, not outputs. Score the method, never optimism. This criterion's weight (6) is the founder's decision but explicitly UNCALIBRATED — simlab could not validate a forward-looking criterion on a backward-looking fixture.",
    anchors: {
      "0": "No forecast input at all; only a point estimate from one analyst source.",
      "25": "One weak input (analyst CAGR from a thin base) with no cost curve, adoption indicator, or policy date.",
      "50": "Direction + at least one measured input (cost curve or adoption leading indicator), but not yet a scenario; or MISSING-tracked (not yet researched).",
      "75": "Base/bull/bear or bracket range, each case with measured inputs; watch variables named; limits stated (direction + order of magnitude, no point estimate).",
      "100": "Triangulated forecast: measured learning rate on a cost curve + converging adoption indicators + fixed policy dates; strategy wins in ≥2 scenarios; forecast audit history if previously forecasted."
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
1. Score exactly these 15 criteria (C1..C14 + F3), using ONLY the anchor values 0, 25, 50, 75, 100. Select the HIGHEST anchor fully supported by the material evidence. Read each anchor as a whole.
2. CRITICAL — the Tan rule: C10 (Market Demand Reality) and C11 (Founder Traction) are SEPARATE. A real market with zero founder traction must score C10 on the market evidence alone — NEVER punish C10 for lack of traction. C11 at 50 (no traction yet) is the normal pre-launch state, not a penalty; its weight is only 4 by design.
3. F3 (Category Trajectory Forecast): score the QUALITY OF THE FORECAST DISCIPLINE, never optimism or pessimism. Forecast COSTS and ADOPTION INPUTS, not market outputs. Banned: point estimates from one analyst source, smooth CAGR from a thin base, funding = demand, multi-decimal CAGRs. Valid: measured cost curves (Wright's law learning rates), adoption leading indicators, fixed policy dates, base/bull/bear or bracket ranges with named watch variables. This criterion is explicitly UNCALIBRATED — be honest about uncertainty; MISSING-tracked is acceptable.
4. If a criterion has NO usable evidence, score it 50, set status to "MISSING" (imputed, not observed). Distinguish observed 50 (genuinely mixed) from imputed 50.
5. A 0 or 25 requires adverse or clearly unfavorable evidence. Lack of information alone is MISSING = 50, never 0.
6. One scoring owner per raw fact: do not award or deduct points twice for the same observation across criteria.
7. For each OBSERVED criterion, also provide q and a:
${QUALITY_ANCHORS}
${APPLICABILITY_ANCHORS}
   For MISSING criteria set q = 0 and a = 0.
8. Research evidence with cited sources/dates counts as observed/external (q up to 0.75-1.0 depending on provenance). User-supplied claims without corroboration are self-reported (q <= 0.5).
9. For C9, briefly note the status of each of the 5 risk categories (regulatory/technology/market/execution/financial) in the evidence field.
10. For C3, briefly note each of the 5 forces in the evidence field.
11. Category-expansion discipline (C2/C10): score EXISTING-category spend with the anchors. Record the expansion hypothesis ("the product makes X into a buyer who doesn't pay today because…") separately as a Tracked Bet — it stays MISSING(50) until its trigger fires and NEVER inflates C2 or C10.
12. Record any CRITICAL BLOCKER separately; it coexists with the score and does not change the math.
13. Propose up to 3 validation priorities: concrete questions/experiments that would most change the assessment.
14. ASYMMETRIC UPSIDE (required, no score math): write the conditional-payoff state — "If X is true, the business looks like Y with Z economics" (X = the key uncertainty, named explicitly). Classify the bet: CONVEX (small bounded loss if wrong; large conditional win if right) or CONCAVE (large loss if wrong; modest win if right).
15. TRACKED BETS register (required): every major uncertainty becomes a named bet — top residual risk (C9), adverse C3 forces, unproven C14 channel, category-expansion hypothesis, F3 watch variables. Each bet: hypothesis, cheap validation trigger, re-score date. An OPEN bet adds ZERO points — it exists to prevent forgetting, not to inflate.
16. DECISION DISCIPLINE: a sub-65 score is NOT a kill signal for a category-creating idea. If the Tracked Bets register contains a category-expansion or distribution hypothesis, route to human judgment on founder exceptionalism + the register — not to the averaged number.

## CRITERIA AND ANCHORS
${criteriaText}

## REQUIRED OUTPUT — strict JSON only, no other text
{
  "criteria": [
    {"id": "C1", "score": 75, "status": "observed", "evidence": "1-2 sentence summary", "rationale": "why this anchor and not the next one up", "q": 0.75, "a": 1.0},
    ... (all 15, in order C1..C14, F3)
  ],
  "blockers": ["critical blocker text, or empty array"],
  "strengths": ["top 2-3 strongest criteria with one-line reason each"],
  "weaknesses": ["bottom 2-3 weakest criteria with one-line reason each"],
  "validation_priorities": [
    {"question": "...", "hypothesis": "...", "observable": "...", "decision": "..."}
  ],
  "asymmetric_upside": {
    "conditional_payoff": "If X is true, the business looks like Y with Z economics.",
    "key_uncertainty": "X, named explicitly",
    "bet_class": "CONVEX or CONCAVE",
    "loss_if_wrong": "bounded description",
    "win_if_right": "conditional description"
  },
  "tracked_bets": [
    {"id": "B1", "hypothesis": "...", "cheap_trigger": "...", "re_score_date": "YYYY-MM-DD", "linked_criterion": "C9/C2/F3/..."}
  ]
}

HONESTY NOTE (include in your assessment preamble): "At a 65 cutoff, this tool would have rejected Airbnb (45.3), Stripe (59.0), Figma (47.5) and Calendly (40.3) at founding. It filters bad ideas well; it cannot identify winners."`;
}

return { SPEC_VERSION, CRITERIA, buildPrompt };
});
