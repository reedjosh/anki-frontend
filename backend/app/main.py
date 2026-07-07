"""API over the anki library.

The Collection is a single SQLite-backed object that is not thread-safe;
every handler grabs one global lock, which is plenty for a personal
deployment.
"""

import os
import tempfile
import threading

from anki.collection import Collection, ImportAnkiPackageRequest
from fastapi import FastAPI, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

COLLECTION_PATH = os.environ.get("ANKI_COLLECTION_PATH", "/data/collection.anki2")

EASE = {"again": 1, "hard": 2, "good": 3, "easy": 4}

app = FastAPI(title="anki-backend")
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)

_lock = threading.Lock()
_col: Collection | None = None


def col() -> Collection:
    global _col
    if _col is None:
        os.makedirs(os.path.dirname(COLLECTION_PATH), exist_ok=True)
        _col = Collection(COLLECTION_PATH)
    return _col


class DeckOut(BaseModel):
    id: str
    name: str
    newCount: int
    learnCount: int
    dueCount: int


class CardOut(BaseModel):
    id: str
    deckId: str
    front: str
    back: str


class AnswerIn(BaseModel):
    ease: str


class ImportOut(BaseModel):
    foundNotes: int


@app.get("/api/health")
def health() -> dict[str, bool]:
    return {"ok": True}


@app.get("/api/decks")
def list_decks() -> list[DeckOut]:
    with _lock:
        def walk(node, prefix=""):
            name = f"{prefix}{node.name}"
            yield DeckOut(
                id=str(node.deck_id),
                name=name,
                newCount=node.new_count,
                learnCount=node.learn_count,
                dueCount=node.review_count,
            )
            for child in node.children:
                yield from walk(child, f"{name}::")

        tree = col().sched.deck_due_tree()
        return [d for n in tree.children for d in walk(n)]


@app.get("/api/decks/{deck_id}/next")
def next_card(deck_id: int) -> CardOut | None:
    with _lock:
        c = col()
        c.decks.select(deck_id)
        card = c.sched.getCard()
        if card is None:
            return None
        return CardOut(
            id=str(card.id),
            deckId=str(deck_id),
            front=card.question(),
            back=card.answer(),
        )


@app.post("/api/cards/{card_id}/answer")
def answer_card(card_id: int, body: AnswerIn) -> dict[str, bool]:
    ease = EASE.get(body.ease)
    if ease is None:
        raise HTTPException(422, f"ease must be one of {sorted(EASE)}")
    with _lock:
        c = col()
        try:
            card = c.get_card(card_id)
        except Exception:
            raise HTTPException(404, "card not found")
        c.sched.answerCard(card, ease)
        return {"ok": True}


@app.post("/api/import")
def import_apkg(file: UploadFile) -> ImportOut:
    with _lock:
        with tempfile.NamedTemporaryFile(suffix=".apkg", delete=False) as tmp:
            tmp.write(file.file.read())
            path = tmp.name
        try:
            log = col().import_anki_package(
                ImportAnkiPackageRequest(package_path=path)
            )
        finally:
            os.unlink(path)
        return ImportOut(foundNotes=log.log.found_notes)
