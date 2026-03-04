-- tabel donasi
CREATE TABLE IF NOT EXISTS donations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    saweria_id TEXT UNIQUE NOT NULL,
    donator_name TEXT NOT NULL,
    amount INTEGER NOT NULL,
    message TEXT DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- index buat leaderboard query biar ngebut
CREATE INDEX IF NOT EXISTS idx_donator_name ON donations(donator_name);
CREATE INDEX IF NOT EXISTS idx_amount ON donations(amount DESC);
