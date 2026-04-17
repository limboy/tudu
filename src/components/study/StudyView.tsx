import { useCallback, useEffect, useState } from 'react'
import { X, CheckCircle2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { MarkdownView } from '@/components/cards/MarkdownView'
import { GradeButtons } from './GradeButtons'
import { useStudyQueue } from '@/hooks/useStudyQueue'
import { api } from '@/lib/api'
import type { Rating } from '@/types'

export function StudyView({
  deckId,
  deckName,
  onExit,
  onReviewed,
}: {
  deckId: number
  deckName: string
  onExit: () => void
  onReviewed: () => void
}) {
  const { queue, loading } = useStudyQueue(deckId, true)
  const [index, setIndex] = useState(0)
  const [showBack, setShowBack] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const card = queue[index]
  const total = queue.length
  const done = !loading && index >= total

  const grade = useCallback(
    async (rating: Rating) => {
      if (!card || submitting) return
      setSubmitting(true)
      await api.cards.review({
        cardId: card.id,
        rating,
        reviewTime: Date.now(),
      })
      onReviewed()
      setShowBack(false)
      setIndex((i) => i + 1)
      setSubmitting(false)
    },
    [card, submitting, onReviewed],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onExit()
        return
      }
      if (done) return
      if (e.key === ' ') {
        e.preventDefault()
        setShowBack((v) => !v)
      } else if (e.key === '1') grade(1)
      else if (e.key === '2') grade(2)
      else if (e.key === '3') grade(3)
      else if (e.key === '4') grade(4)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [done, grade, onExit])

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <header className="app-drag h-12 shrink-0 border-b flex items-center gap-4 px-4">
        <div className="w-15 shrink-0" />
        <div className="min-w-0 text-sm text-muted-foreground truncate">
          Studying · <span className="text-foreground">{deckName}</span>
        </div>
        <div className="flex-1" />
        <div className="app-no-drag flex items-center gap-3">
          {!done && total > 0 && (
            <span className="text-xs text-muted-foreground tabular-nums">
              {Math.min(index + 1, total)} / {total}
            </span>
          )}
          <Button size="sm" variant="ghost" onClick={onExit}>
            <X className="size-4" /> Exit
          </Button>
        </div>
      </header>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          Loading…
        </div>
      ) : total === 0 ? (
        <DoneScreen message="Nothing to study right now." onExit={onExit} />
      ) : done ? (
        <DoneScreen
          message={`All done — reviewed ${total} card${total === 1 ? '' : 's'}.`}
          onExit={onExit}
        />
      ) : card ? (
        <div className="flex-1 flex flex-col items-center p-8 overflow-auto">
          <div className="w-full max-w-3xl flex-1 flex flex-col">
            <div className="flex-1 flex flex-col justify-center">
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-3">
                Front
              </div>
              <MarkdownView source={card.frontMd} className="text-lg" />
              <Separator className="my-6" />
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Back
                </span>
                {!showBack && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs text-muted-foreground"
                    onClick={() => setShowBack(true)}
                  >
                    <Eye className="size-3.5" /> Show back
                    <span className="ml-1 opacity-60">Space</span>
                  </Button>
                )}
              </div>
              {showBack ? (
                <MarkdownView source={card.backMd} className="text-lg" />
              ) : (
                <button
                  onClick={() => setShowBack(true)}
                  className="rounded-md border border-dashed bg-muted/30 hover:bg-muted/60 text-muted-foreground text-sm py-8 text-center cursor-pointer transition-colors"
                >
                  Click or press Space to reveal
                </button>
              )}
            </div>
            <div className="pt-6 flex justify-center">
              <GradeButtons onGrade={grade} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function DoneScreen({
  message,
  onExit,
}: {
  message: string
  onExit: () => void
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
      <CheckCircle2 className="size-12 text-primary" />
      <div className="text-lg font-medium">{message}</div>
      <Button onClick={onExit}>Back</Button>
    </div>
  )
}
