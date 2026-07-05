# anki-frontend

Mobile-friendly web UI for a self-hosted Anki setup, built with Vite + React + TypeScript + Tailwind.

The plan: this SPA talks to a small backend API (wrapping the `anki` Python
library) so cards can be reviewed from any browser on the LAN. Until that
backend exists, the app runs against built-in mock data.

## Develop

```sh
npm install
npm run dev
```

Open the printed URL (add `--host` to test from a phone on the LAN).

## Configuration

Copy `.env.example` to `.env` and set `VITE_API_BASE` to point at the backend.
With no `.env`, the UI uses mock decks/cards.

## Structure

- `src/api/client.ts` – typed API client (decks, next cards, answer) with mock fallback
- `src/screens/DeckList.tsx` – deck list with new/learn/due counts
- `src/screens/Review.tsx` – tap-to-reveal review screen with the four Anki eases
