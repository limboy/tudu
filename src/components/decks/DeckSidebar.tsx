import { useState } from 'react'
import { Plus, MoreHorizontal, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { NewDeckDialog } from './NewDeckDialog'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { Deck } from '@/types'

export function DeckSidebar({
  decks,
  selectedDeckId,
  dueCounts,
  onSelect,
  onChanged,
}: {
  decks: Deck[]
  selectedDeckId: number | null
  dueCounts: Record<number, number>
  onSelect: (id: number) => void
  onChanged: () => void
}) {
  const [newOpen, setNewOpen] = useState(false)
  const [renaming, setRenaming] = useState<Deck | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [deleting, setDeleting] = useState<Deck | null>(null)

  const startRename = (d: Deck) => {
    setRenaming(d)
    setRenameValue(d.name)
  }

  const commitRename = async () => {
    if (!renaming) return
    const v = renameValue.trim()
    if (v && v !== renaming.name) {
      await api.decks.rename(renaming.id, v)
      onChanged()
    }
    setRenaming(null)
  }

  const confirmDelete = async () => {
    if (!deleting) return
    await api.decks.delete(deleting.id)
    setDeleting(null)
    onChanged()
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-3 py-3 text-xs font-semibold tracking-wide uppercase text-muted-foreground">
        Decks
      </div>
      <div className="flex-1 overflow-y-auto px-1">
        {decks.length === 0 && (
          <div className="px-3 py-2 text-xs text-muted-foreground">
            No decks yet
          </div>
        )}
        {decks.map((deck) => {
          const isSelected = deck.id === selectedDeckId
          const due = dueCounts[deck.id] ?? 0
          const isRenaming = renaming?.id === deck.id
          return (
            <div
              key={deck.id}
              className={cn(
                'group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-pointer',
                isSelected ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/60',
              )}
              onClick={() => !isRenaming && onSelect(deck.id)}
              onDoubleClick={(e) => {
                e.stopPropagation()
                startRename(deck)
              }}
            >
              <Layers className="size-3.5 text-muted-foreground shrink-0" />
              {isRenaming ? (
                <Input
                  autoFocus
                  className="h-6 px-1 py-0 text-sm"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitRename()
                    else if (e.key === 'Escape') setRenaming(null)
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="truncate flex-1">{deck.name}</span>
              )}
              {!isRenaming && due > 0 && (
                <span className="text-[10px] tabular-nums rounded-full bg-primary text-primary-foreground px-1.5 py-px">
                  {due}
                </span>
              )}
              {!isRenaming && (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    asChild
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className={cn(
                        'opacity-0 group-hover:opacity-100 rounded hover:bg-background/60 p-0.5',
                      )}
                    >
                      <MoreHorizontal className="size-3.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DropdownMenuItem onSelect={() => startRename(deck)}>
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => setDeleting(deck)}
                      variant="destructive"
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          )
        })}
      </div>
      <div className="p-2 border-t">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={() => setNewOpen(true)}
        >
          <Plus className="size-4" />
          New deck
        </Button>
      </div>

      <NewDeckDialog
        open={newOpen}
        onOpenChange={setNewOpen}
        onCreated={(id) => {
          onChanged()
          onSelect(id)
        }}
      />

      <AlertDialog open={!!deleting} onOpenChange={(v) => !v && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete deck?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleting?.name}" and all its cards and review history will be permanently
              removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
