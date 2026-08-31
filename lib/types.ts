export type Stage = "new" | "qualified" | "offer" | "contract" | "closed"

export const STAGES: { id: Stage; label: string }[] = [
  { id: "new", label: "New" },
  { id: "qualified", label: "Qualified" },
  { id: "offer", label: "Offer" },
  { id: "contract", label: "Contract" },
  { id: "closed", label: "Closed" },
]

export type Temperature = "hot" | "warm" | "cold"

export type RiskLevel = "low" | "medium" | "high"

/**
 * Common seller motivation signals used for lead scoring.
 * These map to the checkboxes in the New Lead form.
 */
export const MOTIVATION_SIGNALS = [
  "Divorce",
  "Foreclosure",
  "Vacant",
  "Inherited",
  "Tired landlord",
  "Relocation",
  "Tax liens",
  "Code violations",
  "Major repairs",
  "Behind on payments",
  "Downsizing",
  "Job loss",
] as const

export type MotivationSignal = (typeof MOTIVATION_SIGNALS)[number]

/**
 * The output of the Deal Analyzer. Every field is an ESTIMATE produced by a
 * transparent, rule-based model until a real AI/valuation API is connected.
 */
export interface DealAnalysis {
  /** Overall deal score 0-100 */
  score: number
  /** After Repair Value estimate (USD) */
  arv: number
  /** Estimated repair cost (USD) */
  repairEstimate: number
  /** Suggested maximum allowable offer (USD) */
  maxOffer: number
  /** Target assignment / wholesale fee (USD) */
  assignmentFee: number
  /** Estimated potential profit / assignment spread (USD) */
  potentialProfit: number
  /** Risk classification */
  risk: RiskLevel
  /** Human-readable risk factors */
  riskFactors: string[]
  /** Detected motivation signals that boosted the score */
  motivationSignals: string[]
  /** Recommended next action */
  nextAction: string
  /** Model confidence 0-100 */
  confidence: number
  /** Whether the result came from the local heuristic (true) or a real AI API (false) */
  isEstimate: boolean
  /** Which engine produced this analysis */
  source: "rule-based" | "ai"
  /** ISO timestamp */
  analyzedAt: string
}

export interface Lead {
  id: string
  sellerName: string
  phone?: string
  email?: string
  address: string
  city: string
  state: string
  propertyType?: string
  beds?: number
  baths?: number
  sqft?: number
  yearBuilt?: number
  condition?: "turnkey" | "light" | "moderate" | "heavy" | "teardown"
  askingPrice?: number
  estimatedValue?: number
  motivation: string
  motivationSignals: string[]
  timeline?: "asap" | "30days" | "90days" | "flexible"
  stage: Stage
  temperature: Temperature
  analysis?: DealAnalysis
  createdAt: string
  updatedAt: string
}

export interface Buyer {
  id: string
  name: string
  markets: string[]
  minBudget: number
  maxBudget: number
  strategy: "flip" | "rental" | "buy-hold" | "brrrr"
  propertyTypes: string[]
  createdAt: string
}

/** Input accepted by the analyzer engine. */
export interface AnalyzerInput {
  arv?: number
  askingPrice?: number
  estimatedValue?: number
  repairs?: number
  sqft?: number
  condition?: Lead["condition"]
  motivationSignals?: string[]
  timeline?: Lead["timeline"]
  targetFee?: number
}
