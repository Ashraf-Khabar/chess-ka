import type { Move } from "chess.js";
import { moveToUci } from "@/features/analysis/lib/classifyMove";

/** High-level repertoire families shown in the catalog. */
export type OpeningCategory =
  | "open"
  | "semiOpen"
  | "closed"
  | "indian"
  | "flank"
  | "gambit";

export type VariationKind = "main" | "variation" | "gambit";

export interface OpeningVariation {
  id: string;
  eco: string;
  nameFr: string;
  nameEn: string;
  kind: VariationKind;
  /** Full line from the starting position (UCI). */
  uciMoves: string[];
  summaryFr: string;
  summaryEn: string;
  ideaWhiteFr: string;
  ideaWhiteEn: string;
  ideaBlackFr: string;
  ideaBlackEn: string;
}

export interface OpeningFamily {
  id: string;
  eco: string;
  nameFr: string;
  nameEn: string;
  category: OpeningCategory;
  summaryFr: string;
  summaryEn: string;
  ideaWhiteFr: string;
  ideaWhiteEn: string;
  ideaBlackFr: string;
  ideaBlackEn: string;
  variations: OpeningVariation[];
}

/** Flat line used by book badges / matchOpening (compat). */
export interface OpeningLine {
  id: string;
  eco: string;
  nameFr: string;
  nameEn: string;
  uciMoves: string[];
  familyId?: string;
  kind?: VariationKind;
}

export const OPENING_FAMILIES: OpeningFamily[] = [
  {
    id: "italian",
    eco: "C50",
    nameFr: "Partie italienne",
    nameEn: "Italian Game",
    category: "open",
    summaryFr:
      "Ouverture ouverte classique : développement rapide, pression sur f7 et centre e4/d4.",
    summaryEn:
      "Classical open game: fast development, pressure on f7 and the e4/d4 centre.",
    ideaWhiteFr:
      "Développer Ff1-c4, contrôler le centre, viser f7 et préparer d2-d3 ou d2-d4.",
    ideaWhiteEn:
      "Develop Bf1-c4, control the centre, eye f7, prepare d2-d3 or d2-d4.",
    ideaBlackFr:
      "Répliquer symétriquement (Cc6, Fc5), tenir e5 et éviter les tactiques sur f7.",
    ideaBlackEn:
      "Mirror development (Nc6, Bc5), hold e5, and avoid tactics on f7.",
    variations: [
      {
        id: "italian-main",
        eco: "C50",
        nameFr: "Italienne (ligne principale)",
        nameEn: "Italian Game (main line)",
        kind: "main",
        uciMoves: ["e2e4", "e7e5", "g1f3", "b8c6", "f1c4"],
        summaryFr: "Développement naturel et pression sur f7.",
        summaryEn: "Natural development with pressure on f7.",
        ideaWhiteFr: "Sortir les pièces vite et choisir entre Giuoco Piano et attaque.",
        ideaWhiteEn: "Develop quickly, then choose quiet Piano or sharper plans.",
        ideaBlackFr: "Fc5 ou Fe7 ; solidifier le centre avant de contre-attaquer.",
        ideaBlackEn: "…Bc5 or …Be7; solidify the centre before counterplay.",
      },
      {
        id: "italian-giuoco",
        eco: "C53",
        nameFr: "Giuoco Piano",
        nameEn: "Giuoco Piano",
        kind: "variation",
        uciMoves: ["e2e4", "e7e5", "g1f3", "b8c6", "f1c4", "f8c5", "c2c3"],
        summaryFr: "Plan calme : c3 + d4 pour un centre large.",
        summaryEn: "Quiet plan: c3 and d4 for a broad centre.",
        ideaWhiteFr: "Préparer d4 avec c3, roquer, puis pousser au centre.",
        ideaWhiteEn: "Prepare d4 with c3, castle, then push in the centre.",
        ideaBlackFr: "…Cf6, …d6, roquer ; parfois …a6/…Fa7 pour garder le fou.",
        ideaBlackEn: "…Nf6, …d6, castle; sometimes …a6/…Ba7 to keep the bishop.",
      },
      {
        id: "italian-two-knights",
        eco: "C55",
        nameFr: "Deux Cavaliers",
        nameEn: "Two Knights Defence",
        kind: "variation",
        uciMoves: ["e2e4", "e7e5", "g1f3", "b8c6", "f1c4", "g8f6"],
        summaryFr: "Contre-attaque immédiate ; peut mener au gambit Traxler ou à Cg5.",
        summaryEn: "Immediate counterplay; can lead to Traxler or Ng5 lines.",
        ideaWhiteFr: "Cg5 vise f7, ou d3 pour un jeu positionnel.",
        ideaWhiteEn: "Ng5 hits f7, or d3 for a positional game.",
        ideaBlackFr: "Accepter les complications ou…Fe7 pour rester solide.",
        ideaBlackEn: "Embrace complications or …Be7 to stay solid.",
      },
      {
        id: "italian-evans",
        eco: "C51",
        nameFr: "Gambit Evans",
        nameEn: "Evans Gambit",
        kind: "gambit",
        uciMoves: ["e2e4", "e7e5", "g1f3", "b8c6", "f1c4", "f8c5", "b2b4"],
        summaryFr: "Sacrifice de pion b pour un développement explosif et l’initiative.",
        summaryEn: "b-pawn sacrifice for explosive development and the initiative.",
        ideaWhiteFr: "Ouvrir des lignes, gagner des temps sur le Ff8, attaquer vite.",
        ideaWhiteEn: "Open lines, gain tempi on …Bc5, attack quickly.",
        ideaBlackFr: "Accepter et consolider, ou refuser avec …Fb6.",
        ideaBlackEn: "Accept and consolidate, or decline with …Bb6.",
      },
    ],
  },
  {
    id: "spanish",
    eco: "C60",
    nameFr: "Partie espagnole (Ruy Lopez)",
    nameEn: "Ruy Lopez",
    category: "open",
    summaryFr:
      "Pression sur le Cc6 qui défend e5 ; lutte longue pour le centre et l’aile dame.",
    summaryEn:
      "Pressure on the Nc6 that defends e5; a long struggle for centre and queenside.",
    ideaWhiteFr: "Fb5 menace la structure noire ; o-o, c3, d4.",
    ideaWhiteEn: "Bb5 pressures Black’s structure; castle, c3, d4.",
    ideaBlackFr: "Défendre e5 (…a6, …b5, …Fe7) ou choisir des systèmes dynamiques.",
    ideaBlackEn: "Defend e5 (…a6, …b5, …Be7) or pick dynamic systems.",
    variations: [
      {
        id: "spanish-main",
        eco: "C60",
        nameFr: "Ruy Lopez (base)",
        nameEn: "Ruy Lopez (base)",
        kind: "main",
        uciMoves: ["e2e4", "e7e5", "g1f3", "b8c6", "f1b5"],
        summaryFr: "La pression classique sur e5 via le cavalier c6.",
        summaryEn: "Classical pressure on e5 via the c6-knight.",
        ideaWhiteFr: "Conserver la paire de fous ou échanger au bon moment.",
        ideaWhiteEn: "Keep the bishop pair or trade at the right moment.",
        ideaBlackFr: "…a6 force Fb5 à décider ; ensuite …Cf6 et développement.",
        ideaBlackEn: "…a6 forces Bb5 to decide; then …Nf6 and development.",
      },
      {
        id: "spanish-morphy",
        eco: "C78",
        nameFr: "Défense Morphy",
        nameEn: "Morphy Defence",
        kind: "variation",
        uciMoves: [
          "e2e4",
          "e7e5",
          "g1f3",
          "b8c6",
          "f1b5",
          "a7a6",
          "b5a4",
          "g8f6",
        ],
        summaryFr: "Ligne principale moderne après …a6 Fa4 Cf6.",
        summaryEn: "Modern main highway after …a6 Ba4 Nf6.",
        ideaWhiteFr: "o-o, Te1, c3, d4 — pression centrale durable.",
        ideaWhiteEn: "Castle, Re1, c3, d4 — lasting central pressure.",
        ideaBlackFr: "…b5, …Fe7, o-o, puis …d6 ou rupture …d5.",
        ideaBlackEn: "…b5, …Be7, castle, then …d6 or a …d5 break.",
      },
      {
        id: "spanish-berlin",
        eco: "C65",
        nameFr: "Défense de Berlin",
        nameEn: "Berlin Defence",
        kind: "variation",
        uciMoves: ["e2e4", "e7e5", "g1f3", "b8c6", "f1b5", "g8f6"],
        summaryFr: "Très solide ; souvent une finale précoce après échange sur e5.",
        summaryEn: "Rock-solid; often an early endgame after trades on e5.",
        ideaWhiteFr: "Accepter la « muraille » ou éviter l’échange pour du jeu moyen.",
        ideaWhiteEn: "Accept the Berlin Wall or avoid the trade for middlegame play.",
        ideaBlackFr: "Structure robuste, pièce active, plans de longue haleine.",
        ideaBlackEn: "Sturdy structure, piece activity, long-term plans.",
      },
      {
        id: "spanish-exchange",
        eco: "C68",
        nameFr: "Échange espagnol",
        nameEn: "Exchange Variation",
        kind: "variation",
        uciMoves: ["e2e4", "e7e5", "g1f3", "b8c6", "f1b5", "a7a6", "b5c6"],
        summaryFr: "Échange immédiat : structure de pions noirs doublés, jeu technique.",
        summaryEn: "Immediate trade: doubled black pawns, technical play.",
        ideaWhiteFr: "Exploiter les faiblesses structurelles et la majorité 4 vs 3.",
        ideaWhiteEn: "Exploit structural weaknesses and the 4 vs 3 majority.",
        ideaBlackFr: "Paire de fous et colonnes ouvertes en compensation.",
        ideaBlackEn: "Bishop pair and open files as compensation.",
      },
    ],
  },
  {
    id: "scotch",
    eco: "C45",
    nameFr: "Partie écossaise",
    nameEn: "Scotch Game",
    category: "open",
    summaryFr: "Ouverture immédiate du centre par d4 ; jeu clair et tactique.",
    summaryEn: "Immediate central opening with d4; clear, tactical play.",
    ideaWhiteFr: "Ouvrir le jeu tôt, activer les pièces, viser un avantage d’espace.",
    ideaWhiteEn: "Open the position early, activate pieces, seek space.",
    ideaBlackFr: "Récupérer le centre (…exd4) et développer sans retard.",
    ideaBlackEn: "Recapture (…exd4) and develop without falling behind.",
    variations: [
      {
        id: "scotch-main",
        eco: "C45",
        nameFr: "Écossaise principale",
        nameEn: "Scotch main line",
        kind: "main",
        uciMoves: ["e2e4", "e7e5", "g1f3", "b8c6", "d2d4", "e5d4", "f3d4"],
        summaryFr: "Centre ouvert dès le 5e coup.",
        summaryEn: "Open centre as early as move five.",
        ideaWhiteFr: "Cc3, Fe3/Fc4, o-o et pression sur d5/e5.",
        ideaWhiteEn: "Nc3, Be3/Bc4, castle and pressure d5/e5.",
        ideaBlackFr: "…Fc5 ou …Cf6 ; lutter pour d5.",
        ideaBlackEn: "…Bc5 or …Nf6; fight for …d5.",
      },
      {
        id: "scotch-gambit",
        eco: "C44",
        nameFr: "Gambit écossais",
        nameEn: "Scotch Gambit",
        kind: "gambit",
        uciMoves: ["e2e4", "e7e5", "g1f3", "b8c6", "d2d4", "e5d4", "f1c4"],
        summaryFr: "Laisse le pion pour un développement ultra-rapide.",
        summaryEn: "Leaves the pawn for ultra-fast development.",
        ideaWhiteFr: "Attaquer f7 et empêcher le noir de consolider.",
        ideaWhiteEn: "Hit f7 and stop Black from consolidating.",
        ideaBlackFr: "Rendre le pion ou défendre précisément contre Fc4.",
        ideaBlackEn: "Return the pawn or defend accurately against Bc4.",
      },
    ],
  },
  {
    id: "sicilian",
    eco: "B20",
    nameFr: "Défense sicilienne",
    nameEn: "Sicilian Defence",
    category: "semiOpen",
    summaryFr:
      "Asymétrie : les Noirs combattent pour c5 et la colonne c ; jeu riche en plans.",
    summaryEn:
      "Asymmetry: Black fights with …c5 and the c-file; rich in plans.",
    ideaWhiteFr: "Ouvrir avec d4, développer vite, souvent attaquer à l’aile roi.",
    ideaWhiteEn: "Open with d4, develop fast, often attack on the kingside.",
    ideaBlackFr: "Contre-jeu à l’aile dame et au centre ; structures Najdorf/Dragon/Scheveningen.",
    ideaBlackEn: "Queenside/central counterplay; Najdorf, Dragon, Scheveningen structures.",
    variations: [
      {
        id: "sicilian-main",
        eco: "B20",
        nameFr: "Sicilienne (base)",
        nameEn: "Sicilian (base)",
        kind: "main",
        uciMoves: ["e2e4", "c7c5"],
        summaryFr: "Le coup …c5 : déséquilibre immédiat.",
        summaryEn: "The …c5 move: immediate imbalance.",
        ideaWhiteFr: "Choisir Ouverte, Alapin, Fermée ou Grand Prix.",
        ideaWhiteEn: "Choose Open, Alapin, Closed, or Grand Prix.",
        ideaBlackFr: "Préparer …d6/…e6/…g6 selon le système.",
        ideaBlackEn: "Prepare …d6/…e6/…g6 depending on the system.",
      },
      {
        id: "sicilian-najdorf",
        eco: "B90",
        nameFr: "Najdorf",
        nameEn: "Najdorf",
        kind: "variation",
        uciMoves: [
          "e2e4",
          "c7c5",
          "g1f3",
          "d7d6",
          "d2d4",
          "c5d4",
          "f3d4",
          "g8f6",
          "b1c3",
          "a7a6",
        ],
        summaryFr: "La sicilienne la plus flexible et théorique.",
        summaryEn: "The most flexible, theory-heavy Sicilian.",
        ideaWhiteFr: "Fe3/f3/Dd2 (Anglais) ou Fc4, f4 — initiative.",
        ideaWhiteEn: "Be3/f3/Qd2 (English Attack) or Bc4, f4 — initiative.",
        ideaBlackFr: "…e5 ou …e6 ; contre-jeu …b5 et sur la colonne c.",
        ideaBlackEn: "…e5 or …e6; counterplay with …b5 and the c-file.",
      },
      {
        id: "sicilian-dragon",
        eco: "B70",
        nameFr: "Dragon",
        nameEn: "Dragon",
        kind: "variation",
        uciMoves: [
          "e2e4",
          "c7c5",
          "g1f3",
          "d7d6",
          "d2d4",
          "c5d4",
          "f3d4",
          "g8f6",
          "b1c3",
          "g7g6",
        ],
        summaryFr: "Fou en g7 : attaques opposées, très tranchant.",
        summaryEn: "Bishop on g7: opposite-side attacks, very sharp.",
        ideaWhiteFr: "Attaque yougoslave : Fe3, f3, Dd2, o-o-o, h4-h5.",
        ideaWhiteEn: "Yugoslav Attack: Be3, f3, Qd2, 0-0-0, h4-h5.",
        ideaBlackFr: "Contre-attaque sur c, …Tc8, …Da5, parfois …b5.",
        ideaBlackEn: "Counter on the c-file, …Rc8, …Qa5, sometimes …b5.",
      },
      {
        id: "sicilian-kan",
        eco: "B41",
        nameFr: "Kan / Paulsen",
        nameEn: "Kan / Paulsen",
        kind: "variation",
        uciMoves: [
          "e2e4",
          "c7c5",
          "g1f3",
          "e7e6",
          "d2d4",
          "c5d4",
          "f3d4",
          "a7a6",
        ],
        summaryFr: "Structure flexible sans …d6 immédiat.",
        summaryEn: "Flexible structure without an early …d6.",
        ideaWhiteFr: "Contrôle d5, développement classique Fc4/Fe2.",
        ideaWhiteEn: "Control d5; classical development Bc4/Be2.",
        ideaBlackFr: "…Dc7, …Cf6, …Fb4/…Fe7 ; rupture …d5 ou …b5.",
        ideaBlackEn: "…Qc7, …Nf6, …Bb4/…Be7; break with …d5 or …b5.",
      },
      {
        id: "sicilian-smith-morra",
        eco: "B21",
        nameFr: "Gambit Smith-Morra",
        nameEn: "Smith-Morra Gambit",
        kind: "gambit",
        uciMoves: ["e2e4", "c7c5", "d2d4", "c5d4", "c2c3"],
        summaryFr: "Pion sacrifié pour un développement blanc fluide.",
        summaryEn: "Pawn sacrificed for smooth white development.",
        ideaWhiteFr: "Pièces actives, pression sur d6/b5/e5.",
        ideaWhiteEn: "Active pieces, pressure on d6/b5/e5.",
        ideaBlackFr: "Accepter et rendre du matériel, ou décliner.",
        ideaBlackEn: "Accept and return material, or decline.",
      },
    ],
  },
  {
    id: "french",
    eco: "C00",
    nameFr: "Défense française",
    nameEn: "French Defence",
    category: "semiOpen",
    summaryFr: "Chaîne de pions e6-d5 ; lutte pour la rupture …c5 et le Fou c8.",
    summaryEn: "e6-d5 pawn chain; fight for …c5 and the light-squared bishop.",
    ideaWhiteFr: "Avance e5 ou échange ; espace à l’aile roi.",
    ideaWhiteEn: "Advance e5 or exchange; kingside space.",
    ideaBlackFr: "…c5, …Db6, pression sur d4 ; activer Fc8.",
    ideaBlackEn: "…c5, …Qb6, pressure d4; activate Bc8.",
    variations: [
      {
        id: "french-main",
        eco: "C00",
        nameFr: "Française (base)",
        nameEn: "French (base)",
        kind: "main",
        uciMoves: ["e2e4", "e7e6"],
        summaryFr: "Invite e5 ou d4 ; structure typique.",
        summaryEn: "Invites e5 or d4; typical structure.",
        ideaWhiteFr: "d4 puis choisir Avance, Tarrasch ou Winawer.",
        ideaWhiteEn: "d4 then choose Advance, Tarrasch, or Winawer.",
        ideaBlackFr: "…d5 immédiatement pour contester le centre.",
        ideaBlackEn: "…d5 at once to challenge the centre.",
      },
      {
        id: "french-advance",
        eco: "C02",
        nameFr: "Variante d’avance",
        nameEn: "Advance Variation",
        kind: "variation",
        uciMoves: ["e2e4", "e7e6", "d2d4", "d7d5", "e4e5"],
        summaryFr: "Gain d’espace ; les Noirs attaquent la base d4.",
        summaryEn: "Space grab; Black attacks the d4 base.",
        ideaWhiteFr: "Soutenir d4, manœuvrer à l’aile roi.",
        ideaWhiteEn: "Support d4, manoeuvre on the kingside.",
        ideaBlackFr: "…c5, …Cc6, …Db6, parfois …Fd7-b5.",
        ideaBlackEn: "…c5, …Nc6, …Qb6, sometimes …Bd7-b5.",
      },
      {
        id: "french-winawer",
        eco: "C15",
        nameFr: "Winawer",
        nameEn: "Winawer",
        kind: "variation",
        uciMoves: ["e2e4", "e7e6", "d2d4", "d7d5", "b1c3", "f8b4"],
        summaryFr: "Épingle du Cc3 ; structures très déséquilibrées.",
        summaryEn: "Pins Nc3; highly imbalanced structures.",
        ideaWhiteFr: "a3, souvent Dd4/Dg4 et attaque.",
        ideaWhiteEn: "a3, often Qd4/Qg4 and attack.",
        ideaBlackFr: "Doubler les pions blancs, contre-jeu …c5.",
        ideaBlackEn: "Double White’s pawns, counter with …c5.",
      },
    ],
  },
  {
    id: "caro",
    eco: "B10",
    nameFr: "Défense Caro-Kann",
    nameEn: "Caro-Kann Defence",
    category: "semiOpen",
    summaryFr: "Solide : …c6 soutient …d5 sans enfermer le Fc8.",
    summaryEn: "Solid: …c6 supports …d5 without boxing in Bc8.",
    ideaWhiteFr: "Avance, Classique ou Panov — tester la solidité noire.",
    ideaWhiteEn: "Advance, Classical, or Panov — test Black’s solidity.",
    ideaBlackFr: "Développement sain, finales favorables, rupture …c5.",
    ideaBlackEn: "Healthy development, good endings, …c5 break.",
    variations: [
      {
        id: "caro-main",
        eco: "B10",
        nameFr: "Caro-Kann (base)",
        nameEn: "Caro-Kann (base)",
        kind: "main",
        uciMoves: ["e2e4", "c7c6"],
        summaryFr: "Prépare …d5 avec une structure robuste.",
        summaryEn: "Prepares …d5 with a robust structure.",
        ideaWhiteFr: "d4 et choisir le système.",
        ideaWhiteEn: "d4 and choose a system.",
        ideaBlackFr: "…d5, puis développer sans faiblesse.",
        ideaBlackEn: "…d5, then develop without weaknesses.",
      },
      {
        id: "caro-classical",
        eco: "B18",
        nameFr: "Classique",
        nameEn: "Classical",
        kind: "variation",
        uciMoves: [
          "e2e4",
          "c7c6",
          "d2d4",
          "d7d5",
          "b1c3",
          "d5e4",
          "c3e4",
          "c8f5",
        ],
        summaryFr: "Fou libre en f5 ; jeu positionnel.",
        summaryEn: "Free bishop on f5; positional play.",
        ideaWhiteFr: "Cg3, h4, Cf3, Fd3 — harceler Ff5.",
        ideaWhiteEn: "Ng3, h4, Nf3, Bd3 — harry Bf5.",
        ideaBlackFr: "…e6, …Fd6, o-o ; solidité.",
        ideaBlackEn: "…e6, …Bd6, castle; solidity.",
      },
      {
        id: "caro-advance",
        eco: "B12",
        nameFr: "Avance Caro",
        nameEn: "Advance Caro",
        kind: "variation",
        uciMoves: ["e2e4", "c7c6", "d2d4", "d7d5", "e4e5"],
        summaryFr: "Espace blanc ; Noirs jouent …Ff5 et …e6.",
        summaryEn: "White space; Black plays …Bf5 and …e6.",
        ideaWhiteFr: "h4, c3, Fd3 — contrôler les cases claires.",
        ideaWhiteEn: "h4, c3, Bd3 — control light squares.",
        ideaBlackFr: "…c5 ou …Fb6 selon la setup.",
        ideaBlackEn: "…c5 or …Qb6 depending on the setup.",
      },
    ],
  },
  {
    id: "queens-gambit",
    eco: "D06",
    nameFr: "Gambit dame",
    nameEn: "Queen’s Gambit",
    category: "closed",
    summaryFr: "Pression sur d5 via c4 ; ouverture fermée fondamentale.",
    summaryEn: "Pressure on d5 via c4; fundamental closed opening.",
    ideaWhiteFr: "Minorité d’attaque, contrôle e4, pression centrale.",
    ideaWhiteEn: "Minority attack, e4 control, central pressure.",
    ideaBlackFr: "Refuser (Orthodoxe) ou accepter ; libérer …c5/…e5.",
    ideaBlackEn: "Decline (Orthodox) or accept; free with …c5/…e5.",
    variations: [
      {
        id: "qg-main",
        eco: "D06",
        nameFr: "Gambit dame (base)",
        nameEn: "Queen’s Gambit (base)",
        kind: "main",
        uciMoves: ["d2d4", "d7d5", "c2c4"],
        summaryFr: "Le coup c4 : défi classique du centre noir.",
        summaryEn: "The c4 move: classical challenge to Black’s centre.",
        ideaWhiteFr: "Récupérer le centre, développer Cc3/Cf3.",
        ideaWhiteEn: "Recapture the centre, develop Nc3/Nf3.",
        ideaBlackFr: "Décider entre accepté, refusé ou slave.",
        ideaBlackEn: "Choose Accepted, Declined, or Slav.",
      },
      {
        id: "qg-declined",
        eco: "D30",
        nameFr: "Gambit dame refusé",
        nameEn: "Queen’s Gambit Declined",
        kind: "variation",
        uciMoves: ["d2d4", "d7d5", "c2c4", "e7e6"],
        summaryFr: "Solide ; le Fc8 reste le problème à résoudre.",
        summaryEn: "Solid; Bc8 remains the problem piece.",
        ideaWhiteFr: "Cg5, e3, Fd3, o-o ; pression sur d5.",
        ideaWhiteEn: "Bg5, e3, Bd3, castle; pressure on d5.",
        ideaBlackFr: "…Fe7, …O-O, …c5 ou …Cbd7-b6.",
        ideaBlackEn: "…Be7, …0-0, …c5 or …Nbd7-b6.",
      },
      {
        id: "qg-accepted",
        eco: "D20",
        nameFr: "Gambit dame accepté",
        nameEn: "Queen’s Gambit Accepted",
        kind: "gambit",
        uciMoves: ["d2d4", "d7d5", "c2c4", "d5c4"],
        summaryFr: "Prendre le pion c ; Blancs regagnent avec e3/e4.",
        summaryEn: "Take the c-pawn; White regains with e3/e4.",
        ideaWhiteFr: "e3 ou e4, Fxc4, initiative de développement.",
        ideaWhiteEn: "e3 or e4, Bxc4, development initiative.",
        ideaBlackFr: "Rendre le pion proprement, viser …c5/…e5.",
        ideaBlackEn: "Return the pawn cleanly, aim for …c5/…e5.",
      },
      {
        id: "slav",
        eco: "D10",
        nameFr: "Défense slave",
        nameEn: "Slav Defence",
        kind: "variation",
        uciMoves: ["d2d4", "d7d5", "c2c4", "c7c6"],
        summaryFr: "Soutien de d5 sans enfermer Fc8.",
        summaryEn: "Supports d5 without locking in Bc8.",
        ideaWhiteFr: "Cc3, Cf3, e3 ; parfois Cx d5.",
        ideaWhiteEn: "Nc3, Nf3, e3; sometimes cxd5.",
        ideaBlackFr: "…Ff5 ou …Fg4, développement libre.",
        ideaBlackEn: "…Bf5 or …Bg4, free development.",
      },
    ],
  },
  {
    id: "kings-indian",
    eco: "E60",
    nameFr: "Défense est-indienne",
    nameEn: "King’s Indian Defence",
    category: "indian",
    summaryFr: "Hypermoderne : laisser le centre pour contre-attaquer avec …e5/…c5.",
    summaryEn: "Hypermodern: concede the centre to strike with …e5/…c5.",
    ideaWhiteFr: "Grand centre, espace, souvent attaque à l’aile dame.",
    ideaWhiteEn: "Big centre, space, often queenside play.",
    ideaBlackFr: "…d6, …e5 ou …c5 ; attaque à l’aile roi.",
    ideaBlackEn: "…d6, …e5 or …c5; kingside attacks.",
    variations: [
      {
        id: "kid-main",
        eco: "E60",
        nameFr: "Est-indienne (base)",
        nameEn: "King’s Indian (base)",
        kind: "main",
        uciMoves: ["d2d4", "g8f6", "c2c4", "g7g6"],
        summaryFr: "Fianchetto royal : flexibilité maximale.",
        summaryEn: "Kingside fianchetto: maximum flexibility.",
        ideaWhiteFr: "Cc3, e4, Fe2/Fg5 — système classique ou Sämisch.",
        ideaWhiteEn: "Nc3, e4, Be2/Bg5 — Classical or Sämisch.",
        ideaBlackFr: "…Fg7, …d6, …O-O puis rupture.",
        ideaBlackEn: "…Bg7, …d6, …0-0 then a break.",
      },
      {
        id: "kid-classical",
        eco: "E90",
        nameFr: "Classique",
        nameEn: "Classical",
        kind: "variation",
        uciMoves: [
          "d2d4",
          "g8f6",
          "c2c4",
          "g7g6",
          "b1c3",
          "f8g7",
          "e2e4",
          "d7d6",
          "g1f3",
          "e8g8",
          "f1e2",
          "e7e5",
        ],
        summaryFr: "Lutte classique …e5 contre le centre blanc.",
        summaryEn: "Classical fight with …e5 against White’s centre.",
        ideaWhiteFr: "o-o, Fe3, d5 ou dxe5 ; jeu sur les deux ailes.",
        ideaWhiteEn: "Castle, Be3, d5 or dxe5; play on both wings.",
        ideaBlackFr: "…Cc6, …Te8, …a5 ; attaque f5-f4.",
        ideaBlackEn: "…Nc6, …Re8, …a5; f5-f4 attack.",
      },
      {
        id: "grunfeld",
        eco: "D80",
        nameFr: "Défense Grünfeld",
        nameEn: "Grünfeld Defence",
        kind: "variation",
        uciMoves: ["d2d4", "g8f6", "c2c4", "g7g6", "b1c3", "d7d5"],
        summaryFr: "Contre-attaque immédiate …d5 sur le centre blanc.",
        summaryEn: "Immediate …d5 counterstrike on White’s centre.",
        ideaWhiteFr: "cxd5, e4 — grand centre à consolider.",
        ideaWhiteEn: "cxd5, e4 — a big centre to consolidate.",
        ideaBlackFr: "Pression sur d4 (…c5, …Cc6, …Fg4).",
        ideaBlackEn: "Pressure d4 (…c5, …Nc6, …Bg4).",
      },
    ],
  },
  {
    id: "nimzo",
    eco: "E20",
    nameFr: "Défense Nimzo-indienne",
    nameEn: "Nimzo-Indian Defence",
    category: "indian",
    summaryFr: "Épingle …Fb4 sur Cc3 : contrôle des cases blanches et structures riches.",
    summaryEn: "…Bb4 pins Nc3: light-square control and rich structures.",
    ideaWhiteFr: "a3, e3, Fd3 ou Fianchetto — résoudre l’épingle.",
    ideaWhiteEn: "a3, e3, Bd3 or Fianchetto — resolve the pin.",
    ideaBlackFr: "Doubler les pions ou garder la pression ; …c5/…d5.",
    ideaBlackEn: "Double pawns or keep pressure; …c5/…d5.",
    variations: [
      {
        id: "nimzo-main",
        eco: "E20",
        nameFr: "Nimzo-indienne",
        nameEn: "Nimzo-Indian",
        kind: "main",
        uciMoves: ["d2d4", "g8f6", "c2c4", "e7e6", "b1c3", "f8b4"],
        summaryFr: "L’épingle historique de Nimzowitsch.",
        summaryEn: "Nimzowitsch’s historic pin.",
        ideaWhiteFr: "Développer sans craindre …Fxc3.",
        ideaWhiteEn: "Develop without fearing …Bxc3.",
        ideaBlackFr: "Contrôle e4, structures saines.",
        ideaBlackEn: "Control e4, healthy structures.",
      },
      {
        id: "queens-indian",
        eco: "E12",
        nameFr: "Ouest-indienne",
        nameEn: "Queen’s Indian",
        kind: "variation",
        uciMoves: ["d2d4", "g8f6", "c2c4", "e7e6", "g1f3", "b7b6"],
        summaryFr: "Fianchetto dame : contrôle e4 à distance.",
        summaryEn: "Queenside fianchetto: remote control of e4.",
        ideaWhiteFr: "g3/Fg2 ou Ff4 — jeu positionnel.",
        ideaWhiteEn: "g3/Bg2 or Bf4 — positional play.",
        ideaBlackFr: "…Fb7, …Fe7, …O-O, …d5/…c5.",
        ideaBlackEn: "…Bb7, …Be7, …0-0, …d5/…c5.",
      },
    ],
  },
  {
    id: "english",
    eco: "A10",
    nameFr: "Ouverture anglaise",
    nameEn: "English Opening",
    category: "flank",
    summaryFr: "1.c4 : contrôle d5 à distance, transpositions nombreuses.",
    summaryEn: "1.c4: remote control of d5, many transpositions.",
    ideaWhiteFr: "Structure de type sicilienne inversée ou grand centre.",
    ideaWhiteEn: "Reversed Sicilian structures or a big centre.",
    ideaBlackFr: "…e5, …c5 ou …e6/…Cf6 — choisir le terrain.",
    ideaBlackEn: "…e5, …c5 or …e6/…Nf6 — choose the battlefield.",
    variations: [
      {
        id: "english-main",
        eco: "A10",
        nameFr: "Anglaise (base)",
        nameEn: "English (base)",
        kind: "main",
        uciMoves: ["c2c4"],
        summaryFr: "Flexibilité maximale dès le premier coup.",
        summaryEn: "Maximum flexibility from move one.",
        ideaWhiteFr: "g3, Fg2, Cc3 — pression sur les cases claires.",
        ideaWhiteEn: "g3, Bg2, Nc3 — pressure on light squares.",
        ideaBlackFr: "Symétrie …c5 ou occupation …e5.",
        ideaBlackEn: "Symmetry with …c5 or occupation with …e5.",
      },
      {
        id: "english-reversed-sicilian",
        eco: "A20",
        nameFr: "Sicilienne inversée",
        nameEn: "Reversed Sicilian",
        kind: "variation",
        uciMoves: ["c2c4", "e7e5"],
        summaryFr: "Les Noirs prennent le centre ; Blancs jouent « sicilienne ».",
        summaryEn: "Black takes the centre; White plays a ‘Sicilian’.",
        ideaWhiteFr: "Cc3, g3, Fg2 — pression sur e5/d5.",
        ideaWhiteEn: "Nc3, g3, Bg2 — pressure on e5/d5.",
        ideaBlackFr: "Développement classique …Cf6 …Cc6 …Fb4/…Fc5.",
        ideaBlackEn: "Classical development …Nf6 …Nc6 …Bb4/…Bc5.",
      },
    ],
  },
  {
    id: "retiro",
    eco: "A04",
    nameFr: "Ouverture Réti",
    nameEn: "Réti Opening",
    category: "flank",
    summaryFr: "1.Cf3 : hypermoderne, évite les théories lourdes de 1.e4/1.d4.",
    summaryEn: "1.Nf3: hypermodern, sidesteps heavy 1.e4/1.d4 theory.",
    ideaWhiteFr: "Contrôle flexible, fianchettos, transpositions.",
    ideaWhiteEn: "Flexible control, fianchettos, transpositions.",
    ideaBlackFr: "…d5, …c5 ou systèmes indiens.",
    ideaBlackEn: "…d5, …c5 or Indian systems.",
    variations: [
      {
        id: "reti-main",
        eco: "A04",
        nameFr: "Réti",
        nameEn: "Réti",
        kind: "main",
        uciMoves: ["g1f3"],
        summaryFr: "Développement avant engagement central.",
        summaryEn: "Development before central commitment.",
        ideaWhiteFr: "c4, g3, Fg2 selon la réponse.",
        ideaWhiteEn: "c4, g3, Bg2 depending on the reply.",
        ideaBlackFr: "Occupier le centre ou rester flexible.",
        ideaBlackEn: "Occupy the centre or stay flexible.",
      },
    ],
  },
  {
    id: "london",
    eco: "D00",
    nameFr: "Système de Londres",
    nameEn: "London System",
    category: "closed",
    summaryFr: "Setup solide Ff4 : plans simples, populaire à tous niveaux.",
    summaryEn: "Solid Bf4 setup: simple plans, popular at every level.",
    ideaWhiteFr: "Ff4, e3, c3, Cbd2 — structure « pyramide ».",
    ideaWhiteEn: "Bf4, e3, c3, Nbd2 — ‘pyramid’ structure.",
    ideaBlackFr: "…c5, …Db6, ou systèmes …Ff5/…Fg4.",
    ideaBlackEn: "…c5, …Qb6, or …Bf5/…Bg4 systems.",
    variations: [
      {
        id: "london-main",
        eco: "D02",
        nameFr: "Londres",
        nameEn: "London",
        kind: "main",
        uciMoves: ["d2d4", "d7d5", "g1f3", "g8f6", "c1f4"],
        summaryFr: "Développement facile et idées claires.",
        summaryEn: "Easy development and clear ideas.",
        ideaWhiteFr: "e3, c3, Fd3, o-o ; parfois Ce5.",
        ideaWhiteEn: "e3, c3, Bd3, castle; sometimes Ne5.",
        ideaBlackFr: "Challenger le Ff4 et viser …c5.",
        ideaBlackEn: "Challenge Bf4 and aim for …c5.",
      },
    ],
  },
  {
    id: "kings-gambit",
    eco: "C30",
    nameFr: "Gambit du roi",
    nameEn: "King’s Gambit",
    category: "gambit",
    summaryFr: "f4 sacrifie un pion pour l’attaque et l’ouverture de lignes.",
    summaryEn: "f4 sacrifices a pawn for attack and open lines.",
    ideaWhiteFr: "Initiative, colonnes f, développement agressif.",
    ideaWhiteEn: "Initiative, f-file, aggressive development.",
    ideaBlackFr: "Accepter et défendre, ou décliner avec …Fc5.",
    ideaBlackEn: "Accept and defend, or decline with …Bc5.",
    variations: [
      {
        id: "kg-accepted",
        eco: "C33",
        nameFr: "Gambit du roi accepté",
        nameEn: "King’s Gambit Accepted",
        kind: "gambit",
        uciMoves: ["e2e4", "e7e5", "f2f4", "e5f4"],
        summaryFr: "Prise du pion f ; partie vive.",
        summaryEn: "Taking the f-pawn; a lively game.",
        ideaWhiteFr: "Cf3, Fc4, d4 — regagner f4 ou attaquer.",
        ideaWhiteEn: "Nf3, Bc4, d4 — regain f4 or attack.",
        ideaBlackFr: "…g5 pour garder le pion, ou le rendre pour développer.",
        ideaBlackEn: "…g5 to keep the pawn, or return it to develop.",
      },
      {
        id: "kg-declined",
        eco: "C30",
        nameFr: "Gambit du roi refusé",
        nameEn: "King’s Gambit Declined",
        kind: "variation",
        uciMoves: ["e2e4", "e7e5", "f2f4", "f8c5"],
        summaryFr: "…Fc5 refuse le pion et développe.",
        summaryEn: "…Bc5 declines the pawn and develops.",
        ideaWhiteFr: "Cf3, c3, d4 — centre classique.",
        ideaWhiteEn: "Nf3, c3, d4 — classical centre.",
        ideaBlackFr: "Pression sur g1 et développement rapide.",
        ideaBlackEn: "Pressure toward g1 and fast development.",
      },
    ],
  },
  {
    id: "danish",
    eco: "C21",
    nameFr: "Gambit danois",
    nameEn: "Danish Gambit",
    category: "gambit",
    summaryFr: "Double sacrifice de pions pour un développement explosif.",
    summaryEn: "Double pawn sacrifice for explosive development.",
    ideaWhiteFr: "Fc4, Db3, pression f7 — attaque directe.",
    ideaWhiteEn: "Bc4, Qb3, f7 pressure — direct attack.",
    ideaBlackFr: "Rendre du matériel, développer, échanger les dames.",
    ideaBlackEn: "Return material, develop, trade queens.",
    variations: [
      {
        id: "danish-main",
        eco: "C21",
        nameFr: "Danois",
        nameEn: "Danish",
        kind: "gambit",
        uciMoves: ["e2e4", "e7e5", "d2d4", "e5d4", "c2c3"],
        summaryFr: "c3 offre un second pion pour l’ouverture des lignes.",
        summaryEn: "c3 offers a second pawn to open lines.",
        ideaWhiteFr: "Récupérer ou laisser pour Fc4/O-O rapide.",
        ideaWhiteEn: "Recapture or leave it for fast Bc4/0-0.",
        ideaBlackFr: "…dxc3 ou …d5 pour simplifier.",
        ideaBlackEn: "…dxc3 or …d5 to simplify.",
      },
    ],
  },
  {
    id: "budapest",
    eco: "A51",
    nameFr: "Gambit de Budapest",
    nameEn: "Budapest Gambit",
    category: "gambit",
    summaryFr: "…e5 contre 1.d4 Cf6 c4 : pièges et activité de pièces.",
    summaryEn: "…e5 against 1.d4 Nf6 c4: traps and piece activity.",
    ideaWhiteFr: "Garder le pion proprement, éviter les pièges.",
    ideaWhiteEn: "Keep the pawn cleanly, avoid traps.",
    ideaBlackFr: "Développement rapide, pression sur e4/d4.",
    ideaBlackEn: "Fast development, pressure on e4/d4.",
    variations: [
      {
        id: "budapest-main",
        eco: "A52",
        nameFr: "Budapest",
        nameEn: "Budapest",
        kind: "gambit",
        uciMoves: ["d2d4", "g8f6", "c2c4", "e7e5"],
        summaryFr: "Sacrifice pour l’activité.",
        summaryEn: "A sacrifice for activity.",
        ideaWhiteFr: "dxe5 Cg5 ; consolider.",
        ideaWhiteEn: "dxe5 Ng5; consolidate.",
        ideaBlackFr: "…Cg4, …Cc6, récupérer ou compenser.",
        ideaBlackEn: "…Ng4, …Nc6, regain or compensate.",
      },
    ],
  },
];

/** Flat list for book matching (longest line wins). */
export const OPENING_LINES: OpeningLine[] = OPENING_FAMILIES.flatMap((family) =>
  family.variations.map((v) => ({
    id: v.id,
    eco: v.eco,
    nameFr: v.nameFr,
    nameEn: v.nameEn,
    uciMoves: v.uciMoves,
    familyId: family.id,
    kind: v.kind,
  }))
);

export function findVariation(id: string): {
  family: OpeningFamily;
  variation: OpeningVariation;
} | null {
  for (const family of OPENING_FAMILIES) {
    const variation = family.variations.find((v) => v.id === id);
    if (variation) return { family, variation };
  }
  return null;
}

export function getCategoryLabel(
  category: OpeningCategory,
  lang: "fr" | "en"
): string {
  const fr: Record<OpeningCategory, string> = {
    open: "Ouvertes (1.e4 e5)",
    semiOpen: "Semi-ouvertes (1.e4)",
    closed: "Fermées (1.d4)",
    indian: "Indiennes",
    flank: "Ailes (flank)",
    gambit: "Gambits",
  };
  const en: Record<OpeningCategory, string> = {
    open: "Open games (1.e4 e5)",
    semiOpen: "Semi-open (1.e4)",
    closed: "Closed (1.d4)",
    indian: "Indian defences",
    flank: "Flank openings",
    gambit: "Gambits",
  };
  return lang === "fr" ? fr[category] : en[category];
}

export const CATEGORY_ORDER: OpeningCategory[] = [
  "open",
  "semiOpen",
  "closed",
  "indian",
  "flank",
  "gambit",
];

function historyUci(history: Move[], throughPly: number): string[] {
  const end = Math.min(throughPly + 1, history.length);
  const out: string[] = [];
  for (let i = 0; i < end; i += 1) {
    out.push(moveToUci(history[i]));
  }
  return out;
}

export function isBookPly(history: Move[], plyIndex: number): boolean {
  if (plyIndex < 0 || plyIndex >= history.length) return false;
  const played = historyUci(history, plyIndex);
  return OPENING_LINES.some((line) => {
    if (played.length > line.uciMoves.length) return false;
    return played.every((uci, i) => uci === line.uciMoves[i]);
  });
}

export function matchOpening(
  history: Move[],
  plyIndex: number
): OpeningLine | null {
  if (plyIndex < 0) return null;
  const played = historyUci(history, Math.min(plyIndex, history.length - 1));
  if (played.length === 0) return null;

  let best: OpeningLine | null = null;
  for (const line of OPENING_LINES) {
    const len = Math.min(played.length, line.uciMoves.length);
    let ok = true;
    for (let i = 0; i < len; i += 1) {
      if (played[i] !== line.uciMoves[i]) {
        ok = false;
        break;
      }
    }
    if (!ok) continue;
    if (!best || line.uciMoves.length > best.uciMoves.length) {
      best = line;
    }
  }
  return best;
}
