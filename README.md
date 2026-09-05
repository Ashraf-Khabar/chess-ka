# Chess Pro Analyzer

A web app for **chess analysis**: import your Chess.com games, replay them move by move, let Stockfish classify every ply, and get a **Coach** that explains *why* a move is strong or weak — built for training, not just reading an evaluation bar.

---

## Why this project exists

Sites like Chess.com and Lichess are great for playing. When you want to **actually understand** a game, though:

- an engine eval alone (`+1.2`) does not explain *what is happening* on the board;
- symbols (`?!`, `??`) without commentary barely help intermediate players;
- you often need to **try another idea** without losing the real game line;
- you want to stay in **your perspective** (your pieces at the bottom, feedback on *your* moves).

**Chess Pro Analyzer** addresses that: local, clear review with visual classification, a pedagogical coach, variations (forks), and an openings catalog — no account required beyond your Chess.com username to import games.

---

## What you can do

| Feature | Why it’s there |
|---|---|
| **Chess.com library** | Pull your recent games so you can review them outside the site |
| **Fullscreen review** (`/analyze/[gameId]`) | Analyze without noisy page scroll — board + side panel focus |
| **Stockfish (WASM)** | Live evaluation + move classification in the browser |
| **Quality markers (PNG)** | Brilliant → Blunder badges on the played square |
| **Coach** | Plain-language feedback: what the move does, why it’s wrong / strong, what to play |
| **Player perspective** | Your pieces at the bottom; coach reviews *your* moves, not the opponent’s |
| **Fork / variation** | Test another move without wiping the game; **Back to fork** button |
| **Openings catalog** | Explore theory lines (`/catalog`) |
| **Themes & language** | EN/FR, Atelier / Ink / Marble / Arena themes, fonts, engine depth |

---

## Quick start

### Requirements

- Node.js 20+ recommended  
- npm (or pnpm / yarn / bun)

### Install

```bash
git clone <repo-url>
cd chess_ka
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Run the production build |
| `npm run lint` | ESLint |

### Stockfish

The engine runs **on the client** (Web Worker + WASM). Engine files are served from `public/engines/`. No Stockfish API key is required.

---

## Typical user flow

1. **Home** — enter your Chess.com username → the library fills in.  
2. **Click a game** → opens `/analyze/...`.  
3. **Step through moves** — board markers, tabs *Moves / Coach / Stockfish*.  
4. **On a mistake** — the coach explains (hanging piece, missed capture, etc.) + red arrow for the best move.  
5. **Want to try something else?** — play a different move → a **variation** appears in the move tree.  
6. **Back to fork** — one click returns to the last *real* game ply where you branched.

---

## Architecture (why it’s structured this way)

Code is split by **domain** under `features/`, not only by pages.  
Goal: keep the board, analysis, and settings independent and reusable.

```
chess_ka/
├── app/                      # Next.js routes (App Router)
│   ├── page.tsx              # Home studio (library + free-play)
│   ├── analyze/[gameId]/     # Game review
│   ├── catalog/              # Openings
│   ├── settings/             # Preferences
│   └── api/chess-com/        # Chess.com games proxy / fetch
├── features/
│   ├── analysis/             # Stockfish, classification, coach, review
│   ├── chessboard/           # Interactive board + markers
│   ├── openings/             # Opening book + catalog
│   ├── settings/             # Theme, i18n, cookies
│   └── components/layout/    # Nav, shell
├── public/
│   ├── engines/              # Stockfish WASM / JS
│   └── markers/              # Quality badge PNGs
└── README.md
```

### Key modules

| Module | Why |
|---|---|
| `useChessGame` | Single source of truth for FEN / history / **fork** (main line + variation) |
| `useStockfish` | Live eval without freezing the UI |
| `useMoveClassification` | Dedicated worker to compare before/after a move without interrupting the engine panel |
| `perspective.ts` | Know whether the analyzing username played White or Black |
| `moveDiagnosis.ts` | Human tactical motifs (hanging pieces, missed captures, missed checks…) for the coach |
| `MoveCoachPanel` | Feedback UI (badge, why, move to play) |
| Settings + cookies | Persist theme / language / depth without a user backend |

---

## Move analysis — how it works

### Classification

For each ply we compare:

1. the eval **before** the move (Stockfish best line);  
2. the eval **after** the played move.

Based on centipawn loss (plus heuristics such as sound sacrifices), the move gets a quality label:

**Positive:** Brilliant → Great → Best → Excellent → Good  
**Negative:** Inaccuracy → Mistake → Miss → Blunder  

Badges are **PNG** files in `public/markers/` (replaceable — see `public/markers/README.md`).

### Coach

The coach goes beyond the label:

- **facts** about the move (capture, check, castling…);  
- **why it’s wrong** (hanging material, missed capture, eval drop…);  
- **why it’s strong** on good moves;  
- **move to play** + correction arrow on the board.

In Chess.com review, coaching applies to the **analyzing player’s moves**. On an opponent ply, the UI stays informative but does not say “you should have…”.

### Perspective & orientation

If you played **Black**, the board opens with Black at the bottom.  
That matches how you saw the game while playing — no mental flip required.

---

## Forks / variations — why

Without variation support, playing another move **truncated** the rest of the PGN and wiped the real game.

Now:

- the **main line** (`mainLine`) stays intact;  
- a different move starts a **variation** shown in the move list;  
- **Back to fork** returns to the last real ply before the branch.

Classic training loop: *“what if I had played this instead?”*

---

## UI themes

| Theme | Intent |
|---|---|
| **Atelier** (default) | Light sage studio / board green — comfortable for long sessions |
| **Ink** | Dark analysis desk |
| **Marble** | Cool stone + teal |
| **Arena** | Tournament-hall mood, brass accent |

Default font pair: **Outfit + Syne** (“studio”).  
Settings are stored in a cookie (`cpa-settings-v3`).

---

## Tech stack

| Tech | Role |
|---|---|
| [Next.js](https://nextjs.org) 16 (App Router) | App + API routes |
| React 19 | UI |
| TypeScript | Types |
| Tailwind CSS 4 | Styling |
| [chess.js](https://github.com/jhlywa/chess.js) | Rules, PGN, SAN |
| [react-chessboard](https://github.com/Clariity/react-chessboard) | Board |
| [stockfish](https://github.com/nmrugg/stockfish.js) (WASM) | Engine |
| lucide-react | Icons |

> **Note for agents / AI:** this repo may use Next.js APIs that differ from older tutorials. See `AGENTS.md` and docs under `node_modules/next/dist/docs/` before changing Next APIs.

---

## Chess.com API

Internal route: `GET /api/chess-com/games?username=...`

Why a proxy?

- avoid CORS / browser rate-limit friction;  
- normalize the payload for the local library;  
- keep import logic in one place.

Active games / library state are also stored in **browser session** (`gameSession`) so you can reopen a review quickly.

---

## Internationalization

English and French via `features/settings/lib/i18n.ts`.  
Language can be switched from the navbar or settings.

---

## Possible roadmap (non-blocking)

Natural next steps if the project grows:

- multiple sibling variations (full PGN-style `(...)` tree);  
- export PGN of the explored line;  
- accuracy stats per game / opening;  
- PGN file import (UI hook already sketched);  
- richer coach motifs (pins, forks called out explicitly).

---

## Contributing

1. Fork / clone  
2. `npm install && npm run dev`  
3. Short branch, clear PR  

For board badges: replace PNGs in `public/markers/` while keeping the same filenames.

---

## License & support

Personal / educational project.  
The GitHub link is configurable via `NEXT_PUBLIC_GITHUB_URL` (see `features/settings/lib/settingsTypes.ts`).

---

## In one sentence

> **Chess Pro Analyzer** turns a Chess.com game into a training session: see move quality, understand the *why*, explore alternatives, and stay in your seat as the player.
