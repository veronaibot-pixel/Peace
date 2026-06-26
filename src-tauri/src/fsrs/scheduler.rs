use chrono::{Duration, Utc};

pub struct Scheduler {
    // FSRS-5 default parameters
    w: [f64; 19],
}

#[derive(Debug, Clone)]
pub struct ScheduleResult {
    pub difficulty: f64,
    pub stability: f64,
    pub elapsed_days: f64,
    pub scheduled_days: f64,
    pub next_review_at: String,
}

impl Scheduler {
    pub fn new() -> Self {
        // Default FSRS-5 parameters
        Self {
            w: [
                0.4072, 1.1829, 3.1262, 15.4722, 7.2102, 0.5316, 1.0651, 0.0589,
                1.5330, 0.1544, 0.9661, 1.9395, 0.1117, 0.2988, 2.5893, 0.2613,
                2.9702, 0.5140, 0.5750,
            ],
        }
    }

    pub fn schedule(
        &self,
        difficulty: f64,
        stability: f64,
        reps: u32,
        lapses: u32,
        rating: i64, // 1=Again, 2=Hard, 3=Good, 4=Easy
    ) -> ScheduleResult {
        let (new_difficulty, new_stability, interval) = if reps == 0 {
            // New card - initial stability and difficulty
            let init_stability = self.init_stability(rating);
            let init_difficulty = self.init_difficulty(rating);
            let interval = self.next_interval(init_stability);
            (init_difficulty, init_stability, interval)
        } else {
            // Review card
            let new_difficulty = self.next_difficulty(difficulty, rating);
            let elapsed = if stability > 0.0 { stability } else { 1.0 };
            let retrievability = self.retrievability(elapsed, stability);
            let new_stability = if rating == 1 {
                // Again - calculate lapse stability
                self.next_forget_stability(new_difficulty, stability, retrievability)
            } else {
                self.next_recall_stability(new_difficulty, stability, retrievability, rating)
            };
            let interval = self.next_interval(new_stability);
            (new_difficulty, new_stability, interval)
        };

        let scheduled_days = interval as f64;
        let next_review = Utc::now() + Duration::days(interval.max(1));

        ScheduleResult {
            difficulty: new_difficulty,
            stability: new_stability,
            elapsed_days: stability,
            scheduled_days,
            next_review_at: next_review.format("%Y-%m-%d %H:%M:%S").to_string(),
        }
    }

    fn init_stability(&self, rating: i64) -> f64 {
        let idx = (rating - 1).max(0).min(3) as usize;
        self.w[idx]
    }

    fn init_difficulty(&self, rating: i64) -> f64 {
        let d = self.w[4] - (rating as f64 - 3.0) * self.w[5];
        d.clamp(1.0, 10.0)
    }

    fn next_difficulty(&self, d: f64, rating: i64) -> f64 {
        let delta = -(self.w[6] * (rating as f64 - 3.0));
        let new_d = d + delta;
        // Mean reversion
        let mean_rev = self.w[7] * (self.w[4] - new_d);
        (new_d + mean_rev).clamp(1.0, 10.0)
    }

    fn retrievability(&self, elapsed: f64, stability: f64) -> f64 {
        if stability <= 0.0 {
            return 0.0;
        }
        (1.0 + elapsed / (9.0 * stability)).powf(-1.0)
    }

    fn next_recall_stability(&self, d: f64, s: f64, r: f64, rating: i64) -> f64 {
        let hard_penalty = if rating == 2 { self.w[15] } else { 1.0 };
        let easy_bonus = if rating == 4 { self.w[16] } else { 1.0 };
        s * (1.0
            + f64::exp(self.w[8])
                * (11.0 - d)
                * s.powf(-self.w[9])
                * (f64::exp((1.0 - r) * self.w[10]) - 1.0)
                * hard_penalty
                * easy_bonus)
    }

    fn next_forget_stability(&self, d: f64, s: f64, r: f64) -> f64 {
        self.w[11]
            * d.powf(-self.w[12])
            * ((s + 1.0).powf(self.w[13]) - 1.0)
            * f64::exp((1.0 - r) * self.w[14])
    }

    fn next_interval(&self, stability: f64) -> i64 {
        // Target retrievability of 90%
        let interval = (9.0 * stability * (1.0_f64 / 0.9 - 1.0).powf(1.0 / -1.0)) as i64;
        interval.max(1).min(365)
    }
}
