export type Deck = {
  id: number
  name: string
  desiredRetention: number
  createdAt: number
}

export const CardStateValues = {
  New: 0,
  Learning: 1,
  Review: 2,
  Relearning: 3,
} as const
export type CardState = typeof CardStateValues[keyof typeof CardStateValues]

export type Card = {
  id: number
  deckId: number
  frontMd: string
  backMd: string
  state: CardState
  difficulty: number
  stability: number
  retrievability: number
  due: number
  lastReview: number | null
  reps: number
  lapses: number
  elapsedDays: number
  scheduledDays: number
  learningSteps: number
  createdAt: number
  updatedAt: number
}

export type Rating = 1 | 2 | 3 | 4

export type CardFilter = {
  deckId: number
  states?: CardState[]
  createdFrom?: number
  createdTo?: number
  reviewedFrom?: number
  reviewedTo?: number
  difficultyMin?: number
  difficultyMax?: number
  retrievabilityMin?: number
  retrievabilityMax?: number
  search?: string
}

export type DeckCounts = {
  new: number
  learning: number
  review: number
  relearning: number
  total: number
}

export type DeckStats = {
  counts: DeckCounts
  dueToday: number
  dueNext7: number
  retentionRate: number | null
  reviewsLast30: Array<{ date: string; count: number }>
}

export type ExportResult =
  | { ok: true; path: string; cardCount: number }
  | { ok: false; canceled: true }
  | { ok: false; canceled: false; error: string }

export type ImportResult =
  | { ok: true; deckId: number; deckName: string; cardCount: number }
  | { ok: false; canceled: true }
  | { ok: false; canceled: false; error: string }

export type UpdateInfo = {
  version: string
}

export type TuduApi = {
  update: {
    onUpdateReady: (callback: (info: UpdateInfo) => void) => void
    apply: () => Promise<void>
  }
  decks: {
    list: () => Promise<Deck[]>
    create: (name: string) => Promise<Deck>
    rename: (id: number, name: string) => Promise<void>
    delete: (id: number) => Promise<void>
    setRetention: (id: number, retention: number) => Promise<void>
    dueCounts: () => Promise<Record<number, number>>
    export: (id: number) => Promise<ExportResult>
    import: (filePath?: string) => Promise<ImportResult>
  }
  cards: {
    list: (filter: CardFilter) => Promise<Card[]>
    create: (args: { deckId: number; frontMd: string; backMd: string }) => Promise<Card>
    update: (args: { id: number; frontMd: string; backMd: string }) => Promise<Card>
    delete: (id: number) => Promise<void>
    queue: (deckId: number) => Promise<Card[]>
    review: (args: { cardId: number; rating: Rating; reviewTime: number }) => Promise<Card>
  }
  stats: {
    deck: (deckId: number) => Promise<DeckStats>
  }
  getPathForFile: (file: File) => string
}

declare global {
  interface Window {
    tudu: TuduApi
  }
}
