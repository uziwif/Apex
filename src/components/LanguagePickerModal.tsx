import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguageStore, LANGUAGES } from '../store/languageStore'

export default function LanguagePickerModal() {
  const { firstLaunchDone, setLanguage, markFirstLaunchDone } = useLanguageStore()
  const [selected, setSelected] = useState('en')
  const [search, setSearch] = useState('')

  if (firstLaunchDone) return null

  const filtered = LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(search.toLowerCase()),
  )

  const handleConfirm = () => {
    setLanguage(selected)
    markFirstLaunchDone()
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80"
        style={{ backdropFilter: 'blur(12px)' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="w-full max-w-lg mx-4 rounded-2xl border border-[color:var(--border)] bg-[rgba(18,18,18,0.95)] p-6"
          style={{ backdropFilter: 'blur(30px)' }}
        >
          <div className="text-center mb-1">
            <div className="text-xl font-extrabold tracking-wide">APEX</div>
          </div>
          <div className="text-center mb-5">
            <div className="text-sm text-[color:var(--text-secondary)]">Choose your language</div>
          </div>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search languages..."
            className="w-full mb-4 rounded-xl border border-[color:var(--border)] bg-[rgba(255,255,255,0.03)] px-4 py-2.5 text-sm outline-none placeholder:text-[color:var(--text-secondary)] focus:border-[color:var(--accent)]"
          />

          <div className="grid grid-cols-2 gap-1.5 max-h-[320px] overflow-y-auto pr-1 mb-5">
            {filtered.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => setSelected(lang.code)}
                className={
                  'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition border ' +
                  (selected === lang.code
                    ? 'border-[color:var(--accent)] bg-[color:var(--accent)]/10 text-white'
                    : 'border-transparent bg-[rgba(255,255,255,0.03)] text-[color:var(--text-secondary)] hover:bg-[rgba(255,255,255,0.06)] hover:text-white')
                }
              >
                <span className="text-lg">{lang.flag}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold truncate">{lang.nativeName}</div>
                  {lang.name !== lang.nativeName && (
                    <div className="text-[10px] opacity-50 truncate">{lang.name}</div>
                  )}
                </div>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            className="w-full rounded-xl bg-[color:var(--accent)] py-3 text-sm font-bold text-black hover:opacity-90 transition"
          >
            Continue
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
