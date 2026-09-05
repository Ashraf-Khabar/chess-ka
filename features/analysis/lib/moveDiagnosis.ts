import { Chess, type Move, type PieceSymbol } from "chess.js";
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
 * Approximates “taking something and not getting recaptured equally”.
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

    // Can we recapture on that square?
    const recaptures = trial
      .moves({ verbose: true })
      .filter((m) => m.to === capture.to && Boolean(m.captured));
    let recoup = 0;
    if (recaptures.length > 0) {
      // Our piece that just captured is what they'd take — value of capturer
      const capturer = game.get(capture.from);
      recoup = capturer ? PIECE_VALUES[capturer.type] : 0;
    }

    const net = gained - recoup;
    if (net >= 1 && (!worst || net > worst.net)) {
      worst = { san: capture.san, net, captured: capture.captured };
    }
  }

  return worst;
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
 * Neutral facts about a played move (capture, check, castling…) — useful for opponent plies too.
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

  // No interesting tactical fact — callers should stay silent rather than invent fluff.
  if (bits.length === 0) return null;

  return bits.join(fr ? ", " : ", ");
}

/**
 * Builds a short human "why this move is wrong" sentence from board tactics.
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

  // 1) Immediate hanging / free material for opponent
  const hang = maxHangingLoss(after);
  if (hang && hang.net >= 2) {
    const name = pieceName(hang.captured, lang);
    const art = articleFr(hang.captured);
    reasons.push(
      fr
        ? `Pourquoi c’est faux : après ${played.san}, l’adversaire peut prendre ${art} ${name} (par ex. ${hang.san}) presque gratuitement.`
        : `Why it’s wrong: after ${played.san}, the opponent can take your ${name} (e.g. ${hang.san}) nearly for free.`
    );
  } else if (hang && hang.net >= 1) {
    const name = pieceName(hang.captured, lang);
    reasons.push(
      fr
        ? `Pourquoi c’est faux : ce coup laisse ${indefArticleFr(hang.captured)} ${name} trop exposé — ${hang.san} gagne du matériel.`
        : `Why it’s wrong: this leaves your ${name} too exposed — ${hang.san} wins material.`
    );
  }

  // 2) Missed a valuable capture that the best move takes
  if (best?.captured) {
    const missed = PIECE_VALUES[best.captured];
    const took = played.captured ? PIECE_VALUES[played.captured] : 0;
    if (missed > took) {
      const name = pieceName(best.captured, lang);
      reasons.push(
        fr
          ? `Vous ratez la prise ${articleFr(best.captured) === "la" ? "de la" : "du"} ${name} avec ${best.san}.`
          : `You miss capturing the ${name} with ${best.san}.`
      );
    }
  }

  // 3) Missed a check
  if (
    best &&
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

  // 4) Best move was a strong capture available before the move
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

  // 5) Opponent gets multiple checks
  const checks = after
    .moves({ verbose: true })
    .filter((m) => m.san.includes("+") || m.san.includes("#"));
  if (checks.length >= 2 && reasons.length === 0) {
    reasons.push(
      fr
        ? `Pourquoi c’est faux : vous cédez l’initiative — l’adversaire obtient plusieurs échecs dangereux.`
        : `Why it’s wrong: you cede the initiative — the opponent gets several dangerous checks.`
    );
  }

  // 6) Eval-based fallback when no tactical motif was detected
  if (reasons.length === 0) {
    const loss =
      params.lossCp !== null ? Math.max(0, Math.round(params.lossCp)) : null;
    if (loss !== null && loss >= 200) {
      reasons.push(
        fr
          ? `Pourquoi c’est faux : vous perdez environ ${(loss / 100).toFixed(1)} pion${loss >= 150 ? "s" : ""} d’avantage (espace, case clé ou coordination des pièces).`
          : `Why it’s wrong: you lose about ${(loss / 100).toFixed(1)} pawn${loss >= 150 ? "s" : ""} of advantage (space, key square, or piece coordination).`
      );
    } else if (loss !== null && loss >= 80) {
      reasons.push(
        fr
          ? `Pourquoi c’est faux : le coup affaiblit votre position (cases, colonnes ou pièce mal placée).`
          : `Why it’s wrong: the move weakens your position (squares, files, or piece placement).`
      );
    } else {
      reasons.push(
        fr
          ? `Pourquoi c’est faux : le coup cède trop de terrain ou de coordination sans compensation claire.`
          : `Why it’s wrong: the move concedes too much space or coordination without clear compensation.`
      );
    }
  }

  if (reasons.length === 0) return null;

  // Keep coach readable: one strong reason (+ optional second short one)
  return reasons.slice(0, 2).join(fr ? " " : " ");
}
