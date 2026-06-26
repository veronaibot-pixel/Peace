use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Deck {
    pub id: i64,
    pub name: String,
    pub level: String,
    pub description: Option<String>,
    pub total_cards: i64,
    pub is_active: i64,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Card {
    pub id: i64,
    pub deck_id: i64,
    pub front: String,
    pub back: String,
    pub example_sentence: Option<String>,
    pub phonetic: Option<String>,
    pub difficulty: f64,
    pub stability: f64,
    pub retrievability: f64,
    pub last_review_at: Option<String>,
    pub next_review_at: Option<String>,
    pub review_count: i64,
    pub lapses: i64,
    pub state: String,
    pub created_at: String,
}
