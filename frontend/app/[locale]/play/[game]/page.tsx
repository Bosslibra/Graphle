import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import PlayView from "@/components/game/play-view";
import { getGame, isMode } from "@/components/game/games/registry";
import { dailySeed, isValidSeed, randomSeed } from "@/lib/graph/random";

interface PlayPageProps {
  params: Promise<{ locale: string; game: string }>;
  searchParams: Promise<{ mode?: string; seed?: string }>;
}

export async function generateMetadata({ params }: PlayPageProps): Promise<Metadata> {
  const { locale, game } = await params;
  if (!getGame(game)) return {};
  const t = await getTranslations({ locale, namespace: `games.${game}` });
  return { title: t("name"), description: t("tagline") };
}

export default async function PlayPage({ params, searchParams }: PlayPageProps) {
  const { locale, game } = await params;
  const { mode: rawMode, seed: rawSeed } = await searchParams;
  setRequestLocale(locale);

  const mode = rawMode ?? "daily";
  if (!getGame(game) || !isMode(mode)) notFound();

  // Daily ignores the URL seed; challenge keeps it so a shared link opens the same graph.
  const seed =
    mode === "daily"
      ? dailySeed(game)
      : mode === "challenge" && isValidSeed(rawSeed)
        ? rawSeed
        : randomSeed();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <PlayView key={`${game}-${mode}-${seed}`} gameId={game} mode={mode} initialSeed={seed} />
    </div>
  );
}
