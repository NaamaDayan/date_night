# Couples Game

Two-service product: **Service 1** (web app) handles landing, payment mock, questionnaire, and one-time game links; **Service 2** (Colyseus) runs the real-time game with session-scoped rooms, 2 players + optional TV, and 2 naive stages.

## Architecture

- **Service 1 (Web):** Next.js in `services/web/` – landing, mock payment, couple questionnaire, link generation, email mock, and the game client at `/play`.
- **Service 2 (Game):** Node + Express + Colyseus at repo root – game server on port 2567, token validation via Service 1 API, one room per session.
- **Shared:** `shared/` holds session constants and schema; in-memory session store lives in Service 1; game server calls Service 1 HTTP API to validate tokens and mark session used.

## Folder structure

```
date_night/
├── package.json
├── server.js              # Colyseus game server
├── lib/
│   └── session-validator.js
├── rooms/
│   ├── GameRoom.js
│   ├── schemas/
│   │   └── GameState.js
│   └── stages/
│       ├── index.js
│       ├── IStage.js
│       ├── stage1Logic.js
│       ├── stage2Logic.js
│       └── stage3Logic.js
├── public/                # Optional static game fallback
├── shared/
│   ├── constants.js
│   └── session-schema.js
└── services/
    └── web/               # Next.js (Service 1)
        ├── app/
        │   ├── page.tsx
        │   ├── buy/
        │   ├── ready/
        │   ├── questionnaire/
        │   ├── links/
        │   ├── play/
        │   ├── game/
        │   │   ├── shared/       # Theme, Button, Layout, Input
        │   │   ├── stages/1/     # Player1View, Player2View, TVView
        │   │   ├── stages/2/
        │   │   ├── stages/3/
        │   │   ├── StageSwitcher.tsx
        │   │   └── types.ts
        │   └── api/
        └── lib/
            ├── session-store.js
            └── email.ts
```

## Run locally

### 1. Install dependencies

```bash
npm install
cd services/web && npm install && cd ../..
```

### 2. Start Service 1 (Web app)

```bash
cd services/web
npm run dev
```

Runs at **http://localhost:3000**.

### 3. Start Service 2 (Game server)

From repo root:

```bash
node server.js
```

Runs at **http://localhost:2567**. Ensure `WEB_APP_URL` points to the web app (default `http://localhost:3000`).

### 4. Environment variables

- **Game server (root):**
  - `PORT` – default `2567`
  - `WEB_APP_URL` – Service 1 base URL for token validation and session used (default `http://localhost:3000`)

- **Web app (services/web):**
  - `NEXT_PUBLIC_COLYSEUS_URL` – Game server URL for the play page (default `http://localhost:2567`)

## User flow

1. User visits landing, clicks **Buy Game**.
2. Mock payment completes; redirect to **Your date is ready** with **Fill couple questionnaire**.
3. After questionnaire, user sees **Screen with 2 links** (Player 1, Player 2, TV optional) and gets an email (mock: links logged to console).
4. Each link opens `/play?session=...&token=...&role=player1|player2|tv`. Game client calls game server `/join`, then joins the room by ID.
5. Game starts when **exactly 2 players** are in the room. Stage 1: TV shows Text 1, players see Text 2 / Text 3; either player submits → Stage 2 (Text A / B / C); either submits → **You won the game!** → room closes and links are invalidated.
6. TV is optional (view-only); refresh and temporary disconnects are supported (reconnection token in sessionStorage, server-side `allowReconnection`).

## Testing

1. Start both services.
2. Open http://localhost:3000 → Buy Game → Complete payment → Fill questionnaire.
3. On the links page, open **Link 1** and **Link 2** in two browser windows (or incognito), and optionally **TV link** in a third.
4. Confirm game starts when both players are in; submit from either player to advance stages; after stage 2 submit, see “You won the game!” and links no longer work.

### Testing directly from stage N (skip buying, questionnaire, stage 1)

When running the web app in development (`NODE_ENV=development`):

1. Open **http://localhost:3000/dev**.
2. Choose **Start at stage** (1, 2, or 3) and click **Generate links**.
3. Use **Open** or **Copy** for Player 1 and Player 2 (and TV if desired). Each link includes mock questionnaire data and `devStage=N`, so the game server starts at that stage.
4. Open both player links in two tabs/windows; you land directly on the chosen stage with no purchase, questionnaire, or earlier stages.

## Security (MVP)

- Tokens are validated on every join via Service 1 API.
- Session is marked used when the game ends; no reuse of links.
- One room per session; max 3 clients (2 players + 1 TV).

## How to add a new stage

1. **Server:** Create `rooms/stages/stageNLogic.js` (e.g. `stage4Logic.js`). Export `onEnter(room, state)`, `onMessage(room, state, client, type, data)`, and optionally `getInterimTitle(room, nextStageIndex)`. Use helpers from `rooms/stages/IStage.js` (`getQuestionnaire`, `getGameHistory`, `setStageTexts`, `setPayload`, `parsePayload`). When the stage is complete, call `room.addToHistory(N, payload)` and then `room.advanceToInterim(N+1)` or `room.advanceToEnd()`.

2. **Server:** Register the stage in `rooms/stages/index.js`: add it to the `STAGES` array so `getStage(N)` and `getStageCount()` include it.

3. **Frontend:** Create `services/web/app/game/stages/N/` with `Player1View.tsx`, `Player2View.tsx`, and `TVView.tsx`. Each receives `state`, `room` (for sending messages), and optionally `questionnaire` and `gameHistory`. Use shared components from `app/game/shared/` (BaseLayout, Button, Input) and send messages with `room.send(type, data)` (e.g. `"next"`, `"submit"`, `"ready"`).

4. **Frontend:** Export the three views from `app/game/stages/N/index.ts`.

5. **Frontend:** In `app/game/StageSwitcher.tsx`, add dynamic imports for the new stage’s three views and a branch for `stageIndex === N` that renders the correct view by role (player1, player2, tv).

6. **Optional:** Add a custom “Get ready” message for the interim before stage N by implementing `getInterimTitle` in the *previous* stage’s logic (stage N−1).

**Dev mode:** Use `?devStage=N` on the play URL (e.g. `/play?session=...&token=...&role=player1&devStage=3`) to skip to stage N and inject mock questionnaire data if none exists.

## Pitfalls and practices

- **One room per session:** Room is keyed by session (metadata.sessionId); `/join` returns existing roomId when the session already has a room.
- **Role from token:** Role is fixed by the link (player1/player2/tv); server validates token and assigns role in `onAuth`.
- **Start only with 2 players:** `gameStarted` is set in `onJoin` when the number of non-TV clients is 2.
- **Server-authoritative stages:** Advance on first `submit` in each stage; no client-driven stage changes.
