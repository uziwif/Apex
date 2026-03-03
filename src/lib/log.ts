/**
 * Simple logging that writes to %LOCALAPPDATA%\Apex\logs\apex.log when running in Tauri.
 */
export async function log(message: string): Promise<void> {
  if (typeof window === 'undefined') return
  const w = window as unknown as { __TAURI__?: unknown }
  if (!w.__TAURI__) return
  try {
    const { invoke } = await import('@tauri-apps/api/core')
    await invoke('append_log', { message })
  } catch {
    // Ignore log failures
  }
}
