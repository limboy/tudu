import { useEffect, useMemo, useState } from 'react'
import { ThreePane } from '@/components/layout/ThreePane'
import { TopBar } from '@/components/layout/TopBar'
import { DeckSidebar } from '@/components/decks/DeckSidebar'
import { CardsFilters } from '@/components/cards/CardsFilters'
import { CardsTable } from '@/components/cards/CardsTable'
import { CardEditor } from '@/components/cards/CardEditor'
import { DeckStatsPanel } from '@/components/stats/DeckStatsPanel'
import { StudyView } from '@/components/study/StudyView'
import { useDecks } from '@/hooks/useDecks'
import { useCards } from '@/hooks/useCards'
import { useDeckStats } from '@/hooks/useDeckStats'
import type { Card, CardFilter } from '@/types'

type EditorMode = { kind: 'add'; deckId: number } | { kind: 'edit'; card: Card }

export default function App() {
  const { decks, dueCounts, refresh: refreshDecks } = useDecks()
  const [selectedDeckId, setSelectedDeckId] = useState<number | null>(null)

  useEffect(() => {
    if (selectedDeckId != null && !decks.find((d) => d.id === selectedDeckId)) {
      setSelectedDeckId(null)
    }
    if (selectedDeckId == null && decks.length > 0) {
      setSelectedDeckId(decks[0].id)
    }
  }, [decks, selectedDeckId])

  const selectedDeck = decks.find((d) => d.id === selectedDeckId) ?? null

  const [filterDraft, setFilterDraft] = useState<Omit<CardFilter, 'deckId'>>({})
  const filter = useMemo<CardFilter | null>(
    () => (selectedDeckId == null ? null : { deckId: selectedDeckId, ...filterDraft }),
    [selectedDeckId, filterDraft],
  )

  const { cards, loading: cardsLoading, refresh: refreshCards } = useCards(filter)
  const { stats, refresh: refreshStats } = useDeckStats(selectedDeckId)

  const [editor, setEditor] = useState<EditorMode | null>(null)
  const [editorOpen, setEditorOpen] = useState(false)
  const [studying, setStudying] = useState(false)

  const [leftOpen, setLeftOpen] = useState(true)
  const [rightOpen, setRightOpen] = useState(true)
  const [leftWidth, setLeftWidth] = useState(220)
  const [rightWidth, setRightWidth] = useState(340)

  const openAdd = () => {
    if (selectedDeckId == null) return
    setEditor({ kind: 'add', deckId: selectedDeckId })
    setEditorOpen(true)
  }
  const openEdit = (c: Card) => {
    setEditor({ kind: 'edit', card: c })
    setEditorOpen(true)
  }

  const refreshAll = () => {
    refreshDecks()
    refreshCards()
    refreshStats()
  }

  const canStudy =
    !!stats && stats.counts.total > 0 && (stats.dueToday > 0 || stats.counts.new > 0)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (editorOpen || studying) return
      const t = e.target as HTMLElement | null
      if (
        t &&
        (t.tagName === 'INPUT' ||
          t.tagName === 'TEXTAREA' ||
          t.isContentEditable)
      ) {
        return
      }
      if (e.key === 'a' || e.key === 'A') {
        if (selectedDeckId == null) return
        e.preventDefault()
        openAdd()
      } else if (e.key === 's' || e.key === 'S') {
        if (!canStudy) return
        e.preventDefault()
        setStudying(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [editorOpen, studying, selectedDeckId, canStudy])

  return (
    <>
      <div className="h-screen w-screen flex flex-col overflow-hidden bg-background text-foreground">
        <TopBar
          deckName={selectedDeck?.name ?? null}
          leftOpen={leftOpen}
          rightOpen={rightOpen}
          showRightToggle={decks.length > 0}
          onToggleLeft={() => setLeftOpen((v) => !v)}
          onToggleRight={() => setRightOpen((v) => !v)}
        />
        <ThreePane
          leftOpen={leftOpen}
          rightOpen={decks.length > 0 && rightOpen}
          leftWidth={leftWidth}
          rightWidth={rightWidth}
          onLeftWidthChange={setLeftWidth}
          onRightWidthChange={setRightWidth}
          left={
            <DeckSidebar
              decks={decks}
              selectedDeckId={selectedDeckId}
              dueCounts={dueCounts}
              onSelect={setSelectedDeckId}
              onChanged={refreshAll}
            />
          }
          center={
            selectedDeck ? (
              <>
                <CardsFilters
                  filter={filterDraft}
                  canStudy={canStudy}
                  onChange={setFilterDraft}
                  onAdd={openAdd}
                  onStudy={() => setStudying(true)}
                />
                <CardsTable
                  cards={cards}
                  loading={cardsLoading}
                  onRowClick={openEdit}
                />
              </>
            ) : (
              <div className="flex-1 select-none flex items-center justify-center text-sm text-muted-foreground">
                {decks.length > 0
                  ? 'Select or create a deck to get started'
                  : 'Create a deck to start'}
              </div>
            )
          }
          right={
            <DeckStatsPanel
              deck={selectedDeck}
              stats={stats}
              onDeckChanged={refreshAll}
            />
          }
        />
      </div>

      <CardEditor
        open={editorOpen}
        mode={editor}
        onOpenChange={setEditorOpen}
        onSaved={refreshAll}
      />

      {studying && selectedDeck && (
        <StudyView
          deckId={selectedDeck.id}
          deckName={selectedDeck.name}
          onExit={() => {
            setStudying(false)
            refreshAll()
          }}
          onReviewed={refreshAll}
        />
      )}
    </>
  )
}
