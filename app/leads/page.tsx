"use client"

import { Search, Users } from "lucide-react"
import { useMemo, useState } from "react"
import { PageHeader } from "@/components/page-header"
import { useUI } from "@/components/providers"
import { SampleBanner } from "@/components/sample-banner"
import { Badge, Button, Card, EmptyState, inputClass } from "@/components/ui"
import { rankLeads } from "@/lib/metrics"
import type { Temperature } from "@/lib/types"
import { useLeads } from "@/lib/use-store"
import { formatCurrency } from "@/lib/utils"

const tempTone: Record<Temperature, "hot" | "warm" | "cold"> = {
  hot: "hot",
  warm: "warm",
  cold: "cold",
}

export default function LeadsPage() {
  const { hydrated, leads, isSample } = useLeads()
  const { openNewLead, openLead } = useUI()
  const [query, setQuery] = useState("")
  const [temp, setTemp] = useState<"all" | Temperature>("all")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rankLeads(leads).filter((l) => {
      const matchesQuery =
        !q ||
        `${l.sellerName} ${l.address} ${l.city} ${l.motivation}`
          .toLowerCase()
          .includes(q)
      const matchesTemp = temp === "all" || l.temperature === temp
      return matchesQuery && matchesTemp
    })
  }, [leads, query, temp])

  return (
    <div>
      <PageHeader
        eyebrow="Acquisitions"
        title="Leads"
        subtitle="Every conversation, signal and follow-up in one place."
        actions={
          <Button variant="primary" onClick={openNewLead}>
            + Add Lead
          </Button>
        }
      />

      {!hydrated ? (
        <div className="h-96 animate-pulse rounded-xl border border-line bg-panel" />
      ) : (
        <>
          {isSample ? <SampleBanner /> : null}

          <div className="mb-4 flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                className={`${inputClass} pl-9`}
                placeholder="Search property, seller or city…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <select
              className={`${inputClass} sm:max-w-[170px]`}
              value={temp}
              onChange={(e) => setTemp(e.target.value as typeof temp)}
            >
              <option value="all">All temperatures</option>
              <option value="hot">Hot</option>
              <option value="warm">Warm</option>
              <option value="cold">Cold</option>
            </select>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={<Users size={20} />}
              title={leads.length === 0 ? "No leads yet" : "No matches"}
              description={
                leads.length === 0
                  ? "Add your first lead to start scoring deals."
                  : "Try a different search or filter."
              }
              action={
                leads.length === 0 ? (
                  <Button variant="primary" onClick={openNewLead}>
                    + Add Lead
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <Card className="p-0">
              {/* Desktop table */}
              <div className="hidden overflow-x-auto sm:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                      <th className="p-4 font-medium">Seller</th>
                      <th className="p-4 font-medium">Property</th>
                      <th className="p-4 font-medium">Motivation</th>
                      <th className="p-4 font-medium">Score</th>
                      <th className="p-4 font-medium">Status</th>
                      <th className="p-4 text-right font-medium">Est. profit</th>
                      <th className="p-4" />
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((lead) => (
                      <tr key={lead.id} className="border-t border-line-soft">
                        <td className="p-4">
                          <p className="font-semibold">{lead.sellerName}</p>
                          <p className="text-xs text-muted">
                            {lead.timeline ?? "—"}
                          </p>
                        </td>
                        <td className="p-4">
                          <p>{lead.address}</p>
                          <p className="text-xs text-muted">{lead.city}</p>
                        </td>
                        <td className="p-4">
                          <span className="text-xs text-muted">
                            {lead.motivationSignals.slice(0, 2).join(", ") ||
                              "—"}
                          </span>
                        </td>
                        <td className="p-4 font-bold">
                          {lead.analysis?.score ?? "—"}
                        </td>
                        <td className="p-4">
                          <Badge tone={tempTone[lead.temperature]}>
                            {lead.temperature}
                          </Badge>
                        </td>
                        <td className="p-4 text-right font-bold text-accent">
                          {formatCurrency(
                            lead.analysis?.potentialProfit ?? 0,
                            true,
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <Button
                            size="sm"
                            onClick={() => openLead(lead, isSample)}
                          >
                            Open
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="divide-y divide-line-soft sm:hidden">
                {filtered.map((lead) => (
                  <button
                    key={lead.id}
                    onClick={() => openLead(lead, isSample)}
                    className="flex w-full items-center justify-between gap-3 p-4 text-left"
                  >
                    <div className="min-w-0">
                      <div className="mb-1 flex items-center gap-2">
                        <Badge tone={tempTone[lead.temperature]}>
                          {lead.temperature}
                        </Badge>
                        <span className="text-xs text-muted">
                          score {lead.analysis?.score}
                        </span>
                      </div>
                      <p className="truncate font-semibold">{lead.address}</p>
                      <p className="truncate text-xs text-muted">
                        {lead.sellerName} · {lead.city}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-bold text-accent">
                      {formatCurrency(lead.analysis?.potentialProfit ?? 0, true)}
                    </span>
                  </button>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
