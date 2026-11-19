# Graphle

Daily graph theory minigames, Wordle style: every day each game gets a new graph, the same for everyone.

| Game | What you do | Theory |
|---|---|---|
| Shortest path | Walk from A to the target with the lowest total cost | Dijkstra |
| Minimum spanning tree | Pick the n − 1 lightest edges that connect every node | Kruskal / Prim, cut property |
| Graph colouring | Colour nodes so neighbours differ, with as few colours as possible | Chromatic number, NP-completeness |
| Breadth-first search | Click nodes in the order BFS visits them | Queue vs stack, BFS vs DFS |

Each game has a **Rules** dialog with how to play and a short theory note (English and Italian).

Modes, available in every game:

- **Daily**: one puzzle per game per day (changes at midnight UTC). The first attempt is saved in the browser, with a streak and a share button.
- **Practice**: unlimited random graphs.
- **Timed**: as many puzzles as you can in 2 minutes.
- **Challenge**: a link with `?seed=` that opens exactly the same graph for a friend.

## How it works

Everything runs in the browser, so the site is a single Next.js app with no server to keep up:

- `frontend/lib/graph/random.ts`: seeded PRNG (cyrb53 + mulberry32). Daily seed = `<game>-<YYYY-MM-DD UTC>`.
- `frontend/lib/graph/generate.ts`: random connected weighted graph (spanning tree + extra edges).
- `frontend/lib/graph/algorithms.ts`: Dijkstra, Kruskal, BFS, chromatic number, used to check answers.
- `frontend/components/game/games/`: one component per minigame plus `registry.ts`, the list of games.
- `frontend/lib/progress.ts`: daily results and streak in `localStorage`.

Adding a game: write the checking logic in `lib/graph/algorithms.ts`, a component in `components/game/games/` (props `graph`, `onComplete`, `onNewGame`, layout via `GameShell` + `GraphBoard`), add it to `GAMES` in `registry.ts` and add `games.<id>` texts to `i18n/messages/en.json` and `it.json`.

The Flask API in `backend/` (`/api/graph`, `/api/health`) is not needed by the site; it is kept for future features such as leaderboards.

## Development

```bash
cd frontend
npm install
npm run dev        # http://localhost:3000
npm run lint
npx tsc --noEmit
npm test
npm run build
```

Backend (optional):

```bash
cd backend
python -m venv venv && venv/Scripts/activate   # Windows; source venv/bin/activate on Linux/macOS
pip install -r requirements.txt
pytest
```

## Deploy

The frontend deploys as is to Vercel (or any Node host running `next start`):

1. Import the repository and set **Root Directory** to `frontend`.
2. Optional: set `NEXT_PUBLIC_SITE_URL` (e.g. `https://graphle.example`) for absolute Open Graph links.
3. Deploy. No other environment variables or services are needed.
