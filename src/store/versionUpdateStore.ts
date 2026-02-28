import { create } from 'zustand'

const LS_KEY = 'apex-remote-versions'
const LS_TS_KEY = 'apex-remote-versions-ts'
const CHECK_INTERVAL = 1000 * 60 * 30 // 30 minutes

const REMOTE_URL = 'https://raw.githubusercontent.com/YOUR_USER/YOUR_REPO/main/versions.json'

type State = {
  remoteVersions: unknown[] | null
  lastChecked: number
  checking: boolean
  checkForUpdates: () => Promise<void>
}

export const useVersionUpdateStore = create<State>((set, get) => ({
  remoteVersions: null,
  lastChecked: Number(localStorage.getItem(LS_TS_KEY) || '0'),
  checking: false,

  checkForUpdates: async () => {
    const now = Date.now()
    if (now - get().lastChecked < CHECK_INTERVAL) return
    if (get().checking) return

    set({ checking: true })

    try {
      const res = await fetch(REMOTE_URL)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (Array.isArray(data)) {
        localStorage.setItem(LS_KEY, JSON.stringify(data))
        localStorage.setItem(LS_TS_KEY, String(now))
        set({ remoteVersions: data, lastChecked: now })
      }
    } catch {
      // silently fail, use bundled versions.json
    } finally {
      set({ checking: false })
    }
  },
}))
