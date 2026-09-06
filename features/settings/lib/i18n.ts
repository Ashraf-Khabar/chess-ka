import type { AppLanguage } from "@/features/settings/lib/settingsTypes";

const fr = {
  "nav.analysis": "Analyse",
  "nav.board": "Échiquier",
  "nav.openings": "Ouvertures",
  "nav.catalog": "Catalogue",
  "nav.library": "Bibliothèque",
  "nav.settings": "Paramètres",
  "nav.profile": "Profil",
  "nav.support": "Support GitHub",
  "nav.menu": "Navigation",

  "studio.title": "Échiquier annoté",
  "studio.eyebrow": "Studio d’analyse",
  "studio.username": "Pseudo Chess.com",
  "studio.fetch": "Fetch parties",
  "studio.fetching": "Chargement…",
  "studio.importPgn": "Import PGN",
  "studio.loaded": "Partie chargée",
  "studio.moves": "Liste des coups",
  "studio.size": "Taille",

  "library.title": "Parties Chess.com",
  "library.eyebrow": "Bibliothèque",
  "library.emptyHint":
    "Vos parties resteront ici après le fetch — cliquez pour ouvrir l’analyse détaillée.",
  "library.enterUser": "Entrez un pseudo puis Fetch",
  "library.loading": "Chargement des parties…",
  "library.loadedCount": "{count} partie(s) chargée(s) — la liste reste affichée.",
  "library.win": "Victoire",
  "library.loss": "Défaite",
  "library.draw": "Nulle",

  "session.eyebrow": "Session",
  "session.title": "Aperçu",
  "session.games": "Parties",
  "session.plies": "Coups",
  "session.quality": "Qualité approx.",

  "coach.eyebrow": "Coach",
  "coach.title": "Feedback du coup",
  "coach.playThis": "Coup à jouer",
  "coach.bestNow": "Meilleur coup maintenant",
  "coach.why": "Pourquoi c’est faux",
  "coach.whyRight": "Pourquoi c’est fort",
  "coach.opponent": "Adversaire",
  "coach.stepHint": "Avancez d’un demi-coup pour analyser votre réponse.",
  "coach.opponentOnly": "Le coach commente uniquement vos coups.",

  "openings.eyebrow": "Catalogue",
  "openings.title": "Ouvertures",
  "openings.hint":
    "Choisissez une ouverture, parcourez la ligne : symbole livre en théorie, puis pastilles de qualité si vous déviez.",
  "openings.plies": "coups",
  "openings.book": "Théorie",

  "engine.eyebrow": "Moteur local",
  "engine.title": "Stockfish",
  "engine.eval": "Évaluation",
  "engine.best": "Meilleur coup",
  "engine.pv": "Variante principale",
  "engine.waitingPv": "En attente de la ligne moteur…",
  "engine.quality": "Qualité du coup",
  "engine.classifying": "Classification…",
  "engine.playHint": "Jouez ou naviguez vers un coup pour le classer.",
  "engine.booting": "démarrage…",
  "engine.loss": "Perte",
  "engine.footer":
    "Stockfish tourne en local (WebAssembly). Les pastilles colorées sur l’échiquier reprennent le style Chess.com.",

  "board.start": "Début",
  "board.back": "Précédent",
  "board.forward": "Suivant",
  "board.end": "Fin",
  "board.flip": "Retourner",
  "board.reset": "Reset",
  "board.returnFork": "Retour à la partie",
  "board.returnForkHint": "Revenir au dernier coup réel",
  "board.shrink": "Réduire l’échiquier",
  "board.grow": "Agrandir l’échiquier",
  "board.lastMove": "Dernier coup",

  "settings.title": "Paramètres",
  "settings.eyebrow": "Préférences",
  "settings.saved": "Enregistré dans les cookies",
  "settings.language": "Langue",
  "settings.boardSize": "Taille de l’échiquier",
  "settings.boardTheme": "Design de l’échiquier",
  "settings.animation": "Vitesse d’animation",
  "settings.liveArrow": "Afficher la flèche du meilleur coup",
  "settings.notation": "Afficher les coordonnées",
  "settings.markers": "Pastilles de qualité sur le plateau",
  "settings.support": "Support",
  "settings.supportBody":
    "Pas de compte requis. Pour signaler un bug, proposer une idée ou soutenir le projet, ouvrez le dépôt GitHub.",
  "settings.openGithub": "Ouvrir le dépôt GitHub",
  "settings.reset": "Réinitialiser les paramètres",
  "settings.anim.fast": "Rapide",
  "settings.anim.normal": "Normale",
  "settings.anim.smooth": "Fluide",
  "settings.theme.forest": "Forêt",
  "settings.theme.classic": "Classique",
  "settings.theme.walnut": "Noyer",
  "settings.theme.maple": "Érable",
  "settings.theme.cherry": "Cerisier",
  "settings.theme.ice": "Glace",
  "settings.theme.ocean": "Océan",
  "settings.theme.midnight": "Minuit",
  "settings.theme.graphite": "Graphite",
  "settings.theme.coral": "Corail",
  "settings.theme.sand": "Sable",
  "settings.theme.emerald": "Émeraude",
  "settings.theme.lavender": "Lavande",
  "settings.theme.contrast": "Contraste",
  "settings.boardTheme.hint":
    "Couleurs et motifs des cases (bois, feutre, marbre…).",
  "settings.pieceStyle": "Style des pièces",
  "settings.pieceStyle.hint": "Apparence des pièces sur l’échiquier.",
  "settings.piece.classic": "Classique",
  "settings.piece.classic.desc": "Pièces SVG standard",
  "settings.piece.mono": "Mono",
  "settings.piece.mono.desc": "Noir et blanc",
  "settings.piece.warm": "Chaud",
  "settings.piece.warm.desc": "Tons bois / sépia",
  "settings.piece.cool": "Froid",
  "settings.piece.cool.desc": "Teinte bleutée",
  "settings.piece.ink": "Encre",
  "settings.piece.ink.desc": "Contraste encré",
  "settings.piece.alpha": "Alpha",
  "settings.piece.alpha.desc": "Symboles Unicode",
  "settings.section.general": "Général & apparence",
  "settings.section.board": "Échiquier",
  "settings.section.analysis": "Analyse",
  "settings.appTheme": "Thème de l’app",
  "settings.appTheme.hint":
    "Couleurs de l’interface (clair ou sombre). Indépendant de l’échiquier.",
  "settings.mode.light": "Clair",
  "settings.mode.dark": "Sombre",
  "settings.appTheme.signal": "Signal",
  "settings.appTheme.signal.desc":
    "Rouge vif sur fond clair — look match desk.",
  "settings.appTheme.paper": "Papier",
  "settings.appTheme.paper.desc":
    "Bleu papier et blanc — lecture confortable.",
  "settings.appTheme.emerald": "Émeraude",
  "settings.appTheme.emerald.desc":
    "Vert frais, ambiance salle de club.",
  "settings.appTheme.slate": "Ardoise",
  "settings.appTheme.slate.desc":
    "Gris clair avec accent orange.",
  "settings.appTheme.harbor": "Port",
  "settings.appTheme.harbor.desc":
    "Cyan profond, atmosphère maritime.",
  "settings.appTheme.carbon": "Carbone",
  "settings.appTheme.carbon.desc":
    "Sombre charbon, accents rouges.",
  "settings.appTheme.night": "Nuit",
  "settings.appTheme.night.desc":
    "Noir profond, accents menthe.",
  "settings.appTheme.dusk": "Crépuscule",
  "settings.appTheme.dusk.desc":
    "Sombre chaud avec corail.",
  "settings.engineDepth": "Profondeur Stockfish",
  "settings.engineDepth.hint":
    "Plus élevé = plus précis (et plus lent). 18–22 proche d’une analyse Chess.com.",
  "settings.showCoach": "Afficher le panneau Coach",
  "settings.previewHint":
    "Les changements s’appliquent tout de suite et sont sauvegardés dans les cookies.",

  "moves.empty":
    "Jouez des coups ou chargez une partie Chess.com pour remplir la liste.",
  "moves.variation": "Variante",
  "moves.variationHint": "Ligne explorée (hors partie réelle)",
  "moves.backToGame": "Dernier coup réel",

  "library.analyze": "Analyser",
  "library.openReview": "Ouvrir l’analyse détaillée",

  "review.back": "Retour à la bibliothèque",
  "review.eyebrow": "Revue de partie",
  "review.title": "Analyse détaillée",
  "review.missing": "Partie introuvable. Revenez à l’accueil et sélectionnez une partie.",
  "review.white": "Blancs",
  "review.black": "Noirs",
  "review.rated": "Classée",
  "review.casual": "Amicale",
  "review.moves": "Coups",
  "review.accuracy": "Précision (approx.)",
  "review.hint":
    "Parcourez chaque coup : pastilles, flèches et feedback comme sur Chess.com.",
  "review.loading": "Chargement de la partie…",
} as const;

type DictKey = keyof typeof fr;

const en: Record<DictKey, string> = {
  "nav.analysis": "Analysis",
  "nav.board": "Board",
  "nav.openings": "Openings",
  "nav.catalog": "Catalog",
  "nav.library": "Library",
  "nav.settings": "Settings",
  "nav.profile": "Profile",
  "nav.support": "GitHub support",
  "nav.menu": "Navigation",

  "studio.title": "Annotated board",
  "studio.eyebrow": "Analysis studio",
  "studio.username": "Chess.com username",
  "studio.fetch": "Fetch games",
  "studio.fetching": "Loading…",
  "studio.importPgn": "Import PGN",
  "studio.loaded": "Game loaded",
  "studio.moves": "Move list",
  "studio.size": "Size",

  "library.title": "Chess.com games",
  "library.eyebrow": "Library",
  "library.emptyHint":
    "Your games stay here after fetch — click one to open the detailed review.",
  "library.enterUser": "Enter a username then Fetch",
  "library.loading": "Loading games…",
  "library.loadedCount": "{count} game(s) loaded — the list stays visible.",
  "library.win": "Win",
  "library.loss": "Loss",
  "library.draw": "Draw",

  "session.eyebrow": "Session",
  "session.title": "Overview",
  "session.games": "Games",
  "session.plies": "Moves",
  "session.quality": "Approx. quality",

  "coach.eyebrow": "Coach",
  "coach.title": "Move feedback",
  "coach.playThis": "Move to play",
  "coach.bestNow": "Best move now",
  "coach.why": "Why it’s wrong",
  "coach.whyRight": "Why it’s strong",
  "coach.opponent": "Opponent",
  "coach.stepHint": "Step forward one ply to analyze your reply.",
  "coach.opponentOnly": "Coach only comments on your moves.",

  "openings.eyebrow": "Catalog",
  "openings.title": "Openings",
  "openings.hint":
    "Pick an opening and step through the line: book badge in theory, then quality markers if you deviate.",
  "openings.plies": "moves",
  "openings.book": "Book",

  "engine.eyebrow": "Local engine",
  "engine.title": "Stockfish",
  "engine.eval": "Evaluation",
  "engine.best": "Best move",
  "engine.pv": "Principal variation",
  "engine.waitingPv": "Waiting for engine line…",
  "engine.quality": "Move quality",
  "engine.classifying": "Classifying…",
  "engine.playHint": "Play or step to a move to classify it.",
  "engine.booting": "booting…",
  "engine.loss": "Loss",
  "engine.footer":
    "Stockfish runs locally (WebAssembly). Colored badges follow a Chess.com-like style.",

  "board.start": "Start",
  "board.back": "Back",
  "board.forward": "Forward",
  "board.end": "End",
  "board.flip": "Flip",
  "board.reset": "Reset",
  "board.returnFork": "Back to game",
  "board.returnForkHint": "Return to the last real move",
  "board.shrink": "Shrink board",
  "board.grow": "Enlarge board",
  "board.lastMove": "Last move",

  "settings.title": "Settings",
  "settings.eyebrow": "Preferences",
  "settings.saved": "Saved in cookies",
  "settings.language": "Language",
  "settings.boardSize": "Board size",
  "settings.boardTheme": "Board design",
  "settings.animation": "Animation speed",
  "settings.liveArrow": "Show best-move arrow",
  "settings.notation": "Show coordinates",
  "settings.markers": "Quality markers on the board",
  "settings.support": "Support",
  "settings.supportBody":
    "No account required. To report a bug, suggest an idea, or support the project, open the GitHub repository.",
  "settings.openGithub": "Open GitHub repository",
  "settings.reset": "Reset settings",
  "settings.anim.fast": "Fast",
  "settings.anim.normal": "Normal",
  "settings.anim.smooth": "Smooth",
  "settings.theme.forest": "Forest",
  "settings.theme.classic": "Classic",
  "settings.theme.walnut": "Walnut",
  "settings.theme.maple": "Maple",
  "settings.theme.cherry": "Cherry",
  "settings.theme.ice": "Ice",
  "settings.theme.ocean": "Ocean",
  "settings.theme.midnight": "Midnight",
  "settings.theme.graphite": "Graphite",
  "settings.theme.coral": "Coral",
  "settings.theme.sand": "Sand",
  "settings.theme.emerald": "Emerald",
  "settings.theme.lavender": "Lavender",
  "settings.theme.contrast": "High contrast",
  "settings.boardTheme.hint":
    "Square colors and motifs (wood, felt, marble…).",
  "settings.pieceStyle": "Piece style",
  "settings.pieceStyle.hint": "How pieces look on the board.",
  "settings.piece.classic": "Classic",
  "settings.piece.classic.desc": "Standard SVG pieces",
  "settings.piece.mono": "Mono",
  "settings.piece.mono.desc": "Black and white",
  "settings.piece.warm": "Warm",
  "settings.piece.warm.desc": "Wood / sepia tones",
  "settings.piece.cool": "Cool",
  "settings.piece.cool.desc": "Blue-tinted look",
  "settings.piece.ink": "Ink",
  "settings.piece.ink.desc": "Ink contrast",
  "settings.piece.alpha": "Alpha",
  "settings.piece.alpha.desc": "Unicode symbols",
  "settings.section.general": "General & appearance",
  "settings.section.board": "Chessboard",
  "settings.section.analysis": "Analysis",
  "settings.appTheme": "App theme",
  "settings.appTheme.hint":
    "Interface colors (light or dark). Independent of the board.",
  "settings.mode.light": "Light",
  "settings.mode.dark": "Dark",
  "settings.appTheme.signal": "Signal",
  "settings.appTheme.signal.desc":
    "Bright red on light — match desk look.",
  "settings.appTheme.paper": "Paper",
  "settings.appTheme.paper.desc":
    "Paper blue and white — easy reading.",
  "settings.appTheme.emerald": "Emerald",
  "settings.appTheme.emerald.desc":
    "Fresh green, club-room vibe.",
  "settings.appTheme.slate": "Slate",
  "settings.appTheme.slate.desc":
    "Light gray with orange accent.",
  "settings.appTheme.harbor": "Harbor",
  "settings.appTheme.harbor.desc":
    "Deep cyan, maritime feel.",
  "settings.appTheme.carbon": "Carbon",
  "settings.appTheme.carbon.desc":
    "Charcoal dark with red accents.",
  "settings.appTheme.night": "Night",
  "settings.appTheme.night.desc":
    "Deep black with mint accents.",
  "settings.appTheme.dusk": "Dusk",
  "settings.appTheme.dusk.desc":
    "Warm dark with coral.",
  "settings.engineDepth": "Stockfish depth",
  "settings.engineDepth.hint":
    "Higher = more accurate (and slower). 18–22 is close to Chess.com-style analysis.",
  "settings.showCoach": "Show Coach panel",
  "settings.previewHint":
    "Changes apply immediately and are saved in cookies.",

  "moves.empty": "Play moves or load a Chess.com game to fill the list.",
  "moves.variation": "Variation",
  "moves.variationHint": "Explored line (not the real game)",
  "moves.backToGame": "Last real move",

  "library.analyze": "Analyze",
  "library.openReview": "Open detailed analysis",

  "review.back": "Back to library",
  "review.eyebrow": "Game review",
  "review.title": "Detailed analysis",
  "review.missing": "Game not found. Go home and select a game again.",
  "review.white": "White",
  "review.black": "Black",
  "review.rated": "Rated",
  "review.casual": "Casual",
  "review.moves": "Moves",
  "review.accuracy": "Accuracy (approx.)",
  "review.hint":
    "Step through each move: badges, arrows, and feedback like Chess.com.",
  "review.loading": "Loading game…",
};

const dictionaries: Record<AppLanguage, Record<DictKey, string>> = {
  fr,
  en,
};

export type TranslationKey = DictKey;

export function translate(
  language: AppLanguage,
  key: TranslationKey,
  vars?: Record<string, string | number>
): string {
  let text = dictionaries[language][key] ?? dictionaries.en[key] ?? key;
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      text = text.replaceAll(`{${name}}`, String(value));
    }
  }
  return text;
}
