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
    const interval = setInterval(fetchPet, 30000)
    return () => clearInterval(interval)
  }, [])

  if (!pet) return null

  const spriteMap: Record<string, string> = {
    egg: '/assets/sprites/egg.svg',
    baby: '/assets/sprites/baby.svg',
    child: '/assets/sprites/child.svg',
    companion: '/assets/sprites/companion.svg',
  }

  const stateAnimation: Record<string, string> = {
    idle: 'animate-float',
    walking: 'animate-walk',
    sleeping: 'animate-sleep',
    happy: 'animate-bounce',
    hungry: 'animate-shake',
    sad: 'animate-sad',
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-transparent select-none overflow-hidden">
      <div
        className={`relative cursor-pointer transition-all duration-300 ${stateAnimation[pet.state] || 'animate-float'}`}
        onDoubleClick={() => invoke('show_main_window')}
        title={`${pet.name} - Lv.${pet.level} ${pet.stage}\nDouble-click to open dashboard`}
      >
        <img
          src={spriteMap[pet.stage] || spriteMap.egg}
          alt={pet.name}
          className="w-32 h-32 drop-shadow-lg"
          draggable={false}
        />

        {/* Status indicator */}
        {pet.hunger < 30 && (
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white rounded-full px-2 py-0.5 text-xs shadow-md whitespace-nowrap animate-bounce">
            🍖 Hungry!
          </div>
        )}
        {pet.state === 'happy' && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-lg animate-ping">
            ✨
          </div>
        )}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes walk {
          0%, 100% { transform: translateX(0px); }
          25% { transform: translateX(-8px) rotate(-3deg); }
          75% { transform: translateX(8px) rotate(3deg); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-3px); }
          75% { transform: translateX(3px); }
        }
        @keyframes sad {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(2px) scale(0.97); }
        }
        @keyframes sleep {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(0.96); opacity: 0.6; }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-walk { animation: walk 1.5s ease-in-out infinite; }
        .animate-shake { animation: shake 0.5s ease-in-out infinite; }
        .animate-sad { animation: sad 2s ease-in-out infinite; }
        .animate-sleep { animation: sleep 3s ease-in-out infinite; }
      `}</style>
    </div>
  )
}
