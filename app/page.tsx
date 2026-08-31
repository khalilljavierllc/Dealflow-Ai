"use client"

import {
  ArrowUpRight,
  Flame,
  Sparkles,
  TrendingUp,
  Wallet,
} from "lucide-react"
import Link from "next/link"
import { useMemo } from "react"
import { PageHeader } from "@/components/page-header"
import { SampleBanner } from "@/components/sample-banner"
import { useUI } from "@/components/providers"
import { Badge, Button, Card, CardTitle, EmptyState } from "@/components/ui"
import { computeMetrics, rankLeads } from "@/lib/metrics"
import { useLeads } from "@/lib/use-store"
import { formatCurrency } from "@/lib/utils"

export default function CommandCenterPage() {
  const { hydrated, leads, isSample } = useLeads()
  const { openNewLead, openLead, toast } = useUI()

  const metrics = useMemo(() => computeMetrics(leads), [leads])
  const ranked = useMemo(() => rankLeads(leads).slice(0, 5), [leads])

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  return (
    <div>
      <PageHeader
        eyebrow={today}
        title="Command Center"
        subtitle="Your next best deal, surfaced automatically."
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() =>
                toast("Lead import — connect a data source to sync.", "default")
              }
            >
              Import Leads
            </Button>
            <Button variant="primary" onClick={openNewLead}>
              + New Lead
            </Button>
          </>
        }
      />

      {!hydrated ? (
        <DashboardSkeleton />
      ) : (
        <>
          {isSample ? <SampleBanner /> : null}

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat
              icon={<Wallet size={16} />}
              label="Pipeline value"
              value={formatCurrency(metrics.pipelineValue, true)}
              hint={`${metrics.total} active leads`}
              money
            />
            <Stat
              icon={<Flame size={16} />}
              label="Hot opportunities"
              value={String(metrics.hotCount)}
              hint="score 80+"
            />
            <Stat
              icon={<ArrowUpRight size={16} />}
              label="Offers ready"
              value={String(metrics.offersReady)}
              hint="in offer stage"
            />
            <Stat
              icon={<TrendingUp size={16} />}
              label="Projected assignment"
              value={formatCurrency(metrics.projectedAssignment, true)}
              hint="est. spread"
              money
            />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.7fr_1fr]">
            {/* Priority queue */}
            <Card>
              <CardTitle hint="· ranked by AI deal score">
                AI Priority Queue
              </CardTitle>
              {ranked.length === 0 ? (
                <EmptyState
                  title="No leads yet"
                  description="Add your first lead and DealFlow will rank it here."
                  action={
                    <Button variant="primary" onClick={openNewLead}>
                      + New Lead
                    </Button>
                  }
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                        <th className="pb-3 font-medium">Property</th>
                        <th className="pb-3 font-medium">Signal</th>
                        <th className="pb-3 font-medium">Score</th>
                        <th className="pb-3 text-right font-medium">
                          Est. profit
                        </th>
                        <th className="pb-3" />
                      </tr>
                    </thead>
                    <tbody>
                      {ranked.map((lead) => (
                        <tr
                          key={lead.id}
                          className="border-t border-line-soft"
                        >
                          <td className="py-3 pr-2">
                            <p className="font-semibold">{lead.address}</p>
                            <p className="text-xs text-muted">
                              {lead.city}
                              {lead.state ? `, ${lead.state}` : ""}
                            </p>
                          </td>
                          <td className="py-3 pr-2">
                            {lead.motivationSignals[0] ? (
                              <Badge
                                tone={
                                  lead.temperature === "hot" ? "hot" : "warm"
                                }
                              >
                                {lead.motivationSignals[0]}
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                —
                              </span>
                            )}
                          </td>
                          <td className="py-3 pr-2 font-bold">
                            {lead.analysis?.score ?? "—"}
                          </td>
                          <td className="py-3 pr-2 text-right font-bold text-accent">
                            {formatCurrency(
                              lead.analysis?.potentialProfit ?? 0,
                              true,
                            )}
                          </td>
                          <td className="py-3 text-right">
                            <Button
                              size="sm"
                              variant="secondary"
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
              )}
            </Card>

            {/* Radar + activity */}
            <div className="flex flex-col gap-4">
              <Card>
                <CardTitle>AI Deal Radar</CardTitle>
                {ranked[0] ? (
                  <div className="rounded-xl border border-primary/25 bg-gradient-to-br from-[#14152b] to-panel p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary">
                      <Sparkles size={15} /> Best next action
                    </div>
                    <p className="text-sm leading-relaxed">
                      {ranked[0].analysis?.nextAction ??
                        "Qualify this lead further."}{" "}
                      Top target:{" "}
                      <span className="font-semibold">{ranked[0].address}</span>{" "}
                      (score {ranked[0].analysis?.score}).
                    </p>
                    <Button
                      variant="primary"
                      className="mt-3 w-full"
                      onClick={() => openLead(ranked[0], isSample)}
                    >
                      Open seller brief
                    </Button>
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      Recommendation from the rule-based model — not financial
                      advice.
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted">
                    Add leads to activate the deal radar.
                  </p>
                )}
              </Card>

              <Card>
                <CardTitle>Recent activity</CardTitle>
                {leads.length === 0 ? (
                  <p className="text-sm text-muted">No activity yet.</p>
                ) : (
                  <ul className="space-y-3">
                    {leads.slice(0, 4).map((lead) => (
                      <li key={lead.id} className="flex gap-3 text-sm">
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                        <div>
                          <p>
                            <span className="font-semibold">
                              {lead.stage === "closed"
                                ? "Deal closed"
                                : "Lead scored"}
                            </span>{" "}
                            · {lead.address}
                          </p>
                          <p className="text-xs text-muted">
                            {lead.city} · score {lead.analysis?.score}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            All scores and dollar figures are rule-based estimates. Connect an AI
            &amp; valuation API and a database for production data.{" "}
            <Link href="/copilot" className="text-primary hover:underline">
              Learn more
            </Link>
          </p>
        </>
      )}
    </div>
  )
}

function Stat({
  icon,
  label,
  value,
  hint,
  money,
}: {
  icon: React.ReactNode
  label: string
  value: string
  hint: string
  money?: boolean
}) {
  return (
    <div className="rounded-xl border border-line bg-panel p-4">
      <div className="flex items-center gap-2 text-muted">
        <span className="text-primary">{icon}</span>
        <span className="text-xs">{label}</span>
      </div>
      <p
        className={`mt-2 text-2xl font-black tracking-tight ${money ? "text-accent" : ""}`}
      >
        {value}
      </p>
      <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl border border-line bg-panel" />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.7fr_1fr]">
        <div className="h-80 rounded-xl border border-line bg-panel" />
        <div className="h-80 rounded-xl border border-line bg-panel" />
      </div>
    </div>
  )
}
