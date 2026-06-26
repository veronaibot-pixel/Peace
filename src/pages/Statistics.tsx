import { useEffect, useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import type { DailyStats } from '../types/learning'

export default function Statistics() {
  const [stats, setStats] = useState<DailyStats[]>([])
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      invoke<DailyStats[]>('get_daily_stats', { days: 7 }),
      invoke<number>('get_streak'),
    ])
      .then(([statsData, streakData]) => {
        setStats(statsData)
        setStreak(streakData)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="text-gray-500">Loading statistics...</div>
  }

  const totalReviewed = stats.reduce((sum, s) => sum + s.cards_reviewed, 0)
  const totalCorrect = stats.reduce((sum, s) => sum + s.correct_answers, 0)
  const accuracy = totalReviewed > 0 ? Math.round((totalCorrect / totalReviewed) * 100) : 0

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
        📊 Statistics
      </h1>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Streak" value={`${streak} days`} emoji="🔥" />
        <StatCard label="This Week" value={`${totalReviewed} cards`} emoji="📖" />
        <StatCard label="Accuracy" value={`${accuracy}%`} emoji="🎯" />
        <StatCard label="Total XP" value={`${stats.reduce((s, d) => s + d.xp_earned, 0)}`} emoji="⭐" />
      </div>

      {/* Daily breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Last 7 Days</h2>
        {stats.length > 0 ? (
          <div className="space-y-2">
            {stats.map((day) => (
              <div key={day.date} className="flex items-center gap-3">
                <span className="text-sm text-gray-500 w-24">{day.date}</span>
                <div className="flex-1 h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${Math.min((day.cards_reviewed / 20) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-sm text-gray-500 w-12 text-right">{day.cards_reviewed}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center">No data yet. Start learning!</p>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, emoji }: { label: string; value: string; emoji: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-center">
      <p className="text-2xl mb-1">{emoji}</p>
      <p className="text-lg font-bold text-gray-800 dark:text-gray-100">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  )
}
