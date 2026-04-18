import { BrowserWindow, dialog, ipcMain } from 'electron'
import { promises as fs } from 'node:fs'
import { getDb } from './db/index.js'
import {
  applyReview,
  elapsedDaysSince,
  newCardFsrsFields,
  retrievabilityAt,
} from './fsrs.js'
import type {
  Card,
  CardFilter,
  CardState,
  Deck,
  DeckStats,
  ExportResult,
  ImportResult,
  Rating,
} from '../src/types.js'

const EXPORT_VERSION = 1

type ExportedCard = {
  frontMd: string
  backMd: string
}

type ExportPayload = {
  format: 'tudu-deck'
  version: number
  exportedAt: number
  deck: { name: string }
  cards: ExportedCard[]
}

function sanitizeFilename(name: string): string {
  const cleaned = name.replace(/[\\/:*?"<>|]+/g, '_').replace(/\s+/g, ' ').trim()
  return cleaned || 'deck'
}

const CARD_COLUMNS = `
  id,
  deck_id       AS deckId,
  front_md      AS frontMd,
  back_md       AS backMd,
  state,
  difficulty,
  stability,
  retrievability,
  due,
  last_review   AS lastReview,
  reps,
  lapses,
  elapsed_days  AS elapsedDays,
  scheduled_days AS scheduledDays,
  learning_steps AS learningSteps,
  created_at    AS createdAt,
  updated_at    AS updatedAt
`

const DECK_COLUMNS = `
  id,
  name,
  desired_retention AS desiredRetention,
  created_at        AS createdAt
`

function decorateRetrievability(card: Card, now: number): Card {
  const elapsed = elapsedDaysSince(card.lastReview, now)
  return { ...card, retrievability: retrievabilityAt(card.stability, elapsed) }
}

function getDeck(id: number): Deck {
  const db = getDb()
  const row = db.prepare(`SELECT ${DECK_COLUMNS} FROM decks WHERE id = ?`).get(id) as
    | Deck
    | undefined
  if (!row) throw new Error(`Deck ${id} not found`)
  return row
}

function getCard(id: number): Card {
  const db = getDb()
  const row = db.prepare(`SELECT ${CARD_COLUMNS} FROM cards WHERE id = ?`).get(id) as
    | Card
    | undefined
  if (!row) throw new Error(`Card ${id} not found`)
  return row
}

export function registerIpc(): void {
  const db = getDb()

  ipcMain.handle('decks:list', () => {
    return db.prepare(`SELECT ${DECK_COLUMNS} FROM decks ORDER BY created_at ASC`).all()
  })

  ipcMain.handle('decks:create', (_e, name: string) => {
    const now = Date.now()
    const info = db
      .prepare(`INSERT INTO decks (name, desired_retention, created_at) VALUES (?, 0.9, ?)`)
      .run(name.trim() || 'Untitled', now)
    return getDeck(info.lastInsertRowid as number)
  })

  ipcMain.handle('decks:rename', (_e, id: number, name: string) => {
    db.prepare(`UPDATE decks SET name = ? WHERE id = ?`).run(name.trim(), id)
  })

  ipcMain.handle('decks:delete', (_e, id: number) => {
    db.prepare(`DELETE FROM decks WHERE id = ?`).run(id)
  })

  ipcMain.handle('decks:setRetention', (_e, id: number, retention: number) => {
    const clamped = Math.min(0.99, Math.max(0.7, retention))
    db.prepare(`UPDATE decks SET desired_retention = ? WHERE id = ?`).run(clamped, id)
  })

  ipcMain.handle('decks:export', async (e, deckId: number): Promise<ExportResult> => {
    try {
      const deck = getDeck(deckId)
      const cardRows = db
        .prepare(
          `SELECT front_md AS frontMd, back_md AS backMd
             FROM cards WHERE deck_id = ? ORDER BY created_at ASC`,
        )
        .all(deckId) as ExportedCard[]

      const payload: ExportPayload = {
        format: 'tudu-deck',
        version: EXPORT_VERSION,
        exportedAt: Date.now(),
        deck: { name: deck.name },
        cards: cardRows.map((c) => ({ frontMd: c.frontMd, backMd: c.backMd })),
      }

      const win = BrowserWindow.fromWebContents(e.sender) ?? undefined
      const defaultName = `${sanitizeFilename(deck.name)}.tudu.json`
      const result = win
        ? await dialog.showSaveDialog(win, {
            title: 'Export deck',
            defaultPath: defaultName,
            filters: [{ name: 'Tudu deck', extensions: ['json'] }],
          })
        : await dialog.showSaveDialog({
            title: 'Export deck',
            defaultPath: defaultName,
            filters: [{ name: 'Tudu deck', extensions: ['json'] }],
          })
      if (result.canceled || !result.filePath) {
        return { ok: false, canceled: true }
      }
      await fs.writeFile(result.filePath, JSON.stringify(payload, null, 2), 'utf8')
      return { ok: true, path: result.filePath, cardCount: payload.cards.length }
    } catch (err) {
      return { ok: false, canceled: false, error: (err as Error).message }
    }
  })

  ipcMain.handle('decks:import', async (e, filePath?: string): Promise<ImportResult> => {
    try {
      let selectedPath = filePath
      if (!selectedPath) {
        const win = BrowserWindow.fromWebContents(e.sender) ?? undefined
        const result = win
          ? await dialog.showOpenDialog(win, {
              title: 'Import deck',
              properties: ['openFile'],
              filters: [
                { name: 'Tudu deck', extensions: ['json'] },
                { name: 'All files', extensions: ['*'] },
              ],
            })
          : await dialog.showOpenDialog({
              title: 'Import deck',
              properties: ['openFile'],
              filters: [
                { name: 'Tudu deck', extensions: ['json'] },
                { name: 'All files', extensions: ['*'] },
              ],
            })
        if (result.canceled || result.filePaths.length === 0) {
          return { ok: false, canceled: true }
        }
        selectedPath = result.filePaths[0]
      }
      const raw = await fs.readFile(selectedPath, 'utf8')
      const parsed = JSON.parse(raw) as Partial<ExportPayload>
      if (parsed?.format !== 'tudu-deck' || typeof parsed.version !== 'number') {
        return {
          ok: false,
          canceled: false,
          error: 'Not a Tudu deck file.',
        }
      }
      if (parsed.version > EXPORT_VERSION) {
        return {
          ok: false,
          canceled: false,
          error: `Unsupported export version ${parsed.version}.`,
        }
      }
      if (!parsed.deck || !Array.isArray(parsed.cards)) {
        return { ok: false, canceled: false, error: 'Malformed deck file.' }
      }

      const now = Date.now()
      const deckName = (parsed.deck.name ?? 'Imported deck').toString().trim() || 'Imported deck'

      const existing = new Set(
        (db.prepare(`SELECT name FROM decks`).all() as Array<{ name: string }>).map(
          (r) => r.name,
        ),
      )
      let finalName = deckName
      if (existing.has(finalName)) {
        let i = 2
        while (existing.has(`${deckName} (${i})`)) i++
        finalName = `${deckName} (${i})`
      }

      const insertDeck = db.prepare(
        `INSERT INTO decks (name, desired_retention, created_at) VALUES (?, 0.9, ?)`,
      )
      const insertCard = db.prepare(
        `INSERT INTO cards (
           deck_id, front_md, back_md,
           state, difficulty, stability, retrievability,
           due, last_review, reps, lapses,
           elapsed_days, scheduled_days, learning_steps,
           created_at, updated_at
         ) VALUES (
           @deckId, @frontMd, @backMd,
           @state, @difficulty, @stability, @retrievability,
           @due, @last_review, @reps, @lapses,
           @elapsed_days, @scheduled_days, @learning_steps,
           @createdAt, @updatedAt
         )`,
      )

      const tx = db.transaction(() => {
        const info = insertDeck.run(finalName, now)
        const newDeckId = info.lastInsertRowid as number
        for (const c of parsed.cards!) {
          const fsrsFields = newCardFsrsFields(now)
          insertCard.run({
            deckId: newDeckId,
            frontMd: String(c.frontMd ?? ''),
            backMd: String(c.backMd ?? ''),
            ...fsrsFields,
            createdAt: now,
            updatedAt: now,
          })
        }
        return newDeckId
      })
      const newDeckId = tx() as number
      return {
        ok: true,
        deckId: newDeckId,
        deckName: finalName,
        cardCount: parsed.cards.length,
      }
    } catch (err) {
      return { ok: false, canceled: false, error: (err as Error).message }
    }
  })

  ipcMain.handle('decks:dueCounts', () => {
    const endOfToday = new Date()
    endOfToday.setHours(23, 59, 59, 999)
    const rows = db
      .prepare(
        `SELECT deck_id AS deckId, COUNT(*) AS n FROM cards
         WHERE state = 0 OR due < ?
         GROUP BY deck_id`,
      )
      .all(endOfToday.getTime()) as Array<{ deckId: number; n: number }>
    const out: Record<number, number> = {}
    for (const r of rows) out[r.deckId] = r.n
    return out
  })

  ipcMain.handle('cards:list', (_e, filter: CardFilter) => {
    const { clauses, params } = buildCardWhere(filter)
    const rows = db
      .prepare(
        `SELECT ${CARD_COLUMNS} FROM cards WHERE ${clauses.join(' AND ')} ORDER BY created_at DESC`,
      )
      .all(params) as Card[]
    const now = Date.now()
    const withRet = rows.map((r) => decorateRetrievability(r, now))

    const rMin = filter.retrievabilityMin
    const rMax = filter.retrievabilityMax
    if (rMin === undefined && rMax === undefined) return withRet
    return withRet.filter(
      (c) =>
        (rMin === undefined || c.retrievability >= rMin) &&
        (rMax === undefined || c.retrievability <= rMax),
    )
  })

  ipcMain.handle(
    'cards:create',
    (_e, args: { deckId: number; frontMd: string; backMd: string }) => {
      const now = Date.now()
      const fsrsFields = newCardFsrsFields(now)
      const info = db
        .prepare(
          `INSERT INTO cards (
            deck_id, front_md, back_md,
            state, difficulty, stability, retrievability,
            due, last_review, reps, lapses,
            elapsed_days, scheduled_days, learning_steps,
            created_at, updated_at
          ) VALUES (
            @deckId, @frontMd, @backMd,
            @state, @difficulty, @stability, @retrievability,
            @due, @last_review, @reps, @lapses,
            @elapsed_days, @scheduled_days, @learning_steps,
            @createdAt, @updatedAt
          )`,
        )
        .run({
          deckId: args.deckId,
          frontMd: args.frontMd,
          backMd: args.backMd,
          ...fsrsFields,
          createdAt: now,
          updatedAt: now,
        })
      return getCard(info.lastInsertRowid as number)
    },
  )

  ipcMain.handle(
    'cards:update',
    (_e, args: { id: number; frontMd: string; backMd: string }) => {
      db.prepare(
        `UPDATE cards SET front_md = ?, back_md = ?, updated_at = ? WHERE id = ?`,
      ).run(args.frontMd, args.backMd, Date.now(), args.id)
      return getCard(args.id)
    },
  )

  ipcMain.handle('cards:delete', (_e, id: number) => {
    db.prepare(`DELETE FROM cards WHERE id = ?`).run(id)
  })

  ipcMain.handle('cards:queue', (_e, deckId: number) => {
    const now = Date.now()
    const due = db
      .prepare(
        `SELECT ${CARD_COLUMNS} FROM cards
         WHERE deck_id = ? AND state != 0 AND due <= ?
         ORDER BY due ASC`,
      )
      .all(deckId, now) as Card[]
    const fresh = db
      .prepare(
        `SELECT ${CARD_COLUMNS} FROM cards
         WHERE deck_id = ? AND state = 0
         ORDER BY created_at ASC`,
      )
      .all(deckId) as Card[]
    return [...due, ...fresh].map((c) => decorateRetrievability(c, now))
  })

  ipcMain.handle(
    'cards:review',
    (_e, args: { cardId: number; rating: Rating; reviewTime: number }) => {
      const card = getCard(args.cardId)
      const deck = getDeck(card.deckId)
      const { card: next, log } = applyReview(
        card,
        args.rating,
        args.reviewTime,
        deck.desiredRetention,
      )

      const tx = db.transaction(() => {
        db.prepare(
          `UPDATE cards SET
             state = @state,
             difficulty = @difficulty,
             stability = @stability,
             retrievability = @retrievability,
             due = @due,
             last_review = @last_review,
             reps = @reps,
             lapses = @lapses,
             elapsed_days = @elapsed_days,
             scheduled_days = @scheduled_days,
             learning_steps = @learning_steps,
             updated_at = @updated_at
           WHERE id = @id`,
        ).run({ ...next, id: args.cardId, updated_at: args.reviewTime })
        db.prepare(
          `INSERT INTO review_log (
             card_id, rating, review_time,
             state_before, state_after, elapsed_days, scheduled_days
           ) VALUES (
             @card_id, @rating, @review_time,
             @state_before, @state_after, @elapsed_days, @scheduled_days
           )`,
        ).run({ ...log, card_id: args.cardId })
      })
      tx()
      return getCard(args.cardId)
    },
  )

  ipcMain.handle('stats:deck', (_e, deckId: number): DeckStats => {
    const now = Date.now()
    const startOfToday = new Date(now)
    startOfToday.setHours(0, 0, 0, 0)
    const endOfToday = startOfToday.getTime() + 86_400_000
    const endOf7 = startOfToday.getTime() + 7 * 86_400_000

    const countsRows = db
      .prepare(
        `SELECT state, COUNT(*) AS n FROM cards WHERE deck_id = ? GROUP BY state`,
      )
      .all(deckId) as Array<{ state: CardState; n: number }>
    const counts = { new: 0, learning: 0, review: 0, relearning: 0, total: 0 }
    for (const r of countsRows) {
      counts.total += r.n
      if (r.state === 0) counts.new = r.n
      else if (r.state === 1) counts.learning = r.n
      else if (r.state === 2) counts.review = r.n
      else if (r.state === 3) counts.relearning = r.n
    }

    const dueToday = (
      db
        .prepare(
          `SELECT COUNT(*) AS n FROM cards WHERE deck_id = ? AND (state = 0 OR due < ?)`,
        )
        .get(deckId, endOfToday) as { n: number }
    ).n

    const dueNext7 = (
      db
        .prepare(
          `SELECT COUNT(*) AS n FROM cards WHERE deck_id = ? AND (state = 0 OR due < ?)`,
        )
        .get(deckId, endOf7) as { n: number }
    ).n

    const retentionRow = db
      .prepare(
        `SELECT
           SUM(CASE WHEN rating >= 3 THEN 1 ELSE 0 END) AS good,
           COUNT(*) AS total
         FROM review_log
         WHERE card_id IN (SELECT id FROM cards WHERE deck_id = ?)`,
      )
      .get(deckId) as { good: number | null; total: number }
    const retentionRate =
      retentionRow.total > 0 ? (retentionRow.good || 0) / retentionRow.total : null

    const start30 = startOfToday.getTime() - 29 * 86_400_000
    const perDay = db
      .prepare(
        `SELECT
           strftime('%Y-%m-%d', review_time / 1000, 'unixepoch', 'localtime') AS date,
           COUNT(*) AS count
         FROM review_log
         WHERE card_id IN (SELECT id FROM cards WHERE deck_id = ?)
           AND review_time >= ?
         GROUP BY date
         ORDER BY date ASC`,
      )
      .all(deckId, start30) as Array<{ date: string; count: number }>

    const byDate = new Map(perDay.map((r) => [r.date, r.count]))
    const reviewsLast30: Array<{ date: string; count: number }> = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date(startOfToday.getTime() - i * 86_400_000)
      const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
      reviewsLast30.push({ date: key, count: byDate.get(key) ?? 0 })
    }

    return { counts, dueToday, dueNext7, retentionRate, reviewsLast30 }
  })
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n)
}

function buildCardWhere(filter: CardFilter): {
  clauses: string[]
  params: Record<string, unknown>
} {
  const clauses: string[] = ['deck_id = @deckId']
  const params: Record<string, unknown> = { deckId: filter.deckId }

  if (filter.states && filter.states.length > 0) {
    const placeholders = filter.states.map((_, i) => `@state_${i}`).join(',')
    clauses.push(`state IN (${placeholders})`)
    filter.states.forEach((s, i) => {
      params[`state_${i}`] = s
    })
  }
  if (filter.createdFrom !== undefined) {
    clauses.push('created_at >= @createdFrom')
    params.createdFrom = filter.createdFrom
  }
  if (filter.createdTo !== undefined) {
    clauses.push('created_at < @createdTo')
    params.createdTo = filter.createdTo
  }
  if (filter.reviewedFrom !== undefined) {
    clauses.push('last_review >= @reviewedFrom')
    params.reviewedFrom = filter.reviewedFrom
  }
  if (filter.reviewedTo !== undefined) {
    clauses.push('last_review < @reviewedTo')
    params.reviewedTo = filter.reviewedTo
  }
  if (filter.difficultyMin !== undefined) {
    clauses.push('difficulty >= @difficultyMin')
    params.difficultyMin = filter.difficultyMin
  }
  if (filter.difficultyMax !== undefined) {
    clauses.push('difficulty <= @difficultyMax')
    params.difficultyMax = filter.difficultyMax
  }
  if (filter.search && filter.search.trim()) {
    clauses.push('(front_md LIKE @search OR back_md LIKE @search)')
    params.search = `%${filter.search.trim()}%`
  }
  return { clauses, params }
}
