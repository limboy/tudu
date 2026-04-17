import { useCallback, useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { Card } from '@/types'

export function useStudyQueue(deckId: number | null, active: boolean) {
  const [queue, setQueue] = useState<Card[]>([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    if (deckId == null || !active) {
      setQueue([])
      return
    }
    setLoading(true)
    const q = await api.cards.queue(deckId)
    setQueue(q)
    setLoading(false)
  }, [deckId, active])

  useEffect(() => {
    load()
  }, [load])

  return { queue, loading, reload: load }
}
