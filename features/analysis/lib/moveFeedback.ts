import type { MoveQuality } from "@/features/analysis/lib/classifyMove";
import {
  MOVE_QUALITY_LABEL,
  MOVE_QUALITY_LABEL_FR,
} from "@/features/analysis/lib/classifyMove";
import { describeMoveFacts } from "@/features/analysis/lib/moveDiagnosis";
import type { AppLanguage } from "@/features/settings/lib/settingsTypes";

/**
 * Builds a coaching summary for the reviewed ply.
 * Detailed "why" text comes from explainWhyWrong / explainWhyRight.
 */
export function explainMove(params: {
  quality: MoveQuality | null;
  playedSan: string | null;
  bestMoveSan: string | null;
  fenBefore?: string | null;
  lossCp: number | null;
  isEngineBest: boolean;
  isSacrifice: boolean;
  isClassifying: boolean;
  language?: AppLanguage;
  /** When false, this ply belongs to the opponent — no user coaching. */
  isUserPly?: boolean | null;
  opponentName?: string | null;
}): string {
  const lang = params.language ?? "fr";
  const fr = lang === "fr";

  if (params.isUserPly === false) {
    const who = params.opponentName ?? (fr ? "l’adversaire" : "the opponent");
    const san = params.playedSan;
    if (!san) {
      return fr
        ? `Coup de ${who}. Le coach commente uniquement vos coups.`
        : `${who}’s move. Coach only comments on your moves.`;
    }

    const facts = describeMoveFacts({
      fenBefore: params.fenBefore ?? null,
      playedSan: san,
      language: lang,
    });
    if (facts) {
      return fr
        ? `${who} joue ${san} (${facts}).`
        : `${who} plays ${san} (${facts}).`;
    }
    return fr ? `${who} joue ${san}.` : `${who} plays ${san}.`;
  }

  if (params.isClassifying) {
    return fr
      ? "Analyse de votre coup… comparaison avec la meilleure ligne Stockfish."
      : "Analyzing your move… comparing it to Stockfish’s best line.";
  }

  if (!params.playedSan || !params.quality) {
    return fr
      ? "Parcourez la partie coup par coup pour obtenir un feedback détaillé sur vos décisions."
      : "Step through the game move by move for detailed feedback on your decisions.";
  }

  const label = fr
    ? MOVE_QUALITY_LABEL_FR[params.quality]
    : MOVE_QUALITY_LABEL[params.quality];
  const loss =
    params.lossCp !== null
      ? Math.max(0, Math.round(params.lossCp))
      : null;
  const lossPawns =
    loss !== null ? (loss / 100).toFixed(loss >= 100 ? 1 : 2) : null;
  const best = params.bestMoveSan;
  const san = params.playedSan;
  const facts = describeMoveFacts({
    fenBefore: params.fenBefore ?? null,
    playedSan: params.playedSan,
    language: lang,
  });
  const what = facts
    ? fr
      ? `Ce coup ${facts}.`
      : `This move ${facts}.`
    : null;

  switch (params.quality) {
    case "brilliant":
      return [
        fr
          ? `${san} est Brillant${params.isSacrifice ? " (sacrifice sain)" : ""}.`
          : `${san} is Brilliant${params.isSacrifice ? " (sound sacrifice)" : ""}.`,
        what,
        fr
          ? `Vous forcez l’avantage tout en offrant du matériel — continuez cette idée.`
          : `You force an edge while offering material — stay on this idea.`,
      ]
        .filter(Boolean)
        .join(" ");
    case "great":
      return [
        fr
          ? `${san} est Superbe — très bonne trouvaille.`
          : `${san} is a Great move — a strong find.`,
        what,
        fr
          ? `Ce coup fait basculer clairement l’évaluation en votre faveur.`
          : `It clearly swings the evaluation your way.`,
      ]
        .filter(Boolean)
        .join(" ");
    case "best":
      return [
        fr
          ? `${san} est le meilleur coup du moteur.`
          : `${san} is the engine’s best move.`,
        what,
        fr ? `Parfait — restez sur cette ligne.` : `Perfect — stay on this line.`,
      ]
        .filter(Boolean)
        .join(" ");
    case "excellent":
      return [
        fr
          ? `${san} est Excellent.`
          : `${san} is Excellent.`,
        what,
        fr
          ? `Perte minime${loss !== null ? ` (~${loss} cp)` : ""}${best && !params.isEngineBest ? ` ; le moteur préférait ${best}` : ""}.`
          : `Tiny loss${loss !== null ? ` (~${loss} cp)` : ""}${best && !params.isEngineBest ? `; engine preferred ${best}` : ""}.`,
      ]
        .filter(Boolean)
        .join(" ");
    case "good":
      return [
        fr ? `${san} est un bon coup (${label}).` : `${san} is a good move.`,
        what,
        fr
          ? `Solide${best && best !== san ? `, même si ${best} était un peu plus précis` : ""}.`
          : `Solid${best && best !== san ? `, even if ${best} was a bit more accurate` : ""}.`,
      ]
        .filter(Boolean)
        .join(" ");
    case "inaccuracy":
      return [
        fr
          ? `${san} est une imprécision${lossPawns ? ` (−${lossPawns} pion)` : ""}.`
          : `${san} is an inaccuracy${lossPawns ? ` (−${lossPawns} pawn)` : ""}.`,
        what,
        best
          ? fr
            ? `Le coup plus précis était ${best}.`
            : `The more precise move was ${best}.`
          : null,
      ]
        .filter(Boolean)
        .join(" ");
    case "mistake":
      return [
        fr
          ? `${san} est une erreur${lossPawns ? ` (−${lossPawns} pion)` : ""}.`
          : `${san} is a mistake${lossPawns ? ` (−${lossPawns} pawn)` : ""}.`,
        what,
        best
          ? fr
            ? `Il fallait jouer ${best}.`
            : `You needed to play ${best}.`
          : null,
      ]
        .filter(Boolean)
        .join(" ");
    case "miss":
      return [
        fr
          ? `Occasion manquée avec ${san}${lossPawns ? ` (−${lossPawns} pion)` : ""}.`
          : `Miss with ${san}${lossPawns ? ` (−${lossPawns} pawn)` : ""}.`,
        what,
        fr
          ? `Vous aviez une chance gagnante${best ? ` avec ${best}` : ""}.`
          : `You had a winning chance${best ? ` with ${best}` : ""}.`,
      ]
        .filter(Boolean)
        .join(" ");
    case "blunder":
      return [
        fr
          ? `${san} est une gaffe${lossPawns ? ` (−${lossPawns} pion)` : ""}.`
          : `${san} is a blunder${lossPawns ? ` (−${lossPawns} pawn)` : ""}.`,
        what,
        best
          ? fr
            ? `Corrigez avec ${best}.`
            : `Fix it with ${best}.`
          : null,
      ]
        .filter(Boolean)
        .join(" ");
    default:
      return "";
  }
}
