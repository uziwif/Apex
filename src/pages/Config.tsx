import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Monitor, Gamepad2, Shuffle, Package } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import AnimatedBackground from '../components/AnimatedBackground'
import { useConfigStore } from '../store/configStore'
import { useToastStore } from '../store/toastStore'
import { useInternalFilesStore, GITHUB_URLS } from '../store/internalFilesStore'
import { openDirectory, openDllFile, openDllFiles } from '../lib/fileDialog'
import type { DownloadStatus } from '../store/internalFilesStore'

type ComponentKey = 'backend' | 'gameserver' | 'redirect'

const COMP_ICONS: Record<string, typeof Monitor> = { backend: Monitor, gameserver: Gamepad2, redirect: Shuffle }

const COMPONENTS: { key: ComponentKey; label: string; shortName: string; repoUrl: string; credit: string }[] = [
  { key: 'backend', label: 'Backend', shortName: 'LawinServer', repoUrl: GITHUB_URLS.backend, credit: 'Lawin0129' },
  { key: 'gameserver', label: 'Gameserver', shortName: 'Erbium', repoUrl: GITHUB_URLS.gameserver, credit: 'plooshi' },
  { key: 'redirect', label: 'Redirect', shortName: 'Tellurium', repoUrl: GITHUB_URLS.redirect, credit: 'plooshi' },
]

const STATUS_CONFIG: Record<DownloadStatus, { label: string; dot: string; ring: string }> = {
  'not-downloaded': { label: 'Not Installed', dot: 'bg-yellow-400', ring: 'ring-yellow-400/30' },
  downloading: { label: 'Installing...', dot: 'bg-blue-400 animate-pulse', ring: 'ring-blue-400/30' },
  ready: { label: 'Ready', dot: 'bg-green-400', ring: 'ring-green-400/30' },
  error: { label: 'Error', dot: 'bg-red-400', ring: 'ring-red-400/30' },
}

type CustomComponent = { id: string; type: 'backend' | 'gameserver' | 'redirect'; name: string; path: string; host: string; port: number }

const LS_CUSTOM = 'apex-custom-components'

function loadCustom(): CustomComponent[] {
  try { return JSON.parse(localStorage.getItem(LS_CUSTOM) || '[]') } catch { return [] }
}

function saveCustom(list: CustomComponent[]) {
  localStorage.setItem(LS_CUSTOM, JSON.stringify(list))
}

function ComponentCard({ comp }: { comp: typeof COMPONENTS[number] }) {
  const entry = useInternalFilesStore((s) => s[comp.key])
  const setPath = useInternalFilesStore((s) => s.setPath)
  const downloadComponent = useInternalFilesStore((s) => s.downloadComponent)
  const statusCfg = STATUS_CONFIG[entry.status]

  const handleBrowse = async () => {
    if (comp.key === 'redirect') {
      const selected = await openDllFile(`Select Tellurium.dll`, entry.path || undefined)
      if (selected) setPath(comp.key, selected)
    } else {
      const selected = await openDirectory(`Select ${comp.label} directory`, entry.path || undefined)
      if (selected) setPath(comp.key, selected)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="glass rounded-2xl p-4"
    >
      <div className="flex items-center gap-3 mb-3">
        <motion.div whileHover={{ scale: 1.15, rotate: 8 }} className="text-[color:var(--accent)]">{(() => { const Icon = COMP_ICONS[comp.key]; return <Icon size={20} /> })()}</motion.div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">{comp.label}</span>
            <span className="text-[10px] text-[color:var(--text-secondary)]">{comp.shortName}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <motion.div
            animate={{ scale: entry.status === 'downloading' ? [1, 1.3, 1] : 1 }}
            transition={{ repeat: entry.status === 'downloading' ? Infinity : 0, duration: 1 }}
            className={`h-2.5 w-2.5 rounded-full ${statusCfg.dot}`}
          />
          <span className="text-[10px] font-semibold text-[color:var(--text-secondary)]">{statusCfg.label}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={entry.path}
          onChange={(e) => setPath(comp.key, e.target.value)}
          placeholder="Path..."
          className="flex-1 rounded-lg border border-[color:var(--border)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-[11px] font-mono outline-none placeholder:text-[color:var(--text-secondary)] focus:border-[color:var(--accent)] transition-colors"
        />
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} type="button" onClick={handleBrowse}
          className="rounded-lg border border-[color:var(--border)] bg-[rgba(255,255,255,0.04)] px-3 py-2 text-[11px] font-semibold hover:bg-[rgba(255,255,255,0.08)] transition-colors">
          Browse
        </motion.button>
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} type="button"
          onClick={() => void downloadComponent(comp.key)} disabled={entry.status === 'downloading'}
          className="rounded-lg bg-[color:var(--accent)] px-3 py-2 text-[11px] font-semibold text-black hover:opacity-90 disabled:opacity-50 transition-colors">
          {entry.status === 'downloading' ? 'Installing...' : entry.status === 'ready' ? 'Reinstall' : 'Install'}
        </motion.button>
      </div>

      <div className="mt-2 flex items-center gap-3 text-[10px] text-[color:var(--text-secondary)]">
        <span>by <a href={`https://github.com/${comp.credit}`} target="_blank" rel="noreferrer" className="text-[color:var(--accent)] hover:underline">{comp.credit}</a></span>
        <a href={comp.repoUrl} target="_blank" rel="noreferrer" className="text-[color:var(--accent)] hover:underline">Source</a>
      </div>
    </motion.div>
  )
}

function ConfigInput({ label, value, onChange, type = 'text', placeholder }: { label: string; value: string | number; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <label className="text-xs font-medium text-[color:var(--text-secondary)] whitespace-nowrap">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-44 rounded-lg border border-[color:var(--border)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-xs font-mono text-white outline-none focus:border-[color:var(--accent)] transition-colors" />
    </div>
  )
}

type Tab = 'components' | 'network' | 'custom' | 'advanced'

export default function Config() {
  const { t: tr } = useTranslation()
  const config = useConfigStore()
  const addToast = useToastStore((s) => s.add)
  const [tab, setTab] = useState<Tab>('components')
  const backendStatus = useInternalFilesStore((s) => s.backend.status)
  const gsStatus = useInternalFilesStore((s) => s.gameserver.status)
  const redirStatus = useInternalFilesStore((s) => s.redirect.status)
  const [customComponents, setCustomComponents] = useState<CustomComponent[]>(loadCustom())
  const [addOpen, setAddOpen] = useState(false)
  const [newType, setNewType] = useState<'backend' | 'gameserver' | 'redirect'>('backend')
  const [newName, setNewName] = useState('')
  const [newPath, setNewPath] = useState('')
  const [newHost, setNewHost] = useState('127.0.0.1')
  const [newPort, setNewPort] = useState(3551)

  const allReady = backendStatus === 'ready' && gsStatus === 'ready' && redirStatus === 'ready'
  const readyCount = [backendStatus, gsStatus, redirStatus].filter((s) => s === 'ready').length

  const handleReset = () => { config.reset(); addToast('Config reset to defaults', 'info') }

  const addCustom = () => {
    if (!newName.trim() || !newPath.trim()) return
    const item: CustomComponent = { id: Date.now().toString(), type: newType, name: newName.trim(), path: newPath.trim(), host: newHost, port: newPort }
    const next = [...customComponents, item]
    setCustomComponents(next)
    saveCustom(next)
    setNewName(''); setNewPath(''); setAddOpen(false)
    addToast(`Added custom ${newType}`, 'success')
  }

  const removeCustom = (id: string) => {
    const next = customComponents.filter((c) => c.id !== id)
    setCustomComponents(next)
    saveCustom(next)
    addToast('Removed custom component', 'info')
  }

  const handleCustomBrowse = async () => {
    if (newType === 'redirect') {
      const selected = await openDllFile('Select DLL file (.dll only)', newPath || undefined)
      if (selected) setNewPath(selected)
    } else {
      const selected = await openDirectory('Select component directory', newPath || undefined)
      if (selected) setNewPath(selected)
    }
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'components', label: tr('config.original') },
    { key: 'network', label: tr('config.network') },
    { key: 'custom', label: tr('config.custom') },
    { key: 'advanced', label: tr('config.advanced') },
  ]

  return (
    <div className="relative h-screen w-screen">
      <AnimatedBackground variant="app" />
      <div className="relative z-10 flex h-full w-full">
        <Sidebar />
        <div className="flex-1 overflow-y-auto p-6">
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold">{tr('config.title')}</motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-4 glass rounded-2xl p-4 flex items-center gap-4"
          >
            <motion.div
              animate={{ scale: allReady ? [1, 1.2, 1] : 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className={`h-3 w-3 rounded-full ${allReady ? 'bg-green-400' : 'bg-yellow-400'} ring-4 ${allReady ? 'ring-green-400/20' : 'ring-yellow-400/20'}`}
            />
            <div className="flex-1">
              <div className="text-xs font-semibold text-white">{allReady ? 'All systems ready' : `${readyCount}/3 components ready`}</div>
              <div className="text-[10px] text-[color:var(--text-secondary)]">{allReady ? 'You can launch any version.' : 'Install all components to launch.'}</div>
            </div>
            {!allReady && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-[10px] font-semibold text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 rounded-full px-2.5 py-1"
              >
                Setup Required
              </motion.span>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mt-4 flex gap-1 rounded-xl bg-[rgba(255,255,255,0.03)] p-1"
          >
            {tabs.map((t) => (
              <button key={t.key} type="button" onClick={() => setTab(t.key)}
                className={'relative flex-1 rounded-lg px-4 py-2 text-xs font-semibold transition ' + (tab === t.key ? 'text-white' : 'text-[color:var(--text-secondary)] hover:text-white')}>
                {tab === t.key && (
                  <motion.div layoutId="config-tab-bg" className="absolute inset-0 rounded-lg bg-[rgba(255,255,255,0.08)]" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                )}
                <span className="relative z-10">{t.label}</span>
              </button>
            ))}
          </motion.div>

          <AnimatePresence mode="popLayout">
            {tab === 'components' && (
              <motion.div key="components" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }} className="mt-4 flex flex-col gap-3">
                {COMPONENTS.map((c, i) => (
                  <motion.div key={c.key} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                    <ComponentCard comp={c} />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {tab === 'network' && (
              <motion.div key="network" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }} className="mt-4 flex flex-col gap-3">
                {[
                  { iconKey: 'backend' as const, label: 'Backend', name: 'LawinServer', host: config.backendHost, port: config.backendPort, onHost: (v: string) => config.update({ backendHost: v }), onPort: (v: string) => config.update({ backendPort: Number(v) || 3551 }) },
                  { iconKey: 'gameserver' as const, label: 'Gameserver', name: 'Erbium', host: config.gameserverHost, port: config.gameserverPort, onHost: (v: string) => config.update({ gameserverHost: v }), onPort: (v: string) => config.update({ gameserverPort: Number(v) || 7777 }) },
                  { iconKey: 'redirect' as const, label: 'Redirect', name: 'Tellurium', host: config.redirectHost, port: config.redirectPort, onHost: (v: string) => config.update({ redirectHost: v }), onPort: (v: string) => config.update({ redirectPort: Number(v) || 443 }) },
                ].map((s, i) => {
                  const Icon = COMP_ICONS[s.iconKey]
                  return (
                  <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="glass rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Icon size={16} className="text-[color:var(--accent)]" />
                      <span className="text-sm font-semibold">{s.label}</span>
                      <span className="text-[10px] text-[color:var(--text-secondary)]">{s.name}</span>
                    </div>
                    <div className="flex flex-col gap-3">
                      <ConfigInput label="Host" value={s.host} onChange={s.onHost} placeholder="127.0.0.1" />
                      <ConfigInput label="Port" type="number" value={s.port} onChange={s.onPort} />
                    </div>
                  </motion.div>
                  )
                })}

                {customComponents.length > 0 && (
                  <>
                    <div className="text-xs font-semibold text-[color:var(--text-secondary)] mt-2">Custom Components</div>
                    {customComponents.map((c, i) => (
                      <motion.div key={c.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.08 }} className="glass rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-4">
                          {(() => { const CI = COMP_ICONS[c.type] || Package; return <CI size={16} className="text-[color:var(--accent)]" /> })()}
                          <span className="text-sm font-semibold">{c.name}</span>
                          <span className="text-[10px] text-[color:var(--text-secondary)]">Custom {c.type}</span>
                        </div>
                        <div className="flex flex-col gap-3">
                          <ConfigInput label="Host" value={c.host} onChange={() => {}} placeholder="127.0.0.1" />
                          <ConfigInput label="Port" type="number" value={c.port} onChange={() => {}} />
                        </div>
                      </motion.div>
                    ))}
                  </>
                )}
              </motion.div>
            )}

            {tab === 'custom' && (
              <motion.div key="custom" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }} className="mt-4 flex flex-col gap-3">
                <div className="glass rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm font-semibold">Custom Components</div>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="button" onClick={() => setAddOpen(!addOpen)}
                      className="rounded-lg bg-[color:var(--accent)] px-3 py-1.5 text-[11px] font-bold text-black hover:opacity-90 transition">
                      {addOpen ? 'Cancel' : '+ Add'}
                    </motion.button>
                  </div>

                  <AnimatePresence>
                    {addOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-3 pb-4 border-b border-[rgba(255,255,255,0.06)] mb-4">
                          <div className="flex gap-2">
                            {(['backend', 'gameserver', 'redirect'] as const).map((t) => (
                              <motion.button key={t} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} type="button" onClick={() => setNewType(t)}
                                className={'flex-1 rounded-lg py-2 text-xs font-semibold transition border ' + (newType === t ? 'border-[color:var(--accent)] bg-[color:var(--accent)]/10 text-white' : 'border-[color:var(--border)] bg-[rgba(255,255,255,0.03)] text-[color:var(--text-secondary)]')}>
                                <span className="flex items-center justify-center gap-1.5">{(() => { const TI = COMP_ICONS[t]; return <TI size={14} /> })()}{t === 'backend' ? 'Backend' : t === 'gameserver' ? 'Gameserver' : 'Redirect'}</span>
                              </motion.button>
                            ))}
                          </div>
                          <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Component name..."
                            className="w-full rounded-lg border border-[color:var(--border)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-xs outline-none placeholder:text-[color:var(--text-secondary)] focus:border-[color:var(--accent)] transition-colors" />
                          <div className="flex gap-2">
                            <input type="text" value={newPath} onChange={(e) => setNewPath(e.target.value)}
                              placeholder={newType === 'redirect' ? 'Path to .dll file...' : 'Directory path...'}
                              className="flex-1 rounded-lg border border-[color:var(--border)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-xs font-mono outline-none placeholder:text-[color:var(--text-secondary)] focus:border-[color:var(--accent)] transition-colors" />
                            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} type="button" onClick={handleCustomBrowse}
                              className="rounded-lg border border-[color:var(--border)] bg-[rgba(255,255,255,0.04)] px-3 py-2 text-xs font-semibold hover:bg-[rgba(255,255,255,0.08)] transition-colors">
                              {newType === 'redirect' ? 'Select DLL' : 'Browse'}
                            </motion.button>
                          </div>
                          <div className="flex gap-3">
                            <ConfigInput label="Host" value={newHost} onChange={setNewHost} placeholder="127.0.0.1" />
                            <ConfigInput label="Port" type="number" value={newPort} onChange={(v) => setNewPort(Number(v) || 3551)} />
                          </div>
                          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" onClick={addCustom}
                            className="w-full rounded-lg bg-[color:var(--accent)] py-2.5 text-xs font-bold text-black hover:opacity-90 transition">
                            {tr('config.addComponent')}
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {customComponents.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
                      <div className="mb-3 flex justify-center text-[color:var(--text-secondary)]"><Package size={32} /></div>
                      <p className="text-xs text-[color:var(--text-secondary)]">{tr('config.noCustom')}</p>
                    </motion.div>
                  ) : (
                    <div className="space-y-2">
                      {customComponents.map((c, i) => (
                        <motion.div
                          key={c.id}
                          initial={{ opacity: 0, x: 16 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className="flex items-center gap-3 rounded-xl border border-[color:var(--border)] bg-[rgba(255,255,255,0.02)] p-3"
                        >
                          {(() => { const CI = COMP_ICONS[c.type] || Package; return <CI size={16} className="text-[color:var(--accent)]" /> })()}
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-white truncate">{c.name}</div>
                            <div className="text-[10px] text-[color:var(--text-secondary)] font-mono truncate">{c.path}</div>
                          </div>
                          <span className="text-[10px] text-[color:var(--text-secondary)]">{c.host}:{c.port}</span>
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} type="button" onClick={() => removeCustom(c.id)}
                            className="text-red-400 hover:text-red-300 text-sm font-bold transition">
                            ✕
                          </motion.button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {tab === 'advanced' && (
              <motion.div key="advanced" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }} className="mt-4 flex flex-col gap-3">
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5">
                  <div className="text-sm font-semibold mb-2">Extra DLL Injector</div>
                  <p className="text-[11px] text-[color:var(--text-secondary)] mb-3">Additional DLLs to inject after the redirect. Injected in order at launch.</p>
                  <div className="space-y-2 mb-4">
                    {(config.extraDllPaths ?? []).map((p, i) => (
                      <div key={i} className="flex items-center gap-2 rounded-lg border border-[color:var(--border)] bg-[rgba(255,255,255,0.02)] px-3 py-2">
                        <span className="flex-1 text-xs font-mono truncate">{p}</span>
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} type="button" onClick={() => {
                          const next = (config.extraDllPaths ?? []).filter((_, j) => j !== i)
                          config.update({ extraDllPaths: next })
                        }} className="text-red-400 hover:text-red-300 text-xs font-bold">✕</motion.button>
                      </div>
                    ))}
                  </div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" onClick={async () => {
                    const selected = await openDllFiles('Select DLL files to inject', undefined)
                    if (selected.length > 0) {
                      const next = [...(config.extraDllPaths ?? []), ...selected]
                      config.update({ extraDllPaths: next })
                      addToast(`Added ${selected.length} DLL(s)`, 'success')
                    }
                  }}
                    className="rounded-lg border border-[color:var(--border)] bg-[rgba(255,255,255,0.04)] px-4 py-2 text-xs font-semibold hover:bg-[rgba(255,255,255,0.08)] transition-colors">
                    + Add DLL(s)
                  </motion.button>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5">
                  <div className="text-sm font-semibold mb-3">{tr('config.launchArgs')}</div>
                  <input type="text" value={config.launchArgs ?? ''} onChange={(e) => config.update({ launchArgs: e.target.value })}
                    placeholder="-AUTH_TYPE=epic -AUTH_LOGIN=user@email.com -AUTH_PASSWORD=unused"
                    className="w-full rounded-lg border border-[color:var(--border)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-xs font-mono text-white outline-none placeholder:text-[color:var(--text-secondary)] focus:border-[color:var(--accent)] transition-colors" />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="glass rounded-2xl p-5">
                  <div className="text-sm font-semibold mb-3">{tr('config.showConsole')}</div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={config.showConsole ?? false} onChange={(e) => config.update({ showConsole: e.target.checked })} className="h-4 w-4 rounded accent-[color:var(--accent)]" />
                    <span className="text-xs text-white">{tr('config.showConsole')}</span>
                  </label>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="glass rounded-2xl p-5">
                  <div className="text-sm font-semibold mb-3">{tr('config.autoStartBackend')}</div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={config.autoStartBackend ?? true} onChange={(e) => config.update({ autoStartBackend: e.target.checked })} className="h-4 w-4 rounded accent-[color:var(--accent)]" />
                    <span className="text-xs text-white">{tr('config.autoStartBackend')}</span>
                  </label>
                </motion.div>

                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="button" onClick={handleReset}
                  className="rounded-2xl border border-red-500/20 bg-red-500/5 px-6 py-3 text-sm font-semibold text-red-400 hover:bg-red-500/10 transition">
                  {tr('config.resetDefaults')}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
