import { useCallback, useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { Deck } from '@/types'

export function useDecks() {
  const [decks, setDecks] = useState<Deck[]>([])
  const [dueCounts, setDueCounts] = useState<Record<number, number>>({})
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const [list, counts] = await Promise.all([
      api.decks.list(),
      api.decks.dueCounts(),
    ])
    setDecks(list)
    setDueCounts(counts)
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { decks, dueCounts, loading, refresh }
}
