import { Info } from "lucide-react"

export function SampleBanner() {
  return (
    <div className="mb-5 flex items-start gap-3 rounded-xl border border-primary/25 bg-primary/10 p-3.5 text-sm">
      <Info size={17} className="mt-0.5 shrink-0 text-primary" />
      <p className="text-pretty text-foreground/90">
        <span className="font-semibold">Showing sample data.</span>{" "}
        <span className="text-muted">
          These demo leads are read-only. Add your first lead to start tracking
          real deals — your data is saved in this browser.
        </span>
      </p>
    </div>
  )
}
