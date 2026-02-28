import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { Inbox, X, CheckCircle2 } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import AnimatedBackground from '../components/AnimatedBackground'
import { useDownloadStore } from '../store/downloadStore'

function formatBytes(n: number) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let v = n
  let i = 0
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i++ }
  return `${v.toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

function formatSpeed(bps: number) { return `${formatBytes(bps)}/s` }

export default function Downloads() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const items = useDownloadStore((s) => Object.values(s.active))
  const cancel = useDownloadStore((s) => s.cancel)

  const inProgress = items.filter((d) => d.status !== 'completed' && d.status !== 'canceled')
  const completed = items.filter((d) => d.status === 'completed')

  return (
    <div className="relative h-screen w-screen">
      <AnimatedBackground variant="app" />
      <div className="relative z-10 flex h-full w-full">
        <Sidebar />
        <div className="flex-1 overflow-y-auto p-6">
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold">{t('downloads.title')}</motion.div>

          {items.length === 0 ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="mt-4 glass rounded-2xl p-6">
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 14 }} className="text-[color:var(--text-secondary)]"><Inbox size={40} /></motion.div>
                <div className="text-sm text-[color:var(--text-secondary)]">{t('downloads.noActive')}</div>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="button"
                  className="rounded-xl bg-[color:var(--accent)] px-5 py-2.5 text-sm font-semibold text-black hover:opacity-90"
                  onClick={() => navigate('/library')}>
                  {t('downloads.goDownload')}
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <div className="mt-4 flex flex-col gap-4">
              <AnimatePresence>
                {inProgress.length > 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="text-xs font-semibold text-[color:var(--text-secondary)] mb-2 uppercase tracking-wider">{t('downloads.active')}</div>
                    <div className="flex flex-col gap-2">
                      {inProgress.map((d, i) => {
                        const pct = d.totalBytes ? Math.min(100, (d.bytesDownloaded / d.totalBytes) * 100) : 0
                        const isExtracting = d.status === 'extracting'
                        return (
                          <motion.div key={d.versionId} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.05 }}
                            className="glass rounded-xl p-4">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold">{d.versionId}</div>
                                <div className="mt-0.5 text-xs text-[color:var(--text-secondary)]">
                                  {isExtracting ? t('downloads.extracting') : d.status === 'error' ? d.error || 'Error'
                                    : `${formatBytes(d.bytesDownloaded)}${d.totalBytes ? ` / ${formatBytes(d.totalBytes)}` : ''} — ${formatSpeed(d.speedBps)}`}
                                </div>
                              </div>
                              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} type="button" onClick={() => void cancel(d.versionId)}
                                className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg text-[color:var(--text-secondary)] hover:text-red-400 hover:bg-red-400/10 transition" title="Cancel">
                                <X size={14} />
                              </motion.button>
                            </div>
                            {isExtracting ? (
                              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
                                <motion.div className="h-full rounded-full bg-yellow-400" animate={{ width: ['30%', '70%', '30%'] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }} />
                              </div>
                            ) : (
                              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
                                <motion.div className="h-full rounded-full bg-[color:var(--accent)]" animate={{ width: `${pct}%` }} transition={{ ease: 'easeOut', duration: 0.4 }} />
                              </div>
                            )}
                          </motion.div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {completed.length > 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="text-xs font-semibold text-[color:var(--text-secondary)] mb-2 uppercase tracking-wider">{t('downloads.completed')}</div>
                    <div className="flex flex-col gap-2">
                      {completed.map((d, i) => (
                        <motion.div key={d.versionId} layout initial={{ opacity: 0, scale: 0.9, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: i * 0.06, type: 'spring', stiffness: 300, damping: 20 }}
                          className="glass rounded-xl p-4" style={{ borderColor: 'rgba(34, 197, 94, 0.2)' }}>
                          <div className="flex items-center gap-3">
                            <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.2 + i * 0.06, type: 'spring', stiffness: 250, damping: 15 }}
                              className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-green-500/15 text-green-400">
                              <CheckCircle2 size={20} />
                            </motion.div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold">{d.versionId}</div>
                              <div className="mt-0.5 text-xs text-green-400/80">{t('downloads.downloadedAdded')}</div>
                            </div>
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} type="button" onClick={() => void cancel(d.versionId)}
                              className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg text-[color:var(--text-secondary)] hover:text-white hover:bg-[rgba(255,255,255,0.06)] transition" title="Dismiss">
                              <X size={14} />
                            </motion.button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
