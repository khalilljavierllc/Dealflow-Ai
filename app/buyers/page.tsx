"use client"

import { useMemo, useState } from "react"
import { Plus, Target, Users, X } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { SampleBanner } from "@/components/sample-banner"
import { useUI } from "@/components/providers"
import {
  Badge,
  Button,
  Card,
  CardTitle,
  EmptyState,
  Field,
  inputClass,
} from "@/components/ui"
import { addBuyer } from "@/lib/store"
import { useBuyers, useLeads } from "@/lib/use-store"
import type { Buyer } from "@/lib/types"
import { formatCurrency, initials } from "@/lib/utils"

const STRATEGIES: { id: Buyer["strategy"]; label: string }[] = [
  { id: "flip", label: "Fix & Flip" },
  { id: "rental", label: "Rental" },
  { id: "buy-hold", label: "Buy & Hold" },
  { id: "brrrr", label: "BRRRR" },
]

export default function BuyersPage() {
  const { buyers, isSample } = useBuyers()
  const { leads } = useLeads()
  const { toast } = useUI()
  const [showForm, setShowForm] = useState(false)

  const matches = useMemo(() => {
    const map: Record<string, number> = {}

    for (const b of buyers) {
      map[b.id] = leads.filter((l) => {
        if (l.stage === "closed") return false

        const offer = l.analysis?.maxOffer ?? 0

        const inBudget =
          offer >= b.minBudget && offer <= b.maxBudget

        const inMarket =
          b.markets.length === 0 ||
          b.markets.some(
            (m) =>
              m.toLowerCase().includes(l.city.toLowerCase()) ||
              m.toLowerCase().includes(l.state.toLowerCase()) ||
              l.city.toLowerCase().includes(m.toLowerCase()),
          )

        return inBudget && inMarket
      }).length
    }

    return map
  }, [buyers, leads])

  return (
    <div>
      <PageHeader
        eyebrow="BUYERS"
        title="Buyers Network"
        subtitle="Match your deals to cash buyers by budget and market"
        actions={
          <Button
            variant="primary"
            onClick={() => setShowForm((s) => !s)}
            disabled={isSample}
          >
            <Plus size={16} />
            Add buyer
          </Button>
        }
      />

      {isSample ? <SampleBanner /> : null}

      {showForm && !isSample ? (
        <AddBuyerForm
          onClose={() => setShowForm(false)}
          onSaved={(name) => {
            setShowForm(false)
            toast(`Added ${name} to your network`, "success")
          }}
        />
      ) : null}

      {buyers.length === 0 ? (
        <EmptyState
          icon={<Users size={22} />}
          title="No buyers yet"
          description="Add cash buyers with their budget and target markets to auto-match deals."
          action={
            <Button
              variant="primary"
              onClick={() => setShowForm(true)}
            >
              <Plus size={16} />
              Add your first buyer
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {buyers.map((b) => (
            <Card key={b.id} className="flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-elevated text-sm font-bold text-primary">
                    {initials(b.name)}
                  </span>

                  <div>
                    <p className="font-semibold">{b.name}</p>
                    <p className="text-xs capitalize text-muted">
                      {STRATEGIES.find(
                        (s) => s.id === b.strategy,
                      )?.label ?? b.strategy}
                    </p>
                  </div>
                </div>

                {matches[b.id] > 0 ? (
                  <Badge tone="success">
                    <Target size={11} className="mr-1" />
                    {matches[b.id]} match
                    {matches[b.id] > 1 ? "es" : ""}
                  </Badge>
                ) : null}
              </div>

              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted">Budget</dt>
                  <dd className="font-semibold">
                    {formatCurrency(b.minBudget, true)} –{" "}
                    {formatCurrency(b.maxBudget, true)}
                  </dd>
                </div>

                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Markets</dt>
                  <dd className="text-right font-medium">
                    {b.markets.join(", ") || "Any"}
                  </dd>
                </div>
              </dl>

              {b.propertyTypes.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-1.5 border-t border-line pt-3">
                  {b.propertyTypes.map((p) => (
                    <span
                      key={p}
                      className="rounded-full bg-elevated px-2 py-0.5 text-[10px] font-medium text-muted"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function AddBuyerForm({
  onClose,
  onSaved,
}: {
  onClose: () => void
  onSaved: (name: string) => void
}) {
  const [name, setName] = useState("")
  const [markets, setMarkets] = useState("")
  const [minBudget, setMinBudget] = useState("")
  const [maxBudget, setMaxBudget] = useState("")
  const [strategy, setStrategy] =
    useState<Buyer["strategy"]>("flip")
  const [types, setTypes] = useState("")

  function save() {
    if (!name.trim()) return

    addBuyer({
      name: name.trim(),
      markets: markets
        .split(",")
        .map((m) => m.trim())
        .filter(Boolean),
      minBudget:
        Number(minBudget.replace(/[^0-9]/g, "")) || 0,
      maxBudget:
        Number(maxBudget.replace(/[^0-9]/g, "")) || 0,
      strategy,
      propertyTypes: types
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    })

    onSaved(name.trim())
  }

  return (
    <Card className="mb-5 border-primary/30">
      <div className="mb-4 flex items-center justify-between">
        <CardTitle>New buyer</CardTitle>

        <button
          type="button"
          onClick={onClose}
          className="text-muted hover:text-foreground"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field
          label="Buyer name"
          className="sm:col-span-2"
        >
          <input
            className={inputClass}
            placeholder="Sunbelt Capital"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>

        <Field label="Min budget ($)">
          <input
            inputMode="numeric"
            className={inputClass}
            placeholder="80000"
            value={minBudget}
            onChange={(e) => setMinBudget(e.target.value)}
          />
        </Field>

        <Field label="Max budget ($)">
          <input
            inputMode="numeric"
            className={inputClass}
            placeholder="250000"
            value={maxBudget}
            onChange={(e) => setMaxBudget(e.target.value)}
          />
        </Field>

        <Field
          label="Target markets"
          hint="comma separated"
          className="sm:col-span-2"
        >
          <input
            className={inputClass}
            placeholder="Dallas TX, Fort Worth TX"
            value={markets}
            onChange={(e) => setMarkets(e.target.value)}
          />
        </Field>

        <Field
          label="Property types"
          hint="comma separated"
          className="sm:col-span-2"
        >
          <input
            className={inputClass}
            placeholder="Single family, Duplex"
            value={types}
            onChange={(e) => setTypes(e.target.value)}
          />
        </Field>
      </div>

      <div className="mt-4">
        <p className="mb-1.5 text-[11px] font-medium text-muted">
          Strategy
        </p>

        <div className="flex flex-wrap gap-1.5">
          {STRATEGIES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStrategy(s.id)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                strategy === s.id
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-line bg-panel-2 text-muted hover:text-foreground"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>

        <Button
          variant="primary"
          onClick={save}
          disabled={!name.trim()}
        >
          Save buyer
        </Button>
      </div>
    </Card>
  )
}
