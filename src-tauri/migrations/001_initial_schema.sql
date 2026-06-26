-- Pet table (single row, one pet per app instance)
CREATE TABLE IF NOT EXISTS pet (
    id INTEGER PRIMARY KEY DEFAULT 1,
    name TEXT NOT NULL DEFAULT 'Peace',
    stage TEXT NOT NULL DEFAULT 'egg',
    xp INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 1,
    hunger REAL NOT NULL DEFAULT 100.0,
    energy REAL NOT NULL DEFAULT 100.0,
    happiness REAL NOT NULL DEFAULT 100.0,
    state TEXT NOT NULL DEFAULT 'idle',
    last_fed_at TEXT,
    last_interaction_at TEXT NOT NULL DEFAULT (datetime('now')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Vocabulary decks
CREATE TABLE IF NOT EXISTS deck (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    level TEXT NOT NULL,
    description TEXT,
    total_cards INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Vocabulary cards
CREATE TABLE IF NOT EXISTS card (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    deck_id INTEGER NOT NULL REFERENCES deck(id),
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    example_sentence TEXT,
    phonetic TEXT,
    difficulty REAL NOT NULL DEFAULT 0.0,
    stability REAL NOT NULL DEFAULT 0.0,
    retrievability REAL NOT NULL DEFAULT 0.0,
    last_review_at TEXT,
    next_review_at TEXT,
    review_count INTEGER NOT NULL DEFAULT 0,
    lapses INTEGER NOT NULL DEFAULT 0,
    state TEXT NOT NULL DEFAULT 'new',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Review log
CREATE TABLE IF NOT EXISTS review_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    card_id INTEGER NOT NULL REFERENCES card(id),
    rating INTEGER NOT NULL,
    elapsed_days REAL NOT NULL,
    scheduled_days REAL NOT NULL,
    review_at TEXT NOT NULL DEFAULT (datetime('now')),
    state TEXT NOT NULL
);

-- Daily statistics
CREATE TABLE IF NOT EXISTS daily_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL UNIQUE,
    cards_reviewed INTEGER NOT NULL DEFAULT 0,
    cards_learned INTEGER NOT NULL DEFAULT 0,
    correct_answers INTEGER NOT NULL DEFAULT 0,
    wrong_answers INTEGER NOT NULL DEFAULT 0,
    xp_earned INTEGER NOT NULL DEFAULT 0,
    study_time_seconds INTEGER NOT NULL DEFAULT 0
);

-- Settings
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_card_deck ON card(deck_id);
CREATE INDEX IF NOT EXISTS idx_card_next_review ON card(next_review_at);
CREATE INDEX IF NOT EXISTS idx_card_state ON card(state);
CREATE INDEX IF NOT EXISTS idx_review_log_card ON review_log(card_id);
CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(date);

-- Initial pet
INSERT OR IGNORE INTO pet (id, name) VALUES (1, 'Peace');
