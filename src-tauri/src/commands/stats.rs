use crate::models::stats::DailyStats;
use crate::AppState;
use tauri::State;

#[tauri::command]
pub async fn get_daily_stats(
    state: State<'_, AppState>,
    days: Option<i64>,
) -> Result<Vec<DailyStats>, String> {
    let days = days.unwrap_or(7);
    let stats = sqlx::query_as::<_, DailyStats>(
        "SELECT * FROM daily_stats WHERE date >= date('now', '-' || ? || ' days') ORDER BY date DESC"
    )
    .bind(days)
    .fetch_all(&state.db)
    .await
    .map_err(|e| e.to_string())?;
    Ok(stats)
}

#[tauri::command]
pub async fn get_streak(state: State<'_, AppState>) -> Result<i64, String> {
    let stats: Vec<DailyStats> = sqlx::query_as::<_, DailyStats>(
        "SELECT * FROM daily_stats WHERE cards_reviewed > 0 ORDER BY date DESC LIMIT 365"
    )
    .fetch_all(&state.db)
    .await
    .map_err(|e| e.to_string())?;

    let mut streak = 0i64;
    let today = chrono::Local::now().date_naive();

    for (i, stat) in stats.iter().enumerate() {
        let stat_date = chrono::NaiveDate::parse_from_str(&stat.date, "%Y-%m-%d")
            .unwrap_or(today);
        let expected = today - chrono::Duration::days(i as i64);
        if stat_date == expected {
            streak += 1;
        } else {
            break;
        }
    }

    Ok(streak)
}
