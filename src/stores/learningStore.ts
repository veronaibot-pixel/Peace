import { create } from 'zustand'
import { invoke } from '@tauri-apps/api/core'
import type { SessionCard, SessionResult } from '../types/learning'

interface LearningStore {
  cards: SessionCard[]
  currentIndex: number
  results: SessionResult[]
  loading: boolean
  sessionActive: boolean
  startSession: (cardCount?: number) => Promise<void>
  submitAnswer: (cardId: number, answer: string) => Promise<SessionResult>
  nextCard: () => void
  endSession: () => void
}

export const useLearningStore = create<LearningStore>((set) => ({
  cards: [],
  currentIndex: 0,
  results: [],
  loading: false,
  sessionActive: false,

  startSession: async (cardCount = 10) => {
    set({ loading: true })
    try {
      const cards = await invoke<SessionCard[]>('start_session', { cardCount })
      set({
        cards,
        currentIndex: 0,
        results: [],
        loading: false,
        sessionActive: true,
      })
    } catch (error) {
      set({ loading: false })
      console.error('Failed to start session:', error)
    }
  },

  submitAnswer: async (cardId: number, answer: string) => {
    const result = await invoke<SessionResult>('submit_answer', {
      cardId,
      answer,
    })
    set((state) => ({ results: [...state.results, result] }))
    return result
  },

  nextCard: () => {
    set((state) => ({ currentIndex: state.currentIndex + 1 }))
  },

  endSession: () => {
    set({ sessionActive: false, cards: [], currentIndex: 0 })
  },
}))
