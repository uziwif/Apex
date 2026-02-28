import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef } from 'react'

export type ThreeDotItem =
  | { type: 'action'; label: string; onClick: () => void; disabled?: boolean }
  | { type: 'divider' }
  | { type: 'info'; label: string; value: string }

export default function ThreeDotMenu({
  open,
  onClose,
  items,
}: {
  open: boolean
  onClose: () => void
  items: ThreeDotItem[]
}) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!ref.current) return
      if (ref.current.contains(e.target as Node)) return
      onClose()
    }

    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (open) {
      window.addEventListener('mousedown', onDown)
      window.addEventListener('keydown', onEsc)
    }

    return () => {
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('keydown', onEsc)
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          ref={ref}
          className="absolute right-2 top-10 z-30 w-56 overflow-hidden rounded-xl border border-[color:var(--border)] bg-[rgba(10,10,10,0.65)]"
          style={{ backdropFilter: 'blur(18px)' }}
          initial={{ opacity: 0, y: 6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.98 }}
          transition={{ duration: 0.14, ease: 'easeOut' }}
        >
          <div className="p-1">
            {items.map((it, idx) => {
              if (it.type === 'divider') {
                return (
                  <div
                    key={`d-${idx}`}
                    className="my-1 h-px w-full bg-[color:var(--border)]"
                  />
                )
              }

              if (it.type === 'info') {
                return (
                  <div key={`i-${idx}`} className="px-3 py-2">
                    <div className="text-[11px] font-semibold text-[color:var(--text-secondary)]">
                      {it.label}
                    </div>
                    <div className="mt-0.5 text-xs text-white">{it.value}</div>
                  </div>
                )
              }

              return (
                <button
                  key={`a-${idx}`}
                  className={
                    'w-full rounded-lg px-3 py-2 text-left text-xs font-semibold transition ' +
                    (it.disabled
                      ? 'cursor-not-allowed text-[color:var(--text-secondary)] opacity-60'
                      : 'text-white hover:bg-[rgba(255,255,255,0.06)]')
                  }
                  type="button"
                  disabled={it.disabled}
                  onClick={() => {
                    if (it.disabled) return
                    it.onClick()
                    onClose()
                  }}
                >
                  {it.label}
                </button>
              )
            })}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
