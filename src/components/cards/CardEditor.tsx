import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
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
import { MarkdownView } from './MarkdownView'
import { api } from '@/lib/api'
import type { Card } from '@/types'

type Mode =
  | { kind: 'add'; deckId: number }
  | { kind: 'edit'; card: Card }

export function CardEditor({
  open,
  mode,
  onOpenChange,
  onSaved,
}: {
  open: boolean
  mode: Mode | null
  onOpenChange: (v: boolean) => void
  onSaved: () => void
}) {
  const [front, setFront] = useState('')
  const [back, setBack] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (!open) return
    if (mode?.kind === 'edit') {
      setFront(mode.card.frontMd)
      setBack(mode.card.backMd)
    } else {
      setFront('')
      setBack('')
    }
  }, [open, mode])

  if (!mode) return null

  const save = async () => {
    if (!front.trim() && !back.trim()) return
    setSaving(true)
    if (mode.kind === 'add') {
      await api.cards.create({
        deckId: mode.deckId,
        frontMd: front,
        backMd: back,
      })
    } else {
      await api.cards.update({
        id: mode.card.id,
        frontMd: front,
        backMd: back,
      })
    }
    setSaving(false)
    onOpenChange(false)
    onSaved()
  }

  const remove = async () => {
    if (mode.kind !== 'edit') return
    await api.cards.delete(mode.card.id)
    setConfirmDelete(false)
    onOpenChange(false)
    onSaved()
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {mode.kind === 'add' ? 'Add card' : 'Edit card'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <FieldWithPreview label="Front" value={front} onChange={setFront} />
            <FieldWithPreview label="Back" value={back} onChange={setBack} />
          </div>
          <DialogFooter className="justify-between sm:justify-between">
            <div>
              {mode.kind === 'edit' && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 className="size-4" /> Delete
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={save}
                disabled={saving || (!front.trim() && !back.trim())}
              >
                Save
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete card?</AlertDialogTitle>
            <AlertDialogDescription>
              This card and its review history will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={remove}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function FieldWithPreview({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <Tabs defaultValue="edit">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium">{label}</span>
          <TabsList className="h-7">
            <TabsTrigger value="edit" className="text-xs">
              Write
            </TabsTrigger>
            <TabsTrigger value="preview" className="text-xs">
              Preview
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="edit" className="mt-0">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="min-h-[240px] font-mono text-sm"
            placeholder="Markdown supported…"
          />
        </TabsContent>
        <TabsContent value="preview" className="mt-0">
          <div className="min-h-[240px] rounded-md border bg-background p-3 text-sm">
            {value.trim() ? (
              <MarkdownView source={value} />
            ) : (
              <span className="text-muted-foreground">Nothing to preview</span>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
