import { motion } from 'framer-motion'

export default function UnderConstruction({ title }: { title: string }) {
  return (
    <div className="mt-4 flex h-[70vh] items-center justify-center">
      <div className="glass relative overflow-hidden rounded-2xl p-10 text-center">
        <div className="text-lg font-semibold">{title}</div>
        <div className="mt-2 text-sm text-[color:var(--text-secondary)]">Under Construction</div>

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <motion.div
            className="h-24 w-24 rounded-full border-2 border-[color:var(--border)]"
            animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.4, 0.65, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </div>
    </div>
  )
}
