import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Clock, Star, Play, ArrowRight } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import AnimatedBackground from '../components/AnimatedBackground'
import versions from '../data/versions.json'
import { useInstalledStore } from '../store/installedStore'
import { useFavouritesStore } from '../store/favouritesStore'
import { useDownloadStore } from '../store/downloadStore'
import { useRecentlyPlayedStore } from '../store/recentlyPlayedStore'
import { useThemeStore, formatGroupName } from '../store/themeStore'
import { launchVersion } from '../lib/launch'

function getAuthName(): string {
  try {
    const raw = localStorage.getItem('apex-auth')
    if (!raw) return 'Guest'
    return JSON.parse(raw)?.name || 'Guest'
  } catch { return 'Guest' }
}

const downloadableCount = versions.filter((v) => !v.manifestOnly).length

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const fadeUp = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } } }

const getBannerSrc = (): string => {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/?$/, '')
  return `${base}/assets/splash/newstab.png?v=1`
}

export default function Home() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [bannerError, setBannerError] = useState(false)
  const installedIds = useInstalledStore((s) => s.installedVersionIds)
  const isInstalled = useInstalledStore((s) => s.isInstalled)
  const favIds = useFavouritesStore((s) => s.ids)
  const activeDownloads = useDownloadStore((s) => Object.values(s.active))
  const recentEntries = useRecentlyPlayedStore((s) => s.entries)
  const groupFormat = useThemeStore((s) => s.groupFormat)

  const installed = useMemo(() => versions.filter((v) => installedIds.includes(v.id)), [installedIds])
  const favourites = useMemo(() => versions.filter((v) => favIds.includes(v.id)).slice(0, 4), [favIds])
  const recentlyPlayed = useMemo(() => {
    return recentEntries
      .map((e) => versions.find((v) => v.id === e.versionId))
      .filter(Boolean) as typeof versions
  }, [recentEntries])
  const downloading = activeDownloads.filter((d) => d.status === 'downloading' || d.status === 'queued')

  return (
    <div className="relative h-full w-full">
      <AnimatedBackground variant="app" />
      <div className="relative z-10 flex h-full w-full">
        <Sidebar />
        <div className="flex-1 overflow-hidden flex flex-col p-5 gap-3">
          <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col h-full overflow-hidden gap-3">

            <div className="flex items-baseline justify-between shrink-0">
              <motion.div variants={fadeUp} className="text-xl font-bold tracking-tight">{t('home.title')}</motion.div>
              <motion.div variants={fadeUp} className="text-xs text-[color:var(--text-secondary)]">
                {t('home.hello')} <span className="text-white font-semibold">{getAuthName()}</span>
              </motion.div>
            </div>

            <div className="flex gap-3 flex-1 min-h-0">
              {/* Left column */}
              <div className="flex-[2] flex flex-col gap-3 min-h-0">
                {/* Banner */}
                <motion.div
                  variants={fadeUp}
                  whileHover={{ scale: 1.005 }}
                  className="relative overflow-hidden rounded-xl cursor-pointer group h-[180px] shrink-0"
                  onClick={() => navigate('/library')}
                >
                  {!bannerError ? (
                    <img
                      src={getBannerSrc()}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                      onError={() => setBannerError(true)}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a2e] via-[#16213e] to-[#0f3460]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
                  <div className="relative z-10 flex flex-col justify-end p-5 h-full">
                    <div className="text-xl font-extrabold tracking-tight">{t('home.getStarted')}</div>
                    <p className="mt-1 text-xs text-white/70 max-w-xs">{t('home.getStartedDesc')}</p>
                    <div className="mt-3">
                      <span className="inline-flex items-center gap-2 rounded-lg bg-[color:var(--accent)] px-4 py-1.5 text-xs font-semibold text-black transition-transform group-hover:scale-105">
                        {t('home.openLibrary')} <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Quick Launch / Recently Played / Installed */}
                <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1">
                  {favourites.length > 0 && (
                    <motion.div variants={fadeUp}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-xs font-semibold"><Star size={12} className="text-[color:var(--accent)]" /> {t('home.quickLaunch')}</div>
                        <button type="button" className="text-[10px] text-[color:var(--accent)] hover:underline" onClick={() => navigate('/library')}>{t('home.viewAll')}</button>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {favourites.map((v) => (
                          <VersionTile key={v.id} v={v} isInstalled={isInstalled(v.id)} groupFormat={groupFormat} onPlay={() => void launchVersion(v.id)} onGet={() => navigate('/library')} t={t} />
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {recentlyPlayed.length > 0 && (
                    <motion.div variants={fadeUp}>
                      <div className="flex items-center gap-2 text-xs font-semibold mb-2"><Clock size={12} className="text-[color:var(--text-secondary)]" /> {t('home.recentlyPlayed')}</div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {recentlyPlayed.slice(0, 4).map((v) => (
                          <VersionTile key={v.id} v={v} isInstalled groupFormat={groupFormat} onPlay={() => void launchVersion(v.id)} onGet={() => navigate('/library')} t={t} />
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {installed.length > 0 && !recentlyPlayed.length && !favourites.length && (
                    <motion.div variants={fadeUp}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-semibold">{t('home.continuePlaying')}</div>
                        <button type="button" className="text-[10px] text-[color:var(--accent)] hover:underline" onClick={() => navigate('/library')}>{t('home.viewAll')}</button>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {installed.slice(0, 4).map((v) => (
                          <VersionTile key={v.id} v={v} isInstalled groupFormat={groupFormat} onPlay={() => void launchVersion(v.id)} onGet={() => navigate('/library')} t={t} />
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {downloading.length > 0 && (
                    <motion.div variants={fadeUp}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-semibold">{t('home.downloading')} ({downloading.length})</div>
                        <button type="button" className="text-[10px] text-[color:var(--accent)] hover:underline" onClick={() => navigate('/downloads')}>{t('home.viewAll')}</button>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        {downloading.slice(0, 2).map((d) => {
                          const pct = d.totalBytes ? Math.min(100, (d.bytesDownloaded / d.totalBytes) * 100) : 0
                          return (
                            <div key={d.versionId} className="glass rounded-xl p-3">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold">{d.versionId}</span>
                                <span className="text-[color:var(--text-secondary)]">{Math.round(pct)}%</span>
                              </div>
                              <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
                                <motion.div className="h-full rounded-full bg-[color:var(--accent)]" animate={{ width: `${pct}%` }} transition={{ ease: 'easeOut' }} />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Right column - What's New */}
              <motion.div variants={fadeUp} className="flex-1 min-w-[260px] max-w-[320px] flex flex-col min-h-0">
                <div className="text-xs font-semibold mb-2 shrink-0">{t('home.whatsNew')}</div>
                <div className="glass rounded-xl p-4 flex-1 min-h-0 overflow-y-auto">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[11px] font-bold text-white">Apex Launcher</span>
                    <span className="rounded-full bg-[color:var(--accent)] px-1.5 py-px text-[9px] font-bold text-black">v1.0.0</span>
                    <span className="ml-auto text-[10px] text-[color:var(--text-secondary)]">Feb 2026</span>
                  </div>
                  <div className="space-y-2 text-[11px]">
                    {[
                      { color: 'bg-green-400', text: t('home.released'), sub: '' },
                      { color: 'bg-[color:var(--accent)]', text: t('home.download'), sub: `${downloadableCount} ${t('home.versionsAvailable')}` },
                      { color: 'bg-[color:var(--accent)]', text: t('home.configurable'), sub: '' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        <span className={`shrink-0 h-2 w-2 rounded-full ${item.color}`} />
                        <span className="text-white font-medium">{item.text}{item.sub ? <span className="text-[color:var(--text-secondary)] font-normal"> — {item.sub}</span> : null}</span>
                      </div>
                    ))}
                    <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.06)]">
                      <div className="text-[10px] font-semibold text-[color:var(--text-secondary)] mb-2">{t('home.comingSoon')}</div>
                      <div className="space-y-2">
                        {[t('home.onlineFunctions'), t('home.mods')].map((label) => (
                          <div key={label} className="flex items-center gap-2.5">
                            <span className="shrink-0 h-2 w-2 rounded-full bg-yellow-400/60" />
                            <span className="text-[color:var(--text-secondary)]">{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  )
}

function VersionTile({ v, isInstalled, groupFormat, onPlay, onGet, t }: {
  v: typeof versions[number]; isInstalled: boolean; groupFormat: 'short' | 'full'
  onPlay: () => void; onGet: () => void; t: (k: string) => string
}) {
  return (
    <motion.button type="button" whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
      className="glass rounded-lg p-2.5 text-left transition-shadow hover:shadow-lg hover:shadow-[color:var(--accent)]/5"
      onClick={() => { if (isInstalled) onPlay(); else onGet() }}>
      <div className="flex items-center gap-2.5">
        <Thumb v={v} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs font-semibold">{v.displayName}</div>
          <div className="text-[10px] text-[color:var(--text-secondary)]">{formatGroupName(v.group, groupFormat)}</div>
        </div>
        {isInstalled ? (
          <span className="shrink-0 flex items-center gap-1 rounded-md bg-[color:var(--play-green)] px-2 py-0.5 text-[10px] font-bold text-black"><Play size={8} fill="currentColor" />{t('home.play')}</span>
        ) : (
          <span className="shrink-0 rounded-md bg-[rgba(255,255,255,0.06)] px-2 py-0.5 text-[10px] font-semibold">{t('home.get')}</span>
        )}
      </div>
    </motion.button>
  )
}

function Thumb({ v }: { v: typeof versions[number] }) {
  return (
    <div
      className="h-8 w-8 shrink-0 rounded-md bg-cover bg-center"
      style={
        v.splashArt
          ? { backgroundImage: `url(${v.splashArt})` }
          : { background: `linear-gradient(135deg, hsl(${(v.id.charCodeAt(0) * 37) % 360}, 40%, 22%), hsl(${(v.id.charCodeAt(0) * 37 + 60) % 360}, 35%, 12%))` }
      }
    />
  )
}
