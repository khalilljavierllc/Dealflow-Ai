"use client"

import { useState } from "react"
import { Calculator, RotateCcw } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { AnalysisSummary } from "@/components/analysis-summary"
import { Button, Card, CardTitle, Field, inputClass } from "@/components/ui"
import { analyzeInput } from "@/lib/store"
import {
  MOTIVATION_SIGNALS,
  type AnalyzerInput,
  type DealAnalysis,
} from "@/lib/types"

const CONDITIONS: { id: NonNullable<AnalyzerInput["condition"]>; label: string }[] = [
  { id: "turnkey", label: "Turnkey" },
  { id: "light", label: "Light" },
  { id: "moderate", label: "Moderate" },
  { id: "heavy", label: "Heavy" },
  { id: "teardown", label: "Teardown" },
]

const TIMELINES: { id: NonNullable<AnalyzerInput["timeline"]>; label: string }[] = [
  { id: "asap", label: "ASAP" },
  { id: "30days", label: "30 days" },
  { id: "90days", label: "90 days" },
  { id: "flexible", label: "Flexible" },
]

const EMPTY = {
  arv: "",
  askingPrice: "",
  sqft: "",
  repairs: "",
  targetFee: "15000",
  condition: "moderate" as NonNullable<AnalyzerInput["condition"]>,
  timeline: "flexible" as NonNullable<AnalyzerInput["timeline"]>,
}

export default function AnalyzerPage() {
  const [form, setForm] = useState({ ...EMPTY })
  const [signals, setSignals] = useState<string[]>([])
  const [result, setResult] = useState<DealAnalysis | null>(null)

  function num(v: string) {
    const n = Number(v.replace(/[^0-9.]/g, ""))
    return Number.isFinite(n) && n > 0 ? n : undefined
  }

  function run() {
    const analysis = analyzeInput({
      arv: num(form.arv),
      askingPrice: num(form.askingPrice),
      sqft: num(form.sqft),
      repairs: num(form.repairs),
      targetFee: num(form.targetFee),
      condition: form.condition,
      timeline: form.timeline,
      motivationSignals: signals,
    })
    setResult(analysis)
  }

  function reset() {
    setForm({ ...EMPTY })
    setSignals([])
    setResult(null)
  }

  function toggleSignal(s: string) {
    setSignals((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    )
  }

   return (
    <div>
  return (
  <div>
    <PageHeader
      eyebrow="UNDERWRITE"
      title="Deal Analyzer"
      subtitle="Run any property through the underwriting model — no lead required"
    />

    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,420px)_1fr]">

/>
        
    

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,420px)_1fr]">
        <Card>
          <CardTitle hint="70% rule + motivation">Property inputs</CardTitle>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Est. ARV ($)">
              <input
                inputMode="numeric"
                className={inputClass}
                placeholder="285000"
                value={form.arv}
                onChange={(e) => setForm({ ...form, arv: e.target.value })}
              />
            </Field>
            <Field label="Asking price ($)">
              <input
                inputMode="numeric"
                className={inputClass}
                placeholder="180000"
                value={form.askingPrice}
                onChange={(e) =>
                  setForm({ ...form, askingPrice: e.target.value })
                }
              />
            </Field>
            <Field label="Square feet">
              <input
                inputMode="numeric"
                className={inputClass}
                placeholder="1450"
                value={form.sqft}
                onChange={(e) => setForm({ ...form, sqft: e.target.value })}
              />
            </Field>
            <Field label="Known repairs ($)" hint="optional">
              <input
                inputMode="numeric"
                className={inputClass}
                placeholder="auto"
                value={form.repairs}
                onChange={(e) => setForm({ ...form, repairs: e.target.value })}
              />
            </Field>
            <Field label="Target fee ($)">
              <input
                inputMode="numeric"
                className={inputClass}
                placeholder="15000"
                value={form.targetFee}
                onChange={(e) =>
                  setForm({ ...form, targetFee: e.target.value })
                }
              />
            </Field>
          </div>

          <div className="mt-4">
            <p className="mb-1.5 text-[11px] font-medium text-muted">Condition</p>
            <div className="flex flex-wrap gap-1.5">
              {CONDITIONS.map((c) => (
                <Chip
                  key={c.id}
                  active={form.condition === c.id}
                  onClick={() => setForm({ ...form, condition: c.id })}
                >
                  {c.label}
                </Chip>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <p className="mb-1.5 text-[11px] font-medium text-muted">Timeline</p>
            <div className="flex flex-wrap gap-1.5">
              {TIMELINES.map((t) => (
                <Chip
                  key={t.id}
                  active={form.timeline === t.id}
                  onClick={() => setForm({ ...form, timeline: t.id })}
                >
                  {t.label}
                </Chip>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <p className="mb-1.5 text-[11px] font-medium text-muted">
              Motivation signals
            </p>
            <div className="flex flex-wrap gap-1.5">
              {MOTIVATION_SIGNALS.map((s) => (
                <Chip
                  key={s}
                  active={signals.includes(s)}
                  onClick={() => toggleSignal(s)}
                >
                  {s}
                </Chip>
              ))}
            </div>
          </div>

          <div className="mt-5 flex gap-2">
            <Button variant="primary" className="flex-1" onClick={run}>
              <Calculator size={16} />
              Analyze deal
            </Button>
            <Button variant="ghost" onClick={reset} aria-label="Reset">
              <RotateCcw size={16} />
            </Button>
          </div>
        </Card>

        <div>
          {result ? (
            <AnalysisSummary analysis={result} />
          ) : (
            <Card className="flex h-full min-h-64 flex-col items-center justify-center text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-elevated text-primary">
                <Calculator size={22} />
              </div>
              <p className="font-semibold">Enter property details</p>
              <p className="mt-1 max-w-xs text-sm text-muted">
                Fill in the ARV and condition, then run the analyzer to see your
                max offer, spread and deal score.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "border-primary bg-primary/15 text-primary"
          : "border-line bg-panel-2 text-muted hover:border-primary/40 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  )
}
