import { useState } from 'react'
import { useLearningStore } from '../stores/learningStore'
import { usePetStore } from '../stores/petStore'
import { motion, AnimatePresence } from 'framer-motion'

export default function Session() {
  const { cards, currentIndex, sessionActive, loading, startSession, submitAnswer, nextCard, endSession } = useLearningStore()
  const { feedPet } = usePetStore()
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [lastCorrect, setLastCorrect] = useState(false)

  const currentCard = cards[currentIndex]
  const isComplete = currentIndex >= cards.length && sessionActive

  if (!sessionActive) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center h-full gap-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          🎯 Learning Session
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-center">
          Review vocabulary cards to feed Peace and help it grow!
        </p>
        <button
          onClick={() => startSession(10)}
          disabled={loading}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Start Session (10 cards)'}
        </button>
      </div>
    )
  }

  if (isComplete) {
    const results = useLearningStore.getState().results
    const correct = results.filter((r) => r.correct).length
    const total = results.length
    const totalXp = results.reduce((sum, r) => sum + r.xp_earned, 0)

    return (
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center h-full gap-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          🎉 Session Complete!
        </h1>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 text-center space-y-3">
          <p className="text-4xl font-bold text-purple-600">{correct}/{total}</p>
          <p className="text-gray-500">Correct answers</p>
          <p className="text-sm text-gray-400">+{totalXp} XP earned</p>
        </div>
        <button
          onClick={endSession}
          className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 font-medium rounded-xl transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    )
  }

  if (!currentCard) {
    return <div className="text-gray-500">No cards due for review.</div>
  }

  const handleAnswer = async (answer: string) => {
    setSelectedAnswer(answer)
    const result = await submitAnswer(currentCard.card.id, answer)
    setLastCorrect(result.correct)
    setShowResult(true)

    if (result.correct) {
      await feedPet(result.food_value, result.xp_earned)
    }

    setTimeout(() => {
      setShowResult(false)
      setSelectedAnswer(null)
      nextCard()
    }, 1500)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">{currentIndex + 1}/{cards.length}</span>
        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-500 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentCard.card.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 text-center"
        >
          <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            {currentCard.card.front}
          </p>
          {currentCard.card.phonetic && (
            <p className="text-sm text-gray-400 mb-4">{currentCard.card.phonetic}</p>
          )}
          {currentCard.card.example_sentence && (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
              "{currentCard.card.example_sentence}"
            </p>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3">
        {currentCard.options.map((option, i) => {
          let btnClass = 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-purple-400'
          if (showResult && option === currentCard.card.back) {
            btnClass = 'bg-green-100 dark:bg-green-900 border-2 border-green-500'
          } else if (showResult && option === selectedAnswer && !lastCorrect) {
            btnClass = 'bg-red-100 dark:bg-red-900 border-2 border-red-500'
          }

          return (
            <button
              key={i}
              onClick={() => !showResult && handleAnswer(option)}
              disabled={showResult}
              className={`p-4 rounded-xl text-left font-medium transition-all ${btnClass} disabled:cursor-default`}
            >
              <span className="text-gray-800 dark:text-gray-100">{option}</span>
            </button>
          )
        })}
      </div>

      {/* Result feedback */}
      {showResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`text-center text-lg font-semibold ${lastCorrect ? 'text-green-600' : 'text-red-600'}`}
        >
          {lastCorrect ? '✅ Correct! Peace is happy!' : '❌ Wrong — the correct answer is highlighted'}
        </motion.div>
      )}
    </div>
  )
}
