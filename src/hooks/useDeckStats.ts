import { useCallback, useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { DeckStats } from '@/types'

export function useDeckStats(deckId: number | null) {
  const [stats, setStats] = useState<DeckStats | null>(null)

  const refresh = useCallback(async () => {
    if (deckId == null) {
      setStats(null)
      return
    }
    const s = await api.stats.deck(deckId)
    setStats(s)
  }, [deckId])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { stats, refresh }
}
