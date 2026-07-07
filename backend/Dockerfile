# syntax=docker/dockerfile:1

FROM python:3.13-slim AS base
LABEL org.opencontainers.image.source=https://github.com/reedjosh/anki
WORKDIR /app
COPY pyproject.toml ./
# Install deps from pyproject without the package itself (source is copied next).
RUN pip install --no-cache-dir "anki>=26.5" "fastapi>=0.115" "uvicorn>=0.34" "python-multipart>=0.0.20"
COPY app ./app

# Dev image: auto-reload. Tilt live_update syncs app/ into the container
# and uvicorn restarts the process — the interpreted-language analog of
# syncing a rebuilt binary.
FROM base AS dev
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

FROM base AS prod
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
