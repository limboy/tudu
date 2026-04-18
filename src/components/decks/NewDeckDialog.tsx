import { useState } from 'react'
import { Upload } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api } from '@/lib/api'

export function NewDeckDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onCreated: (deckId: number) => void
}) {
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const save = async () => {
    const trimmed = name.trim()
    if (!trimmed) return
    setSaving(true)
    setError(null)
    try {
      const deck = await api.decks.create(trimmed)
      setSaving(false)
      setName('')
      onOpenChange(false)
      onCreated(deck.id)
    } catch (e) {
      setSaving(false)
      setError(e instanceof Error ? e.message : 'Failed to create deck')
    }
  }

  const [isDragging, setIsDragging] = useState(false)

  const handleImport = async (filePath?: string) => {
    setSaving(true)
    setError(null)
    const result = await api.decks.import(filePath)
    setSaving(false)
    if (result.ok) {
      onOpenChange(false)
      onCreated(result.deckId)
    } else if (!result.canceled) {
      setError(result.error)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'copy'
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      const path = api.getPathForFile(file)
      if (path) {
        handleImport(path)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>New deck</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="deck-name">Name</Label>
            <Input
              id="deck-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Spanish vocab"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') save()
              }}
            />
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <Button
            variant="outline"
            className={`w-full transition-colors ${
              isDragging
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-dashed'
            }`}
            onClick={() => handleImport()}
            disabled={saving}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className={`mr-2 size-4 ${isDragging ? 'animate-bounce' : ''}`} />
            {isDragging ? 'Drop file here' : 'Import from file...'}
          </Button>

          {error && (
            <div className="text-xs text-destructive text-center">
              {error}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save} disabled={!name.trim() || saving}>
            {saving ? 'Creating...' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
