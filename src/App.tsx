import { useState } from 'react'
import type { Deck } from './api/client'
import DeckList from './screens/DeckList'
import Review from './screens/Review'

export default function App() {
  const [activeDeck, setActiveDeck] = useState<Deck | null>(null)

  if (activeDeck) {
    return <Review deck={activeDeck} onExit={() => setActiveDeck(null)} />
  }

  return (
    <div className="mx-auto max-w-lg">
      <header className="px-4 pt-6 pb-2">
        <h1 className="text-xl font-bold">Anki</h1>
      </header>
      <DeckList onSelect={setActiveDeck} />
    </div>
  )
}
