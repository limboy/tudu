---
summary: "Details about the SQLite database schema and how data is structured in Tudu."
read_when:
  - You are working on database queries or migrations.
  - You want to understand the relationship between decks, cards, and review logs.
title: "Data Model"
---

# Data Model

Tudu uses **SQLite** for primary data storage, managed via `better-sqlite3`. The database file is located in the user's application data directory as `tudu.sqlite`. 

Application-level state (such as window position and size) is stored in JSON files within the same directory, e.g., `window-state-main.json`.

## Tables

### `decks`
Stores collections of cards.
- `id`: Primary key.
- `name`: Display name of the deck.
- `desired_retention`: The target retention rate for cards in this deck (0.7 to 0.99).
- `created_at`: Unix timestamp of creation.

### `cards`
Stores individual flashcards and their FSRS states.
- `id`: Primary key.
- `deck_id`: Reference to the parent deck.
- `front_md`: Markdown content for the front of the card.
- `back_md`: Markdown content for the back of the card.
- `state`: FSRS state (New, Learning, Review, Relearning).
- `difficulty`: FSRS difficulty value.
- `stability`: FSRS stability value.
- `due`: Unix timestamp of when the card is next due.
- `last_review`: Unix timestamp of the most recent review.
- `reps`: Total number of reviews.
- `lapses`: Number of times the card was forgotten (rated "Again").
- `created_at` / `updated_at`: Timestamps.

### `review_log`
Historical record of every review session.
- `id`: Primary key.
- `card_id`: Reference to the reviewed card.
- `rating`: Rating given (1-4).
- `review_time`: Timestamp of the review.
- `state_before` / `state_after`: Card state transitions.
- `elapsed_days`: Days since last review.
- `scheduled_days`: Days that were scheduled for this interval.

## Indexing
Indices are applied to `deck_id` and `due` on the `cards` table to ensure fast lookups for study sessions and filtering.

## Data Lifecycle
When a card is reviewed, the `cards` table is updated with new FSRS values, and a new entry is appended to the `review_log` table within a single database transaction.
