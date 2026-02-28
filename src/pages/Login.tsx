import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import AnimatedBackground from '../components/AnimatedBackground'

export default function Login() {
  const navigate = useNavigate()
  const [name, setName] = useState('')

  const handleContinue = () => {
    const displayName = name.trim() || 'Player'
    localStorage.setItem('apex-auth', JSON.stringify({ name: displayName }))
    navigate('/')
  }

  return (
    <div className="relative h-screen w-screen">
      <AnimatedBackground variant="login" />
      <div className="relative z-10 flex h-full w-full items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="glass w-full max-w-sm rounded-2xl p-8"
        >
          <div className="text-center">
            <div className="text-5xl font-extrabold tracking-wide">APEX</div>
            <div className="mt-2 text-sm text-[color:var(--text-secondary)]">
              Fortnite Version Launcher
            </div>
          </div>

          <div className="mt-8">
            <label className="text-xs font-medium text-[color:var(--text-secondary)]">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleContinue() }}
              placeholder="Enter your name..."
              maxLength={24}
              className="mt-1.5 w-full rounded-xl border border-[color:var(--border)] bg-[rgba(255,255,255,0.03)] px-4 py-3 text-sm outline-none placeholder:text-[color:var(--text-secondary)] focus:border-[color:var(--accent)]"
              autoFocus
            />
          </div>

          <button
            className="mt-4 w-full rounded-xl bg-[color:var(--accent)] px-4 py-3 font-semibold text-black hover:opacity-90 transition"
            type="button"
            onClick={handleContinue}
          >
            Continue
          </button>

          <p className="mt-4 text-center text-[10px] text-[color:var(--text-secondary)] leading-relaxed">
            You can change your name anytime in Settings.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
