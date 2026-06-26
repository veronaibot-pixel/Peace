import { create } from 'zustand'
import { invoke } from '@tauri-apps/api/core'
import type { Pet } from '../types/pet'

interface PetStore {
  pet: Pet | null
  loading: boolean
  error: string | null
  fetchPet: () => Promise<void>
  feedPet: (foodValue: number, xpValue: number) => Promise<void>
}

export const usePetStore = create<PetStore>((set) => ({
  pet: null,
  loading: false,
  error: null,

  fetchPet: async () => {
    set({ loading: true, error: null })
    try {
      const pet = await invoke<Pet>('get_pet_state')
      set({ pet, loading: false })
    } catch (error) {
      set({ error: String(error), loading: false })
    }
  },

  feedPet: async (foodValue: number, xpValue: number) => {
    try {
      const pet = await invoke<Pet>('feed_pet', {
        foodValue,
        xpValue,
      })
      set({ pet })
    } catch (error) {
      set({ error: String(error) })
    }
  },
}))
