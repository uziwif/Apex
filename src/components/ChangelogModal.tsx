import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const CURRENT_VERSION = '1.0.0'
const LS_KEY = 'apex-last-seen-version'

const CHANGELOG = [
  {
    version: '1.0.0',
    title: 'Apex Launcher v1.0',
    items: [
      '200+ Fortnite versions from OT6.5 to The Simpsons Season',
      'Download mirrors with community archive scraping',
      'Auto-extract & import after download',
      'LawinServer, Erbium, and Tellurium integration',
      'Server config (IP/ports) from Config tab',
      'Import existing builds from disk',
      'Favourites, accent colors, customizable display name',
      'Manifest-only support for Seasons 34-39',
      'Toast notifications & version detail panel',
    ],
  },
]

export default function ChangelogModal() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const lastSeen = localStorage.getItem(LS_KEY)
    if (lastSeen !== CURRENT_VERSION) {
      setOpen(true)
    }
  }, [])

  const handleClose = () => {
    localStorage.setItem(LS_KEY, CURRENT_VERSION)
    setOpen(false)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25 }}
            className="relative w-full max-w-md glass rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">What's New</span>
                <span className="rounded-full bg-[color:var(--accent)] px-2 py-0.5 text-[10px] font-bold text-black">v{CURRENT_VERSION}</span>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-[color:var(--text-secondary)] hover:text-white hover:bg-[rgba(255,255,255,0.06)] transition"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {CHANGELOG.map((entry) => (
              <div key={entry.version}>
                <ul className="space-y-2">
                  {entry.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-[color:var(--text-secondary)]">
                      <span className="mt-1 shrink-0 h-1 w-1 rounded-full bg-[color:var(--accent)]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <button
              type="button"
              onClick={handleClose}
              className="mt-5 w-full rounded-xl bg-[color:var(--accent)] py-2.5 text-sm font-semibold text-black hover:opacity-90"
            >
              Got it
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
