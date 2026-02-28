import { create } from 'zustand'

const INSTALL_ROOT_KEY = 'apex-install-root'
const INSTALLED_IDS_KEY = 'apex-installed-version-ids'
const CUSTOM_PATHS_KEY = 'apex-installed-custom-paths'

function getStoredInstallRoot(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem(INSTALL_ROOT_KEY) ?? ''
}

function setStoredInstallRoot(value: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(INSTALL_ROOT_KEY, value)
}

function getStoredInstalledIds(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(INSTALLED_IDS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function setStoredInstalledIds(ids: string[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(INSTALLED_IDS_KEY, JSON.stringify(ids))
}

function getStoredCustomPaths(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(CUSTOM_PATHS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

function setStoredCustomPaths(m: Record<string, string>): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(CUSTOM_PATHS_KEY, JSON.stringify(m))
}

type State = {
  installRoot: string
  installedVersionIds: string[]
  customPaths: Record<string, string>
  setInstallRoot: (path: string) => void
  setInstalled: (versionId: string, installed: boolean) => void
  setInstallPath: (versionId: string, path: string) => void
  getInstallPath: (versionId: string) => string
  isInstalled: (versionId: string) => boolean
  registerInstalled: (versionId: string, path?: string) => void
}

export const useInstalledStore = create<State>((set, get) => ({
  installRoot: getStoredInstallRoot(),
  installedVersionIds: getStoredInstalledIds(),
  customPaths: getStoredCustomPaths(),

  setInstallRoot: (path: string) => {
    setStoredInstallRoot(path)
    set({ installRoot: path })
  },

  setInstallPath: (versionId: string, path: string) => {
    set((s) => {
      const next = { ...s.customPaths, [versionId]: path }
      setStoredCustomPaths(next)
      return { customPaths: next }
    })
  },

  setInstalled: (versionId: string, installed: boolean) => {
    set((s) => {
      const next = installed
        ? s.installedVersionIds.includes(versionId)
          ? s.installedVersionIds
          : [...s.installedVersionIds, versionId]
        : s.installedVersionIds.filter((id) => id !== versionId)
      if (!installed) {
        const { [versionId]: _, ...rest } = s.customPaths
        setStoredCustomPaths(rest)
        setStoredInstalledIds(next)
        return { installedVersionIds: next, customPaths: rest }
      }
      setStoredInstalledIds(next)
      return { installedVersionIds: next }
    })
  },

  getInstallPath: (versionId: string) => {
    const custom = get().customPaths[versionId]
    if (custom) return custom
    const root = get().installRoot.trim()
    if (!root) return ''
    return `${root.replace(/[/\\]+$/, '')}/${versionId}`
  },

  isInstalled: (versionId: string) => get().installedVersionIds.includes(versionId),

  registerInstalled: (versionId: string, path?: string) => {
    const ids = get().installedVersionIds
    if (ids.includes(versionId)) return
    const next = [...ids, versionId]
    setStoredInstalledIds(next)
    set((s) => {
      const nextPaths = path ? { ...s.customPaths, [versionId]: path } : s.customPaths
      if (path) setStoredCustomPaths(nextPaths)
      return { installedVersionIds: next, customPaths: nextPaths }
    })
  },
}))
