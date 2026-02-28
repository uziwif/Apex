import { create } from 'zustand'

const LS_KEY = 'apex-accent-color'
const BG_KEY = 'apex-bg-preset'
const GROUP_FORMAT_KEY = 'apex-group-format'
const BG_ANIMATION_KEY = 'apex-bg-animation'

export type BackgroundAnimation = 'orbs' | 'stars' | 'particles' | 'none'

export const BG_ANIMATION_OPTIONS: { id: BackgroundAnimation; name: string }[] = [
  { id: 'orbs', name: 'Orbs' },
  { id: 'stars', name: 'Stars' },
  { id: 'particles', name: 'Particles' },
  { id: 'none', name: 'None' },
]

export type AccentPreset = {
  name: string
  accent: string
  glow: string
}

export type BgPreset = {
  id: string
  name: string
  bg: string
}

export const ACCENT_PRESETS: AccentPreset[] = [
  { name: 'Blue',      accent: '#3b82f6', glow: 'rgba(59, 130, 246, 0.3)' },
  { name: 'Purple',    accent: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.3)' },
  { name: 'Pink',      accent: '#ec4899', glow: 'rgba(236, 72, 153, 0.3)' },
  { name: 'Red',       accent: '#ef4444', glow: 'rgba(239, 68, 68, 0.3)' },
  { name: 'Orange',    accent: '#f97316', glow: 'rgba(249, 115, 22, 0.3)' },
  { name: 'Yellow',    accent: '#eab308', glow: 'rgba(234, 179, 8, 0.3)' },
  { name: 'Green',     accent: '#22c55e', glow: 'rgba(34, 197, 94, 0.3)' },
  { name: 'Teal',      accent: '#14b8a6', glow: 'rgba(20, 184, 166, 0.3)' },
  { name: 'Cyan',      accent: '#06b6d4', glow: 'rgba(6, 182, 212, 0.3)' },
  { name: 'White',     accent: '#e5e5e5', glow: 'rgba(229, 229, 229, 0.3)' },
]

export const BG_PRESETS: BgPreset[] = [
  { id: 'default', name: 'Default', bg: '#0a0a0a' },
  { id: 'midnight', name: 'Midnight', bg: '#060614' },
  { id: 'charcoal', name: 'Charcoal', bg: '#121212' },
  { id: 'deep-blue', name: 'Deep Blue', bg: '#0a0e1a' },
  { id: 'dark-green', name: 'Forest', bg: '#060e0a' },
  { id: 'warm', name: 'Warm', bg: '#100a06' },
  { id: 'abyss', name: 'Abyss', bg: '#000000' },
  { id: 'slate', name: 'Slate', bg: '#0f1218' },
]

export type GroupFormat = 'short' | 'full'

const GROUP_FULL_MAP: Record<string, string> = {
  'Pre-Season': 'Pre-Season',
  'Season 1': 'Season 1', 'Season 2': 'Season 2', 'Season 3': 'Season 3',
  'Season 4': 'Season 4', 'Season 5': 'Season 5', 'Season 6': 'Season 6',
  'Season 7': 'Season 7', 'Season 8': 'Season 8', 'Season 9': 'Season 9',
  'Season X': 'Season X',
  'CH2 S1': 'Chapter 2 Season 1', 'CH2 S2': 'Chapter 2 Season 2',
  'CH2 S3': 'Chapter 2 Season 3', 'CH2 S4': 'Chapter 2 Season 4',
  'CH2 S5': 'Chapter 2 Season 5', 'CH2 S6': 'Chapter 2 Season 6',
  'CH2 S7': 'Chapter 2 Season 7', 'CH2 S8': 'Chapter 2 Season 8',
  'CH3 S1': 'Chapter 3 Season 1', 'CH3 S2': 'Chapter 3 Season 2',
  'CH3 S3': 'Chapter 3 Season 3', 'CH3 S4': 'Chapter 3 Season 4',
  'CH4 S1': 'Chapter 4 Season 1', 'CH4 S2': 'Chapter 4 Season 2',
  'CH4 S3': 'Chapter 4 Season 3', 'CH4 S4': 'Chapter 4 Season 4',
  'CH5 S1': 'Chapter 5 Season 1', 'CH5 S2': 'Chapter 5 Season 2',
  'CH5 S3': 'Chapter 5 Season 3', 'CH5 S4': 'Chapter 5 Season 4',
  'CH6 S1': 'Chapter 6 Season 1', 'CH6 S2': 'Chapter 6 Season 2',
  'CH6 S3': 'Chapter 6 Season 3', 'CH6 S4': 'Chapter 6 Season 4',
  'CH6 Star Wars': 'Chapter 6 Star Wars', 'CH7 S1': 'Chapter 7 Season 1',
  'OG Season': 'OG Season', 'Chapter 2 Remix': 'Chapter 2 Remix',
  'Simpsons Season': 'Simpsons Season', 'Other/Misc': 'Other/Misc',
}

export function formatGroupName(name: string, format: GroupFormat): string {
  if (format === 'full') return GROUP_FULL_MAP[name] ?? name
  return name
}

function getStored(): AccentPreset {
  if (typeof window === 'undefined') return ACCENT_PRESETS[0]
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return ACCENT_PRESETS[0]
    return JSON.parse(raw) as AccentPreset
  } catch { return ACCENT_PRESETS[0] }
}

function getStoredBg(): BgPreset {
  if (typeof window === 'undefined') return BG_PRESETS[0]
  try {
    const raw = localStorage.getItem(BG_KEY)
    if (!raw) return BG_PRESETS[0]
    return JSON.parse(raw) as BgPreset
  } catch { return BG_PRESETS[0] }
}

function getStoredGroupFormat(): GroupFormat {
  try { return (localStorage.getItem(GROUP_FORMAT_KEY) as GroupFormat) || 'short' } catch { return 'short' }
}

function getStoredBgAnimation(): BackgroundAnimation {
  try { return (localStorage.getItem(BG_ANIMATION_KEY) as BackgroundAnimation) || 'orbs' } catch { return 'orbs' }
}

function applyToDOM(preset: AccentPreset) {
  document.documentElement.style.setProperty('--accent', preset.accent)
  document.documentElement.style.setProperty('--accent-glow', preset.glow)
}

function applyBgToDOM(bg: BgPreset) {
  document.documentElement.style.setProperty('--bg-primary', bg.bg)
  document.body.style.background = bg.bg
}

type State = {
  current: AccentPreset
  bgPreset: BgPreset
  groupFormat: GroupFormat
  bgAnimation: BackgroundAnimation
  setAccent: (preset: AccentPreset) => void
  setBg: (preset: BgPreset) => void
  setGroupFormat: (f: GroupFormat) => void
  setBgAnimation: (a: BackgroundAnimation) => void
}

export const useThemeStore = create<State>((set) => {
  const initial = getStored()
  const initialBg = getStoredBg()
  const initialGroupFormat = getStoredGroupFormat()
  if (typeof window !== 'undefined') {
    applyToDOM(initial)
    applyBgToDOM(initialBg)
  }

  return {
    current: initial,
    bgPreset: initialBg,
    groupFormat: initialGroupFormat,
    bgAnimation: getStoredBgAnimation(),
    setAccent: (preset) => {
      localStorage.setItem(LS_KEY, JSON.stringify(preset))
      applyToDOM(preset)
      set({ current: preset })
    },
    setBg: (preset) => {
      localStorage.setItem(BG_KEY, JSON.stringify(preset))
      applyBgToDOM(preset)
      set({ bgPreset: preset })
    },
    setGroupFormat: (f) => {
      localStorage.setItem(GROUP_FORMAT_KEY, f)
      set({ groupFormat: f })
    },
    setBgAnimation: (a) => {
      localStorage.setItem(BG_ANIMATION_KEY, a)
      set({ bgAnimation: a })
    },
  }
})
