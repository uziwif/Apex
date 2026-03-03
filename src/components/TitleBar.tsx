import { useState } from 'react'

function isTauri(): boolean {
  if (typeof window === 'undefined') return false
  const w = window as unknown as { __TAURI__?: unknown; __TAURI_INTERNALS__?: unknown }
  return !!(w.__TAURI__ ?? w.__TAURI_INTERNALS__)
}

export default function TitleBar() {
  const [closeHover, setCloseHover] = useState(false)

  const handleMinimize = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isTauri()) return
    import('@tauri-apps/api/window').then(({ getCurrentWindow }) =>
      getCurrentWindow().minimize()
    ).catch(() => {})
  }

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isTauri()) {
      window.close()
      return
    }
    import('@tauri-apps/api/window').then(({ getCurrentWindow }) =>
      getCurrentWindow().close()
    ).then(() =>
      import('@tauri-apps/plugin-process').then(({ exit }) => exit(0))
    ).catch(() => {
      import('@tauri-apps/plugin-process').then(({ exit }) => exit(0)).catch(() => {})
    })
  }

  return (
    <div className="relative h-8 shrink-0 flex items-center justify-end px-3 border-b border-[color:var(--border)] bg-[rgba(0,0,0,0.3)] select-none">
      <div data-tauri-drag-region className="absolute left-0 right-12 top-0 bottom-0" />
      <div className="relative z-10 flex items-center shrink-0 ml-auto">
        <button
          type="button"
          onClick={handleMinimize}
          className="h-8 w-12 flex items-center justify-center text-white/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          aria-label="Minimize"
        >
          <span className="text-lg leading-none">−</span>
        </button>
        <button
          type="button"
          onClick={handleClose}
          onMouseEnter={() => setCloseHover(true)}
          onMouseLeave={() => setCloseHover(false)}
          className={`h-8 w-12 flex items-center justify-center transition-colors cursor-pointer ${
            closeHover ? 'bg-red-500 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
          }`}
          aria-label="Close"
        >
          <span className="text-lg leading-none font-light">×</span>
        </button>
      </div>
    </div>
  )
}
