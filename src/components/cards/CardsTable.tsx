import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Card, CardState } from '@/types'
import { CardStateValues } from '@/types'

const STATE_LABEL: Record<CardState, string> = {
  [CardStateValues.New]: 'New',
  [CardStateValues.Learning]: 'Learning',
  [CardStateValues.Review]: 'Review',
  [CardStateValues.Relearning]: 'Relearning',
}

const STATE_VARIANT: Record<
  CardState,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  [CardStateValues.New]: 'outline',
  [CardStateValues.Learning]: 'default',
  [CardStateValues.Review]: 'secondary',
  [CardStateValues.Relearning]: 'destructive',
}

function previewText(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, '[code]')
    .replace(/[#*_`>\-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function relativeFromNow(ms: number): string {
  const now = Date.now()
  const diff = ms - now
  const abs = Math.abs(diff)
  const sign = diff < 0 ? 'ago' : ''
  if (abs < 60_000) return diff < 0 ? 'just now' : 'now'
  if (abs < 3_600_000) {
    const m = Math.round(abs / 60_000)
    return diff < 0 ? `${m}m ${sign}` : `in ${m}m`
  }
  if (abs < 86_400_000) {
    const h = Math.round(abs / 3_600_000)
    return diff < 0 ? `${h}h ${sign}` : `in ${h}h`
  }
  const d = Math.round(abs / 86_400_000)
  return diff < 0 ? `${d}d ${sign}` : `in ${d}d`
}

export function CardsTable({
  cards,
  loading,
  onRowClick,
}: {
  cards: Card[]
  loading: boolean
  onRowClick: (card: Card) => void
}) {
  if (loading && cards.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>
    )
  }
  if (cards.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">
        No cards match your filters.
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto">
      <Table>
        <TableHeader className="sticky top-0 bg-background/95 backdrop-blur-sm z-10">
          <TableRow>
            <TableHead className="w-[40%]">Front</TableHead>
            <TableHead>State</TableHead>
            <TableHead>Due</TableHead>
            <TableHead>Last reviewed</TableHead>
            <TableHead className="text-right">Difficulty</TableHead>
            <TableHead className="text-right">Retrievability</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cards.map((c) => (
            <TableRow
              key={c.id}
              className={cn('cursor-pointer')}
              onClick={() => onRowClick(c)}
            >
              <TableCell className="max-w-0">
                <div className="truncate">{previewText(c.frontMd) || '—'}</div>
              </TableCell>
              <TableCell>
                <Badge variant={STATE_VARIANT[c.state]}>{STATE_LABEL[c.state]}</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {relativeFromNow(c.due)}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {c.lastReview ? relativeFromNow(c.lastReview) : '—'}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {c.state === 0 ? '—' : c.difficulty.toFixed(2)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {c.state === 0 ? '—' : `${Math.round(c.retrievability * 100)}%`}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
