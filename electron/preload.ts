import { contextBridge, ipcRenderer } from 'electron'
import type {
  Card,
  CardFilter,
  Deck,
  DeckStats,
  Rating,
  TuduApi,
} from '../src/types.js'

const api: TuduApi = {
  decks: {
    list: () => ipcRenderer.invoke('decks:list') as Promise<Deck[]>,
    create: (name) => ipcRenderer.invoke('decks:create', name) as Promise<Deck>,
    rename: (id, name) => ipcRenderer.invoke('decks:rename', id, name) as Promise<void>,
    delete: (id) => ipcRenderer.invoke('decks:delete', id) as Promise<void>,
    setRetention: (id, retention) =>
      ipcRenderer.invoke('decks:setRetention', id, retention) as Promise<void>,
    dueCounts: () =>
      ipcRenderer.invoke('decks:dueCounts') as Promise<Record<number, number>>,
  },
  cards: {
    list: (filter: CardFilter) =>
      ipcRenderer.invoke('cards:list', filter) as Promise<Card[]>,
    create: (args) => ipcRenderer.invoke('cards:create', args) as Promise<Card>,
    update: (args) => ipcRenderer.invoke('cards:update', args) as Promise<Card>,
    delete: (id) => ipcRenderer.invoke('cards:delete', id) as Promise<void>,
    queue: (deckId) => ipcRenderer.invoke('cards:queue', deckId) as Promise<Card[]>,
    review: (args: { cardId: number; rating: Rating; reviewTime: number }) =>
      ipcRenderer.invoke('cards:review', args) as Promise<Card>,
  },
  stats: {
    deck: (deckId) => ipcRenderer.invoke('stats:deck', deckId) as Promise<DeckStats>,
  },
}

contextBridge.exposeInMainWorld('tudu', api)
