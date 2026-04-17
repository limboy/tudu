import { useEffect, useState } from 'react'
import { MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
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

const STORAGE_KEY = 'tudu-visible-columns'

export function CardsTable({
  cards,
  loading,
  onRowClick,
}: {
  cards: Card[]
  loading: boolean
  onRowClick: (card: Card) => void
}) {
  const [visibleColumns, setVisibleColumns] = useState<{
    reviewed: boolean
    difficulty: boolean
    retrievability: boolean
    created: boolean
  }>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        // ignore
      }
    }
    return {
      reviewed: true,
      difficulty: true,
      retrievability: true,
      created: true,
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(visibleColumns))
  }, [visibleColumns])

  // Update relative times every minute
  const [, setTick] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 60000)
    return () => clearInterval(timer)
  }, [])

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
            <TableHead className="w-25">State</TableHead>
            <TableHead className="w-30">Due</TableHead>
            {visibleColumns.created && (
              <TableHead className="w-30">Created</TableHead>
            )}
            {visibleColumns.reviewed && (
              <TableHead className="w-30">Reviewed</TableHead>
            )}
            {visibleColumns.difficulty && (
              <TableHead className="w-30">Difficulty</TableHead>
            )}
            {visibleColumns.retrievability && (
              <TableHead className="w-30">Retrievability</TableHead>
            )}
            <TableHead className="w-10 p-0">
              <div className="flex justify-center pr-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      className="flex items-center justify-between cursor-default"
                    >
                      <Label
                        htmlFor="col-created"
                        className="flex-1 cursor-pointer font-normal"
                      >
                        Created
                      </Label>
                      <Switch
                        id="col-created"
                        checked={visibleColumns.created}
                        onCheckedChange={(checked) =>
                          setVisibleColumns((v) => ({ ...v, created: checked }))
                        }
                      />
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      className="flex items-center justify-between cursor-default"
                    >
                      <Label
                        htmlFor="col-reviewed"
                        className="flex-1 cursor-pointer font-normal"
                      >
                        Reviewed
                      </Label>
                      <Switch
                        id="col-reviewed"
                        checked={visibleColumns.reviewed}
                        onCheckedChange={(checked) =>
                          setVisibleColumns((v) => ({ ...v, reviewed: checked }))
                        }
                      />
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      className="flex items-center justify-between cursor-default"
                    >
                      <Label
                        htmlFor="col-difficulty"
                        className="flex-1 cursor-pointer font-normal"
                      >
                        Difficulty
                      </Label>
                      <Switch
                        id="col-difficulty"
                        checked={visibleColumns.difficulty}
                        onCheckedChange={(checked) =>
                          setVisibleColumns((v) => ({ ...v, difficulty: checked }))
                        }
                      />
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      className="flex items-center justify-between cursor-default"
                    >
                      <Label
                        htmlFor="col-retrievability"
                        className="flex-1 cursor-pointer font-normal"
                      >
                        Retrievability
                      </Label>
                      <Switch
                        id="col-retrievability"
                        checked={visibleColumns.retrievability}
                        onCheckedChange={(checked) =>
                          setVisibleColumns((v) => ({ ...v, retrievability: checked }))
                        }
                      />
                    </DropdownMenuItem>
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
              <TableCell className="w-25">
                <Badge variant={STATE_VARIANT[c.state]}>{STATE_LABEL[c.state]}</Badge>
              </TableCell>
              <TableCell
                className={cn(
                  'w-30',
                  c.due < Date.now()
                    ? 'text-orange-600 dark:text-orange-400'
                    : 'text-muted-foreground',
                )}
              >
                {relativeFromNow(c.due)}
              </TableCell>
              {visibleColumns.created && (
                <TableCell className="w-30 text-muted-foreground">
                  {relativeFromNow(c.createdAt)}
                </TableCell>
              )}
              {visibleColumns.reviewed && (
                <TableCell className="w-30 text-muted-foreground">
                  {c.lastReview ? relativeFromNow(c.lastReview) : '—'}
                </TableCell>
              )}
              {visibleColumns.difficulty && (
                <TableCell className="w-30 tabular-nums">
                  {c.state === 0 ? '—' : c.difficulty.toFixed(2)}
                </TableCell>
              )}
              {visibleColumns.retrievability && (
                <TableCell className="w-30 tabular-nums">
                  {c.state === 0 ? '—' : `${Math.round(c.retrievability * 100)}%`}
                </TableCell>
              )}
              <TableCell className="w-10 p-0" />
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
