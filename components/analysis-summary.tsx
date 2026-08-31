import { AlertTriangle, ArrowRight, Sparkles } from "lucide-react"
import type { DealAnalysis } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { Badge, Meter, ScoreDial } from "./ui"

const riskTone = {
  low: "success",
  medium: "warm",
  high: "danger",
} as const

export function AnalysisSummary({ analysis }: { analysis: DealAnalysis }) {
  return (
    <div className="rounded-xl border border-primary/25 bg-gradient-to-br from-[#14152b] to-panel p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
          <Sparkles size={16} />
          AI Deal Analysis
        </div>
        <Badge tone="default">
          {analysis.source === "ai" ? "AI" : "Estimated"}
        </Badge>
      </div>

      <div className="flex items-center gap-4">
        <ScoreDial score={analysis.score} />
        <div className="flex-1">
          <p className="text-xs text-muted">Deal Score</p>
          <p className="text-2xl font-black leading-tight">
            {analysis.score}
            <span className="text-sm font-medium text-muted">/100</span>
          </p>
          <div className="mt-2">
            <Meter value={analysis.confidence} />
            <p className="mt-1 text-[11px] text-muted">
              {analysis.confidence}% model confidence
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="Est. ARV" value={formatCurrency(analysis.arv)} />
        <Metric
          label="Repair est."
          value={formatCurrency(analysis.repairEstimate)}
        />
        <Metric
          label="Max offer"
          value={formatCurrency(analysis.maxOffer)}
          accent
        />
        <Metric
          label="Potential profit"
          value={formatCurrency(analysis.potentialProfit)}
          accent
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-muted">
            <AlertTriangle size={13} />
            Risk assessment
            <Badge tone={riskTone[analysis.risk]}>{analysis.risk}</Badge>
          </div>
          <ul className="space-y-1.5 text-xs text-muted">
            {analysis.riskFactors.map((r) => (
              <li key={r} className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-danger" />
                {r}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold text-muted">
            Motivation signals
          </p>
          {analysis.motivationSignals.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {analysis.motivationSignals.map((s) => (
                <Badge key={s} tone="warm">
                  {s}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              None provided — add signals to improve the score.
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 flex items-start gap-2 rounded-lg border border-line bg-background/60 p-3">
        <ArrowRight size={15} className="mt-0.5 shrink-0 text-accent" />
        <div>
          <p className="text-xs font-semibold text-accent">Recommended next action</p>
          <p className="text-sm">{analysis.nextAction}</p>
        </div>
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
        These figures are produced by DealFlow&apos;s transparent rule-based model
        (70% rule + motivation weighting) — not a certified appraisal or live comps.
        Connect an AI/valuation API to replace them with live data.
      </p>
    </div>
  )
}

function Metric({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div className="rounded-lg border border-line bg-background/50 p-3">
      <p className="text-[11px] text-muted">{label}</p>
      <p
        className={`mt-1 text-sm font-bold ${accent ? "text-accent" : "text-foreground"}`}
      >
        {value}
      </p>
    </div>
  )
}
