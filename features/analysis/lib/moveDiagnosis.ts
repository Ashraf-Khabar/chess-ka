import { Chess, type Move, type PieceSymbol, type Square } from "chess.js";
import type { AppLanguage } from "@/features/settings/lib/settingsTypes";

const PIECE_VALUES: Record<PieceSymbol, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

const PIECE_NAME_FR: Record<PieceSymbol, string> = {
  p: "pion",
  n: "cavalier",
  b: "fou",
  r: "tour",
  q: "dame",
  k: "roi",
};

const PIECE_NAME_EN: Record<PieceSymbol, string> = {
  p: "pawn",
  n: "knight",
  b: "bishop",
  r: "rook",
  q: "queen",
  k: "king",
};

function pieceName(type: PieceSymbol, lang: AppLanguage): string {
  return lang === "fr" ? PIECE_NAME_FR[type] : PIECE_NAME_EN[type];
}

function articleFr(type: PieceSymbol): "le" | "la" {
  if (type === "r" || type === "q") return "la";
  return "le";
}

function indefArticleFr(type: PieceSymbol): "un" | "une" {
  return type === "r" || type === "q" ? "une" : "un";
}

function ofArticleFr(type: PieceSymbol): string {
  return articleFr(type) === "la" ? "de la" : "du";
}

/** Best immediate capture the side to move can make (value gained). */
function bestCaptureGain(game: Chess): {
  san: string;
  gain: number;
  captured: PieceSymbol;
} | null {
  let best: { san: string; gain: number; captured: PieceSymbol } | null = null;
  for (const move of game.moves({ verbose: true })) {
    if (!move.captured) continue;
    const gain = PIECE_VALUES[move.captured];
    if (!best || gain > best.gain) {
      best = { san: move.san, gain, captured: move.captured };
    }
  }
  return best;
}

/**
 * Net material the opponent can win on the next move (hanging pieces).
 */
function maxHangingLoss(game: Chess): {
  san: string;
  net: number;
  captured: PieceSymbol;
} | null {
  let worst: { san: string; net: number; captured: PieceSymbol } | null = null;

  for (const capture of game.moves({ verbose: true })) {
    if (!capture.captured) continue;

    const gained = PIECE_VALUES[capture.captured];
    const trial = new Chess(game.fen());
    trial.move({
      from: capture.from,
      to: capture.to,
      promotion: capture.promotion,
    });

    const recaptures = trial
      .moves({ verbose: true })
      .filter((m) => m.to === capture.to && Boolean(m.captured));
    let recoup = 0;
    if (recaptures.length > 0) {
      const capturer = game.get(capture.from as Square);
      recoup = capturer ? PIECE_VALUES[capturer.type] : 0;
    }

    const net = gained - recoup;
    if (net >= 1 && (!worst || net > worst.net)) {
      worst = { san: capture.san, net, captured: capture.captured };
    }
  }

  return worst;
}

/** Did the move leave the moved piece hanging for free (or nearly)? */
function isMovedPieceHanging(
  after: Chess,
  toSquare: string,
  pieceType: PieceSymbol
): { san: string; net: number } | null {
  const attackers = after
    .moves({ verbose: true })
    .filter((m) => m.to === toSquare && Boolean(m.captured));
  if (attackers.length === 0) return null;

  const pieceValue = PIECE_VALUES[pieceType];
  let best: { san: string; net: number } | null = null;

  for (const attack of attackers) {
    const trial = new Chess(after.fen());
    trial.move({
      from: attack.from,
      to: attack.to,
      promotion: attack.promotion,
    });
    const defenders = trial
      .moves({ verbose: true })
      .filter((m) => m.to === toSquare && Boolean(m.captured));
    const attackerPiece = after.get(attack.from as Square);
    const attackerValue = attackerPiece
      ? PIECE_VALUES[attackerPiece.type]
      : 0;
    const net =
      pieceValue - (defenders.length > 0 ? attackerValue : 0);
    if (net >= 1 && (!best || net > best.net)) {
      best = { san: attack.san, net };
    }
  }
  return best;
}

/** Count how many of our pieces can be taken with positive net next move. */
function countHangingTargets(game: Chess): number {
  let count = 0;
  const seen = new Set<string>();
  for (const capture of game.moves({ verbose: true })) {
    if (!capture.captured || seen.has(capture.to)) continue;
    const gained = PIECE_VALUES[capture.captured];
    const trial = new Chess(game.fen());
    trial.move({
      from: capture.from,
      to: capture.to,
      promotion: capture.promotion,
    });
    const recaptures = trial
      .moves({ verbose: true })
      .filter((m) => m.to === capture.to && Boolean(m.captured));
    const capturer = game.get(capture.from as Square);
    const recoup = capturer ? PIECE_VALUES[capturer.type] : 0;
    if (gained - (recaptures.length > 0 ? recoup : 0) >= 1) {
      seen.add(capture.to);
      count += 1;
    }
  }
  return count;
}

function findPlayedMove(fenBefore: string, playedSan: string): Move | null {
  try {
    const game = new Chess(fenBefore);
    return (
      game.moves({ verbose: true }).find((m) => m.san === playedSan) ?? null
    );
  } catch {
    return null;
  }
}

function parseBestMove(
  fenBefore: string,
  bestUci: string | null
): Move | null {
  if (!bestUci || bestUci.length < 4) return null;
  try {
    const game = new Chess(fenBefore);
    const from = bestUci.slice(0, 2);
    const to = bestUci.slice(2, 4);
    const promotion =
      bestUci.length > 4 ? bestUci[4]?.toLowerCase() : undefined;
    const result = game.move({
      from,
      to,
      ...(promotion ? { promotion } : {}),
    });
    return result;
  } catch {
    return null;
  }
}

/**
 * Neutral facts about a played move (capture, check, castling…).
 */
export function describeMoveFacts(params: {
  fenBefore: string | null;
  playedSan: string | null;
  language?: AppLanguage;
}): string | null {
  const lang = params.language ?? "fr";
  const fr = lang === "fr";
  if (!params.fenBefore || !params.playedSan) return null;

  const played = findPlayedMove(params.fenBefore, params.playedSan);
  if (!played) return null;

  const bits: string[] = [];

  if (played.san === "O-O" || played.san === "0-0") {
    bits.push(fr ? "roque petit côté" : "kingside castling");
  } else if (played.san === "O-O-O" || played.san === "0-0-0") {
    bits.push(fr ? "roque grand côté" : "queenside castling");
  }

  if (played.captured) {
    const name = pieceName(played.captured, lang);
    bits.push(
      fr
        ? `prend ${articleFr(played.captured)} ${name}`
        : `captures the ${name}`
    );
  }

  if (played.promotion) {
    bits.push(
      fr
        ? `promotion en ${pieceName(played.promotion as PieceSymbol, lang)}`
        : `promotes to ${pieceName(played.promotion as PieceSymbol, lang)}`
    );
  }

  if (played.san.includes("#")) {
    bits.push(fr ? "échec et mat" : "checkmate");
  } else if (played.san.includes("+")) {
    bits.push(fr ? "donne échec" : "gives check");
  }

  if (bits.length === 0) return null;
  return bits.join(", ");
}

/**
 * Why a good / best move works — short concrete praise with board facts.
 */
export function explainWhyRight(params: {
  fenBefore: string | null;
  playedSan: string | null;
  bestUci: string | null;
  language?: AppLanguage;
  isSacrifice?: boolean;
}): string | null {
  const lang = params.language ?? "fr";
  const fr = lang === "fr";
  if (!params.fenBefore || !params.playedSan) return null;

  const played = findPlayedMove(params.fenBefore, params.playedSan);
  if (!played) return null;

  const after = new Chess(params.fenBefore);
  after.move({
    from: played.from,
    to: played.to,
    promotion: played.promotion,
  });

  const bits: string[] = [];

  if (params.isSacrifice) {
    bits.push(
      fr
        ? `Le sacrifice est sain : vous gardez l’initiative malgré le matériel offert.`
        : `The sacrifice is sound: you keep the initiative despite offering material.`
    );
  }

  if (played.captured) {
    const name = pieceName(played.captured, lang);
    bits.push(
      fr
        ? `Vous gagnez ${articleFr(played.captured)} ${name} proprement.`
        : `You cleanly win the ${name}.`
    );
  }

  if (played.san.includes("#")) {
    bits.push(fr ? `Échec et mat forcé.` : `Forced checkmate.`);
  } else if (played.san.includes("+")) {
    bits.push(
      fr
        ? `L’échec force la réponse adverse et gagne un temps.`
        : `Check forces a reply and wins a tempo.`
    );
  }

  const hangBefore = maxHangingLoss(new Chess(params.fenBefore));
  const hangAfter = maxHangingLoss(after);
  if (
    hangBefore &&
    hangBefore.net >= 2 &&
    (!hangAfter || hangAfter.net < hangBefore.net)
  ) {
    bits.push(
      fr
        ? `Vous sécurisez une pièce qui était en prise.`
        : `You secure a piece that was hanging.`
    );
  }

  const beforeCaps = bestCaptureGain(new Chess(params.fenBefore));
  if (
    beforeCaps &&
    beforeCaps.gain >= 3 &&
    played.captured === beforeCaps.captured
  ) {
    bits.push(
      fr
        ? `Vous prenez le matériel qui était réellement en prise.`
        : `You take the hanging material that mattered.`
    );
  }

  if (bits.length === 0) {
    if (played.san === "O-O" || played.san === "O-O-O") {
      return fr
        ? `Le roque met le roi à l’abri et active une tour.`
        : `Castling tucks the king away and activates a rook.`;
    }
    return fr
      ? `Le coup conserve (ou améliore) l’évaluation tout en restant concret.`
      : `The move keeps (or improves) the evaluation while staying concrete.`;
  }

  return bits.slice(0, 2).join(" ");
}

/**
 * Builds a precise "why this move is wrong" explanation from tactics + eval.
 */
export function explainWhyWrong(params: {
  fenBefore: string | null;
  playedSan: string | null;
  bestUci: string | null;
  bestSan: string | null;
  lossCp: number | null;
  language?: AppLanguage;
}): string | null {
  const lang = params.language ?? "fr";
  const fr = lang === "fr";
  if (!params.fenBefore || !params.playedSan) return null;

  const played = findPlayedMove(params.fenBefore, params.playedSan);
  if (!played) return null;

  const before = new Chess(params.fenBefore);
  const after = new Chess(params.fenBefore);
  after.move({
    from: played.from,
    to: played.to,
    promotion: played.promotion,
  });

  const best = parseBestMove(params.fenBefore, params.bestUci);
  const bestSan = params.bestSan ?? best?.san ?? null;
  const reasons: string[] = [];
  const loss =
    params.lossCp !== null ? Math.max(0, Math.round(params.lossCp)) : null;
  const lossPawns =
    loss !== null ? (loss / 100).toFixed(loss >= 100 ? 1 : 2) : null;

  // 1) Moved piece hangs
  const selfHang = isMovedPieceHanging(after, played.to, played.piece);
  if (selfHang && selfHang.net >= 2) {
    const name = pieceName(played.piece, lang);
    reasons.push(
      fr
        ? `Après ${played.san}, ${articleFr(played.piece)} ${name} est en prise : l’adversaire peut jouer ${selfHang.san} et gagner ~${selfHang.net} points de matériel.`
        : `After ${played.san}, your ${name} is hanging: the opponent can play ${selfHang.san} and win ~${selfHang.net} points of material.`
    );
  } else if (selfHang && selfHang.net >= 1) {
    const name = pieceName(played.piece, lang);
    reasons.push(
      fr
        ? `${played.san} laisse ${articleFr(played.piece)} ${name} trop exposé (${selfHang.san}).`
        : `${played.san} leaves your ${name} too exposed (${selfHang.san}).`
    );
  }

  // 2) Other hanging material after the move
  const hang = maxHangingLoss(after);
  if (hang && hang.net >= 2 && (!selfHang || hang.san !== selfHang.san)) {
    const name = pieceName(hang.captured, lang);
    reasons.push(
      fr
        ? `Vous laissez ${articleFr(hang.captured)} ${name} en prise : ${hang.san} gagne du matériel presque gratuitement.`
        : `You leave your ${name} hanging: ${hang.san} wins material nearly for free.`
    );
  } else if (
    hang &&
    hang.net >= 1 &&
    reasons.length === 0 &&
    (!selfHang || hang.san !== selfHang.san)
  ) {
    const name = pieceName(hang.captured, lang);
    reasons.push(
      fr
        ? `Ce coup laisse ${indefArticleFr(hang.captured)} ${name} trop exposé — ${hang.san} gagne du matériel.`
        : `This leaves your ${name} too exposed — ${hang.san} wins material.`
    );
  }

  // 3) Multiple hanging targets
  const hangCount = countHangingTargets(after);
  if (hangCount >= 2 && reasons.length < 2) {
    reasons.push(
      fr
        ? `Plusieurs pièces deviennent attaquables en même temps — la position se désorganise.`
        : `Several pieces become attackable at once — the position falls apart.`
    );
  }

  // 4) Missed a better capture
  if (best?.captured) {
    const missed = PIECE_VALUES[best.captured];
    const took = played.captured ? PIECE_VALUES[played.captured] : 0;
    if (missed > took) {
      const name = pieceName(best.captured, lang);
      reasons.push(
        fr
          ? `Vous ratez la prise ${ofArticleFr(best.captured)} ${name} avec ${best.san}${played.captured ? ` (votre prise est moins forte)` : ""}.`
          : `You miss capturing the ${name} with ${best.san}${played.captured ? ` (your capture is weaker)` : ""}.`
      );
    }
  }

  // 5) Missed check / mate
  if (best) {
    if (best.san.includes("#") && !played.san.includes("#")) {
      reasons.push(
        fr
          ? `${bestSan ?? best.san} mattait (ou forçait le mat) — vous passez à côté.`
          : `${bestSan ?? best.san} was mate (or forced mate) — you miss it.`
      );
    } else if (
      (best.san.includes("+") || best.san.includes("#")) &&
      !played.san.includes("+") &&
      !played.san.includes("#")
    ) {
      reasons.push(
        fr
          ? `${bestSan ?? best.san} donnait échec et forçait une réponse adverse.`
          : `${bestSan ?? best.san} would have given check and forced a reply.`
      );
    }
  }

  // 6) Hanging enemy piece ignored
  const available = bestCaptureGain(before);
  if (
    available &&
    available.gain >= 3 &&
    !played.captured &&
    best?.captured === available.captured
  ) {
    const name = pieceName(available.captured, lang);
    reasons.push(
      fr
        ? `Un ${name} adverse était en prise : ${available.san} était prioritaire.`
        : `An enemy ${name} was hanging: ${available.san} was the priority.`
    );
  }

  // 7) Opponent gets dangerous checks
  const checks = after
    .moves({ verbose: true })
    .filter((m) => m.san.includes("+") || m.san.includes("#"));
  if (checks.length >= 2 && reasons.length === 0) {
    reasons.push(
      fr
        ? `Vous cédez l’initiative : l’adversaire obtient plusieurs échecs dangereux (ex. ${checks[0].san}).`
        : `You cede the initiative: the opponent gets several dangerous checks (e.g. ${checks[0].san}).`
    );
  } else if (
    checks.some((m) => m.san.includes("#")) &&
    reasons.length === 0
  ) {
    reasons.push(
      fr
        ? `Attention : l’adversaire a un mat immédiat après ce coup.`
        : `Warning: the opponent has immediate mate after this move.`
    );
  }

  // 8) Bad trade (captured less than gave up by hanging)
  if (
    played.captured &&
    hang &&
    hang.net > PIECE_VALUES[played.captured] &&
    reasons.length < 2
  ) {
    reasons.push(
      fr
        ? `La prise ne compense pas : vous gagnez ${pieceName(played.captured, lang)} mais perdez davantage juste après.`
        : `The capture doesn’t compensate: you win a ${pieceName(played.captured, lang)} but lose more right after.`
    );
  }

  // 9) Compare with best move when we still need a reason
  if (reasons.length === 0 && bestSan && bestSan !== played.san) {
    if (loss !== null && loss >= 200) {
      reasons.push(
        fr
          ? `${played.san} coûte ~${lossPawns} pion${loss >= 150 ? "s" : ""} d’évaluation. ${bestSan} gardait l’avantage (espace, case clé ou coordination).`
          : `${played.san} costs ~${lossPawns} pawn${loss >= 150 ? "s" : ""} of eval. ${bestSan} kept the edge (space, key square, or coordination).`
      );
    } else if (loss !== null && loss >= 80) {
      reasons.push(
        fr
          ? `${played.san} est imprécis (~${lossPawns} pion). ${bestSan} était plus précis : meilleure case, meilleure pression ou moins de faiblesses.`
          : `${played.san} is inaccurate (~${lossPawns} pawn). ${bestSan} was more precise: better square, more pressure, or fewer weaknesses.`
      );
    } else {
      reasons.push(
        fr
          ? `${played.san} cède un peu de terrain. Le moteur préfère ${bestSan}, qui conserve mieux la structure et l’activité.`
          : `${played.san} gives up a bit of ground. The engine prefers ${bestSan}, which keeps structure and activity better.`
      );
    }
  } else if (reasons.length === 0) {
    if (loss !== null && loss >= 200) {
      reasons.push(
        fr
          ? `Vous perdez environ ${lossPawns} pion${loss >= 150 ? "s" : ""} d’avantage (espace, case clé ou coordination des pièces).`
          : `You lose about ${lossPawns} pawn${loss >= 150 ? "s" : ""} of advantage (space, key square, or piece coordination).`
      );
    } else if (loss !== null && loss >= 80) {
      reasons.push(
        fr
          ? `Le coup affaiblit votre position (cases, colonnes ou pièce mal placée).`
          : `The move weakens your position (squares, files, or piece placement).`
      );
    } else {
      reasons.push(
        fr
          ? `Le coup cède trop de terrain ou de coordination sans compensation claire.`
          : `The move concedes too much space or coordination without clear compensation.`
      );
    }
  }

  // Always append the correction if we have room and a best move
  if (
    bestSan &&
    bestSan !== played.san &&
    reasons.length < 2 &&
    !reasons.some((r) => r.includes(bestSan))
  ) {
    reasons.push(
      fr
        ? `À jouer à la place : ${bestSan}.`
        : `Play instead: ${bestSan}.`
    );
  }

  return reasons.slice(0, 2).join(" ");
}
