import { useEffect, useMemo, useRef } from 'react'
import { useThemeStore } from '../store/themeStore'
import type { BackgroundAnimation } from '../store/themeStore'

type Variant = 'login' | 'app'

function hexToRgb(hex: string) {
  const clean = hex.replace('#', '').trim()
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean
  const n = Number.parseInt(full, 16)
  return {
    r: (n >> 16) & 255,
    g: (n >> 8) & 255,
    b: n & 255,
  }
}

export default function AnimatedBackground({ variant }: { variant: Variant }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const bgAnimation: BackgroundAnimation = useThemeStore((s) => s.bgAnimation)
  const effectiveAnimation = variant === 'login' ? 'orbs' : bgAnimation

  const orbs = useMemo(() => {
    const vivid = variant === 'login'
    const baseRadius = vivid ? 260 : 190
    const speed = vivid ? 0.18 : 0.12
    return new Array(vivid ? 6 : 5).fill(0).map((_, i) => ({
      x: 200 + i * 220,
      y: 120 + i * 160,
      r: baseRadius + i * 30,
      vx: (i % 2 === 0 ? 1 : -1) * speed,
      vy: (i % 2 === 0 ? -1 : 1) * speed,
      seed: i * 1337,
    }))
  }, [variant])

  const stars = useMemo(() => {
    const count = 120
    return Array.from({ length: count }, (_, i) => ({
      x: Math.random() * 4000 - 500,
      y: Math.random() * 4000 - 500,
      r: 0.3 + Math.random() * 1.2,
      twinkle: i * 0.7,
      speed: 0.2 + Math.random() * 0.3,
    }))
  }, [])

  const particles = useMemo(() => {
    const count = 80
    return Array.from({ length: count }, (_, i) => ({
      x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1280),
      y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: 1 + Math.random() * 2,
      seed: i * 1.1,
    }))
  }, [])

  useEffect(() => {
    if (effectiveAnimation === 'none') return
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let running = true
    let t0 = performance.now()

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = Math.floor(window.innerWidth * dpr)
      canvas.height = Math.floor(window.innerHeight * dpr)
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const getAccent = () => {
      const accent = getComputedStyle(document.documentElement)
        .getPropertyValue('--accent')
        .trim()
      return accent || '#3b82f6'
    }

    const tick = () => {
      if (!running) return

      const { innerWidth: w, innerHeight: h } = window
      ctx.clearRect(0, 0, w, h)
      const t = (performance.now() - t0) / 1000
      const accent = hexToRgb(getAccent())

      if (effectiveAnimation === 'orbs') {
        const alpha = variant === 'login' ? 0.16 : 0.09
        for (const o of orbs) {
          const wobble = 0.65 + 0.35 * Math.sin(t * 0.9 + o.seed)
          o.x += o.vx * wobble
          o.y += o.vy * wobble
          if (o.x < -o.r) o.x = w + o.r
          if (o.x > w + o.r) o.x = -o.r
          if (o.y < -o.r) o.y = h + o.r
          if (o.y > h + o.r) o.y = -o.r

          const pulse = 1 + 0.08 * Math.sin(t * 0.8 + o.seed)
          const rr = o.r * pulse
          const shift = 18 * Math.sin(t * 0.25 + o.seed)
          const r = Math.max(0, Math.min(255, accent.r + shift))
          const g = Math.max(0, Math.min(255, accent.g + shift * 0.35))
          const b = Math.max(0, Math.min(255, accent.b - shift * 0.25))

          const grad = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r)
          grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`)
          grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`)
          ctx.fillStyle = grad
          ctx.beginPath()
          ctx.arc(o.x, o.y, rr, 0, Math.PI * 2)
          ctx.fill()
        }
      } else if (effectiveAnimation === 'stars') {
        const cx = w / 2
        const cy = h / 2
        for (const s of stars) {
          const px = cx + (s.x + t * s.speed * 30) % (w + 400) - 200
          const py = cy + (s.y + t * s.speed * 20) % (h + 400) - 200
          const twinkle = 0.4 + 0.6 * Math.sin(t * 2 + s.twinkle)
          ctx.fillStyle = `rgba(255, 255, 255, ${twinkle * 0.15})`
          ctx.beginPath()
          ctx.arc(px, py, s.r, 0, Math.PI * 2)
          ctx.fill()
        }
      } else if (effectiveAnimation === 'particles') {
        for (const p of particles) {
          p.x += p.vx
          p.y += p.vy
          if (p.x < 0 || p.x > w) p.vx *= -1
          if (p.y < 0 || p.y > h) p.vy *= -1
          p.x = Math.max(0, Math.min(w, p.x))
          p.y = Math.max(0, Math.min(h, p.y))
          const alpha = 0.06 + 0.04 * Math.sin(t + p.seed)
          ctx.fillStyle = `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${alpha})`
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      raf = window.requestAnimationFrame(tick)
    }

    const onFocus = () => {
      running = true
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(tick)
    }
    const onBlur = () => {
      running = false
      cancelAnimationFrame(raf)
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('focus', onFocus)
    window.addEventListener('blur', onBlur)
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('blur', onBlur)
    }
  }, [orbs, stars, particles, variant, effectiveAnimation])

  if (effectiveAnimation === 'none') return null

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-0"
    />
  )
}
