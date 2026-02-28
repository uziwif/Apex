import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useMemo, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import ThreeDotMenu from './ThreeDotMenu'

const WARNING_DISPLAY_NAMES = new Set(['OT6.5', 'OT11', '1.0', '1.2.0', '29.00', '30.00', '31.20', '31.41', '32.11'])
const WARNING_TOOLTIP = 'With normal configs, may possibly not load into playable matches.'

export type VersionEntry = {
  id: string
  displayName: string
  buildId: string
  group: string
  sortIndex: number
  reliability: string
  manifestOnly: boolean
  splashArt: string
}

export type VersionCardProps = {
  v: VersionEntry
  installed: boolean
  favourited: boolean
  onDownload: () => void
  onPlay: () => void
  onToggleFavourite: () => void
  onOpenDirectory?: () => void
  onRemoveFromLibrary?: () => void
  onMarkInstalled?: () => void
  onViewDetails?: () => void
}

export default function VersionCard({
  v,
  installed,
  favourited,
  onDownload,
  onPlay,
  onToggleFavourite,
  onOpenDirectory,
  onRemoveFromLibrary,
  onMarkInstalled,
  onViewDetails,
}: VersionCardProps) {
  const [burstKey, setBurstKey] = useState(0)
  const [starPopKey, setStarPopKey] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [imgError, setImgError] = useState(false)
  const onImgError = useCallback(() => setImgError(true), [])

  const menuItems = useMemo(() => {
    const items: import('./ThreeDotMenu').ThreeDotItem[] = []
    if (onViewDetails) {
      items.push({ type: 'action', label: 'View Details', onClick: onViewDetails })
    }
    if (installed && onOpenDirectory) {
      items.push({ type: 'action', label: 'Open Directory', onClick: onOpenDirectory })
    }
    items.push({
      type: 'action',
      label: favourited ? 'Remove from Favourites' : 'Add to Favourites',
      onClick: onToggleFavourite,
    })
    if (installed && onRemoveFromLibrary) {
      items.push({ type: 'divider' })
      items.push({ type: 'action', label: 'Remove from Library', onClick: onRemoveFromLibrary })
    }
    if (!installed && onMarkInstalled) {
      items.push({ type: 'divider' })
      items.push({ type: 'action', label: 'Mark as installed (dev)', onClick: onMarkInstalled })
    }
    return items
  }, [installed, favourited, onToggleFavourite, onOpenDirectory, onRemoveFromLibrary, onMarkInstalled, onViewDetails])

  const burstParticles = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => {
        const angle = (Math.PI * 2 * i) / 6
        const dist = 18
        return {
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist,
        }
      }),
    [],
  )

  const showWarningTriangle = WARNING_DISPLAY_NAMES.has(v.displayName)

  const manifestBadge = v.manifestOnly ? { label: 'Manifest Only', tip: 'This entry is manifest-only and may not be playable.' } : null

  return (
    <motion.div
      whileHover={{ scale: 1.035 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className={
        'group relative overflow-hidden rounded-xl border border-[color:var(--border)] ' +
        (v.manifestOnly ? 'opacity-80' : '')
      }
      style={{ aspectRatio: '16/9' }}
    >
      {v.splashArt && !imgError ? (
        <>
          <img src={v.splashArt} alt="" className="hidden" onError={onImgError} />
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${v.splashArt})` }} />
        </>
      ) : (
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, hsl(${(v.id.charCodeAt(0) * 37 + v.id.charCodeAt(1) * 53) % 360}, 40%, 18%) 0%, hsl(${(v.id.charCodeAt(0) * 37 + v.id.charCodeAt(1) * 53 + 60) % 360}, 35%, 10%) 100%)` }} />
      )}
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="absolute right-3 top-3 z-40">
        <button
          type="button"
          className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-[color:var(--border)] bg-transparent text-sm font-extrabold opacity-0 transition group-hover:opacity-100 hover:bg-[rgba(0,0,0,0.18)]"
          title="More options"
          onClick={(e) => {
            e.stopPropagation()
            setMenuOpen((o) => !o)
          }}
        >
          ⋮
        </button>
        <ThreeDotMenu
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          items={menuItems}
        />
      </div>
      <div className="absolute left-3 top-3 z-40">
        <button
          type="button"
          className={
            'relative flex h-8 w-8 items-center justify-center rounded-lg border border-[color:var(--border)] bg-transparent text-sm font-extrabold opacity-0 transition group-hover:opacity-100 hover:bg-[rgba(0,0,0,0.18)] '
          }
          title={favourited ? 'Unfavourite' : 'Favourite'}
          onClick={(e) => {
            e.stopPropagation()
            onToggleFavourite()
            setBurstKey((k) => k + 1)
            setStarPopKey((k) => k + 1)
          }}
        >
          <motion.span
            key={starPopKey}
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.35, 1] }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="leading-none"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                fill={favourited ? 'rgb(253 224 71)' : 'transparent'}
                stroke={favourited ? 'rgb(253 224 71)' : 'rgba(255,255,255,0.9)'}
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
          </motion.span>

          <AnimatePresence>
            {burstKey > 0 ? (
              <motion.div
                key={burstKey}
                className="pointer-events-none absolute inset-0"
                initial={{ opacity: 1, scale: 1 }}
                animate={{ opacity: 0, scale: 1.1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.55, ease: 'easeOut' }}
              >
                {burstParticles.map((p, idx) => (
                  <motion.div
                    key={idx}
                    className="absolute left-1/2 top-1/2 text-yellow-300"
                    initial={{ x: 0, y: 0, scale: 0.9, opacity: 1 }}
                    animate={{ x: p.x * 1.6, y: p.y * 1.6, scale: 1.2, opacity: 0 }}
                    transition={{ duration: 0.55, ease: 'easeOut' }}
                    style={{ marginLeft: -6, marginTop: -8 }}
                  >
                    ✦
                  </motion.div>
                ))}

                <motion.div
                  className="absolute left-1/2 top-1/2 h-10 w-10 rounded-full border border-yellow-300/60"
                  initial={{ opacity: 0.9, scale: 0.4 }}
                  animate={{ opacity: 0, scale: 1.4 }}
                  transition={{ duration: 0.55, ease: 'easeOut' }}
                  style={{ marginLeft: -20, marginTop: -20 }}
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </button>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-3">
        <div className="flex flex-wrap gap-1.5 mb-1.5">
          {manifestBadge ? (
            <div className="group/badge relative">
              <div className="rounded-md bg-black/60 border border-white/10 px-1.5 py-0.5 text-[10px] font-semibold text-white/90 leading-tight">
                {manifestBadge.label}
              </div>
              <div className="pointer-events-none absolute left-0 bottom-6 z-50 w-52 rounded-xl border border-[color:var(--border)] bg-[rgba(10,10,10,0.95)] p-2 text-[10px] text-white opacity-0 transition group-hover/badge:opacity-100" style={{ backdropFilter: 'blur(18px)' }}>
                {manifestBadge.tip}
              </div>
            </div>
          ) : null}
          {showWarningTriangle ? (
            <div className="group/badge relative inline-flex">
              <div className="flex items-center justify-center rounded-md bg-amber-500/20 border border-amber-400/20 p-1.5" title={WARNING_TOOLTIP}>
                <AlertTriangle size={12} className="text-amber-400" />
              </div>
              <div className="pointer-events-none absolute left-0 bottom-6 z-50 w-52 rounded-xl border border-[color:var(--border)] bg-[rgba(10,10,10,0.95)] p-2 text-[10px] text-white opacity-0 transition group-hover/badge:opacity-100" style={{ backdropFilter: 'blur(18px)' }}>
                {WARNING_TOOLTIP}
              </div>
            </div>
          ) : null}
        </div>
        <div className="flex items-end justify-between gap-2">
          <div className="min-w-0">
            <div className="truncate text-sm font-bold text-white drop-shadow-lg">{v.displayName}</div>
            <div className="truncate text-[11px] font-medium text-white/50 drop-shadow-md">{v.buildId}</div>
          </div>

          {installed ? (
            <div className="rounded-full bg-[rgba(34,197,94,0.16)] px-2 py-1 text-[11px] font-semibold text-[color:var(--play-green)]">
              Installed
            </div>
          ) : null}
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
        {installed ? (
          <button
            className="rounded-xl bg-[color:var(--play-green)] px-5 py-3 text-sm font-semibold text-black"
            type="button"
            onClick={onPlay}
            style={{ boxShadow: '0 0 24px var(--play-glow)' }}
          >
            Play
          </button>
        ) : (
          <button
            className="rounded-xl bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-black"
            type="button"
            onClick={onDownload}
            style={{ boxShadow: '0 0 24px var(--accent-glow)' }}
          >
            Download
          </button>
        )}
      </div>
    </motion.div>
  )
}
