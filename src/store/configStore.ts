import { create } from 'zustand'

const LS_KEY = 'apex-config'

export type ServerConfig = {
  backendHost: string
  backendPort: number
  gameserverHost: string
  gameserverPort: number
  redirectHost: string
  redirectPort: number
  launchArgs: string
  showConsole: boolean
  autoStartBackend: boolean
  /** Extra DLLs to inject (paths). Injected after redirect, in order. */
  extraDllPaths: string[]
}

const DEFAULTS: ServerConfig = {
  backendHost: '127.0.0.1',
  backendPort: 3551,
  gameserverHost: '127.0.0.1',
  gameserverPort: 7777,
  redirectHost: '127.0.0.1',
  redirectPort: 443,
  launchArgs: '',
  showConsole: false,
  autoStartBackend: true,
  extraDllPaths: [],
}

function loadConfig(): ServerConfig {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return { ...DEFAULTS }
    return { ...DEFAULTS, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULTS }
  }
}

function saveConfig(config: ServerConfig) {
  localStorage.setItem(LS_KEY, JSON.stringify(config))
}

type State = ServerConfig & {
  update: (partial: Partial<ServerConfig>) => void
  reset: () => void
}

export const useConfigStore = create<State>((set, get) => ({
  ...loadConfig(),

  update: (partial) => {
    const next = { ...get(), ...partial }
    saveConfig(next)
    set(partial)
  },

  reset: () => {
    saveConfig(DEFAULTS)
    set(DEFAULTS)
  },
}))
