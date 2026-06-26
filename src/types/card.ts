export interface Deck {
  id: number
  name: string
  level: string
  description: string | null
  total_cards: number
  is_active: number
  created_at: string
}

export interface Card {
  id: number
  deck_id: number
  front: string
  back: string
  example_sentence: string | null
  phonetic: string | null
  difficulty: number
  stability: number
  retrievability: number
  last_review_at: string | null
  next_review_at: string | null
  review_count: number
  lapses: number
  state: 'new' | 'learning' | 'review' | 'relearning'
  created_at: string
}
