import {
  LayoutDashboard,
  Users,
  KanbanSquare,
  Calculator,
  Building2,
  Sparkles,
  type LucideIcon,
} from "lucide-react"

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Command Center", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/pipeline", label: "Pipeline", icon: KanbanSquare },
  { href: "/analyzer", label: "Deal Analyzer", icon: Calculator },
  { href: "/buyers", label: "Buyers", icon: Building2 },
  { href: "/copilot", label: "AI Copilot", icon: Sparkles },
]
