"use client"

import { useMemo, useState } from "react"
import { PageHeader } from "@/components/page-header"
import { SampleBanner } from "@/components/sample-banner"
import { Badge, Card, EmptyState } from "@/components/ui"
import { useUI } from "@/components/providers"
import { setStage } from "@/lib/store"
import { useLeads } from "@/lib/use-store"
import { STAGES, type Lead, type Stage } from "@/lib/types"
import { formatCurrency, initials } from "@/lib/utils"

const tempTone = { hot: "hot", warm: "warm", cold: "cold" } as const

export default function PipelinePage() {
  const { leads, isSample, hydrated } = useLeads()
  const { openLead, toast } = useUI()
  const [dragId, setDragId] = useState<string | null>(null)

  const byStage = useMemo(() => {
    const map: Record<Stage, Lead[]> = {
      new: [],
      qualified: [],
      offer: [],
      contract: [],
      closed: [],
    }
    for (const lead of leads) map[lead.stage]?.push(lead)
    return map
  }, [leads])

  function moveTo(id: string, stage: Stage) {
    if (isSample) {
      toast("Add a real lead to manage your pipeline", "error")
      return
    }
    setStage(id, stage)
    const label = STAGES.find((s) => s.id === stage)?.label ?? stage
    toast(`Moved to ${label}`, "success")
  }

  const pipelineValue = leads
    .filter((l) => l.stage !== "closed")
    .reduce((sum, l) => sum + (l.analysis?.assignmentFee ?? 0), 0)

  return (
    <div>
      <PageHeader
        title="Pipeline"
        subtitle="Drag deals across stages to track progress"
        meta={
          <span className="text-sm text-muted">
            Projected fees in play{" "}
            <span className="font-bold text-accent">
              {formatCurrency(pipelineValue, true)}
            </span>
          </span>
        }
      />
      {isSample ? <SampleBanner /> : null}

      {hydrated && leads.length === 0 ? (
        <EmptyState title="No deals yet" description="Add a lead to start building your pipeline." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {STAGES.map((stage) => {
            const items = byStage[stage.id]
            return (
              <section
                key={stage.id}
                onDragOver={(e) => {
                  e.preventDefault()
                }}
                onDrop={() => {
                  if (dragId) moveTo(dragId, stage.id)
                  setDragId(null)
                }}
                className="flex flex-col rounded-xl border border-line bg-panel/60"
              >
                <header className="flex items-center justify-between border-b border-line px-3 py-2.5">
                  <span className="text-xs font-bold uppercase tracking-wide text-muted">
                    {stage.label}
                  </span>
                  <span className="rounded-full bg-elevated px-2 py-0.5 text-[10px] font-bold text-muted">
                    {items.length}
                  </span>
                </header>
                <div className="flex min-h-24 flex-1 flex-col gap-2 p-2">
                  {items.map((lead) => (
                    <button
                      key={lead.id}
                      type="button"
                      draggable={!isSample}
                      onDragStart={() => setDragId(lead.id)}
                      onDragEnd={() => setDragId(null)}
                      onClick={() => openLead(lead, isSample)}
                      className="group rounded-lg border border-line bg-panel p-3 text-left transition-colors hover:border-primary/50 hover:bg-elevated"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2 truncate text-sm font-semibold">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-elevated text-[10px] font-bold text-primary">
                            {initials(lead.sellerName)}
                          </span>
                          <span className="truncate">{lead.sellerName}</span>
                        </span>
                        <Badge tone={tempTone[lead.temperature]}>
                          {lead.analysis?.score ?? "-"}
                        </Badge>
                      </div>
                      <p className="mt-1.5 truncate text-xs text-muted">
                        {lead.address}
                      </p>
                      <p className="mt-2 text-xs font-bold text-accent">
                        {formatCurrency(lead.analysis?.assignmentFee, true)} fee
                      </p>
                    </button>
                  ))}
                  {items.length === 0 ? (
                    <p className="px-1 py-3 text-center text-[11px] text-muted-foreground">
                      Drop here
                    </p>
                  ) : null}
                </div>
              </section>
            )
          })}
        </div>
      )}

      <p className="mt-4 text-center text-xs text-muted-foreground sm:hidden">
        Tip: open a lead to change its stage on smaller screens.
      </p>
    </div>
  )
}
