import { create } from 'zustand'

const LS_PREFIX = 'apex-internal-'

function isTauri(): boolean {
  return typeof window !== 'undefined' && !!(window as unknown as { __TAURI__?: unknown }).__TAURI__
}

function defaultBasePath(): string {
  if (typeof window === 'undefined') return ''
  // In Tauri, we use %LOCALAPPDATA%\Apex (resolved by Rust); fallback for SSR/browser
  return '%LOCALAPPDATA%/Apex'
}

function getStored(key: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback
  return localStorage.getItem(LS_PREFIX + key) ?? fallback
}

function setStored(key: string, value: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(LS_PREFIX + key, value)
}

export type DownloadStatus = 'not-downloaded' | 'downloading' | 'ready' | 'error'

type InternalFileEntry = {
  path: string
  status: DownloadStatus
  error?: string
}

type State = {
  backend: InternalFileEntry
  gameserver: InternalFileEntry
  redirect: InternalFileEntry
  setPath: (key: 'backend' | 'gameserver' | 'redirect', path: string) => void
  setStatus: (key: 'backend' | 'gameserver' | 'redirect', status: DownloadStatus, error?: string) => void
  downloadComponent: (key: 'backend' | 'gameserver' | 'redirect') => Promise<void>
}

const GITHUB_URLS = {
  backend: 'https://github.com/Lawin0129/LawinServer',
  gameserver: 'https://github.com/plooshi/Erbium',
  redirect: 'https://github.com/plooshi/Tellurium',
} as const

const DOWNLOAD_URLS = {
  backend: 'https://github.com/Lawin0129/LawinServer/archive/refs/heads/main.zip',
  gameserver: 'https://github.com/plooshi/Erbium/archive/refs/heads/main.zip',
  redirect: 'https://github.com/plooshi/Tellurium/archive/refs/heads/main.zip',
} as const

export { GITHUB_URLS }

export const useInternalFilesStore = create<State>((set, get) => ({
  backend: {
    path: getStored('backend-path', defaultBasePath() + '/backend'),
    status: 'not-downloaded',
  },
  gameserver: {
    path: getStored('gameserver-path', defaultBasePath() + '/gameserver'),
    status: 'not-downloaded',
  },
  redirect: {
    path: getStored('redirect-path', defaultBasePath() + '/redirect'),
    status: 'not-downloaded',
  },

  setPath: (key, path) => {
    setStored(key + '-path', path)
    set((s) => ({ [key]: { ...s[key], path } }))
  },

  setStatus: (key, status, error) => {
    set((s) => ({ [key]: { ...s[key], status, error } }))
  },

  downloadComponent: async (key) => {
    const { setStatus, setPath } = get()
    setStatus(key, 'downloading')

    if (!isTauri()) {
      await new Promise((r) => setTimeout(r, 1500))
      const url = DOWNLOAD_URLS[key]
      window.open(url, '_blank')
      setStatus(key, 'ready')
      console.log(`[Apex] Would auto-download ${key} from ${url}`)
      return
    }

    try {
      const { invoke } = await import('@tauri-apps/api/core')
      const entry = get()[key]
      const dest = entry.path && !entry.path.includes('%') ? entry.path : ''
      await invoke('download_component', {
        component: key,
        url: DOWNLOAD_URLS[key],
        dest,
      })
      setStatus(key, 'ready')
      // Update stored path with actual destination
      try {
        const base = await invoke<string>('resolve_app_data_path')
        setPath(key, `${base}/${key}`.replace(/\/+/g, '/'))
      } catch {
        // Keep existing path if resolve fails
      }
    } catch (e) {
      setStatus(key, 'error', String(e))
    }
  },
}))
