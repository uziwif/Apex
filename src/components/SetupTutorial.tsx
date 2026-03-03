import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Gamepad2, PartyPopper } from 'lucide-react'
import { useInstalledStore } from '../store/installedStore'
import { useInternalFilesStore } from '../store/internalFilesStore'
import { useToastStore } from '../store/toastStore'

const LS_KEY = 'apex-setup-done'

function isSetupDone(): boolean {
  try { return localStorage.getItem(LS_KEY) === '1' } catch { return false }
}

function markSetupDone() {
  localStorage.setItem(LS_KEY, '1')
}

export default function SetupTutorial() {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(!isSetupDone())
  const [step, setStep] = useState(0)
  const installRoot = useInstalledStore((s) => s.installRoot)
  const setInstallRoot = useInstalledStore((s) => s.setInstallRoot)
  const addToast = useToastStore((s) => s.add)
  const backendStatus = useInternalFilesStore((s) => s.backend.status)
  const gsStatus = useInternalFilesStore((s) => s.gameserver.status)
  const redirStatus = useInternalFilesStore((s) => s.redirect.status)
  const downloadComponent = useInternalFilesStore((s) => s.downloadComponent)

  const STEPS = [
    { id: 'welcome', title: t('setup.welcome'), subtitle: t('setup.welcomeSub') },
    { id: 'directory', title: t('setup.installDir'), subtitle: t('setup.installDirSub') },
    { id: 'components', title: t('setup.components'), subtitle: t('setup.componentsSub') },
    { id: 'done', title: t('setup.allSet'), subtitle: t('setup.allSetSub') },
  ]

  if (!visible) return null

  const skip = () => { markSetupDone(); setVisible(false) }
  const finish = () => { markSetupDone(); setVisible(false); addToast(t('toast.setupComplete'), 'success') }
  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1))
  const back = () => setStep((s) => Math.max(s - 1, 0))
  const current = STEPS[step]

  const handleBrowse = async () => {
    const selected = await import('../lib/fileDialog').then((m) => m.openDirectory(t('setup.installDir'), installRoot || 'C:\\Games\\Fortnite Builds'))
    if (selected) setInstallRoot(selected)
  }

  const downloadAll = () => {
    if (backendStatus !== 'ready' && backendStatus !== 'downloading') void downloadComponent('backend')
    if (gsStatus !== 'ready' && gsStatus !== 'downloading') void downloadComponent('gameserver')
    if (redirStatus !== 'ready' && redirStatus !== 'downloading') void downloadComponent('redirect')
  }

  const allReady = backendStatus === 'ready' && gsStatus === 'ready' && redirStatus === 'ready'
  const anyDownloading = backendStatus === 'downloading' || gsStatus === 'downloading' || redirStatus === 'downloading'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/85"
      style={{ backdropFilter: 'blur(16px)' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md mx-4 rounded-2xl border border-[color:var(--border)] bg-[rgba(16,16,16,0.97)] overflow-hidden"
        style={{ backdropFilter: 'blur(30px)' }}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-0">
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <motion.div
                key={i}
                className="h-1 rounded-full"
                animate={{
                  width: i === step ? 24 : 8,
                  backgroundColor: i <= step ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
                }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={skip}
            className="text-[11px] text-[color:var(--text-secondary)] hover:text-white transition"
          >
            {t('setup.skipSetup')}
          </button>
        </div>

        <div className="p-6 min-h-[320px] flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="flex-1 flex flex-col"
            >
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                <div className="text-xl font-extrabold text-white">{current.title}</div>
                <div className="mt-1 text-sm text-[color:var(--text-secondary)]">{current.subtitle}</div>
              </motion.div>

              <div className="flex-1 mt-6">
                {step === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.35 }}
                    className="space-y-4"
                  >
                    <div className="text-center py-4 text-[color:var(--accent)]"><Gamepad2 size={56} className="mx-auto" /></div>
                    <p className="text-xs text-center text-[color:var(--text-secondary)]">
                      {t('setup.welcomeDesc')}
                    </p>
                  </motion.div>
                )}

                {step === 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.35 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={installRoot}
                        onChange={(e) => setInstallRoot(e.target.value)}
                        placeholder="C:\Games\Fortnite Builds"
                        className="flex-1 rounded-xl border border-[color:var(--border)] bg-[rgba(255,255,255,0.03)] px-4 py-3 text-sm font-mono outline-none placeholder:text-[color:var(--text-secondary)] focus:border-[color:var(--accent)]"
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={handleBrowse}
                        className="rounded-xl border border-[color:var(--border)] bg-[rgba(255,255,255,0.04)] px-4 py-3 text-sm font-semibold hover:bg-[rgba(255,255,255,0.08)] transition-colors"
                      >
                        {t('settings.browse')}
                      </motion.button>
                    </div>
                    {installRoot && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-2 text-xs text-green-400"
                      >
                        <div className="h-2 w-2 rounded-full bg-green-400" />
                        {t('setup.directorySet')}
                      </motion.div>
                    )}
                    <p className="text-[11px] text-[color:var(--text-secondary)]">
                      {t('setup.installDirHint')}
                    </p>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.35 }}
                    className="space-y-3"
                  >
                    {[
                      { key: 'backend' as const, label: t('config.backend'), name: 'LawinServer', status: backendStatus },
                      { key: 'gameserver' as const, label: t('config.gameserver'), name: 'Erbium', status: gsStatus },
                      { key: 'redirect' as const, label: t('config.redirect'), name: 'Tellurium', status: redirStatus },
                    ].map((c, i) => (
                      <motion.div
                        key={c.key}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + i * 0.1, duration: 0.3 }}
                        className="flex items-center gap-3 rounded-xl border border-[color:var(--border)] bg-[rgba(255,255,255,0.02)] p-3"
                      >
                        <div className={`h-2.5 w-2.5 rounded-full ${c.status === 'ready' ? 'bg-green-400' : c.status === 'downloading' ? 'bg-blue-400 animate-pulse' : 'bg-yellow-400'}`} />
                        <div className="flex-1">
                          <div className="text-xs font-semibold text-white">{c.label}</div>
                          <div className="text-[10px] text-[color:var(--text-secondary)]">{c.name}</div>
                        </div>
                        <span className="text-[10px] font-semibold text-[color:var(--text-secondary)]">
                          {c.status === 'ready' ? t('config.installed') : c.status === 'downloading' ? t('config.installing') : t('config.notInstalled')}
                        </span>
                      </motion.div>
                    ))}

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={downloadAll}
                      disabled={allReady || anyDownloading}
                      className="w-full mt-2 rounded-xl bg-[color:var(--accent)] py-3 text-sm font-bold text-black hover:opacity-90 disabled:opacity-50 transition"
                    >
                      {allReady ? t('setup.allInstalled') : anyDownloading ? t('config.installing') : t('setup.installAll')}
                    </motion.button>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.15, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col items-center text-center space-y-4 pt-4"
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -30 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 12 }}
                      className="text-[color:var(--accent)]"
                    >
                      <PartyPopper size={56} />
                    </motion.div>
                    <p className="text-sm text-[color:var(--text-secondary)]">
                      {t('setup.allSetDesc')}
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-[rgba(255,255,255,0.06)]">
            {step > 0 ? (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={back}
                className="rounded-xl border border-[color:var(--border)] px-5 py-2.5 text-sm font-semibold text-[color:var(--text-secondary)] hover:text-white transition"
              >
                {t('setup.back')}
              </motion.button>
            ) : <div />}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={step === STEPS.length - 1 ? finish : next}
              className="rounded-xl bg-[color:var(--accent)] px-6 py-2.5 text-sm font-bold text-black hover:opacity-90 transition"
            >
              {step === STEPS.length - 1 ? t('setup.getStarted') : t('setup.continue')}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
