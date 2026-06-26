use crate::models::card::{Card, Deck};
use crate::AppState;
use tauri::State;

#[tauri::command]
pub async fn get_decks(state: State<'_, AppState>) -> Result<Vec<Deck>, String> {
    let decks = sqlx::query_as::<_, Deck>("SELECT * FROM deck ORDER BY id")
        .fetch_all(&state.db)
        .await
        .map_err(|e| e.to_string())?;
    Ok(decks)
}

#[tauri::command]
pub async fn get_due_cards(
    state: State<'_, AppState>,
    limit: Option<i64>,
) -> Result<Vec<Card>, String> {
    let limit = limit.unwrap_or(10);
    let cards = sqlx::query_as::<_, Card>(
        "SELECT * FROM card WHERE (next_review_at IS NULL OR next_review_at <= datetime('now')) AND deck_id IN (SELECT id FROM deck WHERE is_active = 1) ORDER BY CASE WHEN state = 'new' THEN 0 ELSE 1 END, next_review_at ASC LIMIT ?"
    )
    .bind(limit)
    .fetch_all(&state.db)
    .await
    .map_err(|e| e.to_string())?;
    Ok(cards)
}

#[tauri::command]
pub async fn get_cards_by_deck(
    state: State<'_, AppState>,
    deck_id: i64,
) -> Result<Vec<Card>, String> {
    let cards = sqlx::query_as::<_, Card>("SELECT * FROM card WHERE deck_id = ? ORDER BY id")
        .bind(deck_id)
        .fetch_all(&state.db)
        .await
        .map_err(|e| e.to_string())?;
    Ok(cards)
}
