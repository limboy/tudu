import { useState } from 'react'
import { MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
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
  const [visibleColumns, setVisibleColumns] = useState({
    reviewed: true,
    difficulty: true,
    retrievability: true,
  })

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
            <TableHead className="pl-4">Front</TableHead>
            <TableHead className="w-[100px]">State</TableHead>
            <TableHead className="w-[120px]">Due</TableHead>
            {visibleColumns.reviewed && (
              <TableHead className="w-[120px]">Reviewed</TableHead>
            )}
            {visibleColumns.difficulty && (
              <TableHead className="w-[120px]">Difficulty</TableHead>
            )}
            {visibleColumns.retrievability && (
              <TableHead className="w-[120px]">Retrievability</TableHead>
            )}
            <TableHead className="w-[40px] p-0">
              <div className="flex justify-center pr-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuCheckboxItem
                      checked={visibleColumns.reviewed}
                      onCheckedChange={(checked) =>
                        setVisibleColumns((v) => ({ ...v, reviewed: !!checked }))
                      }
                    >
                      Reviewed
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={visibleColumns.difficulty}
                      onCheckedChange={(checked) =>
                        setVisibleColumns((v) => ({ ...v, difficulty: !!checked }))
                      }
                    >
                      Difficulty
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={visibleColumns.retrievability}
                      onCheckedChange={(checked) =>
                        setVisibleColumns((v) => ({ ...v, retrievability: !!checked }))
                      }
                    >
                      Retrievability
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cards.map((c) => (
            <TableRow
              key={c.id}
              className={cn('cursor-pointer')}
              onClick={() => onRowClick(c)}
            >
              <TableCell className="max-w-0 pl-4">
                <div className="truncate">{previewText(c.frontMd) || '—'}</div>
              </TableCell>
              <TableCell className="w-[100px]">
                <Badge variant={STATE_VARIANT[c.state]}>{STATE_LABEL[c.state]}</Badge>
              </TableCell>
              <TableCell className="w-[120px] text-muted-foreground">
                {relativeFromNow(c.due)}
              </TableCell>
              {visibleColumns.reviewed && (
                <TableCell className="w-[120px] text-muted-foreground">
                  {c.lastReview ? relativeFromNow(c.lastReview) : '—'}
                </TableCell>
              )}
              {visibleColumns.difficulty && (
                <TableCell className="w-[120px] tabular-nums">
                  {c.state === 0 ? '—' : c.difficulty.toFixed(2)}
                </TableCell>
              )}
              {visibleColumns.retrievability && (
                <TableCell className="w-[120px] tabular-nums">
                  {c.state === 0 ? '—' : `${Math.round(c.retrievability * 100)}%`}
                </TableCell>
              )}
              <TableCell className="w-[40px] p-0" />
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
