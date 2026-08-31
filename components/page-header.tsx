import type { ReactNode } from "react"

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow: string
  title: string
  subtitle?: string
  actions?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
          {eyebrow}
        </p>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-balance sm:text-3xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-muted text-pretty">{subtitle}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  )
}
