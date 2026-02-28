import { create } from 'zustand'

const LS_KEY = 'apex-build-notes'

type State = {
  notes: Record<string, string>
  setNote: (versionId: string, note: string) => void
  getNote: (versionId: string) => string
}

function load(): Record<string, string> {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

function save(notes: Record<string, string>) {
  localStorage.setItem(LS_KEY, JSON.stringify(notes))
}

export const useBuildNotesStore = create<State>((set, get) => ({
  notes: load(),
  setNote: (versionId, note) => set((state) => {
    const next = { ...state.notes }
    if (note.trim()) next[versionId] = note.trim()
    else delete next[versionId]
    save(next)
    return { notes: next }
  }),
  getNote: (versionId) => get().notes[versionId] ?? '',
}))
