export interface SessionCard {
  card: import('./card').Card
  options: string[]
}

export interface SessionResult {
  correct: boolean
  xp_earned: number
  food_value: number
  next_review_at: string | null
}

export interface DailyStats {
  id: number
  date: string
  cards_reviewed: number
  cards_learned: number
  correct_answers: number
  wrong_answers: number
  xp_earned: number
  study_time_seconds: number
}
