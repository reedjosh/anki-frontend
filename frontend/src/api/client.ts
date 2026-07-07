// Client for the anki backend (backend/, served under /api on the same
// host). Set VITE_API_BASE=mock to run the UI standalone on canned data,
// or to an absolute URL to hit a backend elsewhere.

export interface Deck {
  id: string
  name: string
  newCount: number
  learnCount: number
  dueCount: number
}

export interface Card {
  id: string
  deckId: string
  front: string // rendered HTML from the anki library
  back: string
}

// Anki's four answer eases.
export type Ease = 'again' | 'hard' | 'good' | 'easy'

const API_BASE: string = import.meta.env.VITE_API_BASE ?? '/api'
const MOCK = API_BASE === 'mock'

const MOCK_DECKS: Deck[] = [
  { id: '1', name: 'Japanese::Core 2k', newCount: 12, learnCount: 3, dueCount: 41 },
  { id: '2', name: 'Kubernetes', newCount: 5, learnCount: 0, dueCount: 8 },
  { id: '3', name: 'Music Theory', newCount: 0, learnCount: 1, dueCount: 2 },
]

const MOCK_CARDS: Card[] = [
  { id: 'c1', deckId: '1', front: '犬', back: 'いぬ — dog' },
  { id: 'c2', deckId: '1', front: '猫', back: 'ねこ — cat' },
  { id: 'c3', deckId: '1', front: '鳥', back: 'とり — bird' },
]
let mockIndex = 0

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, init)
  if (!res.ok) throw new Error(`${init?.method ?? 'GET'} ${path}: ${res.status}`)
  return res.json() as Promise<T>
}

export async function listDecks(): Promise<Deck[]> {
  if (MOCK) return MOCK_DECKS
  return request<Deck[]>('/decks')
}

export async function nextCard(deckId: string): Promise<Card | null> {
  if (MOCK) return MOCK_CARDS.filter((c) => c.deckId === deckId)[mockIndex] ?? null
  return request<Card | null>(`/decks/${deckId}/next`)
}

export async function answerCard(cardId: string, ease: Ease): Promise<void> {
  if (MOCK) {
    mockIndex++
    return
  }
  await request<{ ok: boolean }>(`/cards/${cardId}/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ease }),
  })
}

export async function importApkg(file: File): Promise<{ foundNotes: number }> {
  if (MOCK) return { foundNotes: 0 }
  const body = new FormData()
  body.append('file', file)
  return request<{ foundNotes: number }>('/import', { method: 'POST', body })
}
