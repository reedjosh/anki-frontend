# anki

Self-hosted Anki: a FastAPI backend wrapping the official `anki` library plus a
mobile-friendly React web UI, deployed to the homelab k8s cluster at
https://anki.thereedfamily.rocks.

## Status (last touched 2026-07-06)

Working:

- Frontend deployed and serving at https://anki.thereedfamily.rocks (LE TLS)
- Tilt dev loop against the `josh-home` cluster: `./dev.sh`, then edit —
  frontend `src/` HMRs via file sync into the pod; backend `app/` syncs and
  uvicorn auto-reloads. No image rebuilds for code changes.
- Backend written and smoke-tested locally against anki 26.05 (deck tree,
  review/answer flow, `.apkg` import all verified against the real library)
- Chart deploys both: frontend at `/`, backend at `/api`, collection on a
  5Gi `nfs-kubedata` PVC

**Blocked on one manual click:** the `anki-backend` GHCR package was
auto-created private on first push, so the backend pod is in
ImagePullBackOff. Flip it public at
https://github.com/users/reedjosh/packages/container/anki-backend/settings
(Danger Zone → Change visibility), then `./dev.sh` and it should go green.

## TODO

- [ ] Flip `anki-backend` GHCR package public (see above), redeploy, verify
      backend pod Ready
- [ ] End-to-end check: deck list from the real collection at
      https://anki.thereedfamily.rocks, import a shared `.apkg`, review a card
- [ ] Serve card media: images/audio in `.apkg` files land in
      `collection.media/`; the backend needs a `/api/media/{name}` route (or
      static mount) and card HTML references need to resolve to it
- [ ] Prod images: CI (GitHub Actions) to build/push the `prod` targets of
      both Dockerfiles on merge to main
- [ ] Full gitops: Argo Application in homelab-gitops pointing at `chart/`
      with prod image tags (interim is Tilt/helm only)
- [ ] Auth: the UI + API are LAN-reachable with no auth; decide whether that's
      fine or put oauth2-proxy/Authentik in front
- [ ] Maybe later: expose Anki's sync protocol so AnkiDroid/desktop clients
      can sync against this collection

## Layout

- `frontend/` – Vite + React + TS + Tailwind SPA (deck list, tap-to-reveal
  review with the four eases, `.apkg` import button)
- `backend/` – FastAPI over the `anki` library; endpoints: `GET /api/decks`,
  `GET /api/decks/{id}/next`, `POST /api/cards/{id}/answer`,
  `POST /api/import`, `GET /api/health`
- `chart/` – Helm chart for both services + ingress + collection PVC
- `Tiltfile` / `dev.sh` – dev loop (isolated kubeconfig so the global
  kubectl context / a work Tilt instance are untouched; Tilt UI on :10351)

## Develop

```sh
./dev.sh                 # Tilt against josh-home; app at the URL above
cd frontend && npm run dev   # UI only; VITE_API_BASE=mock for canned data
```

The backend collection lives in the pod's PVC at `/data/collection.anki2`
(`ANKI_COLLECTION_PATH` to override; note the Collection is single-writer).
