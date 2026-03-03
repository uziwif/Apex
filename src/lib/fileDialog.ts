/**
 * Centralized file/directory picker with proper Tauri dialog support.
 * Falls back to prompt() when dialog fails (e.g. missing permissions) or in browser.
 */
export async function openDirectory(title: string, defaultPath?: string): Promise<string | null> {
  if (typeof window === 'undefined') return null
  const w = window as unknown as { __TAURI__?: unknown }
  if (w.__TAURI__) {
    try {
      const { open } = await import('@tauri-apps/plugin-dialog')
      const selected = await open({ directory: true, title, defaultPath: defaultPath ?? undefined })
      return selected != null ? (Array.isArray(selected) ? selected[0] : selected) : null
    } catch {
      // Fallback to prompt when dialog fails (e.g. permission denied)
    }
  }
  const input = prompt(title + ':', defaultPath ?? '')
  return input !== null && input.trim() ? input.trim() : null
}

export async function openFile(title: string, defaultPath?: string): Promise<string | null> {
  if (typeof window === 'undefined') return null
  const w = window as unknown as { __TAURI__?: unknown }
  if (w.__TAURI__) {
    try {
      const { open } = await import('@tauri-apps/plugin-dialog')
      const selected = await open({ directory: false, title, multiple: false, defaultPath: defaultPath ?? undefined })
      return selected != null ? (Array.isArray(selected) ? selected[0] : selected) : null
    } catch {
      // Fallback to prompt when dialog fails
    }
  }
  const input = prompt(title + ':', defaultPath ?? '')
  return input !== null && input.trim() ? input.trim() : null
}

/** Open file picker for DLL files only (.dll filter) */
export async function openDllFile(title: string = 'Select DLL file', defaultPath?: string): Promise<string | null> {
  if (typeof window === 'undefined') return null
  const w = window as unknown as { __TAURI__?: unknown }
  if (w.__TAURI__) {
    try {
      const { open } = await import('@tauri-apps/plugin-dialog')
      const selected = await open({
        directory: false,
        title,
        multiple: false,
        defaultPath: defaultPath ?? undefined,
        filters: [{ name: 'DLL files', extensions: ['dll'] }],
      })
      return selected != null ? (Array.isArray(selected) ? selected[0] : selected) : null
    } catch {
      // Fallback to prompt when dialog fails
    }
  }
  const input = prompt(title + ' (path to .dll):', defaultPath ?? '')
  return input !== null && input.trim() ? input.trim() : null
}

/** Open file picker for multiple DLL files */
export async function openDllFiles(title: string = 'Select DLL files', defaultPath?: string): Promise<string[]> {
  if (typeof window === 'undefined') return []
  const w = window as unknown as { __TAURI__?: unknown }
  if (w.__TAURI__) {
    try {
      const { open } = await import('@tauri-apps/plugin-dialog')
      const selected = await open({
        directory: false,
        title,
        multiple: true,
        defaultPath: defaultPath ?? undefined,
        filters: [{ name: 'DLL files', extensions: ['dll'] }],
      })
      if (selected == null) return []
      return Array.isArray(selected) ? selected : [selected]
    } catch {
      // Fallback: single file via prompt
      const input = prompt(title + ' (comma-separated paths):', defaultPath ?? '')
      if (input === null || !input.trim()) return []
      return input.split(',').map((s) => s.trim()).filter(Boolean)
    }
  }
  const input = prompt(title + ' (comma-separated paths):', defaultPath ?? '')
  if (input === null || !input.trim()) return []
  return input.split(',').map((s) => s.trim()).filter(Boolean)
}
