import { Search, X, Plus, Play } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { CardFilter, CardState } from '@/types'
import { CardStateValues } from '@/types'

const STATE_OPTIONS: Array<{ value: CardState; label: string }> = [
  { value: CardStateValues.New, label: 'New' },
  { value: CardStateValues.Learning, label: 'Learning' },
  { value: CardStateValues.Review, label: 'Review' },
  { value: CardStateValues.Relearning, label: 'Relearning' },
]

type FilterDraft = Omit<CardFilter, 'deckId'>

const getStartOfDay = (daysAgo: number) => {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export function CardsFilters({
  filter,
  canStudy,
  onChange,
  onAdd,
  onStudy,
}: {
  filter: FilterDraft
  canStudy: boolean
  onChange: (next: FilterDraft) => void
  onAdd: () => void
  onStudy: () => void
}) {
  const onFilterChange = (value: string) => {
    const next = { ...filter }
    next.states = undefined
    next.createdFrom = undefined
    next.createdTo = undefined
    next.reviewedFrom = undefined
    next.reviewedTo = undefined

    if (value === 'all') {
      // done
    } else if (value.startsWith('state-')) {
      const s = parseInt(value.replace('state-', ''), 10) as CardState
      next.states = [s]
    } else if (value.startsWith('created-')) {
      const type = value.replace('created-', '')
      if (type === 'today') next.createdFrom = getStartOfDay(0)
      else if (type === 'week') next.createdFrom = getStartOfDay(7)
      else if (type === 'month') next.createdFrom = getStartOfDay(30)
    } else if (value.startsWith('reviewed-')) {
      const type = value.replace('reviewed-', '')
      if (type === 'today') next.reviewedFrom = getStartOfDay(0)
      else if (type === 'week') next.reviewedFrom = getStartOfDay(7)
      else if (type === 'month') next.reviewedFrom = getStartOfDay(30)
    }
    onChange(next)
  }

  const currentSelectValue = (() => {
    if (filter.states?.length === 1) return `state-${filter.states[0]}`
    if (filter.createdFrom === getStartOfDay(0)) return 'created-today'
    if (filter.createdFrom === getStartOfDay(7)) return 'created-week'
    if (filter.createdFrom === getStartOfDay(30)) return 'created-month'
    if (filter.reviewedFrom === getStartOfDay(0)) return 'reviewed-today'
    if (filter.reviewedFrom === getStartOfDay(7)) return 'reviewed-week'
    if (filter.reviewedFrom === getStartOfDay(30)) return 'reviewed-month'
    return 'all'
  })()

  const hasAny =
    (filter.states && filter.states.length > 0) ||
    filter.createdFrom != null ||
    filter.reviewedFrom != null ||
    (filter.search && filter.search.trim())

  const clear = () => onChange({})

  return (
    <div className="border-b bg-background/80 backdrop-blur-sm px-4 py-2 space-y-2">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-[320px]">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            value={filter.search ?? ''}
            onChange={(e) => onChange({ ...filter, search: e.target.value })}
            placeholder="Search cards…"
            className="h-8 pl-7 text-sm"
          />
        </div>
        
        <Select value={currentSelectValue} onValueChange={onFilterChange}>
          <SelectTrigger size="sm" className="w-[140px]">
            <SelectValue placeholder="All Cards" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cards</SelectItem>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel>State</SelectLabel>
              {STATE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={`state-${opt.value}`}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel>Created</SelectLabel>
              <SelectItem value="created-today">Today</SelectItem>
              <SelectItem value="created-week">Past 7 Days</SelectItem>
              <SelectItem value="created-month">Past 30 Days</SelectItem>
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel>Reviewed</SelectLabel>
              <SelectItem value="reviewed-today">Today</SelectItem>
              <SelectItem value="reviewed-week">Past 7 Days</SelectItem>
              <SelectItem value="reviewed-month">Past 30 Days</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

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

        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-8" onClick={onAdd}>
            <Plus className="size-3.5" />
            Add
          </Button>
          <Button size="sm" className="h-8" onClick={onStudy} disabled={!canStudy}>
            <Play className="size-3.5" />
            Study
          </Button>
        </div>
      </div>
    </div>
  )
}


