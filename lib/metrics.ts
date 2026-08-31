import type { Lead, Stage } from "./types"

export interface DashboardMetrics {
  pipelineValue: number
  hotCount: number
  offersReady: number
  projectedAssignment: number
  closedValue: number
  avgScore: number
  total: number
}

const ACTIVE_STAGES: Stage[] = ["new", "qualified", "offer", "contract"]

export function computeMetrics(leads: Lead[]): DashboardMetrics {
  const active = leads.filter((l) => ACTIVE_STAGES.includes(l.stage))
  const pipelineValue = active.reduce(
    (sum, l) => sum + (l.estimatedValue ?? 0),
    0,
  )
  const projectedAssignment = active.reduce(
    (sum, l) => sum + (l.analysis?.potentialProfit ?? 0),
    0,
  )
  const hotCount = leads.filter((l) => l.temperature === "hot").length
  const offersReady = leads.filter((l) => l.stage === "offer").length
  const closedValue = leads
    .filter((l) => l.stage === "closed")
    .reduce((sum, l) => sum + (l.analysis?.potentialProfit ?? 0), 0)
  const avgScore = leads.length
    ? Math.round(
        leads.reduce((s, l) => s + (l.analysis?.score ?? 0), 0) / leads.length,
      )
    : 0

  return {
    pipelineValue,
    hotCount,
    offersReady,
    projectedAssignment,
    closedValue,
    avgScore,
    total: leads.length,
  }
}

/** Leads ranked by AI score, highest first. */
export function rankLeads(leads: Lead[]): Lead[] {
  return [...leads].sort(
    (a, b) => (b.analysis?.score ?? 0) - (a.analysis?.score ?? 0),
  )
}

export function leadsByStage(leads: Lead[], stage: Stage): Lead[] {
  return leads.filter((l) => l.stage === stage)
}
