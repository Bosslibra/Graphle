import { setRequestLocale } from "next-intl/server";
import PlayModeContent from "@/components/game/modes/play-mode-content";

interface PlayPageProps {
  params: Promise<{ locale: string; mode: string }>;
  searchParams: Promise<{ seed?: string }>;
}

export default async function PlayPage({ params, searchParams }: PlayPageProps) {
  const { locale, mode } = await params;
  const { seed } = await searchParams;
  setRequestLocale(locale);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-8 [background:var(--graphle-page-bg)]">
      
        <PlayModeContent mode={mode} seed={seed} />
      
    </div>
  );
}