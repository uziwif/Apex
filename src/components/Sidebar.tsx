import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Download, Home, LibraryBig, Settings, Wrench, Globe, Sliders } from 'lucide-react'
import { useDownloadStore } from '../store/downloadStore'

function getAuthName(): string {
  try {
    const raw = localStorage.getItem('apex-auth')
    if (!raw) return 'Guest'
    return JSON.parse(raw)?.name || 'Guest'
  } catch { return 'Guest' }
}

const NAV_KEYS = [
  { to: '/', key: 'nav.home', icon: Home },
  { to: '/library', key: 'nav.library', icon: LibraryBig },
  { to: '/downloads', key: 'nav.downloads', icon: Download, showBadge: true },
  { to: '/config', key: 'nav.config', icon: Sliders },
  { to: '/online', key: 'nav.online', icon: Globe },
  { to: '/mods', key: 'home.mods', icon: Wrench },
]

export default function Sidebar() {
  const { t } = useTranslation()
  const activeCount = useDownloadStore((s) =>
    Object.values(s.active).filter((d) => d.status === 'downloading' || d.status === 'queued' || d.status === 'extracting').length,
  )

  return (
    <div className="relative h-full w-[220px] shrink-0 border-r border-[color:var(--border)] bg-[rgba(255,255,255,0.03)]">
      <div className="px-5 pt-6">
        <div className="text-xl font-extrabold tracking-wide">APEX</div>
      </div>

      <div className="mt-6 flex flex-col gap-1 px-3">
        {NAV_KEYS.map((item) => {
          const Icon = item.icon
          const badge = item.showBadge && activeCount > 0 ? activeCount : 0
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ` +
                (isActive
                  ? 'bg-gray-600/40 text-white'
                  : 'text-[color:var(--text-secondary)] hover:bg-[rgba(255,255,255,0.05)] hover:text-white')
              }
            >
              <Icon size={18} />
              <span className="font-medium flex-1">{t(item.key)}</span>
              {badge > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gray-500 px-1.5 text-[10px] font-bold text-white">
                  {badge}
                </span>
              )}
            </NavLink>
          )
        })}
      </div>

      <div className="absolute bottom-0 left-0 w-[220px] border-t border-[color:var(--border)] p-3 flex flex-col gap-1">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            'flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ' +
            (isActive
              ? 'bg-gray-600/40 text-white'
              : 'text-[color:var(--text-secondary)] hover:bg-[rgba(255,255,255,0.05)] hover:text-white')
          }
        >
          <Settings size={18} />
          <span className="font-medium">{t('nav.settings')}</span>
        </NavLink>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[rgba(255,255,255,0.03)]">
          <div className="h-6 w-6 rounded-full bg-gray-600 flex items-center justify-center text-[10px] font-bold text-white">
            {getAuthName().charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold text-white truncate">{getAuthName()}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
