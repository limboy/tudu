import { useEffect, useState } from 'react'
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

  useEffect(() => {
    if (deck) setRetention(deck.desiredRetention.toFixed(2))
  }, [deck?.id, deck?.desiredRetention])

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

  return (
    <Tabs defaultValue="statistics" className="h-full flex flex-col">
      <div className="px-4 h-[49px] flex items-center shrink-0 border-b bg-background/80 backdrop-blur-sm">
        <TabsList className="grid w-full grid-cols-2 h-8">
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
      </div>

      <div className="flex-1 overflow-y-auto p-4 text-sm">
        <TabsContent value="statistics" className="space-y-4 m-0">
          <section>
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Counts
            </div>
            <div className="grid grid-cols-3 gap-2">
              <StatCell label="New" value={stats.counts.new} />
              <StatCell label="Learning" value={stats.counts.learning} />
              <StatCell
                label="Review"
                value={stats.counts.review + stats.counts.relearning}
              />
            </div>
          </section>

          <Separator />

          <section className="grid grid-cols-2 gap-2">
            <StatCell label="Due today" value={stats.dueToday} accent />
            <StatCell label="Next 7 days" value={stats.dueNext7} />
          </section>

          <Separator />

          <section>
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Retention
              </span>
              <span className="tabular-nums text-base font-semibold">
                {stats.retentionRate != null
                  ? `${Math.round(stats.retentionRate * 100)}%`
                  : '—'}
              </span>
            </div>
            <div className="text-[11px] text-muted-foreground">
              Good/Easy reviews over total, all time
            </div>
          </section>

          <section>
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
              Reviews · last 30 days
            </div>
            <ReviewsChart data={stats.reviewsLast30} />
          </section>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4 m-0">
          <section className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Deck Settings
            </div>
            <div className="space-y-1">
              <Label htmlFor="retention" className="text-xs">
                Desired retention
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
                className="h-8"
              />
              <div className="text-[11px] text-muted-foreground">
                FSRS target, 0.70–0.99
              </div>
            </div>
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
  value: number
  accent?: boolean
}) {
  return (
    <div className="rounded-md border bg-background p-2">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div
        className={
          'text-lg font-semibold tabular-nums ' +
          (accent && value > 0 ? 'text-primary' : '')
        }
      >
        {value}
      </div>
    </div>
  )
}
