import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Sidebar from '../components/Sidebar'
import AnimatedBackground from '../components/AnimatedBackground'
import versions from '../data/versions.json'
import DownloadMirrorModal from '../components/DownloadMirrorModal'
import ImportModal from '../components/ImportModal'
import VersionDetailModal from '../components/VersionDetailModal'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { useLinkStore } from '../store/linkStore'
import { getKeysForVersion } from '../lib/downloadLinks'
import { useDownloadStore } from '../store/downloadStore'
import VersionCard from '../components/VersionCard'
import { useFavouritesStore } from '../store/favouritesStore'
import { useInstalledStore } from '../store/installedStore'
import { useToastStore } from '../store/toastStore'
import { launchVersion } from '../lib/launch'
import { useThemeStore, formatGroupName } from '../store/themeStore'

type SortMode = 'oldest' | 'newest'

export default function Library() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { hydrate, refreshFromGitHub, linkMap, hydrated } = useLinkStore()
  const startDownload = useDownloadStore((s) => s.startDownload)
  const favHydrate = useFavouritesStore((s) => s.hydrate)
  const favHydrated = useFavouritesStore((s) => s.hydrated)
  const favIds = useFavouritesStore((s) => s.ids)
  const toggleFavourite = useFavouritesStore((s) => s.toggle)
  const isFavourite = (id: string) => favIds.includes(id)
  const isInstalled = useInstalledStore((s) => s.isInstalled)
  const setInstalled = useInstalledStore((s) => s.setInstalled)
  const installRoot = useInstalledStore((s) => s.installRoot)
  const addToast = useToastStore((s) => s.add)
  const [open, setOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [sortMode, setSortMode] = useState<SortMode>('oldest')
  const [favsOnly, setFavsOnly] = useState(false)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [sortOpen, setSortOpen] = useState(false)
  const groupFormat = useThemeStore((s) => s.groupFormat)

  useEffect(() => {
    void hydrate()
  }, [hydrate])

  useEffect(() => {
    void favHydrate()
  }, [favHydrate])

  useEffect(() => {
    if (!hydrated) return
    if (Object.keys(linkMap).length > 0) return
    void refreshFromGitHub().catch(() => {})
  }, [hydrated, linkMap, refreshFromGitHub])

  const byId = useMemo(() => {
    const m = new Map<string, (typeof versions)[number]>()
    for (const v of versions) m.set(v.id, v)
    return m
  }, [])

  const active = activeId ? byId.get(activeId) : undefined
  const mirrors = useMemo(() => {
    if (!active) return []
    const keys = getKeysForVersion(active.displayName)
    for (const key of keys) {
      const found = linkMap[key]
      if (found && found.length > 0) return found
    }
    return []
  }, [active, linkMap])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const base = versions.filter((v) => {
      const hit =
        q.length === 0 ||
        v.displayName.toLowerCase().includes(q) ||
        v.buildId.toLowerCase().includes(q) ||
        v.group.toLowerCase().includes(q) ||
        v.id.toLowerCase().includes(q)
      if (!hit) return false
      if (favsOnly) {
        if (!favHydrated) return false
        if (!isFavourite(v.id)) return false
      }
      return true
    })

    const sorted = [...base].sort((a, b) => {
      return sortMode === 'oldest' ? a.sortIndex - b.sortIndex : b.sortIndex - a.sortIndex
    })

    return sorted
  }, [query, favsOnly, sortMode, favIds, favHydrated])

  const groups = useMemo(() => {
    const out = new Map<string, (typeof versions)[number][]>();
    for (const v of filtered) {
      const g = v.group
      const list = out.get(g)
      if (list) list.push(v)
      else out.set(g, [v])
    }
    return out
  }, [filtered])

  const groupOrder = useMemo(() => {
    const order: string[] = []
    for (const v of versions) {
      if (!order.includes(v.group)) order.push(v.group)
    }
    return order
  }, [])

  const orderedGroups = useMemo(() => {
    const ordered = groupOrder
      .filter((g) => groups.has(g))
      .map((g) => {
        const items = [...groups.get(g)!].sort((a, b) => a.sortIndex - b.sortIndex)
        return { name: g, items }
      })

    return sortMode === 'oldest' ? ordered : [...ordered].reverse()
  }, [groupOrder, groups, sortMode])

  const isEmpty = orderedGroups.length === 0

  return (
    <div className="relative h-screen w-screen">
      <AnimatedBackground variant="app" />
      <div className="relative z-10 flex h-full w-full">
        <Sidebar />
        <div className="flex-1 overflow-y-auto p-6">
          <div className="text-2xl font-bold">{t('library.title')}</div>

          <div className="sticky top-0 z-20 mt-4 -mx-6 px-6 py-4">
            <div className="glass rounded-2xl p-4">
              <div className="flex flex-wrap items-center gap-3">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('library.search')}
                  className="h-10 flex-1 rounded-full border border-[color:var(--border)] bg-[rgba(255,255,255,0.03)] px-4 text-sm outline-none placeholder:text-[color:var(--text-secondary)]"
                />

                <div className="relative">
                  <button type="button" onClick={() => setSortOpen((o) => !o)}
                    className="h-10 flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[rgba(0,0,0,0.35)] px-4 text-sm text-white">
                    <span>{sortMode === 'oldest' ? t('library.oldestToNewest') : t('library.newestToOldest')}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50"><polyline points="6 9 12 15 18 9" /></svg>
                  </button>
                  <AnimatePresence>
                    {sortOpen && (
                      <>
                        <div className="fixed inset-0 z-30" onClick={() => setSortOpen(false)} />
                        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.12 }}
                          className="absolute right-0 top-12 z-40 w-48 rounded-xl border border-[color:var(--border)] bg-[#141414] p-1 shadow-xl" style={{ backdropFilter: 'blur(20px)' }}>
                          {([['oldest', t('library.oldestToNewest')], ['newest', t('library.newestToOldest')]] as [SortMode, string][]).map(([val, label]) => (
                            <button key={val} type="button"
                              onClick={() => { setSortMode(val); setSortOpen(false) }}
                              className={'w-full rounded-lg px-3 py-2 text-left text-sm transition ' + (sortMode === val ? 'bg-[rgba(255,255,255,0.08)] text-white font-medium' : 'text-[color:var(--text-secondary)] hover:bg-[rgba(255,255,255,0.04)] hover:text-white')}>
                              {label}
                            </button>
                          ))}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  className={
                    'h-10 rounded-full border px-4 text-sm font-semibold transition ' +
                    (favsOnly
                      ? 'border-[color:var(--accent)] bg-[rgba(59,130,246,0.15)]'
                      : 'border-[color:var(--border)] bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)]')
                  }
                  type="button"
                  onClick={() => setFavsOnly((v) => !v)}
                >
                  {t('library.favourites')}
                </button>

                <button
                  className="h-10 rounded-full border border-[color:var(--border)] bg-[rgba(255,255,255,0.03)] px-4 text-sm font-semibold hover:bg-[rgba(255,255,255,0.06)]"
                  type="button"
                  onClick={() => setImportOpen(true)}
                >
                  Import
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-4">
            {favsOnly && !favHydrated ? (
              <div className="glass rounded-2xl p-5 text-sm text-[color:var(--text-secondary)]">Loading favourites...</div>
            ) : null}

            {(!favsOnly || favHydrated) && isEmpty ? (
              <div className="glass rounded-2xl p-5 text-sm text-[color:var(--text-secondary)]">
                {favsOnly ? 'No favourites yet. Hover a version and click the star.' : 'No versions found.'}
              </div>
            ) : null}

            {orderedGroups.map((g) => {
              const isCollapsed = collapsed[g.name] ?? false
              return (
                <div key={g.name} className="glass rounded-2xl p-4">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between"
                    onClick={() => setCollapsed((s) => ({ ...s, [g.name]: !isCollapsed }))}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-semibold">{formatGroupName(g.name, groupFormat)}</div>
                      <div className="rounded-full border border-[color:var(--border)] bg-[rgba(255,255,255,0.03)] px-2 py-0.5 text-xs text-[color:var(--text-secondary)]">
                        {g.items.length}
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: isCollapsed ? 0 : 180 }}
                      transition={{ duration: 0.16, ease: 'easeOut' }}
                      className="text-[color:var(--text-secondary)]"
                    >
                      ^
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {!isCollapsed ? (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                          {g.items.map((v) => (
                            <VersionCard
                              key={v.id}
                              v={v}
                              installed={isInstalled(v.id)}
                              favourited={isFavourite(v.id)}
                              onToggleFavourite={() => {
                                void toggleFavourite(v.id)
                              }}
                              onPlay={() => void launchVersion(v.id)}
                              onDownload={() => {
                                if (!installRoot) {
                                  addToast('Set an install directory in Settings first', 'error')
                                  return
                                }
                                setActiveId(v.id)
                                setOpen(true)
                              }}
                              onOpenDirectory={() => {
                                const path = useInstalledStore.getState().getInstallPath(v.id)
                                if (!path) return
                                const isTauri = typeof window !== 'undefined' && '__TAURI__' in window
                                if (isTauri) {
                                  import('@tauri-apps/api/core').then(({ invoke }) => {
                                    void invoke('open_directory', { path })
                                  }).catch(() => {})
                                } else {
                                  alert(`[Dev] Would open directory:\n${path}`)
                                }
                              }}
                              onRemoveFromLibrary={() => setInstalled(v.id, false)}
                              onMarkInstalled={
                                import.meta.env.DEV
                                  ? () => setInstalled(v.id, true)
                                  : undefined
                              }
                              onViewDetails={() => {
                                setDetailId(v.id)
                                setDetailOpen(true)
                              }}
                            />
                          ))}
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <DownloadMirrorModal
        open={open}
        title={active?.displayName ?? ''}
        mirrors={mirrors}
        onClose={() => setOpen(false)}
        onRefresh={() => {
          void refreshFromGitHub().catch(() => {})
        }}
        onPick={(m) => {
          setOpen(false)
          if (!activeId) return
          void startDownload(activeId, m.url, installRoot || undefined)
          navigate('/downloads')
        }}
      />

      <ImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImport={(versionId, path) => {
          const store = useInstalledStore.getState()
          store.setInstallPath(versionId, path)
          setInstalled(versionId, true)
          // Do NOT change installRoot on import - import path and install directory are separate.
          // installRoot is only for where NEW downloads go; imported versions keep their custom path.
        }}
      />

      <VersionDetailModal
        open={detailOpen}
        version={detailId ? byId.get(detailId) ?? null : null}
        installed={detailId ? isInstalled(detailId) : false}
        installPath={detailId ? useInstalledStore.getState().getInstallPath(detailId) : ''}
        onClose={() => setDetailOpen(false)}
        onPlay={() => { if (detailId) void launchVersion(detailId) }}
        onDownload={() => {
          if (!detailId) return
          setActiveId(detailId)
          setOpen(true)
        }}
      />
    </div>
  )
}
