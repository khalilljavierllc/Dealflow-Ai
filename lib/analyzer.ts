import type { AnalyzerInput, DealAnalysis, RiskLevel } from "./types"

/**
 * DealFlow rule-based deal analyzer.
 *
 * This is a TRANSPARENT heuristic model — NOT a real AI valuation. It exists so
 * the app is fully functional today. When a real AI/valuation API is connected,
 * `/api/analyze` can return the same `DealAnalysis` shape with `source: "ai"`.
 *
 * Everything it returns should be surfaced in the UI as an ESTIMATE.
 */

const CONDITION_REPAIR_PER_SQFT: Record<
  NonNullable<AnalyzerInput["condition"]>,
  number
> = {
  turnkey: 5,
  light: 18,
  moderate: 35,
  heavy: 55,
  teardown: 85,
}

const HIGH_MOTIVATION = new Set([
  "Foreclosure",
  "Behind on payments",
  "Tax liens",
  "Job loss",
  "Divorce",
])

const MED_MOTIVATION = new Set([
  "Vacant",
  "Inherited",
  "Relocation",
  "Tired landlord",
  "Code violations",
  "Major repairs",
])

function round(n: number, to = 1) {
  return Math.round(n / to) * to
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

export function analyzeDeal(input: AnalyzerInput): DealAnalysis {
  const arv = Math.max(0, input.arv ?? input.estimatedValue ?? 0)
  const sqft = Math.max(0, input.sqft ?? 0)
  const condition = input.condition ?? "moderate"
  const signals = input.motivationSignals ?? []

  // --- Repair estimate -----------------------------------------------------
  let repairEstimate = Math.max(0, input.repairs ?? 0)
  if (!repairEstimate) {
    if (sqft > 0) {
      repairEstimate = sqft * CONDITION_REPAIR_PER_SQFT[condition]
    } else {
      // Fallback: percentage of ARV based on condition
      const pct: Record<string, number> = {
        turnkey: 0.02,
        light: 0.06,
        moderate: 0.12,
        heavy: 0.2,
        teardown: 0.3,
      }
      repairEstimate = arv * (pct[condition] ?? 0.12)
    }
  }
  repairEstimate = round(repairEstimate, 500)

  // --- Offer / profit (70% rule based) ------------------------------------
  const assignmentFee = Math.max(0, input.targetFee ?? 15000)
  const closingHolding = round(arv * 0.03, 500) // ~3% closing & holding
  // Maximum Allowable Offer: 70% ARV - repairs - assignment fee
  const maxOffer = Math.max(
    0,
    round(arv * 0.7 - repairEstimate - assignmentFee, 500),
  )

  const askingPrice = input.askingPrice ?? 0
  // Potential spread if acquired at MAO and assigned
  const potentialProfit = Math.max(
    0,
    round(arv * 0.7 - maxOffer - repairEstimate - closingHolding, 250) +
      assignmentFee,
  )

  // --- Score ---------------------------------------------------------------
  let score = 45 // baseline

  // Motivation contribution (up to +30)
  const detectedSignals: string[] = []
  let motivationBoost = 0
  for (const s of signals) {
    if (HIGH_MOTIVATION.has(s)) {
      motivationBoost += 9
      detectedSignals.push(s)
    } else if (MED_MOTIVATION.has(s)) {
      motivationBoost += 5
      detectedSignals.push(s)
    } else {
      motivationBoost += 2
      detectedSignals.push(s)
    }
  }
  score += clamp(motivationBoost, 0, 30)

  // Equity / discount contribution (up to +20)
  if (arv > 0 && askingPrice > 0) {
    const discount = (arv - askingPrice) / arv // higher = better
    score += clamp(Math.round(discount * 60), -15, 20)
  }

  // Timeline urgency (up to +8)
  const timelineBoost: Record<string, number> = {
    asap: 8,
    "30days": 5,
    "90days": 2,
    flexible: 0,
  }
  score += timelineBoost[input.timeline ?? "flexible"] ?? 0

  // Deal-math sanity: penalize thin/negative spreads
  if (arv > 0) {
    if (potentialProfit < 5000) score -= 18
    else if (potentialProfit < 12000) score -= 6
    else if (potentialProfit > 30000) score += 6
  }

  // Heavy rehab risk penalty
  if (condition === "heavy") score -= 4
  if (condition === "teardown") score -= 10

  score = clamp(Math.round(score), 1, 99)

  // --- Risk ----------------------------------------------------------------
  const riskFactors: string[] = []
  let riskPoints = 0

  if (arv === 0) {
    riskFactors.push("No ARV provided — estimate is unreliable")
    riskPoints += 3
  }
  if (repairEstimate > arv * 0.25) {
    riskFactors.push("Repairs exceed 25% of ARV")
    riskPoints += 2
  }
  if (potentialProfit < 8000) {
    riskFactors.push("Thin assignment spread")
    riskPoints += 2
  }
  if (condition === "heavy" || condition === "teardown") {
    riskFactors.push("Heavy rehab scope increases execution risk")
    riskPoints += 1
  }
  if (askingPrice > 0 && arv > 0 && askingPrice > arv * 0.8) {
    riskFactors.push("Asking price leaves little margin")
    riskPoints += 2
  }
  if (riskFactors.length === 0) {
    riskFactors.push("No major risk flags detected in provided inputs")
  }

  const risk: RiskLevel =
    riskPoints >= 5 ? "high" : riskPoints >= 2 ? "medium" : "low"

  // --- Next action ---------------------------------------------------------
  let nextAction: string
  if (score >= 85) {
    nextAction = "Call the seller today and present your offer verbally."
  } else if (score >= 70) {
    nextAction = "Draft an offer and schedule a follow-up call within 48 hours."
  } else if (score >= 50) {
    nextAction = "Qualify further — confirm motivation, condition and title."
  } else {
    nextAction = "Nurture. Add to a long-term follow-up sequence."
  }

  // --- Confidence ----------------------------------------------------------
  let confidence = 50
  if (arv > 0) confidence += 15
  if (sqft > 0) confidence += 10
  if (input.repairs) confidence += 10
  if (askingPrice > 0) confidence += 10
  if (signals.length > 0) confidence += 5
  confidence = clamp(confidence, 30, 92)

  return {
    score,
    arv: round(arv, 500),
    repairEstimate,
    maxOffer,
    assignmentFee,
    potentialProfit,
    risk,
    riskFactors,
    motivationSignals: detectedSignals,
    nextAction,
    confidence,
    isEstimate: true,
    source: "rule-based",
    analyzedAt: new Date().toISOString(),
  }
}

/** Suggest a lead temperature from an analysis score. */
export function temperatureFromScore(score: number): "hot" | "warm" | "cold" {
  if (score >= 80) return "hot"
  if (score >= 60) return "warm"
  return "cold"
}
