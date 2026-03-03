import { useInstalledStore } from '../store/installedStore'
import { useInternalFilesStore } from '../store/internalFilesStore'
import { useConfigStore } from '../store/configStore'
import { useToastStore } from '../store/toastStore'
import { useRecentlyPlayedStore } from '../store/recentlyPlayedStore'

function isTauri(): boolean {
  if (typeof window === 'undefined') return false
  const w = window as unknown as { __TAURI__?: unknown; __TAURI_INTERNALS__?: unknown }
  return !!(w.__TAURI__ ?? w.__TAURI_INTERNALS__)
}

export function getShippingExePath(versionId: string): string {
  const root = useInstalledStore.getState().getInstallPath(versionId)
  if (!root) return ''
  return `${root}/FortniteGame/Binaries/Win64/FortniteClient-Win64-Shipping.exe`.replace(/\/+/g, '/')
}

export function checkLaunchReady(): string | null {
  const installRoot = useInstalledStore.getState().installRoot
  if (!installRoot) return 'Install directory is not set. Go to Settings to configure it.'
  return null
}

export async function launchVersion(versionId: string): Promise<void> {
  const toast = useToastStore.getState().add

  const guard = checkLaunchReady()
  if (guard) {
    toast(guard, 'error')
    return
  }

  const installPath = useInstalledStore.getState().getInstallPath(versionId)
  if (!installPath) {
    toast('Version is not installed. Download it first.', 'error')
    return
  }

  const files = useInternalFilesStore.getState()
  const config = useConfigStore.getState()

  useRecentlyPlayedStore.getState().addPlay(versionId)

  try {
    const { invoke } = await import('@tauri-apps/api/core')
    await invoke('launch_game', {
      gamePath: installPath,
      backendPath: files.backend.path || '',
      redirectPath: files.redirect.path || '',
      gameserverPath: files.gameserver.path || '',
      backendHost: config.backendHost,
      backendPort: config.backendPort,
      extraDllPaths: config.extraDllPaths ?? [],
    })
    toast(`Launched ${versionId}`, 'success')
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    if (!isTauri() && (msg.includes('__TAURI__') || msg.includes('invoke') || msg.includes('not defined'))) {
      toast(`[Dev] Would launch ${versionId} → ${config.backendHost}:${config.backendPort}`, 'info')
    } else {
      toast(`Launch failed: ${msg}`, 'error')
    }
  }
}

export async function closeGame(): Promise<void> {
  const toast = useToastStore.getState().add
  try {
    const { invoke } = await import('@tauri-apps/api/core')
    await invoke('close_game')
    toast('Game closed', 'success')
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    if (!isTauri()) {
      toast('[Dev] Would close all Fortnite processes', 'info')
    } else {
      toast(`Failed to close game: ${msg}`, 'error')
    }
  }
}
