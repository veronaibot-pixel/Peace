import { useEffect, useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import type { Card } from '../types/card'

export default function MyWords() {
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    invoke<Card[]>('get_cards_by_deck', { deckId: 1 })
      .then(setCards)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="text-gray-500">Loading words...</div>
  }

  const stateColors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    learning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    review: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    relearning: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
        ⭐ My Words
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-750">
            <tr>
              <th className="text-left p-3 font-medium text-gray-600 dark:text-gray-400">Word</th>
              <th className="text-left p-3 font-medium text-gray-600 dark:text-gray-400">Meaning</th>
              <th className="text-left p-3 font-medium text-gray-600 dark:text-gray-400">State</th>
              <th className="text-left p-3 font-medium text-gray-600 dark:text-gray-400">Reviews</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {cards.map((card) => (
              <tr key={card.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                <td className="p-3 font-medium text-gray-800 dark:text-gray-100">{card.front}</td>
                <td className="p-3 text-gray-600 dark:text-gray-400">{card.back}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${stateColors[card.state] || ''}`}>
                    {card.state}
                  </span>
                </td>
                <td className="p-3 text-gray-500">{card.review_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
