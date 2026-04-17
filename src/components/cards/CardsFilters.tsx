import { useState } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { CardFilter, CardState } from '@/types'
import { CardStateValues } from '@/types'

const STATE_OPTIONS: Array<{ value: CardState; label: string }> = [
  { value: CardStateValues.New, label: 'New' },
  { value: CardStateValues.Learning, label: 'Learning' },
  { value: CardStateValues.Review, label: 'Review' },
  { value: CardStateValues.Relearning, label: 'Relearning' },
]

type FilterDraft = Omit<CardFilter, 'deckId'>

export function CardsFilters({
  filter,
  onChange,
}: {
  filter: FilterDraft
  onChange: (next: FilterDraft) => void
}) {
  const [showMore, setShowMore] = useState(false)

  const toggleState = (s: CardState) => {
    const current = new Set(filter.states ?? [])
    if (current.has(s)) current.delete(s)
    else current.add(s)
    onChange({ ...filter, states: current.size ? Array.from(current) : undefined })
  }

  const setDateRange = (
    fromKey: 'createdFrom' | 'reviewedFrom',
    toKey: 'createdTo' | 'reviewedTo',
    from: string,
    to: string,
  ) => {
    const next = { ...filter }
    next[fromKey] = from ? new Date(from).getTime() : undefined
    next[toKey] = to ? new Date(to + 'T23:59:59.999').getTime() : undefined
    onChange(next)
  }

  const clear = () => onChange({})

  const hasAny =
    (filter.states && filter.states.length > 0) ||
    filter.createdFrom != null ||
    filter.createdTo != null ||
    filter.reviewedFrom != null ||
    filter.reviewedTo != null ||
    filter.difficultyMin != null ||
    filter.difficultyMax != null ||
    filter.retrievabilityMin != null ||
    filter.retrievabilityMax != null ||
    (filter.search && filter.search.trim())

  return (
    <div className="border-b bg-background/80 backdrop-blur-sm px-4 py-2 space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-[320px]">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            value={filter.search ?? ''}
            onChange={(e) => onChange({ ...filter, search: e.target.value })}
            placeholder="Search cards…"
            className="h-8 pl-7 text-sm"
          />
        </div>
        <div className="flex items-center gap-1">
          {STATE_OPTIONS.map((opt) => {
            const active = filter.states?.includes(opt.value) ?? false
            return (
              <button
                key={opt.value}
                onClick={() => toggleState(opt.value)}
                className={cn(
                  'text-xs px-2 py-1 rounded-full border',
                  active
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background hover:bg-accent text-muted-foreground',
                )}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 px-2 text-xs"
          onClick={() => setShowMore((v) => !v)}
        >
          {showMore ? 'Less' : 'More'}
        </Button>
        {hasAny && (
          <Button
            size="sm"
            variant="ghost"
            className="h-8 px-2 text-xs text-muted-foreground"
            onClick={clear}
          >
            <X className="size-3" /> Clear
          </Button>
        )}
      </div>
      {showMore && (
        <div className="flex items-end gap-4 flex-wrap text-xs">
          <DateRange
            label="Created"
            from={filter.createdFrom}
            to={filter.createdTo}
            onChange={(f, t) => setDateRange('createdFrom', 'createdTo', f, t)}
          />
          <DateRange
            label="Reviewed"
            from={filter.reviewedFrom}
            to={filter.reviewedTo}
            onChange={(f, t) => setDateRange('reviewedFrom', 'reviewedTo', f, t)}
          />
          <RangeInput
            label="Difficulty"
            min={0}
            max={10}
            step={0.5}
            valueMin={filter.difficultyMin}
            valueMax={filter.difficultyMax}
            onChange={(a, b) =>
              onChange({ ...filter, difficultyMin: a, difficultyMax: b })
            }
          />
          <RangeInput
            label="Retrievability"
            min={0}
            max={1}
            step={0.05}
            valueMin={filter.retrievabilityMin}
            valueMax={filter.retrievabilityMax}
            onChange={(a, b) =>
              onChange({ ...filter, retrievabilityMin: a, retrievabilityMax: b })
            }
          />
        </div>
      )}
    </div>
  )
}

function DateRange({
  label,
  from,
  to,
  onChange,
}: {
  label: string
  from?: number
  to?: number
  onChange: (from: string, to: string) => void
}) {
  const toDateStr = (ms?: number) =>
    ms != null ? new Date(ms).toISOString().slice(0, 10) : ''
  return (
    <div className="flex flex-col gap-1">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1">
        <Input
          type="date"
          className="h-7 text-xs w-[130px]"
          value={toDateStr(from)}
          onChange={(e) => onChange(e.target.value, toDateStr(to))}
        />
        <span className="text-muted-foreground">–</span>
        <Input
          type="date"
          className="h-7 text-xs w-[130px]"
          value={toDateStr(to)}
          onChange={(e) => onChange(toDateStr(from), e.target.value)}
        />
      </div>
    </div>
  )
}

function RangeInput({
  label,
  min,
  max,
  step,
  valueMin,
  valueMax,
  onChange,
}: {
  label: string
  min: number
  max: number
  step: number
  valueMin?: number
  valueMax?: number
  onChange: (min: number | undefined, max: number | undefined) => void
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1">
        <Input
          type="number"
          min={min}
          max={max}
          step={step}
          className="h-7 text-xs w-[70px]"
          value={valueMin ?? ''}
          placeholder={String(min)}
          onChange={(e) =>
            onChange(e.target.value === '' ? undefined : Number(e.target.value), valueMax)
          }
        />
        <span className="text-muted-foreground">–</span>
        <Input
          type="number"
          min={min}
          max={max}
          step={step}
          className="h-7 text-xs w-[70px]"
          value={valueMax ?? ''}
          placeholder={String(max)}
          onChange={(e) =>
            onChange(valueMin, e.target.value === '' ? undefined : Number(e.target.value))
          }
        />
      </div>
    </div>
  )
}
