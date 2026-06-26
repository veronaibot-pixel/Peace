use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct ReviewLog {
    pub id: i64,
    pub card_id: i64,
    pub rating: i64,
    pub elapsed_days: f64,
    pub scheduled_days: f64,
    pub review_at: String,
    pub state: String,
}
