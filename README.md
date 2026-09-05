# Chess Pro Analyzer

Application web d’**analyse d’échecs** : tu charges tes parties Chess.com, tu les rejoues coup par coup, Stockfish classe chaque coup, et un **Coach** t’explique *pourquoi* un coup est bon ou mauvais — le tout dans une interface pensée pour l’entraînement, pas seulement pour lire une évaluation.

---

## Pourquoi ce projet existe

Les plateformes classiques (Chess.com, Lichess) sont excellentes pour jouer. En revanche, quand on veut **vraiment comprendre** une partie :

- l’évaluation moteur seule (`+1.2`) ne dit pas *ce qui se passe* sur l’échiquier ;
- les symboles (`?!`, `??`) sans explication aident peu un joueur intermédiaire ;
- on a souvent besoin d’**explorer une autre idée** sans perdre la ligne réelle de la partie ;
- on veut rester dans **sa perspective** (ses pièces en bas, feedback sur *ses* coups).

**Chess Pro Analyzer** répond à ça : une revue locale, claire, avec classification visuelle, coach pédagogique, variantes (forks), et catalogue d’ouvertures — sans compte obligatoire au-delà du pseudo Chess.com pour importer les parties.

---

## Ce que tu peux faire

| Fonctionnalité | À quoi ça sert |
|---|---|
| **Bibliothèque Chess.com** | Récupérer tes dernières parties pour les revoir hors du site |
| **Revue plein écran** (`/analyze/[gameId]`) | Analyser une partie sans scroll inutile, focus échiquier + panneau |
| **Stockfish (WASM)** | Évaluation live + classification des coups dans le navigateur |
| **Symboles de qualité (PNG)** | Brillant → Gaffe, lisibles sur la case jouée |
| **Coach** | Texte clair : ce que fait le coup, pourquoi c’est faux / fort, coup à jouer |
| **Perspective joueur** | Tes pièces en bas ; le coach commente *tes* coups, pas ceux de l’adversaire |
| **Fork / variante** | Tester un autre coup sans écraser la partie ; bouton *Retour au fork* |
| **Catalogue d’ouvertures** | Explorer des lignes théoriques (`/catalog`) |
| **Thèmes & langue** | FR/EN, thèmes Atelier / Encre / Marbre / Arène, polices, profondeur moteur |

---

## Démarrage rapide

### Prérequis

- Node.js 20+ recommandé  
- npm (ou pnpm / yarn / bun)

### Installation

```bash
git clone <url-du-repo>
cd chess_ka
npm install
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

### Scripts

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build production |
| `npm start` | Lancer le build |
| `npm run lint` | ESLint |

### Stockfish

Le moteur tourne **côté client** (Web Worker + WASM). Les fichiers moteur sont servis depuis `public/engines/`. Aucune clé API Stockfish n’est requise.

---

## Parcours utilisateur typique

1. **Accueil** — entre ton pseudo Chess.com → la bibliothèque se remplit.  
2. **Clique une partie** → ouverture de `/analyze/...`.  
3. **Parcours coup par coup** — symboles sur l’échiquier, onglets *Coups / Coach / Stockfish*.  
4. **Sur une erreur** — le coach explique (pièce en prise, prise ratée, etc.) + flèche rouge du meilleur coup.  
5. **Tu veux tester autre chose** — joue un autre coup → **variante** dans l’arborescence.  
6. **Retour au fork** — un clic pour revenir au dernier coup *réel* de la partie.

---

## Architecture (pourquoi c’est organisé comme ça)

Le code est découpé par **domaines** sous `features/`, pas seulement par pages.  
Objectif : garder l’échiquier, l’analyse et les réglages indépendants et réutilisables.

```
chess_ka/
├── app/                      # Routes Next.js (App Router)
│   ├── page.tsx              # Studio d’accueil (bibliothèque + free-play)
│   ├── analyze/[gameId]/     # Revue de partie
│   ├── catalog/              # Ouvertures
│   ├── settings/             # Préférences
│   └── api/chess-com/        # Proxy / fetch parties Chess.com
├── features/
│   ├── analysis/             # Stockfish, classification, coach, revue
│   ├── chessboard/           # Plateau interactif + marqueurs
│   ├── openings/             # Livre d’ouvertures + catalogue
│   ├── settings/             # Thème, i18n, cookies
│   └── components/layout/    # Nav, shell
├── public/
│   ├── engines/              # Stockfish WASM / JS
│   └── markers/              # Badges PNG de qualité
└── README.md
```

### Idées clés

| Module | Pourquoi |
|---|---|
| `useChessGame` | Une seule source de vérité FEN / historique / **fork** (ligne principale + variante) |
| `useStockfish` | Éval live sans bloquer l’UI |
| `useMoveClassification` | Worker dédié pour comparer « avant / après » le coup sans couper le panneau moteur |
| `perspective.ts` | Savoir si le pseudo analysé était Blancs ou Noirs |
| `moveDiagnosis.ts` | Motifs tactiques humains (en prise, prise ratée, échec manqué…) pour le coach |
| `MoveCoachPanel` | UI du feedback (badge, pourquoi, coup à jouer) |
| Settings + cookies | Persister thème / langue / profondeur sans backend utilisateur |

---

## Analyse des coups — comment ça marche

### Classification

Pour chaque demi-coup, on compare :

1. l’évaluation **avant** le coup (meilleure ligne Stockfish) ;
2. l’évaluation **après** le coup joué.

Selon la perte en centipions (et des heuristiques type sacrifice), le coup reçoit une qualité :

**Positif :** Brillant → Superbe → Meilleur → Excellent → Bon  
**Négatif :** Imprécision → Erreur → Occasion manquée → Gaffe  

Les badges sont des **PNG** dans `public/markers/` (remplaçables — voir `public/markers/README.md`).

### Coach

Le coach ne se contente pas du label :

- **faits** du coup (prise, échec, roque…) ;
- **pourquoi c’est faux** (matériel en prise, meilleure prise ratée, perte d’éval…) ;
- **pourquoi c’est fort** sur les bons coups ;
- **coup à jouer** + flèche de correction sur l’échiquier.

En revue Chess.com, le coach s’applique aux **coups du joueur analysé**. Sur un coup adverse, l’UI reste informative mais sans coaching « tu aurais dû… ».

### Perspective & orientation

Si tu as joué les **Noirs**, l’échiquier s’ouvre avec les Noirs en bas.  
Ça évite de rejouer mentalement à l’envers — c’est la même vue que pendant la partie.

---

## Forks / variantes — pourquoi

Sans système de variante, jouer un autre coup **écrasait** le reste de la PGN.  
On perdait la partie réelle.

Désormais :

- la **ligne principale** (`mainLine`) reste intacte ;
- un coup différent crée une **variante** affichée dans la liste des coups ;
- le bouton **Retour au fork** ramène au dernier coup réel avant la bifurcation.

C’est le workflow classique d’entraînement : *« et si j’avais joué ça à la place ? »*.

---

## Thèmes UI

| Thème | Intention |
|---|---|
| **Atelier** (défaut) | Studio clair sauge / vert échiquier — lisible longtemps |
| **Encre** | Desk d’analyse sombre |
| **Marbre** | Pierre froide + teal |
| **Arène** | Ambiance salle de tournoi, accent laiton |

Police par défaut : **Outfit + Syne** (pair « studio »).  
Les réglages sont stockés en cookie (`cpa-settings-v3`).

---

## Stack technique

| Techno | Rôle |
|---|---|
| [Next.js](https://nextjs.org) 16 (App Router) | App + API routes |
| React 19 | UI |
| TypeScript | Typage |
| Tailwind CSS 4 | Styles |
| [chess.js](https://github.com/jhlywa/chess.js) | Règles, PGN, SAN |
| [react-chessboard](https://github.com/Clariity/react-chessboard) | Plateau |
| [stockfish](https://github.com/nmrugg/stockfish.js) (WASM) | Moteur |
| lucide-react | Icônes |

> **Note agents / IA :** ce repo utilise une version Next.js qui peut différer des tutoriels classiques. Voir `AGENTS.md` et la doc dans `node_modules/next/dist/docs/` avant de changer des APIs Next.

---

## API Chess.com

Route interne : `GET /api/chess-com/games?username=...`

Pourquoi un proxy ?

- éviter les soucis CORS / rate-limit côté navigateur ;
- normaliser la réponse pour la bibliothèque locale ;
- garder la logique d’import au même endroit.

Les parties actives / la bibliothèque sont aussi mémorisées en **session navigateur** (`gameSession`) pour rouvrir une revue rapidement.

---

## Internationalisation

FR et EN via `features/settings/lib/i18n.ts`.  
La langue se change dans la navbar ou les paramètres.

---

## Roadmap possible (non bloquant)

Idées naturelles si le projet continue :

- plusieurs variantes sœurs (arbre complet type PGN `(...)`) ;
- export PGN de la variante explorée ;
- stats de précision par partie / ouverture ;
- import PGN fichier (bouton déjà prévu côté UI) ;
- plus de motifs coach (clous, fourchettes détectées explicitement).

---

## Contribuer

1. Fork / clone  
2. `npm install && npm run dev`  
3. Branche courte, PR claire  

Pour les badges plateau : remplace les PNG dans `public/markers/` en gardant les noms de fichiers.

---

## Licence & support

Projet personnel / éducatif.  
Le lien GitHub du dépôt est configurable via `NEXT_PUBLIC_GITHUB_URL` (voir `features/settings/lib/settingsTypes.ts`).

---

## En une phrase

> **Chess Pro Analyzer** existe pour transformer une partie Chess.com en session d’entraînement : voir la qualité des coups, comprendre le *pourquoi*, explorer des alternatives, et rester dans ta perspective de joueur.
