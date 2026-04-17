import { useCallback, useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { Card, CardFilter } from '@/types'

export function useCards(filter: CardFilter | null) {
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!filter) {
      setCards([])
      return
    }
    setLoading(true)
    const list = await api.cards.list(filter)
    setCards(list)
    setLoading(false)
  }, [filter])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { cards, loading, refresh }
}
