import { create } from 'zustand'

const KEY = 'apex-favouriteVersionIds'

function isTauri(): boolean {
  return typeof window !== 'undefined' && !!(window as unknown as { __TAURI__?: unknown }).__TAURI__
}

function getFromStorage(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveToStorage(ids: string[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY, JSON.stringify(ids))
}

type State = {
  ids: string[]
  hydrated: boolean
  hydrate: () => Promise<void>
  toggle: (id: string) => Promise<void>
  isFavourite: (id: string) => boolean
}

export const useFavouritesStore = create<State>((set, get) => ({
  ids: isTauri() ? [] : getFromStorage(),
  hydrated: !isTauri(),

  hydrate: async () => {
    if (get().hydrated) return
    if (!isTauri()) {
      set({ ids: getFromStorage(), hydrated: true })
      return
    }
    try {
      const { load } = await import('@tauri-apps/plugin-store')
      const store = await load('apex-favs.bin', { autoSave: false, defaults: {} })
      const existing = (await store.get(KEY)) as string[] | null
      set({ ids: existing || [], hydrated: true })
    } catch {
      set({ ids: getFromStorage(), hydrated: true })
    }
  },

  toggle: async (id: string) => {
    if (!get().hydrated) await get().hydrate()
    const prev = get().ids
    const setIds = new Set(prev)
    if (setIds.has(id)) setIds.delete(id)
    else setIds.add(id)
    const next = Array.from(setIds)
    if (!isTauri()) {
      saveToStorage(next)
      set({ ids: next })
      return
    }
    try {
      const { load } = await import('@tauri-apps/plugin-store')
      const store = await load('apex-favs.bin', { autoSave: false, defaults: {} })
      await store.set(KEY, next)
      await store.save()
      set({ ids: next })
    } catch {
      saveToStorage(next)
      set({ ids: next })
    }
  },

  isFavourite: (id: string) => get().ids.includes(id),
}))
