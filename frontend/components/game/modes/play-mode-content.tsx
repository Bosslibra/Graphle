import { notFound } from "next/navigation";
import ChallengeMode from "@/components/game/modes/challenge-mode";
import DailyMode from "@/components/game/modes/daily-mode";
import PracticeMode from "@/components/game/modes/practice-mode";
import TimedMode from "@/components/game/modes/timed-mode";
import { fetchGraphFromBackend } from "@/lib/api/graph";

type Mode = "daily" | "practice" | "timed" | "challenge";

interface PlayModeContentProps {
  mode: string;
  seed?: string;
}

export default async function PlayModeContent({ mode, seed }: PlayModeContentProps) {
  const modeName = mode as Mode;

  if (!["daily", "practice", "timed", "challenge"].includes(modeName)) {
    notFound();
  }

  const graph = await fetchGraphFromBackend(seed);

  if (modeName === "daily") {
    return <DailyMode graph={graph} />;
  }

  if (modeName === "practice") {
    return <PracticeMode graph={graph} />;
  }

  if (modeName === "timed") {
    return <TimedMode graph={graph} />;
  }

  return <ChallengeMode graph={graph} />;
}
