import type { MoveQuality } from "@/features/analysis/lib/classifyMove";
import {
  MOVE_QUALITY_LABEL,
  MOVE_QUALITY_LABEL_FR,
} from "@/features/analysis/lib/classifyMove";
import { describeMoveFacts } from "@/features/analysis/lib/moveDiagnosis";
import type { AppLanguage } from "@/features/settings/lib/settingsTypes";

/**
 * Builds a short coaching summary for the reviewed ply.
 * Detailed "why" text is provided separately via explainWhyWrong.
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
    // Keep it short: SAN + optional fact (capture/check…). Quality lives in the badge.
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
  const best = params.bestMoveSan;
  const san = params.playedSan;
  const facts = describeMoveFacts({
    fenBefore: params.fenBefore ?? null,
    playedSan: params.playedSan,
    language: lang,
  });
  const factBit = facts ? ` (${facts})` : "";

  switch (params.quality) {
    case "brilliant":
      return fr
        ? `${san} est Brillant${params.isSacrifice ? " (sacrifice sain)" : ""}${factBit}. Vous gardez l’avantage tout en offrant du matériel — continuez cette idée.`
        : `${san} is Brilliant${params.isSacrifice ? " (sound sacrifice)" : ""}${factBit}. You keep the edge while offering material — stay on this idea.`;
    case "great":
      return fr
        ? `${san} est Superbe${factBit}. Ce coup fait basculer l’évaluation en votre faveur : très bonne trouvaille.`
        : `${san} is a Great move${factBit}. It swings the evaluation your way — a strong find.`;
    case "best":
      return fr
        ? `${san} est le meilleur coup du moteur${factBit}. Parfait — restez sur cette ligne.`
        : `${san} is the engine’s best${factBit}. Perfect — stay on this line.`;
    case "excellent":
      return fr
        ? `${san} est Excellent (${label})${factBit}. Perte minime${loss !== null ? ` (~${loss} cp)` : ""}${best && !params.isEngineBest ? ` ; le moteur préférait ${best}` : ""}.`
        : `${san} is Excellent${factBit}. Tiny loss${loss !== null ? ` (~${loss} cp)` : ""}${best && !params.isEngineBest ? `; engine preferred ${best}` : ""}.`;
    case "good":
      return fr
        ? `${san} est un bon coup${factBit}. Solide${best ? `, même si ${best} était un peu plus précis` : ""}.`
        : `${san} is a good move${factBit}. Solid${best ? `, even if ${best} was a bit more accurate` : ""}.`;
    case "inaccuracy":
      return fr
        ? `${san} est une imprécision${loss !== null ? ` (−${loss} cp)` : ""}${factBit}.${best ? ` Préférez ${best}.` : ""}`
        : `${san} is an inaccuracy${loss !== null ? ` (−${loss} cp)` : ""}${factBit}.${best ? ` Prefer ${best}.` : ""}`;
    case "mistake":
      return fr
        ? `${san} est une erreur${loss !== null ? ` (−${loss} cp)` : ""}${factBit}.${best ? ` Le bon coup était ${best}.` : ""}`
        : `${san} is a mistake${loss !== null ? ` (−${loss} cp)` : ""}${factBit}.${best ? ` The right move was ${best}.` : ""}`;
    case "miss":
      return fr
        ? `Occasion manquée avec ${san}${loss !== null ? ` (−${loss} cp)` : ""}${factBit}. Vous aviez une chance gagnante.${best ? ` Il fallait ${best}.` : ""}`
        : `Miss with ${san}${loss !== null ? ` (−${loss} cp)` : ""}${factBit}. You had a winning chance.${best ? ` Play ${best} instead.` : ""}`;
    case "blunder":
      return fr
        ? `${san} est une gaffe${loss !== null ? ` (−${loss} cp)` : ""}${factBit}.${best ? ` Corrigez avec ${best}.` : ""}`
        : `${san} is a blunder${loss !== null ? ` (−${loss} cp)` : ""}${factBit}.${best ? ` Fix it with ${best}.` : ""}`;
    default:
      return "";
  }
}
