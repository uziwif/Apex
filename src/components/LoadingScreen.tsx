import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AnimatedBackground from './AnimatedBackground'

const LAUNCHER_VERSION = '1.0.0'

const STEPS = [
  'Checking for updates...',
  'Loading version data...',
  'Initializing launcher...',
]

export { LAUNCHER_VERSION }

export default function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []

    timers.push(setTimeout(() => { setStep(0); setProgress(20) }, 300))
    timers.push(setTimeout(() => { setStep(1); setProgress(55) }, 1200))
    timers.push(setTimeout(() => { setStep(2); setProgress(85) }, 2000))
    timers.push(setTimeout(() => { setProgress(100) }, 2600))
    timers.push(setTimeout(() => onDone(), 3000))

    return () => timers.forEach(clearTimeout)
  }, [onDone])

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <AnimatedBackground variant="login" />
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <div className="text-5xl font-extrabold tracking-wide">APEX</div>
          <div className="mt-2 text-xs text-[color:var(--text-secondary)]">v{LAUNCHER_VERSION}</div>
        </motion.div>

        <div className="mt-10 w-64">
          <div className="h-1 w-full overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
            <motion.div
              className="h-full rounded-full bg-[color:var(--accent)]"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="mt-3 text-center text-xs text-[color:var(--text-secondary)]"
            >
              {STEPS[step] ?? ''}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
