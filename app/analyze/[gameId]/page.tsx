import GameReviewPage from "@/features/analysis/components/GameReviewPage";

interface AnalyzePageProps {
  params: Promise<{ gameId: string }>;
}

export default async function AnalyzeRoute({ params }: AnalyzePageProps) {
  const { gameId } = await params;
  return <GameReviewPage gameId={decodeURIComponent(gameId)} />;
}
