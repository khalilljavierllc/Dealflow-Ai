"use client"

import { analyzeDeal, temperatureFromScore } from "./analyzer"
import { SAMPLE_BUYERS, SAMPLE_LEADS } from "./sample-data"
import type { AnalyzerInput, Buyer, Lead, Stage } from "./types"

/**
 * Client-side data layer.
 *
 * Today this persists to localStorage so leads survive refreshes. The public
 * API (getState / addLead / updateLead / ...) is intentionally storage-agnostic
 * so it can be swapped for Supabase queries later without touching components.
 */

const LEADS_KEY = "dealflow.leads.v1"
const BUYERS_KEY = "dealflow.buyers.v1"

interface StoreState {
  leads: Lead[]
  buyers: Buyer[]
  hydrated: boolean
}

let state: StoreState = { leads: [], buyers: [], hydrated: false }
const listeners = new Set<() => void>()

function emit() {
  for (const l of listeners) l()
}

function persist() {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(LEADS_KEY, JSON.stringify(state.leads))
    window.localStorage.setItem(BUYERS_KEY, JSON.stringify(state.buyers))
  } catch {
    // storage may be unavailable (private mode / quota) — fail silently
  }
}

/** Load from localStorage. Called once on the client. */
export function hydrate() {
  if (typeof window === "undefined" || state.hydrated) return
  try {
    const rawLeads = window.localStorage.getItem(LEADS_KEY)
    const rawBuyers = window.localStorage.getItem(BUYERS_KEY)
    state = {
      leads: rawLeads ? (JSON.parse(rawLeads) as Lead[]) : [],
      buyers: rawBuyers ? (JSON.parse(rawBuyers) as Buyer[]) : [],
      hydrated: true,
    }
  } catch {
    state = { leads: [], buyers: [], hydrated: true }
  }
  emit()
}

export function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getState(): StoreState {
  return state
}

/** True when the user has no real leads and we should show demo data. */
export function isUsingSampleLeads(): boolean {
  return state.hydrated && state.leads.length === 0
}

/** Effective leads for display: real leads, or sample data as a fallback. */
export function getDisplayLeads(): Lead[] {
  if (!state.hydrated) return []
  return state.leads.length > 0 ? state.leads : SAMPLE_LEADS
}

export function getDisplayBuyers(): Buyer[] {
  if (!state.hydrated) return []
  return state.buyers.length > 0 ? state.buyers : SAMPLE_BUYERS
}

function uid() {
  return `lead_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

export type NewLeadInput = {
  sellerName: string
  phone?: string
  email?: string
  address: string
  city: string
  state: string
  propertyType?: string
  beds?: number
  baths?: number
  sqft?: number
  yearBuilt?: number
  condition?: Lead["condition"]
  askingPrice?: number
  estimatedValue?: number
  motivation?: string
  motivationSignals?: string[]
  timeline?: Lead["timeline"]
  targetFee?: number
}

export function analyzeInput(input: AnalyzerInput) {
  return analyzeDeal(input)
}

export function addLead(input: NewLeadInput): Lead {
  const analysis = analyzeDeal({
    arv: input.estimatedValue,
    askingPrice: input.askingPrice,
    sqft: input.sqft,
    condition: input.condition,
    motivationSignals: input.motivationSignals,
    timeline: input.timeline,
    targetFee: input.targetFee,
  })
  const now = new Date().toISOString()
  const lead: Lead = {
    id: uid(),
    sellerName: input.sellerName || "New Seller",
    phone: input.phone,
    email: input.email,
    address: input.address || "Unknown address",
    city: input.city || "",
    state: input.state || "",
    propertyType: input.propertyType,
    beds: input.beds,
    baths: input.baths,
    sqft: input.sqft,
    yearBuilt: input.yearBuilt,
    condition: input.condition,
    askingPrice: input.askingPrice,
    estimatedValue: input.estimatedValue,
    motivation: input.motivation ?? "",
    motivationSignals: input.motivationSignals ?? [],
    timeline: input.timeline,
    stage: "new",
    temperature: temperatureFromScore(analysis.score),
    analysis,
    createdAt: now,
    updatedAt: now,
  }
  state = { ...state, leads: [lead, ...state.leads] }
  persist()
  emit()
  return lead
}

export function updateLead(id: string, patch: Partial<Lead>) {
  state = {
    ...state,
    leads: state.leads.map((l) =>
      l.id === id ? { ...l, ...patch, updatedAt: new Date().toISOString() } : l,
    ),
  }
  persist()
  emit()
}

export function setStage(id: string, stage: Stage) {
  updateLead(id, { stage })
}

export function reanalyzeLead(id: string) {
  const lead = state.leads.find((l) => l.id === id)
  if (!lead) return
  const analysis = analyzeDeal({
    arv: lead.estimatedValue,
    askingPrice: lead.askingPrice,
    sqft: lead.sqft,
    condition: lead.condition,
    motivationSignals: lead.motivationSignals,
    timeline: lead.timeline,
  })
  updateLead(id, {
    analysis,
    temperature: temperatureFromScore(analysis.score),
  })
}

export function deleteLead(id: string) {
  state = { ...state, leads: state.leads.filter((l) => l.id !== id) }
  persist()
  emit()
}

export function addBuyer(input: Omit<Buyer, "id" | "createdAt">): Buyer {
  const buyer: Buyer = {
    ...input,
    id: `buyer_${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
  }
  state = { ...state, buyers: [buyer, ...state.buyers] }
  persist()
  emit()
  return buyer
}

/** Wipe all user data (leads + buyers) and return to sample data. */
export function resetAll() {
  state = { ...state, leads: [], buyers: [] }
  persist()
  emit()
}
