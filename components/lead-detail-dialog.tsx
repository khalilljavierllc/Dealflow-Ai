"use client"

import { Mail, MapPin, Phone, Trash2, X } from "lucide-react"
import { useEffect } from "react"
import { deleteLead, reanalyzeLead, setStage } from "@/lib/store"
import { STAGES, type Lead } from "@/lib/types"
import { useLeads } from "@/lib/use-store"
import { formatCurrency, formatNumber } from "@/lib/utils"
import { AnalysisSummary } from "./analysis-summary"
import { Badge, Button, inputClass } from "./ui"

const tempTone = { hot: "hot", warm: "warm", cold: "cold" } as const

export function LeadDetailDialog({
  lead: initialLead,
  onClose,
  readOnly,
  onToast,
}: {
  lead: Lead | null
  onClose: () => void
  readOnly: boolean
  onToast: (msg: string, tone?: "default" | "success" | "error") => void
}) {
  const { leads } = useLeads()

  useEffect(() => {
    if (!initialLead) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [initialLead])

  if (!initialLead) return null

  // Prefer the live version from the store so edits (stage, re-score) reflect instantly.
  const lead = leads.find((l) => l.id === initialLead.id) ?? initialLead

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Details for ${lead.address}`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-line bg-panel sm:rounded-2xl">
        <div className="flex items-start justify-between border-b border-line p-5">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <Badge tone={tempTone[lead.temperature]}>{lead.temperature}</Badge>
              {readOnly ? <Badge tone="cold">Sample</Badge> : null}
            </div>
            <h2 className="text-lg font-bold tracking-tight">{lead.address}</h2>
            <p className="flex items-center gap-1 text-xs text-muted">
              <MapPin size={12} /> {lead.city}
              {lead.state ? `, ${lead.state}` : ""}
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

        <div className="flex-1 overflow-y-auto p-5">
          {/* Seller + property facts */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Fact label="Seller" value={lead.sellerName} />
            <Fact label="Type" value={lead.propertyType ?? "—"} />
            <Fact
              label="Beds / Baths"
              value={`${lead.beds ?? "—"} / ${lead.baths ?? "—"}`}
            />
            <Fact
              label="Sq ft"
              value={lead.sqft ? formatNumber(lead.sqft) : "—"}
            />
            <Fact label="Asking" value={formatCurrency(lead.askingPrice)} />
            <Fact label="Est. ARV" value={formatCurrency(lead.estimatedValue)} />
            <Fact label="Condition" value={lead.condition ?? "—"} />
            <Fact label="Timeline" value={lead.timeline ?? "—"} />
          </div>

          {lead.phone || lead.email ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {lead.phone ? (
                <a
                  href={`tel:${lead.phone}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-panel-2 px-3 py-1.5 text-xs font-medium hover:bg-elevated"
                >
                  <Phone size={13} /> {lead.phone}
                </a>
              ) : null}
              {lead.email ? (
                <a
                  href={`mailto:${lead.email}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-panel-2 px-3 py-1.5 text-xs font-medium hover:bg-elevated"
                >
                  <Mail size={13} /> {lead.email}
                </a>
              ) : null}
            </div>
          ) : null}

          {lead.motivation ? (
            <div className="mt-3 rounded-lg border border-line bg-background/50 p-3">
              <p className="text-[11px] font-medium text-muted">Notes</p>
              <p className="mt-1 text-sm">{lead.motivation}</p>
            </div>
          ) : null}

          {/* Stage control */}
          <div className="mt-4">
            <p className="mb-1.5 text-[11px] font-medium text-muted">
              Pipeline stage
            </p>
            <select
              className={inputClass}
              value={lead.stage}
              disabled={readOnly}
              onChange={(e) => {
                setStage(lead.id, e.target.value as Lead["stage"])
                onToast(`Moved to ${e.target.value}`, "success")
              }}
            >
              {STAGES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* AI analysis */}
          {lead.analysis ? (
            <div className="mt-5">
              <AnalysisSummary analysis={lead.analysis} />
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-line p-4">
          {readOnly ? (
            <p className="text-[11px] text-muted">
              Sample lead — add your own to enable editing.
            </p>
          ) : (
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                deleteLead(lead.id)
                onToast("Lead deleted", "default")
                onClose()
              }}
            >
              <Trash2 size={14} /> Delete
            </Button>
          )}
          <div className="flex gap-2">
            {!readOnly ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  reanalyzeLead(lead.id)
                  onToast("Re-scored with latest inputs", "success")
                }}
              >
                Re-run analysis
              </Button>
            ) : null}
            <Button
              variant="primary"
              size="sm"
              onClick={() =>
                onToast(
                  "Call brief generated — connect a phone provider to dial.",
                  "default",
                )
              }
            >
              Generate call brief
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-background/50 p-2.5">
      <p className="text-[10px] uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-0.5 truncate text-sm font-semibold capitalize">{value}</p>
    </div>
  )
}
