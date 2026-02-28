import { create } from 'zustand'
import type { DownloadLinkMap } from '../lib/downloadLinks'
import { scrapeLinksFromReadmeMarkdown } from '../lib/downloadLinks'

const STORE_PATH = 'apex-links.bin'
const KEY = 'downloadLinkMap'
const LOCALSTORAGE_KEY = 'apex-downloadLinkMap'

function isTauri(): boolean {
  return typeof window !== 'undefined' && !!(window as unknown as { __TAURI__?: unknown }).__TAURI__
}

function getFromStorage(): DownloadLinkMap {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(LOCALSTORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveToStorage(map: DownloadLinkMap): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(map))
}

type State = {
  linkMap: DownloadLinkMap
  hydrated: boolean
  hydrate: () => Promise<void>
  refreshFromGitHub: () => Promise<void>
}

export const useLinkStore = create<State>((set, get) => ({
  linkMap: isTauri() ? {} : getFromStorage(),
  hydrated: !isTauri(),

  hydrate: async () => {
    if (get().hydrated) return
    if (!isTauri()) {
      set({ linkMap: getFromStorage(), hydrated: true })
      return
    }
    try {
      const { load } = await import('@tauri-apps/plugin-store')
      const store = await load(STORE_PATH, { autoSave: false, defaults: {} })
      const existing = (await store.get(KEY)) as DownloadLinkMap | null
      set({ linkMap: existing || {}, hydrated: true })
    } catch {
      set({ linkMap: getFromStorage(), hydrated: true })
    }
  },

  refreshFromGitHub: async () => {
    const res = await fetch(
      'https://raw.githubusercontent.com/llamaqwerty/fortnite-builds-archive/main/README.md',
      { cache: 'no-store' },
    )
    if (!res.ok) throw new Error(`Failed to fetch README: ${res.status}`)

    const md = await res.text()
    const map = scrapeLinksFromReadmeMarkdown(md)
    console.log(`[Apex] Scraped ${Object.keys(map).length} mirror keys from README`)

    if (!isTauri()) {
      saveToStorage(map)
      set({ linkMap: map })
      return
    }
    try {
      const { load } = await import('@tauri-apps/plugin-store')
      const store = await load(STORE_PATH, { autoSave: false, defaults: {} })
      await store.set(KEY, map)
      await store.save()
      set({ linkMap: map })
    } catch {
      saveToStorage(map)
      set({ linkMap: map })
    }
  },
}))
