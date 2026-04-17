import Database from 'better-sqlite3'
import { app } from 'electron'
import path from 'node:path'

const SCHEMA = `
CREATE TABLE IF NOT EXISTS decks (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  name               TEXT NOT NULL,
  desired_retention  REAL NOT NULL DEFAULT 0.9,
  created_at         INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS cards (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  deck_id            INTEGER NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  front_md           TEXT NOT NULL,
  back_md            TEXT NOT NULL,
  state              INTEGER NOT NULL DEFAULT 0,
  difficulty         REAL NOT NULL DEFAULT 0,
  stability          REAL NOT NULL DEFAULT 0,
  retrievability     REAL NOT NULL DEFAULT 1,
  due                INTEGER NOT NULL,
  last_review        INTEGER,
  reps               INTEGER NOT NULL DEFAULT 0,
  lapses             INTEGER NOT NULL DEFAULT 0,
  elapsed_days       REAL NOT NULL DEFAULT 0,
  scheduled_days     REAL NOT NULL DEFAULT 0,
  learning_steps     INTEGER NOT NULL DEFAULT 0,
  created_at         INTEGER NOT NULL,
  updated_at         INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cards_deck_due   ON cards(deck_id, due);
CREATE INDEX IF NOT EXISTS idx_cards_deck_state ON cards(deck_id, state);

CREATE TABLE IF NOT EXISTS review_log (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  card_id            INTEGER NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  rating             INTEGER NOT NULL,
  review_time        INTEGER NOT NULL,
  state_before       INTEGER NOT NULL,
  state_after        INTEGER NOT NULL,
  elapsed_days       REAL NOT NULL,
  scheduled_days     REAL NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_review_log_card_time ON review_log(card_id, review_time);
`

let db: Database.Database | null = null

export function initDatabase(): Database.Database {
  if (db) return db
  const dbPath = path.join(app.getPath('userData'), 'tudu.sqlite')
  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  db.exec(SCHEMA)
  return db
}

export function getDb(): Database.Database {
  if (!db) throw new Error('Database not initialized; call initDatabase() first')
  return db
}
