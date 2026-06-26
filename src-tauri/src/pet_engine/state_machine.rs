use crate::models::pet::PetState;
use sqlx::SqlitePool;

/// Decay rate per tick (5 minutes)
const HUNGER_DECAY: f64 = 1.5;
const ENERGY_DECAY: f64 = 0.5;
const HAPPINESS_DECAY: f64 = 1.0;

/// Run one decay tick for the pet's attributes
pub async fn decay_tick(pool: &SqlitePool) -> Result<(), sqlx::Error> {
    sqlx::query(
        "UPDATE pet SET hunger = MAX(0, hunger - ?), energy = MAX(0, energy - ?), happiness = MAX(0, happiness - ?), state = CASE WHEN hunger - ? < 20 THEN 'hungry' WHEN energy - ? < 20 THEN 'sleeping' WHEN happiness - ? < 20 THEN 'sad' WHEN happiness - ? > 80 THEN 'happy' ELSE 'idle' END WHERE id = 1"
    )
    .bind(HUNGER_DECAY)
    .bind(ENERGY_DECAY)
    .bind(HAPPINESS_DECAY)
    .bind(HUNGER_DECAY)
    .bind(ENERGY_DECAY)
    .bind(HAPPINESS_DECAY)
    .bind(HAPPINESS_DECAY)
    .execute(pool)
    .await?;
    Ok(())
}

/// Calculate energy recovery when pet "sleeps" (user is away)
pub fn calculate_energy_recovery(hours_away: f64) -> f64 {
    // Recovery: 10 energy per hour of sleep, max 100
    (hours_away * 10.0).min(100.0)
}
