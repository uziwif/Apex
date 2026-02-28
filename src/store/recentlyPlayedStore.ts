import { create } from 'zustand'

const LS_KEY = 'apex-recently-played'
const MAX = 8

type Entry = { versionId: string; timestamp: number }

type State = {
  entries: Entry[]
  addPlay: (versionId: string) => void
}

function load(): Entry[] {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function save(entries: Entry[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(entries))
}

export const useRecentlyPlayedStore = create<State>((set) => ({
  entries: load(),
  addPlay: (versionId) => set((state) => {
    const filtered = state.entries.filter((e) => e.versionId !== versionId)
    const next = [{ versionId, timestamp: Date.now() }, ...filtered].slice(0, MAX)
    save(next)
    return { entries: next }
  }),
}))
