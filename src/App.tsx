import { useCallback, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLocation, Navigate, Route, Routes } from 'react-router-dom'
import LoadingScreen from './components/LoadingScreen'
import TitleBar from './components/TitleBar'
import ToastContainer from './components/ToastContainer'
import ChangelogModal from './components/ChangelogModal'
import LanguagePickerModal from './components/LanguagePickerModal'
import SetupTutorial from './components/SetupTutorial'
import Login from './pages/Login'
import Home from './pages/Home'
import Library from './pages/Library'
import Downloads from './pages/Downloads'
import Config from './pages/Config'
import Mods from './pages/Mods'
import Settings from './pages/Settings'
import Online from './pages/Online'

const pageVariants = {
  initial: { opacity: 0, x: 24 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: {
    opacity: 0,
    x: -16,
    transition: { duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

function AnimatedRoute({ pathKey, children }: { pathKey: string; children: React.ReactNode }) {
  return (
    <motion.div key={pathKey} variants={pageVariants} initial="initial" animate="animate" exit="exit" className="absolute inset-0">
      {children}
    </motion.div>
  )
}

function isLoggedIn() {
  try {
    return !!localStorage.getItem('apex-auth')
  } catch {
    return false
  }
}

export default function App() {
  const location = useLocation()
  const [loaded, setLoaded] = useState(false)
  const onLoadingDone = useCallback(() => setLoaded(true), [])

  if (!loaded) {
    return <LoadingScreen onDone={onLoadingDone} />
  }

  if (!isLoggedIn() && location.pathname !== '/login') {
    return <Navigate to="/login" replace />
  }

  if (location.pathname === '/login') {
    return (
      <div className="relative min-h-screen w-full">
        <Routes><Route path="/login" element={<Login />} /></Routes>
        <ToastContainer />
        <ChangelogModal />
        <LanguagePickerModal />
        <SetupTutorial />
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-[var(--bg-primary)]">
      <TitleBar />
      <div className="flex-1 min-h-0 relative">
        <AnimatePresence mode="wait">
          <Routes location={location}>
          <Route path="/" element={<AnimatedRoute pathKey="/"><Home /></AnimatedRoute>} />
          <Route path="/library" element={<AnimatedRoute pathKey="/library"><Library /></AnimatedRoute>} />
          <Route path="/downloads" element={<AnimatedRoute pathKey="/downloads"><Downloads /></AnimatedRoute>} />
          <Route path="/config" element={<AnimatedRoute pathKey="/config"><Config /></AnimatedRoute>} />
          <Route path="/online" element={<AnimatedRoute pathKey="/online"><Online /></AnimatedRoute>} />
          <Route path="/mods" element={<AnimatedRoute pathKey="/mods"><Mods /></AnimatedRoute>} />
          <Route path="/settings" element={<AnimatedRoute pathKey="/settings"><Settings /></AnimatedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </div>
      <ToastContainer />
      <ChangelogModal />
      <LanguagePickerModal />
      <SetupTutorial />
    </div>
  )
}
