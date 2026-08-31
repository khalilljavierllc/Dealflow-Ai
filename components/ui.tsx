import type { ButtonHTMLAttributes, ReactNode } from "react"
import { cn } from "@/lib/utils"

/* -------------------------------- Button -------------------------------- */
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger"
  size?: "sm" | "md"
}

export function Button({
  variant = "secondary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:cursor-not-allowed disabled:opacity-50",
        size === "md" ? "px-4 py-2.5 text-sm" : "px-3 py-1.5 text-xs",
        variant === "primary" &&
          "bg-primary text-primary-foreground hover:bg-primary/90",
        variant === "secondary" &&
          "border border-line bg-panel-2 text-foreground hover:bg-elevated",
        variant === "ghost" && "text-muted hover:bg-elevated hover:text-foreground",
        variant === "danger" &&
          "border border-danger/40 bg-danger/10 text-danger hover:bg-danger/20",
        className,
      )}
      {...props}
    />
  )
}

/* --------------------------------- Card --------------------------------- */
export function Card({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-line bg-panel p-5",
        className,
      )}
    >
      {children}
    </div>
  )
}

export function CardTitle({
  children,
  hint,
}: {
  children: ReactNode
  hint?: ReactNode
}) {
  return (
    <h3 className="mb-4 flex items-baseline gap-2 text-[15px] font-semibold">
      {children}
      {hint ? (
        <span className="text-xs font-normal text-muted">{hint}</span>
      ) : null}
    </h3>
  )
}

/* -------------------------------- Badge --------------------------------- */
type BadgeTone = "default" | "hot" | "warm" | "cold" | "success" | "danger"

export function Badge({
  tone = "default",
  children,
  className,
}: {
  tone?: BadgeTone
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        tone === "default" && "bg-primary/15 text-primary",
        tone === "hot" && "bg-success/15 text-success",
        tone === "warm" && "bg-warning/15 text-warning",
        tone === "cold" && "bg-elevated text-muted",
        tone === "success" && "bg-accent/15 text-accent",
        tone === "danger" && "bg-danger/15 text-danger",
        className,
      )}
    >
      {children}
    </span>
  )
}

/* --------------------------------- Meter -------------------------------- */
export function Meter({ value }: { value: number }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-elevated">
      <div
        className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-[width] duration-500"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  )
}

/* ------------------------------ Score badge ----------------------------- */
export function ScoreDial({
  score,
  size = 64,
}: {
  score: number
  size?: number
}) {
  const stroke = 6
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(100, score)) / 100
  const color =
    score >= 80 ? "#4ade80" : score >= 60 ? "#fbbf24" : "#fb7185"
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#1f2b3b"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct)}
          className="transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-lg font-black">
        {score}
      </span>
    </div>
  )
}

/* -------------------------------- Spinner ------------------------------- */
export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block h-4 w-4 rounded-full border-2 border-line border-t-primary",
        "[animation:dfSpin_0.7s_linear_infinite]",
        className,
      )}
      aria-hidden="true"
    />
  )
}

/* ------------------------------ Empty state ----------------------------- */
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line bg-panel/50 px-6 py-16 text-center">
      {icon ? (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-elevated text-primary">
          {icon}
        </div>
      ) : null}
      <p className="text-base font-semibold">{title}</p>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}

/* ------------------------------ Field label ----------------------------- */
export function Field({
  label,
  children,
  className,
  hint,
}: {
  label: string
  children: ReactNode
  className?: string
  hint?: string
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 flex items-center justify-between text-[11px] font-medium text-muted">
        {label}
        {hint ? <span className="text-muted-foreground">{hint}</span> : null}
      </span>
      {children}
    </label>
  )
}

export const inputClass =
  "w-full rounded-lg border border-line bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
