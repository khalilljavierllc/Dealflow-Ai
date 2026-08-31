"use client"

import { X } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { analyzeInput, addLead, type NewLeadInput } from "@/lib/store"
import { MOTIVATION_SIGNALS, type DealAnalysis } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { AnalysisSummary } from "./analysis-summary"
import { Button, Field, inputClass } from "./ui"

const empty = {
  sellerName: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  state: "FL",
  propertyType: "Single family",
  beds: "",
  baths: "",
  sqft: "",
  yearBuilt: "",
  condition: "moderate",
  askingPrice: "",
  estimatedValue: "",
  timeline: "flexible",
  motivation: "",
  targetFee: "15000",
}

type FormState = typeof empty

function num(v: string): number | undefined {
  if (v === "" || v == null) return undefined
  const n = Number(v.replace(/[^0-9.-]/g, ""))
  return Number.isFinite(n) ? n : undefined
}

export function NewLeadDialog({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [form, setForm] = useState<FormState>(empty)
  const [signals, setSignals] = useState<string[]>([])
  const [analysis, setAnalysis] = useState<DealAnalysis | null>(null)
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(empty)
      setSignals([])
      setAnalysis(null)
      setAnalyzing(false)
    }
  }, [open])

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  const set = (key: keyof FormState) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }))

  const canAnalyze = useMemo(
    () => Boolean(form.estimatedValue) && Boolean(form.address),
    [form.estimatedValue, form.address],
  )

  const input: NewLeadInput = useMemo(
    () => ({
      sellerName: form.sellerName,
      phone: form.phone,
      email: form.email,
      address: form.address,
      city: form.city,
      state: form.state,
      propertyType: form.propertyType,
      beds: num(form.beds),
      baths: num(form.baths),
      sqft: num(form.sqft),
      yearBuilt: num(form.yearBuilt),
      condition: form.condition as NewLeadInput["condition"],
      askingPrice: num(form.askingPrice),
      estimatedValue: num(form.estimatedValue),
      timeline: form.timeline as NewLeadInput["timeline"],
      motivation: form.motivation,
      motivationSignals: signals,
      targetFee: num(form.targetFee),
    }),
    [form, signals],
  )

  function runAnalysis() {
    if (!canAnalyze) return
    setAnalyzing(true)
    setAnalysis(null)
    // Small delay to communicate work is happening; the math is local & instant.
    setTimeout(() => {
      setAnalysis(
        analyzeInput({
          arv: input.estimatedValue,
          askingPrice: input.askingPrice,
          sqft: input.sqft,
          condition: input.condition,
          motivationSignals: input.motivationSignals,
          timeline: input.timeline,
          targetFee: input.targetFee,
        }),
      )
      setAnalyzing(false)
    }, 550)
  }

  function save() {
    addLead(input)
    onClose()
  }

  function toggleSignal(s: string) {
    setSignals((cur) =>
      cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s],
    )
    setAnalysis(null)
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Add a new lead"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-line bg-panel sm:rounded-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-line p-5">
          <div>
            <h2 className="text-lg font-bold tracking-tight">New Lead</h2>
            <p className="text-xs text-muted">
              Enter the property, then run the AI Deal Analyzer.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-muted hover:bg-elevated hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Seller name">
              <input
                className={inputClass}
                value={form.sellerName}
                onChange={(e) => set("sellerName")(e.target.value)}
                placeholder="e.g. Sarah M."
              />
            </Field>
            <Field label="Phone">
              <input
                className={inputClass}
                value={form.phone}
                onChange={(e) => set("phone")(e.target.value)}
                placeholder="(555) 000-0000"
                inputMode="tel"
              />
            </Field>
            <Field label="Property address" className="sm:col-span-2">
              <input
                className={inputClass}
                value={form.address}
                onChange={(e) => set("address")(e.target.value)}
                placeholder="123 Main St"
              />
            </Field>
            <Field label="City">
              <input
                className={inputClass}
                value={form.city}
                onChange={(e) => set("city")(e.target.value)}
                placeholder="Tampa"
              />
            </Field>
            <Field label="State">
              <input
                className={inputClass}
                value={form.state}
                onChange={(e) => set("state")(e.target.value)}
                placeholder="FL"
              />
            </Field>

            <Field label="Estimated ARV" hint="after-repair value">
              <input
                className={inputClass}
                value={form.estimatedValue}
                onChange={(e) => {
                  set("estimatedValue")(e.target.value)
                  setAnalysis(null)
                }}
                placeholder="$"
                inputMode="numeric"
              />
            </Field>
            <Field label="Asking price">
              <input
                className={inputClass}
                value={form.askingPrice}
                onChange={(e) => {
                  set("askingPrice")(e.target.value)
                  setAnalysis(null)
                }}
                placeholder="$"
                inputMode="numeric"
              />
            </Field>

            <Field label="Square feet">
              <input
                className={inputClass}
                value={form.sqft}
                onChange={(e) => {
                  set("sqft")(e.target.value)
                  setAnalysis(null)
                }}
                placeholder="1500"
                inputMode="numeric"
              />
            </Field>
            <Field label="Condition">
              <select
                className={inputClass}
                value={form.condition}
                onChange={(e) => {
                  set("condition")(e.target.value)
                  setAnalysis(null)
                }}
              >
                <option value="turnkey">Turnkey</option>
                <option value="light">Light rehab</option>
                <option value="moderate">Moderate rehab</option>
                <option value="heavy">Heavy rehab</option>
                <option value="teardown">Teardown</option>
              </select>
            </Field>

            <Field label="Beds">
              <input
                className={inputClass}
                value={form.beds}
                onChange={(e) => set("beds")(e.target.value)}
                placeholder="3"
                inputMode="numeric"
              />
            </Field>
            <Field label="Baths">
              <input
                className={inputClass}
                value={form.baths}
                onChange={(e) => set("baths")(e.target.value)}
                placeholder="2"
                inputMode="numeric"
              />
            </Field>

            <Field label="Seller timeline">
              <select
                className={inputClass}
                value={form.timeline}
                onChange={(e) => {
                  set("timeline")(e.target.value)
                  setAnalysis(null)
                }}
              >
                <option value="asap">ASAP</option>
                <option value="30days">Within 30 days</option>
                <option value="90days">Within 90 days</option>
                <option value="flexible">Flexible</option>
              </select>
            </Field>
            <Field label="Target assignment fee">
              <input
                className={inputClass}
                value={form.targetFee}
                onChange={(e) => {
                  set("targetFee")(e.target.value)
                  setAnalysis(null)
                }}
                placeholder="$15,000"
                inputMode="numeric"
              />
            </Field>

            <Field label="Motivation & notes" className="sm:col-span-2">
              <textarea
                className={inputClass}
                rows={2}
                value={form.motivation}
                onChange={(e) => set("motivation")(e.target.value)}
                placeholder="Why are they selling?"
              />
            </Field>
          </div>

          {/* Motivation signals */}
          <div className="mt-4">
            <p className="mb-2 text-[11px] font-medium text-muted">
              Motivation signals
            </p>
            <div className="flex flex-wrap gap-2">
              {MOTIVATION_SIGNALS.map((s) => {
                const active = signals.includes(s)
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSignal(s)}
                    aria-pressed={active}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      active
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-line bg-background text-muted hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    {s}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Analysis result */}
          {analysis ? (
            <div className="mt-5 animate-fade-up">
              <AnalysisSummary analysis={analysis} />
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-2 border-t border-line p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] text-muted">
            {formatCurrency(num(form.estimatedValue) ?? 0)} ARV ·{" "}
            <span className="text-muted-foreground">
              Estimates are rule-based, not a valuation
            </span>
          </p>
          <div className="flex gap-2">
            {!analysis ? (
              <Button
                variant="primary"
                onClick={runAnalysis}
                disabled={!canAnalyze || analyzing}
              >
                {analyzing ? "Analyzing…" : "Run AI Deal Analyzer"}
              </Button>
            ) : (
              <Button variant="primary" onClick={save}>
                Save to Pipeline
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
