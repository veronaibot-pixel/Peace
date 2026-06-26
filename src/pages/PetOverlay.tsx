import { useEffect, useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import type { Pet } from '../types/pet'

export default function PetOverlay() {
  const [pet, setPet] = useState<Pet | null>(null)

  useEffect(() => {
    const fetchPet = () => {
      invoke<Pet>('get_pet_state')
        .then(setPet)
        .catch(console.error)
    }
    fetchPet()
    const interval = setInterval(fetchPet, 30000) // refresh every 30s
    return () => clearInterval(interval)
  }, [])

  const stageEmoji: Record<string, string> = {
    egg: '🥚',
    baby: '🐣',
    child: '🐥',
    companion: '🐦',
  }

  const stateAnimation: Record<string, string> = {
    idle: 'animate-bounce-slow',
    walking: 'animate-walk',
    sleeping: 'opacity-60',
    happy: 'animate-bounce',
    hungry: 'animate-pulse',
    sad: 'opacity-50',
  }

  if (!pet) return null

  return (
    <div className="w-full h-full flex items-center justify-center bg-transparent select-none">
      <div
        className={`text-8xl cursor-pointer transition-all duration-300 ${stateAnimation[pet.state] || ''}`}
        onDoubleClick={() => invoke('show_main_window')}
        title={`${pet.name} - ${pet.state}\nDouble-click to open dashboard`}
      >
        {stageEmoji[pet.stage] || '🥚'}
      </div>

      {/* Speech bubble when hungry */}
      {pet.hunger < 30 && (
        <div className="absolute top-2 right-2 bg-white rounded-lg px-2 py-1 text-xs shadow-md">
          I'm hungry! 📖
        </div>
      )}
    </div>
  )
}
