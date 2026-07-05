// Client for the (future) self-hosted Anki backend.
// Until the backend exists, VITE_API_BASE is unset and every call
// falls back to in-memory mock data so the UI is workable standalone.

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
  front: string
  back: string
}

// Anki's four answer eases.
export type Ease = 'again' | 'hard' | 'good' | 'easy'

const API_BASE: string | undefined = import.meta.env.VITE_API_BASE

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

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!res.ok) throw new Error(`${init?.method ?? 'GET'} ${path}: ${res.status}`)
  return res.json() as Promise<T>
}

export async function listDecks(): Promise<Deck[]> {
  if (!API_BASE) return MOCK_DECKS
  return request<Deck[]>('/decks')
}

export async function nextCards(deckId: string): Promise<Card[]> {
  if (!API_BASE) return MOCK_CARDS.filter((c) => c.deckId === deckId)
  return request<Card[]>(`/decks/${deckId}/next`)
}

export async function answerCard(cardId: string, ease: Ease): Promise<void> {
  if (!API_BASE) return
  await request<void>(`/cards/${cardId}/answer`, {
    method: 'POST',
    body: JSON.stringify({ ease }),
  })
}
