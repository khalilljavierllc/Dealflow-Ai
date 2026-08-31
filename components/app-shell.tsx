"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Plus } from "lucide-react"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { NAV_ITEMS } from "./nav-items"
import { useUI } from "./providers"

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { openNewLead } = useUI()

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href)

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-line bg-[#090e17] px-3 py-5 lg:flex">
        <Link href="/" className="mb-6 flex items-center gap-2 px-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-sm font-black text-white">
            ◆
          </span>
          <span className="text-lg font-extrabold tracking-tight">
            DealFlow
          </span>
          <span className="rounded-md border border-line px-1.5 py-0.5 text-[10px] font-semibold text-muted">
            AI
          </span>
        </Link>

        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors",
                  isActive(item.href)
                    ? "bg-elevated text-foreground"
                    : "text-muted hover:bg-elevated hover:text-foreground",
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <button
          onClick={openNewLead}
          className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus size={16} /> New Lead
        </button>

        <div className="mt-auto flex items-center gap-2 rounded-xl border border-line bg-panel p-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-bold text-white">
            KB
          </span>
          <div className="text-xs leading-tight">
            <p className="font-semibold">My Workspace</p>
            <p className="text-muted">Acquisitions</p>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-[#090e17]/90 px-4 py-3 backdrop-blur lg:hidden">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-xs font-black text-white">
            ◆
          </span>
          <span className="text-base font-extrabold tracking-tight">
            DealFlow <span className="text-primary">AI</span>
          </span>
        </Link>
        <button
          onClick={openNewLead}
          aria-label="New lead"
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
        >
          <Plus size={15} /> New
        </button>
      </header>

      {/* Main content */}
      <main className="px-4 pb-28 pt-5 lg:ml-60 lg:px-8 lg:pb-10 lg:pt-8">
        <div className="mx-auto max-w-[1400px]">{children}</div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-6 border-t border-line bg-[#090e17]/95 backdrop-blur lg:hidden">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium",
                active ? "text-primary" : "text-muted",
              )}
            >
              <Icon size={19} />
              <span className="max-w-full truncate px-0.5">
                {item.label.split(" ")[0]}
              </span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
