"use client"

import { useEffect, useSyncExternalStore } from "react"
import {
  getDisplayBuyers,
  getDisplayLeads,
  getState,
  hydrate,
  isUsingSampleLeads,
  subscribe,
} from "./store"

/**
 * Bridges the vanilla store to React. Hydration happens once on the client so
 * the server render (empty) matches the first client render, then fills in.
 */
export function useHydrateStore() {
  useEffect(() => {
    hydrate()
  }, [])
}

export function useStore() {
  useHydrateStore()
  const snapshot = useSyncExternalStore(
    subscribe,
    getState,
    () => getState(), // server snapshot (not hydrated)
  )
  return snapshot
}

export function useLeads() {
  const { hydrated } = useStore()
  return {
    hydrated,
    leads: getDisplayLeads(),
    isSample: isUsingSampleLeads(),
  }
}

export function useBuyers() {
  const { hydrated } = useStore()
  return {
    hydrated,
    buyers: getDisplayBuyers(),
    isSample: isUsingSampleLeads(),
  }
}
