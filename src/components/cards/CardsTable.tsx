import { useEffect, useState, useMemo } from 'react'
import {
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  ChevronsUpDown
} from 'lucide-react'
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
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type {
  ColumnDef,
  SortingState,
  VisibilityState,
} from '@tanstack/react-table'

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

function SortableHeader({ column, title }: { column: any, title: string }) {
  return (
    <div className="flex items-center">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8 data-[state=open]:bg-accent"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        <span>{title}</span>
        {column.getIsSorted() === 'desc' ? (
          <ArrowDown className="h-3 w-3" strokeWidth={1.5} />
        ) : column.getIsSorted() === 'asc' ? (
          <ArrowUp className="h-3 w-3" strokeWidth={1.5} />
        ) : (
          <ChevronsUpDown className="text-muted-foreground/60" strokeWidth={1} size={10} />
        )}
      </Button>
    </div>
  )
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
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if ('reviewed' in parsed) {
          return {
            lastReview: parsed.reviewed,
            difficulty: parsed.difficulty,
            retrievability: parsed.retrievability,
            createdAt: parsed.created,
          }
        }
        return parsed
      } catch (e) {
        // ignore
      }
    }
    return {
      lastReview: true,
      difficulty: true,
      retrievability: true,
      createdAt: true,
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      reviewed: columnVisibility.lastReview ?? true,
      difficulty: columnVisibility.difficulty ?? true,
      retrievability: columnVisibility.retrievability ?? true,
      created: columnVisibility.createdAt ?? true,
    }))
  }, [columnVisibility])

  // Update relative times every minute
  const [, setTick] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 60000)
    return () => clearInterval(timer)
  }, [])

  const columns = useMemo<ColumnDef<Card>[]>(() => [
    {
      id: 'front',
      accessorFn: (row) => previewText(row.frontMd) || '',
      header: ({ column }) => <SortableHeader column={column} title="Front" />,
      cell: ({ getValue }) => (
        <div className="truncate">{getValue() as string || '—'}</div>
      ),
    },
    {
      accessorKey: 'state',
      header: ({ column }) => <SortableHeader column={column} title="State" />,
      cell: ({ row }) => (
        <Badge variant={STATE_VARIANT[row.original.state as CardState]}>
          {STATE_LABEL[row.original.state as CardState]}
        </Badge>
      ),
    },
    {
      accessorKey: 'due',
      header: ({ column }) => <SortableHeader column={column} title="Due" />,
      cell: ({ row }) => {
        const c = row.original
        return (
          <span className={cn(
            c.due < Date.now()
              ? 'text-orange-600 dark:text-orange-400'
              : 'text-muted-foreground'
          )}>
            {relativeFromNow(c.due)}
          </span>
        )
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => <SortableHeader column={column} title="Created" />,
      cell: ({ row }) => (
        <span className="text-muted-foreground">{relativeFromNow(row.original.createdAt)}</span>
      ),
    },
    {
      accessorKey: 'lastReview',
      header: ({ column }) => <SortableHeader column={column} title="Reviewed" />,
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.lastReview ? relativeFromNow(row.original.lastReview) : '—'}
        </span>
      ),
    },
    {
      accessorKey: 'difficulty',
      header: ({ column }) => <SortableHeader column={column} title="Difficulty" />,
      cell: ({ row }) => (
        <span className="tabular-nums">
          {row.original.state === 0 ? '—' : row.original.difficulty.toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: 'retrievability',
      header: ({ column }) => <SortableHeader column={column} title="Retrievability" />,
      cell: ({ row }) => (
        <span className="tabular-nums">
          {row.original.state === 0 ? '—' : `${Math.round(row.original.retrievability * 100)}%`}
        </span>
      ),
    },
    {
      id: 'actions',
      header: ({ table }) => {
        return (
          <div className="flex justify-end pr-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {['createdAt', 'lastReview', 'difficulty', 'retrievability'].map(colId => {
                  const column = table.getColumn(colId)
                  if (!column) return null
                  const labelMap: Record<string, string> = {
                    createdAt: 'Created',
                    lastReview: 'Reviewed',
                    difficulty: 'Difficulty',
                    retrievability: 'Retrievability'
                  }
                  return (
                    <DropdownMenuItem
                      key={colId}
                      onSelect={(e) => e.preventDefault()}
                      className="flex items-center justify-between cursor-default"
                    >
                      <Label
                        htmlFor={`col-${colId}`}
                        className="flex-1 cursor-pointer font-normal"
                      >
                        {labelMap[colId]}
                      </Label>
                      <Switch
                        id={`col-${colId}`}
                        checked={column.getIsVisible()}
                        onCheckedChange={(v) => column.toggleVisibility(!!v)}
                      />
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
      cell: () => null,
      enableSorting: false,
      enableHiding: false,
    }
  ], [])

  const table = useReactTable({
    data: cards,
    columns,
    state: {
      sorting,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
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
      <Table containerClassName="overflow-x-visible">
        <TableHeader className="sticky top-0 bg-muted z-10">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const widthMap: Record<string, string> = {
                  front: 'w-full min-w-[300px]',
                  state: 'w-[100px]',
                  due: 'w-[120px]',
                  createdAt: 'w-[120px]',
                  lastReview: 'w-[120px]',
                  difficulty: 'w-[120px]',
                  retrievability: 'w-[120px]',
                  actions: 'w-10 p-0',
                }
                return (
                  <TableHead
                    key={header.id}
                    className={cn(header.id === 'front' ? 'pl-5' : '', widthMap[header.id] || 'w-auto')}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="cursor-pointer"
                onClick={() => onRowClick(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cn(cell.column.id === 'front' ? 'pl-5 max-w-0' : '')}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
