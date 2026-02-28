import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'info'

export type Toast = {
  id: string
  message: string
  type: ToastType
  createdAt: number
}

type State = {
  toasts: Toast[]
  add: (message: string, type?: ToastType) => void
  dismiss: (id: string) => void
}

let _counter = 0

export const useToastStore = create<State>((set) => ({
  toasts: [],

  add: (message, type = 'info') => {
    const id = `toast-${++_counter}`
    const toast: Toast = { id, message, type, createdAt: Date.now() }
    set((s) => ({ toasts: [...s.toasts, toast] }))
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
    }, 4000)
  },

  dismiss: (id) => {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
  },
}))
