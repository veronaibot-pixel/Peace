import { useEffect, useState, useCallback } from 'react'
import { invoke } from '@tauri-apps/api/core'
import type { Pet } from '../types/pet'

interface QuizData {
  card_id: number
  word: string
  options: string[]
  correct: string
}

export default function PetOverlay() {
  const [pet, setPet] = useState<Pet | null>(null)
  const [quiz, setQuiz] = useState<QuizData | null>(null)
  const [showQuiz, setShowQuiz] = useState(false)
  const [feedbackState, setFeedbackState] = useState<'none' | 'correct' | 'wrong'>('none')
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; emoji: string }[]>([])

  useEffect(() => {
    const fetchPet = () => {
      invoke<Pet>('get_pet_state')
        .then(setPet)
        .catch(console.error)
    }
    fetchPet()
    const interval = setInterval(fetchPet, 10000)
    return () => clearInterval(interval)
  }, [])

  const startQuiz = useCallback(async () => {
    try {
      const data = await invoke<QuizData | null>('get_quiz_card')
      if (data) {
        setQuiz(data)
        setShowQuiz(true)
      }
    } catch (e) {
      console.error('Failed to get quiz:', e)
    }
  }, [])

  const handleAnswer = async (answer: string) => {
    if (!quiz) return

    try {
      const result = await invoke<{ correct: boolean; xp_earned: number; food_value: number }>(
        'submit_answer',
        { cardId: quiz.card_id, answer }
      )

      if (result.correct) {
        setFeedbackState('correct')
        // Feed pet
        await invoke('feed_pet', { foodValue: result.food_value, xpValue: result.xp_earned })
        // Refresh pet state
        const updatedPet = await invoke<Pet>('get_pet_state')
        setPet(updatedPet)
        // Show particles
        spawnParticles()
      } else {
        setFeedbackState('wrong')
      }

      setTimeout(() => {
        setFeedbackState('none')
        setShowQuiz(false)
        setQuiz(null)
      }, 1500)
    } catch (e) {
      console.error(e)
    }
  }

  const spawnParticles = () => {
    const newParticles = Array.from({ length: 6 }, (_, i) => ({
      id: Date.now() + i,
      x: 50 + (Math.random() - 0.5) * 80,
      y: 50 + (Math.random() - 0.5) * 40,
      emoji: ['✨', '⭐', '🍖', '💛', '🔥', '❤️'][i],
    }))
    setParticles(newParticles)
    setTimeout(() => setParticles([]), 1500)
  }

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
    <div className="w-full h-full flex flex-col items-center justify-center select-none overflow-hidden"
      style={{ background: 'transparent' }}>

      {/* Quiz popup - word appears above pet */}
      {showQuiz && quiz && (
        <div className="absolute top-0 left-0 right-0 bottom-0 flex flex-col items-center justify-start pt-2 z-10">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-3 w-44 border border-gray-200">
            <p className="text-center font-bold text-gray-800 text-sm mb-2">
              🇬🇧 {quiz.word}
            </p>
            <div className="grid grid-cols-1 gap-1">
              {quiz.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(opt)}
                  disabled={feedbackState !== 'none'}
                  className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all
                    ${feedbackState === 'correct' && opt === quiz.correct
                      ? 'bg-green-400 text-white'
                      : feedbackState === 'wrong' && opt === quiz.correct
                      ? 'bg-green-400 text-white'
                      : feedbackState === 'wrong' && opt !== quiz.correct
                      ? 'bg-red-100 text-red-600'
                      : 'bg-gray-100 hover:bg-purple-100 text-gray-700 hover:text-purple-700'
                    }
                    disabled:cursor-default`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Feedback overlay */}
      {feedbackState === 'correct' && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <span className="text-3xl animate-ping">✅</span>
        </div>
      )}
      {feedbackState === 'wrong' && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <span className="text-3xl animate-ping">❌</span>
        </div>
      )}

      {/* Particles */}
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute text-lg animate-particle pointer-events-none"
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
        >
          {p.emoji}
        </span>
      ))}

      {/* Pet sprite */}
      <div
        className={`relative cursor-pointer transition-all duration-300 ${stateAnimation[pet.state] || 'animate-float'} ${feedbackState === 'correct' ? 'scale-110' : ''}`}
        onClick={!showQuiz ? startQuiz : undefined}
        onDoubleClick={() => invoke('show_main_window')}
        title={`${pet.name} - Lv.${pet.level}\nClick: Feed | Double-click: Dashboard`}
      >
        <img
          src={spriteMap[pet.stage] || spriteMap.egg}
          alt={pet.name}
          className="w-28 h-28 drop-shadow-lg"
          draggable={false}
        />
      </div>

      {/* Status bar under pet */}
      {!showQuiz && (
        <div className="mt-1 flex flex-col items-center gap-0.5">
          {/* Hunger bar */}
          <div className="w-20 h-1.5 bg-gray-300/50 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${pet.hunger > 50 ? 'bg-green-400' : pet.hunger > 20 ? 'bg-yellow-400' : 'bg-red-400'}`}
              style={{ width: `${pet.hunger}%` }}
            />
          </div>
          <span className="text-[9px] text-gray-600 font-medium">
            Lv.{pet.level} {pet.hunger < 30 ? '🍖 Click to feed!' : ''}
          </span>
        </div>
      )}

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
        @keyframes particle {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-30px) scale(0.5); opacity: 0; }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-walk { animation: walk 1.5s ease-in-out infinite; }
        .animate-shake { animation: shake 0.5s ease-in-out infinite; }
        .animate-sad { animation: sad 2s ease-in-out infinite; }
        .animate-sleep { animation: sleep 3s ease-in-out infinite; }
        .animate-particle { animation: particle 1.5s ease-out forwards; }
      `}</style>
    </div>
  )
}
