import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import type { DownloadMirror } from '../lib/downloadLinks'

export default function DownloadMirrorModal({
  open,
  title,
  mirrors,
  onClose,
  onPick,
  onRefresh,
}: {
  open: boolean
  title: string
  mirrors: DownloadMirror[]
  onClose: () => void
  onPick: (mirror: DownloadMirror) => void
  onRefresh?: () => void
}) {
  const { t } = useTranslation()

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[100]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />

          <div className="absolute inset-0 flex items-center justify-center p-6">
            <motion.div
              className="glass w-full max-w-lg rounded-2xl p-6"
              style={{ backdropFilter: 'blur(24px)' }}
              initial={{ y: 10, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 10, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.14, ease: 'easeOut' }}
            >
              <div className="text-lg font-semibold">{t('mirror.title')} {title}</div>
              <div className="mt-1 text-sm text-[color:var(--text-secondary)]">
                {t('mirror.chooseMirror')}
              </div>

              <div className="mt-5 grid gap-3">
                {mirrors.length === 0 ? (
                  <div className="rounded-xl border border-[color:var(--border)] bg-[rgba(255,255,255,0.02)] p-4">
                    <div className="text-sm font-semibold">{t('mirror.noMirrors')}</div>
                    <div className="mt-1 text-xs text-[color:var(--text-secondary)]">
                      {t('mirror.noMirrorsHint')}
                    </div>

                    {onRefresh ? (
                      <button
                        className="mt-3 rounded-xl bg-[rgba(255,255,255,0.06)] px-3 py-2 text-xs font-semibold hover:bg-[rgba(255,255,255,0.09)]"
                        type="button"
                        onClick={onRefresh}
                      >
                        {t('mirror.refreshLinks')}
                      </button>
                    ) : null}
                  </div>
                ) : (
                  mirrors.map((m) => (
                    <button
                      key={m.url}
                      className="w-full overflow-hidden rounded-xl border border-[color:var(--border)] bg-[rgba(255,255,255,0.03)] px-4 py-3 text-left text-sm hover:bg-[rgba(255,255,255,0.06)] transition"
                      type="button"
                      onClick={() => onPick(m)}
                    >
                      <div className="font-semibold">{m.label}</div>
                      <div className="mt-1 min-w-0 truncate text-xs text-[color:var(--text-secondary)]">
                        {m.url}
                      </div>
                    </button>
                  ))
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  className="rounded-xl px-4 py-2 text-sm text-[color:var(--text-secondary)] hover:text-white"
                  type="button"
                  onClick={onClose}
                >
                  {t('common.cancel')}
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
