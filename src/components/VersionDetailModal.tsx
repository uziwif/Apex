import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { X, Play, Download, StickyNote, Check, AlertTriangle } from 'lucide-react'
import type { VersionEntry } from './VersionCard'
import { useBuildNotesStore } from '../store/buildNotesStore'
import { useThemeStore, formatGroupName } from '../store/themeStore'

type Props = {
  open: boolean
  version: VersionEntry | null
  installed: boolean
  installPath: string
  onClose: () => void
  onPlay: () => void
  onDownload: () => void
}

export default function VersionDetailModal({ open, version, installed, installPath, onClose, onPlay, onDownload }: Props) {
  const { t } = useTranslation()
  const [editingNote, setEditingNote] = useState(false)
  const note = useBuildNotesStore((s) => version ? s.notes[version.id] ?? '' : '')
  const setNote = useBuildNotesStore((s) => s.setNote)
  const [noteText, setNoteText] = useState('')
  const groupFormat = useThemeStore((s) => s.groupFormat)

  if (!version) return null

  const openNoteEditor = () => {
    setNoteText(note)
    setEditingNote(true)
  }

  const saveNote = () => {
    setNote(version.id, noteText)
    setEditingNote(false)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-lg glass rounded-2xl overflow-hidden"
          >
            <div className="relative h-36 w-full">
              {version.splashArt ? (
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${version.splashArt})` }} />
              ) : (
                <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, hsl(${(version.id.charCodeAt(0) * 37 + version.id.charCodeAt(1) * 53) % 360}, 40%, 18%), hsl(${(version.id.charCodeAt(0) * 37 + version.id.charCodeAt(1) * 53 + 60) % 360}, 35%, 10%))` }} />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,10,10,0.95)] to-transparent" />
              <button type="button" onClick={onClose}
                className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-lg bg-black/40 text-white hover:bg-black/60 transition">
                <X size={14} />
              </button>
            </div>

            <div className="p-6 -mt-8 relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-xl font-bold">{version.displayName}</div>
                {installed && (
                  <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-[10px] font-semibold text-green-400">{t('config.installed')}</span>
                )}
                {version.manifestOnly && (
                  <span className="rounded-full bg-yellow-500/15 px-2 py-0.5 text-[10px] font-semibold text-yellow-400">{t('library.manifestOnly')}</span>
                )}
              </div>

              <div className="flex flex-col gap-2.5">
                <Row label={t('detail.buildId')} value={version.buildId} />
                <Row label={t('detail.group')} value={formatGroupName(version.group, groupFormat)} />
                <Row label={t('detail.sortIndex')} value={String(version.sortIndex)} />
                <Row label={t('detail.reliability')} value={
                  ['OT6.5','OT11','1.0','1.2.0','29.00','30.00','31.20','31.41','32.11'].includes(version.displayName)
                    ? <span className="inline-flex items-center gap-1.5" title="With normal configs, may possibly not load into playable matches."><AlertTriangle size={12} className="text-amber-400 shrink-0" /></span>
                    : (version.reliability === 'may-not-work' ? t('detail.mayNotWork') : t('detail.supported'))
                } />
                {installed && installPath && <Row label={t('detail.installPath')} value={installPath} mono />}
              </div>

              <div className="mt-4 border-t border-[rgba(255,255,255,0.06)] pt-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[color:var(--text-secondary)]">
                    <StickyNote size={12} /> {t('detail.notes')}
                  </div>
                  {!editingNote && (
                    <button type="button" onClick={openNoteEditor}
                      className="text-[10px] text-[color:var(--accent)] hover:underline">
                      {note ? t('detail.edit') : t('detail.addNote')}
                    </button>
                  )}
                </div>
                {editingNote ? (
                  <div className="flex flex-col gap-2">
                    <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)}
                      placeholder={t('detail.notePlaceholder')}
                      rows={3}
                      className="w-full rounded-lg border border-[color:var(--border)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-xs outline-none resize-none placeholder:text-[color:var(--text-secondary)] focus:border-[color:var(--accent)] transition-colors" />
                    <div className="flex gap-2 justify-end">
                      <button type="button" onClick={() => setEditingNote(false)}
                        className="rounded-lg px-3 py-1.5 text-[10px] font-semibold text-[color:var(--text-secondary)] hover:text-white transition">{t('common.cancel')}</button>
                      <button type="button" onClick={saveNote}
                        className="flex items-center gap-1 rounded-lg bg-[color:var(--accent)] px-3 py-1.5 text-[10px] font-semibold text-black hover:opacity-90 transition">
                        <Check size={10} /> {t('common.save')}
                      </button>
                    </div>
                  </div>
                ) : note ? (
                  <div className="text-xs text-white/70 whitespace-pre-wrap">{note}</div>
                ) : (
                  <div className="text-[11px] text-[color:var(--text-secondary)]">{t('detail.noNotes')}</div>
                )}
              </div>

              <div className="mt-5 flex gap-2">
                {installed ? (
                  <button type="button" onClick={() => { onPlay(); onClose() }}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[color:var(--play-green)] py-2.5 text-sm font-semibold text-black hover:opacity-90">
                    <Play size={14} fill="currentColor" /> {t('common.play')}
                  </button>
                ) : (
                  <button type="button" onClick={() => { onDownload(); onClose() }}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[color:var(--accent)] py-2.5 text-sm font-semibold text-black hover:opacity-90">
                    <Download size={14} /> {t('common.download')}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Row({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs text-[color:var(--text-secondary)] shrink-0">{label}</span>
      <span className={`text-xs text-white text-right ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  )
}
