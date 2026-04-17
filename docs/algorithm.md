---
summary: "Explanation of the Free Spaced Repetition Scheduler (FSRS) algorithm used in Tudu."
read_when:
  - You want to understand how cards are scheduled for review.
  - You are looking for details on the parameters and how they are applied.
title: "Spaced Repetition Algorithm"
---

# Spaced Repetition Algorithm

Tudu uses the **FSRS (Free Spaced Repetition Scheduler)** algorithm to manage card review schedules. Unlike traditional algorithms like SM-2 (used in older Anki versions), FSRS uses a more advanced mathematical model to predict your memory's stability and retrievability.

## Key Concepts

- **Stability (S)**: The number of days it takes for the probability of recalling a card to drop to 90%.
- **Difficulty (D)**: A measure of how hard a card is to learn.
- **Retrievability (R)**: The estimated probability that you will remember the card at a given moment.

## How it Works

When you review a card, you provide a rating (Again, Hard, Good, Easy). FSRS uses this rating and the card's history to update its Stability and Difficulty.

### 1. Retention Goal
The algorithm schedules the next review based on your **Desired Retention** (default is 90%). If you want to remember more, the intervals will be shorter; if you can tolerate more forgetting, the intervals will be longer.

### 2. Rating Meanings
- **Again (1)**: Total forgetfulness. The card's stability is reset, and it enters the "Relearning" state.
- **Hard (2)**: You remembered with significant effort. Stability increases slowly.
- **Good (3)**: You remembered correctly after a normal interval. Stability increases at the expected rate.
- **Easy (4)**: You remembered perfectly and very quickly. Stability increases significantly.

## Implementation Details

The core logic is implemented in `electron/fsrs.ts`, which leverages the `ts-fsrs` library.

### Fuzz Factor
Tudu enables **Fuzzing**, which adds a small amount of random variation to the scheduled intervals. This prevents "card clusters" (where too many cards become due on the same day).

### Retrievability Calculation
Retrievability is calculated in real-time as you browse your cards:
$$R = 0.9^{\frac{t}{S}}$$
Where:
- $t$ is the time elapsed since the last review.
- $S$ is the current stability of the card.
