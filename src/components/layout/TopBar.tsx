import { Plus, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function TopBar({
  deckName,
  canStudy,
  onAdd,
  onStudy,
}: {
  deckName: string | null
  canStudy: boolean
  onAdd: () => void
  onStudy: () => void
}) {
  return (
    <header className="h-12 shrink-0 border-b bg-background/80 backdrop-blur-sm flex items-center justify-between px-4">
      <h1 className="text-sm font-medium tracking-tight truncate">
        {deckName ?? 'No deck selected'}
      </h1>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={onAdd}
          disabled={deckName === null}
        >
          <Plus className="size-4" />
          Add
        </Button>
        <Button size="sm" onClick={onStudy} disabled={!canStudy}>
          <Play className="size-4" />
          Study
        </Button>
      </div>
    </header>
  )
}
