import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useState } from 'react'
import versions from '../data/versions.json'

type ImportStep = 'select-path' | 'detect' | 'confirm'

const CL_MAP: Record<number, string> = {
  3532353: 'cert', 3541083: '1.2', 3700114: '1.7.2',
  3724489: '1.8', 3729133: '1.8.1', 3741772: '1.8.2',
  3757339: '1.9', 3775276: '1.9.1', 3790078: '1.10',
  3807424: '1.11', 3825894: '2.1', 3841827: '2.2',
  3847564: '2.3', 3858292: '2.4', 3870737: '2.4.2',
  3889387: '2.5', 3901517: '3.0', 3915963: '3.1',
  3929794: '3.2', 3942182: '3.3', 3968866: '3.4',
  3994867: '3.5', 4019403: '3.6', 4039451: '4.0',
  4053532: '4.1', 4072250: '4.2', 4117433: '4.4',
  4159770: '4.5', 4204761: '5.0', 4225813: '5.10',
  4305896: '5.30', 4351695: '5.40', 4363240: '5.41',
  4395664: '6.00', 4417689: '6.01', 4442095: '6.02',
  4464155: '6.10', 4497486: '6.20', 4526925: '6.21',
  4541220: '6.22', 4579044: '6.30', 4573279: '6.31',
  4629139: '7.00', 4667333: '7.10', 4716934: '7.20',
  4821335: '7.30', 4980899: '7.40', 5203069: '8.00',
  5362200: '8.10', 5547534: '8.20', 5793395: '8.30',
  5914491: '8.40', 6058028: '8.50', 6165369: '8.51',
  6337466: '9.00', 6428087: '9.01', 6573057: '9.10',
  6822798: '9.20', 6922310: '9.21', 7021684: '9.30',
  7315705: '9.40', 7609292: '9.41', 7658179: '10.00',
  7955722: '10.10', 8243923: '10.20', 8569414: '10.30',
  8723043: '10.31', 8970213: '10.40',
}

function detectVersionFromPath(path: string): { versionId: string | null; confidence: 'high' | 'medium' | 'low'; detail: string } {
  const normalized = path.replace(/\\/g, '/').toLowerCase()
  const lastSegment = normalized.split('/').filter(Boolean).pop() || ''

  const clMatch = normalized.match(/cl[- _]?(\d{7,})/i)
  if (clMatch) {
    const cl = parseInt(clMatch[1])
    const mapped = CL_MAP[cl]
    if (mapped) {
      const found = versions.find((v) => v.displayName.toLowerCase().replace(/\s/g, '') === mapped.toLowerCase().replace(/\s/g, ''))
        || versions.find((v) => v.buildId.toLowerCase().includes(clMatch[1]))
      if (found) return { versionId: found.id, confidence: 'high', detail: `Matched CL-${clMatch[1]}` }
    }
    const byCl = versions.find((v) => v.buildId.includes(clMatch[1]))
    if (byCl) return { versionId: byCl.id, confidence: 'high', detail: `Matched CL-${clMatch[1]} in build ID` }
  }

  const versionPatterns = [
    /(\d{1,2}\.\d{1,2}(?:\.\d{1,2})?)/,
    /v(\d{1,2}\.\d{1,2})/,
    /fortnite[- _]?(\d{1,2}\.\d{1,2})/i,
    /season[- _]?(\d{1,2})/i,
  ]

  for (const pattern of versionPatterns) {
    const match = lastSegment.match(pattern)
    if (match) {
      const ver = match[1]
      const found = versions.find((v) =>
        v.displayName.toLowerCase() === ver ||
        v.displayName.toLowerCase() === ver.replace(/^0/, '') ||
        v.id.toLowerCase().includes(ver)
      )
      if (found) return { versionId: found.id, confidence: 'medium', detail: `Matched "${ver}" from folder name` }
    }
  }

  for (const v of versions) {
    const dn = v.displayName.toLowerCase().replace(/\s/g, '')
    if (lastSegment.includes(dn) && dn.length > 1) {
      return { versionId: v.id, confidence: 'low', detail: `Partial match "${v.displayName}" in path` }
    }
  }

  return { versionId: null, confidence: 'low', detail: 'Could not auto-detect version' }
}

export default function ImportModal({
  open,
  onClose,
  onImport,
}: {
  open: boolean
  onClose: () => void
  onImport: (versionId: string, path: string) => void
}) {
  const [step, setStep] = useState<ImportStep>('select-path')
  const [selectedVersion, setSelectedVersion] = useState('')
  const [importPath, setImportPath] = useState('')
  const [search, setSearch] = useState('')
  const [detection, setDetection] = useState<{ versionId: string | null; confidence: string; detail: string } | null>(null)
  const [detecting, setDetecting] = useState(false)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return versions
    return versions.filter((v) =>
      v.displayName.toLowerCase().includes(q) ||
      v.group.toLowerCase().includes(q) ||
      v.buildId.toLowerCase().includes(q) ||
      v.id.toLowerCase().includes(q)
    )
  }, [search])

  const selectedV = versions.find((v) => v.id === selectedVersion)

  const handleBrowse = async () => {
    if (typeof window !== 'undefined' && (window as unknown as { __TAURI__?: unknown }).__TAURI__) {
      try {
        const { open: openDialog } = await import('@tauri-apps/plugin-dialog')
        const selected = await openDialog({ directory: true, title: 'Select game build folder' })
        if (selected) setImportPath(selected as string)
      } catch {}
    } else {
      const input = prompt('Enter the path to the game build folder:', importPath)
      if (input !== null) setImportPath(input.trim())
    }
  }

  const runDetection = useCallback(() => {
    if (!importPath.trim()) return
    setDetecting(true)
    setTimeout(() => {
      const result = detectVersionFromPath(importPath)
      setDetection(result)
      if (result.versionId) setSelectedVersion(result.versionId)
      setDetecting(false)
      setStep('detect')
    }, 600)
  }, [importPath])

  const handleConfirm = () => {
    if (!selectedVersion || !importPath.trim()) return
    onImport(selectedVersion, importPath.trim())
    reset()
  }

  const reset = () => {
    setStep('select-path')
    setSelectedVersion('')
    setImportPath('')
    setSearch('')
    setDetection(null)
    onClose()
  }

  useEffect(() => {
    if (!open) {
      setStep('select-path')
      setDetection(null)
      setDetecting(false)
    }
  }, [open])

  const confidenceColor = detection?.confidence === 'high' ? 'text-green-400' : detection?.confidence === 'medium' ? 'text-yellow-400' : 'text-red-400'
  const confidenceBg = detection?.confidence === 'high' ? 'bg-green-400/10 border-green-400/20' : detection?.confidence === 'medium' ? 'bg-yellow-400/10 border-yellow-400/20' : 'bg-red-400/10 border-red-400/20'

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[100]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/60" style={{ backdropFilter: 'blur(8px)' }} onClick={reset} />

          <div className="absolute inset-0 flex items-center justify-center p-6">
            <motion.div
              className="glass w-full max-w-lg rounded-2xl p-6"
              style={{ backdropFilter: 'blur(24px)' }}
              initial={{ y: 20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="text-lg font-bold">Import Version</div>
              <div className="mt-1 text-sm text-[color:var(--text-secondary)]">
                {step === 'select-path' && 'Point to a folder containing a Fortnite build'}
                {step === 'detect' && 'Version detected — confirm or change'}
                {step === 'confirm' && 'Review and confirm'}
              </div>

              <div className="mt-4 flex items-center gap-2">
                {(['select-path', 'detect', 'confirm'] as ImportStep[]).map((s, i) => {
                  const steps: ImportStep[] = ['select-path', 'detect', 'confirm']
                  const isActive = step === s
                  const isDone = steps.indexOf(s) < steps.indexOf(step)
                  return (
                    <div key={s} className="flex items-center gap-2">
                      <motion.div
                        animate={{ scale: isActive ? 1.1 : 1 }}
                        className={'h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ' +
                          (isActive ? 'bg-[color:var(--accent)] text-black' : isDone ? 'bg-[color:var(--accent)] text-black opacity-60' : 'bg-[rgba(255,255,255,0.06)] text-[color:var(--text-secondary)]')}
                      >
                        {isDone ? '✓' : i + 1}
                      </motion.div>
                      {i < 2 && <div className="h-px w-6 bg-[rgba(255,255,255,0.1)]" />}
                    </div>
                  )
                })}
              </div>

              <AnimatePresence mode="wait">
                {step === 'select-path' && (
                  <motion.div key="path" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.15 }} className="mt-4">
                    <label className="text-xs font-semibold text-[color:var(--text-secondary)]">Build folder</label>
                    <div className="mt-1.5 flex gap-2">
                      <input
                        value={importPath}
                        onChange={(e) => setImportPath(e.target.value)}
                        placeholder="C:\Games\FortniteBuilds\4.0 ..."
                        className="flex-1 rounded-lg border border-[color:var(--border)] bg-[rgba(255,255,255,0.03)] px-3 py-2.5 text-xs font-mono outline-none placeholder:text-[color:var(--text-secondary)] focus:border-[color:var(--accent)] transition-colors"
                      />
                      <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} type="button" onClick={() => void handleBrowse()}
                        className="rounded-lg border border-[color:var(--border)] bg-[rgba(255,255,255,0.04)] px-4 py-2.5 text-xs font-semibold hover:bg-[rgba(255,255,255,0.08)] transition-colors">
                        Browse
                      </motion.button>
                    </div>
                    <p className="mt-2 text-[10px] text-[color:var(--text-secondary)]">
                      Select the root folder containing <code className="rounded bg-black/30 px-1">FortniteGame/</code> and <code className="rounded bg-black/30 px-1">Engine/</code>. The version will be auto-detected from the path and file structure.
                    </p>
                  </motion.div>
                )}

                {step === 'detect' && (
                  <motion.div key="detect" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.15 }} className="mt-4">
                    {detecting ? (
                      <div className="flex flex-col items-center py-8 gap-3">
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                          className="h-8 w-8 rounded-full border-2 border-[color:var(--accent)] border-t-transparent" />
                        <span className="text-xs text-[color:var(--text-secondary)]">Scanning path...</span>
                      </div>
                    ) : (
                      <>
                        {detection && (
                          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`rounded-xl border p-3 mb-4 ${confidenceBg}`}>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-bold ${confidenceColor}`}>
                                {detection.confidence === 'high' ? 'Auto-detected' : detection.confidence === 'medium' ? 'Likely match' : 'Manual selection needed'}
                              </span>
                            </div>
                            <p className="text-[10px] text-[color:var(--text-secondary)] mt-1">{detection.detail}</p>
                          </motion.div>
                        )}

                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs font-semibold text-[color:var(--text-secondary)]">
                            {detection?.versionId ? 'Detected version — change if incorrect:' : 'Select version manually:'}
                          </span>
                        </div>

                        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search versions..."
                          className="w-full rounded-lg border border-[color:var(--border)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-sm outline-none placeholder:text-[color:var(--text-secondary)] focus:border-[color:var(--accent)] transition-colors" />

                        <div className="mt-2 max-h-[200px] overflow-y-auto rounded-xl border border-[color:var(--border)] bg-[rgba(0,0,0,0.2)]">
                          {filtered.slice(0, 50).map((v) => (
                            <button key={v.id} type="button"
                              className={'w-full px-3 py-2 text-left text-sm hover:bg-[rgba(255,255,255,0.04)] transition flex items-center justify-between ' +
                                (selectedVersion === v.id ? 'bg-[rgba(255,255,255,0.06)]' : '')}
                              onClick={() => setSelectedVersion(v.id)}>
                              <div className="min-w-0">
                                <span className="font-semibold">{v.displayName}</span>
                                <span className="ml-2 text-xs text-[color:var(--text-secondary)]">{v.group}</span>
                              </div>
                              {selectedVersion === v.id && (
                                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[color:var(--accent)] text-xs font-bold">Selected</motion.span>
                              )}
                            </button>
                          ))}
                          {filtered.length === 0 && (
                            <div className="px-3 py-4 text-center text-xs text-[color:var(--text-secondary)]">No versions match</div>
                          )}
                        </div>
                      </>
                    )}
                  </motion.div>
                )}

                {step === 'confirm' && (
                  <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.15 }} className="mt-4 space-y-3">
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-[color:var(--border)] bg-[rgba(255,255,255,0.02)] p-4">
                      <div className="flex justify-between text-xs">
                        <span className="text-[color:var(--text-secondary)]">Version</span>
                        <span className="font-semibold">{selectedV?.displayName} ({selectedV?.group})</span>
                      </div>
                      <div className="flex justify-between text-xs mt-2">
                        <span className="text-[color:var(--text-secondary)]">Build ID</span>
                        <span className="font-mono">{selectedV?.buildId}</span>
                      </div>
                      <div className="flex justify-between text-xs mt-2">
                        <span className="text-[color:var(--text-secondary)]">Path</span>
                        <span className="font-mono truncate max-w-[240px]" title={importPath}>{importPath}</span>
                      </div>
                    </motion.div>
                    {detection && (
                      <div className={`rounded-lg border p-2 text-[10px] ${confidenceBg} ${confidenceColor}`}>
                        Detection confidence: {detection.confidence}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-6 flex items-center justify-between">
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} type="button"
                  className="rounded-xl px-4 py-2 text-sm text-[color:var(--text-secondary)] hover:text-white transition"
                  onClick={step === 'select-path' ? reset : () => {
                    const steps: ImportStep[] = ['select-path', 'detect', 'confirm']
                    setStep(steps[steps.indexOf(step) - 1])
                  }}>
                  {step === 'select-path' ? 'Cancel' : 'Back'}
                </motion.button>

                {step === 'confirm' ? (
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} type="button"
                    className="rounded-xl bg-[color:var(--accent)] px-5 py-2 text-sm font-bold text-black hover:opacity-90 disabled:opacity-50 transition"
                    disabled={!selectedVersion || !importPath.trim()} onClick={handleConfirm}>
                    Import
                  </motion.button>
                ) : step === 'select-path' ? (
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} type="button"
                    className="rounded-xl bg-[color:var(--accent)] px-5 py-2 text-sm font-bold text-black hover:opacity-90 disabled:opacity-50 transition"
                    disabled={!importPath.trim()} onClick={runDetection}>
                    Detect Version
                  </motion.button>
                ) : (
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} type="button"
                    className="rounded-xl bg-[color:var(--accent)] px-5 py-2 text-sm font-bold text-black hover:opacity-90 disabled:opacity-50 transition"
                    disabled={!selectedVersion} onClick={() => setStep('confirm')}>
                    Next
                  </motion.button>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
