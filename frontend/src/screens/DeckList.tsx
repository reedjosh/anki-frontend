import { useEffect, useState } from 'react'
import { listDecks, type Deck } from '../api/client'

export default function DeckList({ onSelect }: { onSelect: (deck: Deck) => void }) {
  const [decks, setDecks] = useState<Deck[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listDecks().then(setDecks).catch((e) => setError(String(e)))
  }, [])

  if (error) return <p className="p-4 text-red-600">{error}</p>
  if (!decks) return <p className="p-4 text-gray-500">Loading decks…</p>

  return (
    <ul className="divide-y divide-gray-200">
      {decks.map((deck) => (
        <li key={deck.id}>
          <button
            onClick={() => onSelect(deck)}
            className="flex w-full items-center justify-between px-4 py-4 text-left active:bg-gray-100"
          >
            <span className="font-medium">{deck.name}</span>
            <span className="flex gap-3 text-sm tabular-nums">
              <span className="text-blue-600">{deck.newCount}</span>
              <span className="text-red-600">{deck.learnCount}</span>
              <span className="text-green-700">{deck.dueCount}</span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}
