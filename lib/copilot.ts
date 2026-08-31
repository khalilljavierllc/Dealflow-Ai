import type { Lead } from "./types"
import { formatCurrency } from "./utils"

/**
 * Rule-based copilot. Reads the user's actual leads and answers common
 * questions deterministically. Swap this for an LLM call (via /api/analyze)
 * when a model is connected — the UI stays identical.
 */
export function buildCopilotReply(question: string, leads: Lead[]): string {
  const q = question.toLowerCase()

  if (leads.length === 0) {
    return "You don't have any deals yet. Add a lead from the Leads page and I'll analyze it for you."
  }

  const active = leads.filter((l) => l.stage !== "closed")
  const sorted = [...leads].sort(
    (a, b) => (b.analysis?.score ?? 0) - (a.analysis?.score ?? 0),
  )

  // Hottest / best deals
  if (/(hot|best|top|highest|strong)/.test(q)) {
    const top = sorted.slice(0, 3)
    if (top.length === 0) return "No scored deals yet."
    const lines = top.map(
      (l, i) =>
        `${i + 1}. ${l.sellerName} — ${l.address} · score ${
          l.analysis?.score ?? "?"
        }/100 · ${formatCurrency(l.analysis?.assignmentFee, true)} fee`,
    )
    return `Your strongest deals right now:\n\n${lines.join(
      "\n",
    )}\n\nStart with #1 — ${top[0].analysis?.nextAction ?? "reach out today."}`
  }

  // Pipeline value
  if (/(pipeline|value|worth|total|revenue|fee|profit)/.test(q)) {
    const projectedFees = active.reduce(
      (s, l) => s + (l.analysis?.assignmentFee ?? 0),
      0,
    )
    const potential = active.reduce(
      (s, l) => s + (l.analysis?.potentialProfit ?? 0),
      0,
    )
    return `You have ${active.length} active deals.\n\n• Projected assignment fees: ${formatCurrency(
      projectedFees,
    )}\n• Total potential profit: ${formatCurrency(
      potential,
    )}\n\nThese are estimates from the deal model, not closed revenue.`
  }

  // Needs action / today
  if (/(action|today|next|do|focus|priority|follow)/.test(q)) {
    const priority = sorted
      .filter((l) => l.stage !== "closed")
      .slice(0, 3)
    if (priority.length === 0) return "Nothing urgent — all deals are closed."
    const lines = priority.map(
      (l) => `• ${l.sellerName}: ${l.analysis?.nextAction ?? "follow up."}`,
    )
    return `Here's where I'd focus today:\n\n${lines.join("\n")}`
  }

  // Portfolio summary
  if (/(summar|portfolio|overview|status|how am i|report)/.test(q)) {
    const hot = leads.filter((l) => l.temperature === "hot").length
    const avg = Math.round(
      leads.reduce((s, l) => s + (l.analysis?.score ?? 0), 0) / leads.length,
    )
    const closed = leads.filter((l) => l.stage === "closed").length
    return `Portfolio snapshot:\n\n• ${leads.length} total deals (${hot} hot, ${closed} closed)\n• Average deal score: ${avg}/100\n• ${active.length} deals still active in your pipeline\n\nAsk me "what are my hottest deals?" to see where to spend your time.`
  }

  // Risk
  if (/(risk|danger|careful|avoid|weak|bad)/.test(q)) {
    const risky = leads.filter((l) => l.analysis?.risk === "high")
    if (risky.length === 0)
      return "Good news — none of your current deals are flagged high risk."
    const lines = risky
      .slice(0, 4)
      .map(
        (l) =>
          `• ${l.sellerName} (${l.address}): ${
            l.analysis?.riskFactors[0] ?? "review inputs"
          }`,
      )
    return `${risky.length} deal(s) flagged high risk:\n\n${lines.join(
      "\n",
    )}\n\nRe-verify ARV and repair scope before committing.`
  }

  // Fallback
  return `I can help you analyze your ${leads.length} deals. Try asking:\n\n• "What are my hottest deals?"\n• "How much is in my pipeline?"\n• "Which deals need action today?"\n• "Any high-risk deals?"`
}
