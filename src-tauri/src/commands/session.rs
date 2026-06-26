use crate::fsrs::scheduler::Scheduler;
use crate::models::card::Card;
use crate::AppState;
use serde::{Deserialize, Serialize};
use tauri::State;

#[derive(Debug, Serialize, Deserialize)]
pub struct SessionResult {
    pub correct: bool,
    pub xp_earned: i64,
    pub food_value: f64,
    pub next_review_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SessionCard {
    pub card: Card,
    pub options: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct QuizData {
    pub card_id: i64,
    pub word: String,
    pub options: Vec<String>,
    pub correct: String,
}

#[tauri::command]
pub async fn get_quiz_card(state: State<'_, AppState>) -> Result<Option<QuizData>, String> {
    // Get one due card
    let card = sqlx::query_as::<_, Card>(
        "SELECT * FROM card WHERE (next_review_at IS NULL OR next_review_at <= datetime('now')) AND deck_id IN (SELECT id FROM deck WHERE is_active = 1) ORDER BY CASE WHEN state = 'new' THEN 0 ELSE 1 END, RANDOM() LIMIT 1"
    )
    .fetch_optional(&state.db)
    .await
    .map_err(|e| e.to_string())?;

    let card = match card {
        Some(c) => c,
        None => return Ok(None),
    };

    // Get wrong options
    let all_backs: Vec<String> = sqlx::query_scalar::<_, String>(
        "SELECT back FROM card WHERE id != ? AND deck_id IN (SELECT id FROM deck WHERE is_active = 1) ORDER BY RANDOM() LIMIT 10"
    )
    .bind(card.id)
    .fetch_all(&state.db)
    .await
    .map_err(|e| e.to_string())?;

    let options = generate_options(&card.back, &all_backs);

    Ok(Some(QuizData {
        card_id: card.id,
        word: card.front.clone(),
        options,
        correct: card.back.clone(),
    }))
}

#[tauri::command]
pub async fn start_session(
    state: State<'_, AppState>,
    card_count: Option<i64>,
) -> Result<Vec<SessionCard>, String> {
    let limit = card_count.unwrap_or(10);
    let cards = sqlx::query_as::<_, Card>(
        "SELECT * FROM card WHERE (next_review_at IS NULL OR next_review_at <= datetime('now')) AND deck_id IN (SELECT id FROM deck WHERE is_active = 1) ORDER BY CASE WHEN state = 'new' THEN 0 ELSE 1 END, next_review_at ASC LIMIT ?"
    )
    .bind(limit)
    .fetch_all(&state.db)
    .await
    .map_err(|e| e.to_string())?;

    // Generate multiple choice options for each card
    let all_backs: Vec<String> = sqlx::query_scalar::<_, String>(
        "SELECT back FROM card WHERE deck_id IN (SELECT id FROM deck WHERE is_active = 1) ORDER BY RANDOM() LIMIT 50"
    )
    .fetch_all(&state.db)
    .await
    .map_err(|e| e.to_string())?;

    let session_cards: Vec<SessionCard> = cards
        .into_iter()
        .map(|card| {
            let options = generate_options(&card.back, &all_backs);
            SessionCard { card, options }
        })
        .collect();

    Ok(session_cards)
}

#[tauri::command]
pub async fn submit_answer(
    state: State<'_, AppState>,
    card_id: i64,
    answer: String,
) -> Result<SessionResult, String> {
    let card = sqlx::query_as::<_, Card>("SELECT * FROM card WHERE id = ?")
        .bind(card_id)
        .fetch_one(&state.db)
        .await
        .map_err(|e| e.to_string())?;

    let correct = answer.trim().to_lowercase() == card.back.trim().to_lowercase();
    let rating = if correct { 3 } else { 1 }; // Good or Again

    let scheduler = Scheduler::new();
    let schedule_result = scheduler.schedule(
        card.difficulty,
        card.stability,
        card.review_count as u32,
        card.lapses as u32,
        rating,
    );

    // Update card with new FSRS parameters
    sqlx::query(
        "UPDATE card SET difficulty = ?, stability = ?, next_review_at = ?, last_review_at = datetime('now'), review_count = review_count + 1, lapses = ?, state = ? WHERE id = ?"
    )
    .bind(schedule_result.difficulty)
    .bind(schedule_result.stability)
    .bind(&schedule_result.next_review_at)
    .bind(if correct { card.lapses } else { card.lapses + 1 })
    .bind(if correct { "review" } else { "relearning" })
    .bind(card_id)
    .execute(&state.db)
    .await
    .map_err(|e| e.to_string())?;

    // Log the review
    sqlx::query(
        "INSERT INTO review_log (card_id, rating, elapsed_days, scheduled_days, state) VALUES (?, ?, ?, ?, ?)"
    )
    .bind(card_id)
    .bind(rating)
    .bind(schedule_result.elapsed_days)
    .bind(schedule_result.scheduled_days)
    .bind(&card.state)
    .execute(&state.db)
    .await
    .map_err(|e| e.to_string())?;

    // Update daily stats
    let today = chrono::Local::now().format("%Y-%m-%d").to_string();
    let xp_earned = if correct { 10 } else { 0 };
    let food_value = if correct { 5.0 } else { 0.0 };

    sqlx::query(
        "INSERT INTO daily_stats (date, cards_reviewed, correct_answers, wrong_answers, xp_earned) VALUES (?, 1, ?, ?, ?) ON CONFLICT(date) DO UPDATE SET cards_reviewed = cards_reviewed + 1, correct_answers = correct_answers + ?, wrong_answers = wrong_answers + ?, xp_earned = xp_earned + ?"
    )
    .bind(&today)
    .bind(if correct { 1 } else { 0 })
    .bind(if correct { 0 } else { 1 })
    .bind(xp_earned)
    .bind(if correct { 1 } else { 0 })
    .bind(if correct { 0 } else { 1 })
    .bind(xp_earned)
    .execute(&state.db)
    .await
    .map_err(|e| e.to_string())?;

    Ok(SessionResult {
        correct,
        xp_earned,
        food_value,
        next_review_at: Some(schedule_result.next_review_at),
    })
}

fn generate_options(correct: &str, all_options: &[String]) -> Vec<String> {
    use rand::seq::SliceRandom;
    let mut rng = rand::thread_rng();

    let mut options: Vec<String> = all_options
        .iter()
        .filter(|o| o.as_str() != correct)
        .cloned()
        .collect();
    options.shuffle(&mut rng);
    options.truncate(3);
    options.push(correct.to_string());
    options.shuffle(&mut rng);
    options
}
