import { useEffect, useState } from 'react'
import { answerCard, nextCards, type Card, type Deck, type Ease } from '../api/client'

const EASES: { ease: Ease; label: string; className: string }[] = [
  { ease: 'again', label: 'Again', className: 'bg-red-600' },
  { ease: 'hard', label: 'Hard', className: 'bg-orange-500' },
  { ease: 'good', label: 'Good', className: 'bg-green-600' },
  { ease: 'easy', label: 'Easy', className: 'bg-blue-600' },
]

export default function Review({ deck, onExit }: { deck: Deck; onExit: () => void }) {
  const [queue, setQueue] = useState<Card[] | null>(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    nextCards(deck.id).then(setQueue)
  }, [deck.id])

  const card = queue?.[0]

  async function answer(ease: Ease) {
    if (!card) return
    await answerCard(card.id, ease)
    setRevealed(false)
    setQueue((q) => q!.slice(1))
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center gap-3 border-b border-gray-200 px-4 py-3">
        <button onClick={onExit} className="text-blue-600">
          ← Decks
        </button>
        <h1 className="truncate font-semibold">{deck.name}</h1>
      </header>

      {!queue ? (
        <p className="p-4 text-gray-500">Loading cards…</p>
      ) : !card ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 p-4">
          <p className="text-2xl">🎉</p>
          <p className="text-gray-600">Deck finished for now.</p>
        </div>
      ) : (
        <>
          <main
            className="flex flex-1 flex-col items-center justify-center gap-6 p-6 text-center"
            onClick={() => setRevealed(true)}
          >
            <p className="text-3xl">{card.front}</p>
            {revealed && (
              <>
                <hr className="w-24 border-gray-300" />
                <p className="text-2xl text-gray-700">{card.back}</p>
              </>
            )}
          </main>

          <footer className="p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            {revealed ? (
              <div className="grid grid-cols-4 gap-2">
                {EASES.map(({ ease, label, className }) => (
                  <button
                    key={ease}
                    onClick={() => answer(ease)}
                    className={`rounded-lg py-3 font-medium text-white active:opacity-80 ${className}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            ) : (
              <button
                onClick={() => setRevealed(true)}
                className="w-full rounded-lg bg-gray-800 py-3 font-medium text-white active:opacity-80"
              >
                Show answer
              </button>
            )}
          </footer>
        </>
      )}
    </div>
  )
}
