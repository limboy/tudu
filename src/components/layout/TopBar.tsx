import { PanelLeft, PanelRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function TopBar({
  deckName,
  leftOpen,
  rightOpen,
  onToggleLeft,
  onToggleRight,
}: {
  deckName: string | null
  leftOpen: boolean
  rightOpen: boolean
  onToggleLeft: () => void
  onToggleRight: () => void
}) {
  return (
    <header className="app-drag h-11 shrink-0 border-b bg-background/80 backdrop-blur-sm flex items-center gap-2 pr-3">
      <div className="w-19 shrink-0" />

      <div className="app-no-drag flex items-center gap-1 shrink-0">
        <Button
          size="icon"
          variant="ghost"
          className="size-7"
          aria-label={leftOpen ? 'Hide deck sidebar' : 'Show deck sidebar'}
          aria-pressed={leftOpen}
          onClick={onToggleLeft}
        >
          <PanelLeft className="size-4" />
        </Button>
      </div>

      <h1 className="flex-1 min-w-0 text-sm font-medium tracking-tight truncate text-center">
        {deckName ?? 'No deck selected'}
      </h1>

      <div className="app-no-drag flex items-center gap-2 shrink-0">
        <Button
          size="icon"
          variant="ghost"
          className="size-7"
          aria-label={rightOpen ? 'Hide stats sidebar' : 'Show stats sidebar'}
          aria-pressed={rightOpen}
          onClick={onToggleRight}
        >
          <PanelRight className="size-4" />
        </Button>
      </div>
    </header>
  )
}

