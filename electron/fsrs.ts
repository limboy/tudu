import {
  fsrs,
  generatorParameters,
  createEmptyCard,
  State as FsrsState,
  type Card as FsrsCard,
  type Grade,
} from 'ts-fsrs'
import type { Card, Rating } from '../src/types.js'

const defaultScheduler = fsrs(generatorParameters({}))

export function newCardFsrsFields(now: number) {
  const c = createEmptyCard(new Date(now))
  return {
    state: FsrsState.New as number,
    difficulty: c.difficulty,
    stability: c.stability,
    retrievability: 1,
    due: c.due.getTime(),
    last_review: null as number | null,
    reps: 0,
    lapses: 0,
    elapsed_days: 0,
    scheduled_days: 0,
    learning_steps: 0,
  }
}

type DbCardFsrs = Pick<
  Card,
  | 'state'
  | 'difficulty'
  | 'stability'
  | 'due'
  | 'lastReview'
  | 'reps'
  | 'lapses'
  | 'elapsedDays'
  | 'scheduledDays'
  | 'learningSteps'
>

function toFsrsCard(c: DbCardFsrs): FsrsCard {
  return {
    due: new Date(c.due),
    stability: c.stability,
    difficulty: c.difficulty,
    elapsed_days: c.elapsedDays,
    scheduled_days: c.scheduledDays,
    learning_steps: c.learningSteps,
    reps: c.reps,
    lapses: c.lapses,
    state: c.state as FsrsState,
    last_review: c.lastReview ? new Date(c.lastReview) : undefined,
  }
}

export type ReviewResult = {
  card: {
    state: number
    difficulty: number
    stability: number
    retrievability: number
    due: number
    last_review: number
    reps: number
    lapses: number
    elapsed_days: number
    scheduled_days: number
    learning_steps: number
  }
  log: {
    rating: number
    review_time: number
    state_before: number
    state_after: number
    elapsed_days: number
    scheduled_days: number
  }
}

export function applyReview(
  dbCard: DbCardFsrs,
  rating: Rating,
  reviewTime: number,
  desiredRetention: number,
): ReviewResult {
  const params = generatorParameters({
    request_retention: desiredRetention,
    enable_fuzz: true,
  })
  const scheduler = fsrs(params)
  const before = toFsrsCard(dbCard)
  const now = new Date(reviewTime)
  const { card: after, log } = scheduler.next(before, now, rating as Grade)
  return {
    card: {
      state: after.state as number,
      difficulty: after.difficulty,
      stability: after.stability,
      retrievability: retrievabilityAt(after.stability, 0),
      due: after.due.getTime(),
      last_review: reviewTime,
      reps: after.reps,
      lapses: after.lapses,
      elapsed_days: after.elapsed_days,
      scheduled_days: after.scheduled_days,
      learning_steps: after.learning_steps,
    },
    log: {
      rating: log.rating as number,
      review_time: reviewTime,
      state_before: dbCard.state,
      state_after: after.state as number,
      elapsed_days: log.elapsed_days,
      scheduled_days: log.scheduled_days,
    },
  }
}

export function retrievabilityAt(stability: number, elapsedDays: number): number {
  if (stability <= 0) return 1
  return defaultScheduler.forgetting_curve(elapsedDays, stability)
}

export function elapsedDaysSince(lastReview: number | null, now: number): number {
  if (!lastReview) return 0
  return Math.max(0, (now - lastReview) / 86_400_000)
}
