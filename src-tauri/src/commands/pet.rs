use crate::models::pet::{Pet, PetStage, PetState};
use crate::AppState;
use tauri::State;

#[tauri::command]
pub async fn get_pet_state(state: State<'_, AppState>) -> Result<Pet, String> {
    let pet = sqlx::query_as::<_, Pet>("SELECT * FROM pet WHERE id = 1")
        .fetch_one(&state.db)
        .await
        .map_err(|e| e.to_string())?;
    Ok(pet)
}

#[tauri::command]
pub async fn feed_pet(
    state: State<'_, AppState>,
    food_value: f64,
    xp_value: i64,
) -> Result<Pet, String> {
    let pet = sqlx::query_as::<_, Pet>("SELECT * FROM pet WHERE id = 1")
        .fetch_one(&state.db)
        .await
        .map_err(|e| e.to_string())?;

    let new_hunger = (pet.hunger + food_value).min(100.0);
    let new_happiness = (pet.happiness + food_value * 0.5).min(100.0);
    let new_xp = pet.xp + xp_value;
    let new_level = calculate_level(new_xp);
    let new_stage = PetStage::from_level(new_level);
    let new_state = PetState::from_attributes(new_hunger, pet.energy, new_happiness);

    let updated = sqlx::query_as::<_, Pet>(
        "UPDATE pet SET hunger = ?, happiness = ?, xp = ?, level = ?, stage = ?, state = ?, last_fed_at = datetime('now'), last_interaction_at = datetime('now') WHERE id = 1 RETURNING *"
    )
    .bind(new_hunger)
    .bind(new_happiness)
    .bind(new_xp)
    .bind(new_level)
    .bind(new_stage.as_str())
    .bind(new_state.as_str())
    .fetch_one(&state.db)
    .await
    .map_err(|e| e.to_string())?;

    Ok(updated)
}

fn calculate_level(xp: i64) -> i64 {
    // Each level requires progressively more XP
    // Level 1: 0 XP, Level 2: 100 XP, Level 3: 250 XP, etc.
    let mut level = 1i64;
    let mut required = 0i64;
    loop {
        let next_required = required + (level * 50 + 50);
        if xp < next_required {
            break;
        }
        required = next_required;
        level += 1;
    }
    level
}
