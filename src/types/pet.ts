export interface Pet {
  id: number
  name: string
  stage: 'egg' | 'baby' | 'child' | 'companion'
  xp: number
  level: number
  hunger: number
  energy: number
  happiness: number
  state: 'idle' | 'walking' | 'sleeping' | 'happy' | 'hungry' | 'sad'
  last_fed_at: string | null
  last_interaction_at: string
  created_at: string
}

export type PetStage = 'egg' | 'baby' | 'child' | 'companion'
export type PetState = 'idle' | 'walking' | 'sleeping' | 'happy' | 'hungry' | 'sad'
