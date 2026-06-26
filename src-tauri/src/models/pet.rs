use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Pet {
    pub id: i64,
    pub name: String,
    pub stage: String,
    pub xp: i64,
    pub level: i64,
    pub hunger: f64,
    pub energy: f64,
    pub happiness: f64,
    pub state: String,
    pub last_fed_at: Option<String>,
    pub last_interaction_at: String,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PetStage {
    Egg,
    Baby,
    Child,
    Companion,
}

impl PetStage {
    pub fn from_level(level: i64) -> Self {
        match level {
            1..=4 => PetStage::Egg,
            5..=14 => PetStage::Baby,
            15..=29 => PetStage::Child,
            _ => PetStage::Companion,
        }
    }

    pub fn as_str(&self) -> &str {
        match self {
            PetStage::Egg => "egg",
            PetStage::Baby => "baby",
            PetStage::Child => "child",
            PetStage::Companion => "companion",
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PetState {
    Idle,
    Walking,
    Sleeping,
    Happy,
    Hungry,
    Sad,
}

impl PetState {
    pub fn from_attributes(hunger: f64, energy: f64, happiness: f64) -> Self {
        if hunger < 20.0 {
            PetState::Hungry
        } else if energy < 20.0 {
            PetState::Sleeping
        } else if happiness < 20.0 {
            PetState::Sad
        } else if happiness > 80.0 {
            PetState::Happy
        } else {
            PetState::Idle
        }
    }

    pub fn as_str(&self) -> &str {
        match self {
            PetState::Idle => "idle",
            PetState::Walking => "walking",
            PetState::Sleeping => "sleeping",
            PetState::Happy => "happy",
            PetState::Hungry => "hungry",
            PetState::Sad => "sad",
        }
    }
}
