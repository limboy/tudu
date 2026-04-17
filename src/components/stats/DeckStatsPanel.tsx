import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ReviewsChart } from './ReviewsChart'
import { api } from '@/lib/api'
import type { Deck, DeckStats } from '@/types'

export function DeckStatsPanel({
  deck,
  stats,
  onDeckChanged,
}: {
  deck: Deck | null
  stats: DeckStats | null
  onDeckChanged: () => void
}) {
  const [retention, setRetention] = useState('')
  const [busy, setBusy] = useState<'export' | 'import' | null>(null)
  const [message, setMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)

  useEffect(() => {
    if (deck) setRetention(deck.desiredRetention.toFixed(2))
  }, [deck?.id, deck?.desiredRetention])

  useEffect(() => {
    setMessage(null)
  }, [deck?.id])

  if (!deck) {
    return (
      <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
        No deck selected
      </div>
    )
  }
  if (!stats) {
    return (
      <div className="p-4 text-xs text-muted-foreground">Loading stats…</div>
    )
  }

  const commitRetention = async () => {
    const n = Number(retention)
    if (Number.isFinite(n) && n >= 0.7 && n <= 0.99 && n !== deck.desiredRetention) {
      await api.decks.setRetention(deck.id, n)
      onDeckChanged()
    } else {
      setRetention(deck.desiredRetention.toFixed(2))
    }
  }

  const handleExport = async () => {
    setBusy('export')
    setMessage(null)
    const result = await api.decks.export(deck.id)
    setBusy(null)
    if (result.ok) {
      setMessage({
        kind: 'ok',
        text: `Exported ${result.cardCount} card${result.cardCount === 1 ? '' : 's'}.`,
      })
    } else if (!result.canceled) {
      setMessage({ kind: 'err', text: result.error })
    }
  }


  return (
    <Tabs defaultValue="statistics" className="h-full flex flex-col">
      <div className="px-4 h-12.25 flex items-center shrink-0 border-b bg-background/80 backdrop-blur-sm">
        <TabsList className="grid w-full grid-cols-2 h-8">
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <TabsContent value="statistics" className="m-0 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <StatCell label="New cards" value={stats.counts.new} />
            <StatCell label="Learning" value={stats.counts.learning} />
            <StatCell
              label="To review"
              value={stats.counts.review + stats.counts.relearning}
            />
            <StatCell label="Due today" value={stats.dueToday} accent />
            <StatCell label="Next 7 days" value={stats.dueNext7} />
            <StatCell
              label="Retention"
              value={
                stats.retentionRate != null
                  ? `${Math.round(stats.retentionRate * 100)}%`
                  : '—'
              }
            />
          </div>

          <div className="pt-2">
            <div className="text-sm text-muted-foreground mb-3">
              Reviews · last 30 days
            </div>
            <ReviewsChart data={stats.reviewsLast30} />
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4 m-0">
          <section className="space-y-2">
            <div className="text-[13px] font-medium text-foreground">
              Deck Settings
            </div>
            <div className="space-y-1">
              <Label htmlFor="retention" className="text-xs text-muted-foreground block mb-2">
                Desired retention (FSRS target, 0.70–0.99)
              </Label>
              <Input
                id="retention"
                type="number"
                min={0.7}
                max={0.99}
                step={0.01}
                value={retention}
                onChange={(e) => setRetention(e.target.value)}
                onBlur={commitRetention}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') (e.currentTarget as HTMLInputElement).blur()
                }}
                className="h-8 max-w-50"
              />
            </div>
          </section>

          <Separator />

          <section className="space-y-2">
            <div className="text-[13px] font-medium text-foreground">
              Export Deck
            </div>
            <p className="text-xs text-muted-foreground">
              Save the current deck (cards and review history) to a JSON file.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={busy !== null || stats.counts.total === 0}
              >
                <Download className="size-3.5" />
                {busy === 'export' ? 'Exporting…' : 'Export deck'}
              </Button>
            </div>
            {message && (
              <div
                className={
                  'text-xs ' +
                  (message.kind === 'ok' ? 'text-muted-foreground' : 'text-destructive')
                }
              >
                {message.text}
              </div>
            )}
          </section>
        </TabsContent>
      </div>
    </Tabs>
  )
}

function StatCell({
  label,
  value,
  accent,
}: {
  label: string
  value: number | string
  accent?: boolean
}) {
  return (
    <div className="rounded-xl bg-muted/60 p-3">
      <div className="text-[13px] text-muted-foreground mb-1">
        {label}
      </div>
      <div
        className={
          'text-base font-medium tabular-nums ' +
          (accent && value && Number(value) > 0 ? 'text-primary' : 'text-foreground')
        }
      >
        {value}
      </div>
    </div>
  )
}
