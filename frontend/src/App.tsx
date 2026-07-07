import { useRef, useState } from 'react'
import { importApkg, type Deck } from './api/client'
import DeckList from './screens/DeckList'
import Review from './screens/Review'

export default function App() {
  const [activeDeck, setActiveDeck] = useState<Deck | null>(null)
  const [importing, setImporting] = useState(false)
  const [deckListKey, setDeckListKey] = useState(0)
  const fileInput = useRef<HTMLInputElement>(null)

  async function onImportFile(file: File) {
    setImporting(true)
    try {
      await importApkg(file)
      setDeckListKey((k) => k + 1) // refetch decks
    } finally {
      setImporting(false)
    }
  }

  if (activeDeck) {
    return <Review deck={activeDeck} onExit={() => setActiveDeck(null)} />
  }

  return (
    <div className="mx-auto max-w-lg">
      <header className="flex items-center justify-between px-4 pt-6 pb-2">
        <h1 className="text-xl font-bold">Anki</h1>
        <button
          onClick={() => fileInput.current?.click()}
          disabled={importing}
          className="rounded-lg bg-gray-800 px-3 py-1.5 text-sm font-medium text-white active:opacity-80 disabled:opacity-50"
        >
          {importing ? 'Importing…' : 'Import .apkg'}
        </button>
        <input
          ref={fileInput}
          type="file"
          accept=".apkg"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onImportFile(file)
            e.target.value = ''
          }}
        />
      </header>
      <DeckList key={deckListKey} onSelect={setActiveDeck} />
    </div>
  )
}
