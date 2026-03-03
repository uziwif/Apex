import { create } from 'zustand'

export type DownloadStatus = 'queued' | 'downloading' | 'extracting' | 'paused' | 'completed' | 'canceled' | 'error'

export type DownloadItem = {
  versionId: string
  url: string
  status: DownloadStatus
  bytesDownloaded: number
  totalBytes: number | null
  speedBps: number
  error?: string
}

function isTauri(): boolean {
  return typeof window !== 'undefined' && !!(window as unknown as { __TAURI__?: unknown }).__TAURI__
}

type DownloadProgressPayload = {
  version_id: string
  bytes_downloaded: number
  total_bytes: number | null
  speed_bps: number
}

type State = {
  active: Record<string, DownloadItem>
  initialized: boolean
  initListeners: () => Promise<void>
  startDownload: (versionId: string, url: string) => Promise<void>
  pause: (versionId: string) => Promise<void>
  resume: (versionId: string) => Promise<void>
  cancel: (versionId: string) => Promise<void>
}

export const useDownloadStore = create<State>((set, get) => ({
  active: {},
  initialized: false,

  initListeners: async () => {
    if (get().initialized) return

    if (isTauri()) {
      const { listen } = await import('@tauri-apps/api/event')
      await listen<DownloadProgressPayload>('download_progress', (event) => {
        const p = event.payload
        set((s) => {
          const prev = s.active[p.version_id]
          if (!prev) return s
          return {
            active: {
              ...s.active,
              [p.version_id]: {
                ...prev,
                status: 'downloading',
                bytesDownloaded: p.bytes_downloaded,
                totalBytes: p.total_bytes,
                speedBps: p.speed_bps,
              },
            },
          }
        })
      })
    }

    set({ initialized: true })
  },

  startDownload: async (versionId: string, url: string, installRoot?: string) => {
    await get().initListeners()

    set((s) => ({
      active: {
        ...s.active,
        [versionId]: {
          versionId,
          url,
          status: 'queued',
          bytesDownloaded: 0,
          totalBytes: null,
          speedBps: 0,
        },
      },
    }))

    if (!isTauri()) {
      const totalBytes = 1024 * 1024 * 500 + Math.random() * 1024 * 1024 * 1500
      let downloaded = 0
      const interval = setInterval(() => {
        const chunk = Math.random() * 1024 * 1024 * 25
        downloaded = Math.min(downloaded + chunk, totalBytes)
        const speed = chunk * (1000 / 200)
        set((s) => {
          const prev = s.active[versionId]
          if (!prev || prev.status === 'canceled' || prev.status === 'paused') {
            clearInterval(interval)
            return s
          }
          if (downloaded >= totalBytes) {
            clearInterval(interval)
            const extracting = { ...prev, status: 'extracting' as const, bytesDownloaded: totalBytes, totalBytes, speedBps: 0 }
            setTimeout(async () => {
              try {
                const { useInstalledStore } = await import('../store/installedStore')
                useInstalledStore.getState().setInstalled(versionId, true)
                const { useToastStore } = await import('../store/toastStore')
                useToastStore.getState().add(`${versionId} downloaded & added to Library`, 'success')
              } catch {}
              set((s2) => ({
                active: {
                  ...s2.active,
                  [versionId]: { ...extracting, status: 'completed' },
                },
              }))
            }, 2000)
            return { active: { ...s.active, [versionId]: extracting } }
          }
          return {
            active: {
              ...s.active,
              [versionId]: { ...prev, status: 'downloading', bytesDownloaded: downloaded, totalBytes, speedBps: speed },
            },
          }
        })
      }, 200)
      return
    }

    try {
      const { invoke } = await import('@tauri-apps/api/core')
      const root = installRoot ?? (await import('../store/installedStore')).useInstalledStore.getState().installRoot
      if (!root?.trim()) {
        set((s) => ({
          active: {
            ...s.active,
            [versionId]: {
              ...(s.active[versionId] || { versionId, url, status: 'error' as const, bytesDownloaded: 0, totalBytes: null, speedBps: 0 }),
              status: 'error',
              error: 'Install directory not set. Go to Settings to configure it.',
            },
          },
        }))
        return
      }
      await invoke('download_version', { versionId, url, installRoot: root })
      set((s) => {
        const prev = s.active[versionId]
        if (!prev) return s
        return {
          active: {
            ...s.active,
            [versionId]: { ...prev, status: 'completed', bytesDownloaded: prev.totalBytes ?? prev.bytesDownloaded, speedBps: 0 },
          },
        },
      })
      const { useInstalledStore } = await import('../store/installedStore')
      useInstalledStore.getState().setInstalled(versionId, true)
      const { useToastStore } = await import('../store/toastStore')
      useToastStore.getState().add(`${versionId} downloaded & added to Library`, 'success')
    } catch (e) {
      set((s) => ({
        active: {
          ...s.active,
          [versionId]: {
            ...(s.active[versionId] || {
              versionId,
              url,
              status: 'error' as const,
              bytesDownloaded: 0,
              totalBytes: null,
              speedBps: 0,
            }),
            status: 'error',
            error: String(e),
          },
        },
      }))
    }
  },

  pause: async (versionId: string) => {
    if (isTauri()) {
      const { invoke } = await import('@tauri-apps/api/core')
      await invoke('pause_download', { versionId })
    }
    set((s) => {
      const prev = s.active[versionId]
      if (!prev) return s
      return { active: { ...s.active, [versionId]: { ...prev, status: 'paused' } } }
    })
  },

  resume: async (versionId: string) => {
    if (isTauri()) {
      const { invoke } = await import('@tauri-apps/api/core')
      await invoke('resume_download', { versionId })
    }
    set((s) => {
      const prev = s.active[versionId]
      if (!prev) return s
      return { active: { ...s.active, [versionId]: { ...prev, status: 'downloading' } } }
    })
  },

  cancel: async (versionId: string) => {
    if (isTauri()) {
      const { invoke } = await import('@tauri-apps/api/core')
      await invoke('cancel_download', { versionId })
    }
    set((s) => {
      const next = { ...s.active }
      delete next[versionId]
      return { active: next }
    })
  },
}))
