import { useEffect, useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import type { Deck } from '../types/card'

export default function Library() {
  const [decks, setDecks] = useState<Deck[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    invoke<Deck[]>('get_decks')
      .then(setDecks)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="text-gray-500">Loading decks...</div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
        📚 Vocabulary Library
      </h1>

      <div className="grid gap-4">
        {decks.map((deck) => (
          <div
            key={deck.id}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 flex items-center justify-between"
          >
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                {deck.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {deck.description || `Level: ${deck.level}`} · {deck.total_cards} cards
              </p>
            </div>
            <div className="flex items-center gap-2">
              {deck.is_active ? (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                  Active
                </span>
              ) : (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                  Inactive
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {decks.length === 0 && (
        <p className="text-center text-gray-500">No decks available yet.</p>
      )}
    </div>
  )
}
