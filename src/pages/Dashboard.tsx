import { useEffect } from 'react'
import { usePetStore } from '../stores/petStore'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const { pet, loading, fetchPet } = usePetStore()
  const navigate = useNavigate()

  useEffect(() => {
    fetchPet()
  }, [fetchPet])

  if (loading || !pet) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  const stageEmoji: Record<string, string> = {
    egg: '🥚',
    baby: '🐣',
    child: '🐥',
    companion: '🐦',
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
        Dashboard
      </h1>

      {/* Pet Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-6">
          <div className="text-6xl">{stageEmoji[pet.stage] || '🥚'}</div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              {pet.name}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Level {pet.level} · {pet.stage} · {pet.xp} XP
            </p>

            {/* Attribute bars */}
            <div className="mt-4 space-y-2">
              <AttributeBar label="Hunger" value={pet.hunger} color="bg-orange-400" />
              <AttributeBar label="Energy" value={pet.energy} color="bg-blue-400" />
              <AttributeBar label="Happiness" value={pet.happiness} color="bg-pink-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => navigate('/session')}
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl p-4 text-left transition-colors"
        >
          <p className="font-semibold">▶ Start Learning</p>
          <p className="text-sm text-purple-200 mt-1">Feed Peace with knowledge</p>
        </button>
        <button
          onClick={() => navigate('/library')}
          className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-left transition-colors"
        >
          <p className="font-semibold text-gray-800 dark:text-gray-100">📚 Library</p>
          <p className="text-sm text-gray-500 mt-1">Browse vocabulary decks</p>
        </button>
      </div>

      {/* Pet state indicator */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        Peace is currently <strong>{pet.state}</strong>
        {pet.hunger < 30 && ' — Peace is getting hungry! Time to learn 📖'}
      </div>
    </div>
  )
}

function AttributeBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 dark:text-gray-400 w-16">{label}</span>
      <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs text-gray-500 dark:text-gray-400 w-8">{Math.round(value)}</span>
    </div>
  )
}
