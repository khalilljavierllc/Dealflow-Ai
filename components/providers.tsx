"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import type { Lead } from "@/lib/types"
import { LeadDetailDialog } from "./lead-detail-dialog"
import { NewLeadDialog } from "./new-lead-dialog"

type Toast = { id: number; message: string; tone: "default" | "success" | "error" }

interface UIContextValue {
  openNewLead: () => void
  openLead: (lead: Lead, readOnly?: boolean) => void
  toast: (message: string, tone?: Toast["tone"]) => void
}

const UIContext = createContext<UIContextValue | null>(null)

export function useUI() {
  const ctx = useContext(UIContext)
  if (!ctx) throw new Error("useUI must be used within <Providers>")
  return ctx
}

export function Providers({ children }: { children: ReactNode }) {
  const [newLeadOpen, setNewLeadOpen] = useState(false)
  const [detail, setDetail] = useState<{ lead: Lead; readOnly: boolean } | null>(
    null,
  )
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback(
    (message: string, tone: Toast["tone"] = "default") => {
      const id = Date.now() + Math.random()
      setToasts((t) => [...t, { id, message, tone }])
      setTimeout(() => {
        setToasts((t) => t.filter((x) => x.id !== id))
      }, 3200)
    },
    [],
  )

  const value = useMemo<UIContextValue>(
    () => ({
      openNewLead: () => setNewLeadOpen(true),
      openLead: (lead: Lead, readOnly = false) => setDetail({ lead, readOnly }),
      toast,
    }),
    [toast],
  )

  return (
    <UIContext.Provider value={value}>
      {children}
      <NewLeadDialog open={newLeadOpen} onClose={() => setNewLeadOpen(false)} />
      <LeadDetailDialog
        lead={detail?.lead ?? null}
        readOnly={detail?.readOnly ?? false}
        onClose={() => setDetail(null)}
        onToast={toast}
      />
      <div className="pointer-events-none fixed bottom-5 right-5 z-[60] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`animate-fade-up pointer-events-auto rounded-lg border px-4 py-3 text-xs font-medium shadow-lg ${
              t.tone === "success"
                ? "border-accent/40 bg-panel-2 text-accent"
                : t.tone === "error"
                  ? "border-danger/40 bg-panel-2 text-danger"
                  : "border-line bg-panel-2 text-foreground"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </UIContext.Provider>
  )
}
