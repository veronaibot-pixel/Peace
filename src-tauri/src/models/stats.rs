use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct DailyStats {
    pub id: i64,
    pub date: String,
    pub cards_reviewed: i64,
    pub cards_learned: i64,
    pub correct_answers: i64,
    pub wrong_answers: i64,
    pub xp_earned: i64,
    pub study_time_seconds: i64,
}
