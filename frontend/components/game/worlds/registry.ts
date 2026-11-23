"use client";

import { useSiteSkin } from "@/contexts/site-skin-context";
import type { WorldId } from "@/lib/themes/types";
import { realmWorld } from "@/components/game/worlds/realm";
import type { GameArt, GameId, WorldDefinition } from "@/components/game/worlds/types";

export const WORLDS: Record<WorldId, WorldDefinition> = {
  realm: realmWorld,
};

/** World of the active skin, or undefined for abstract skins. */
export function useWorld(): WorldDefinition | undefined {
  const world = useSiteSkin().currentSkin.world;
  return world ? WORLDS[world] : undefined;
}

/** Art for one game in the active skin's world, or undefined (abstract board). */
export function useGameArt(game: GameId | undefined): GameArt | undefined {
  const world = useWorld();
  return game ? world?.games[game] : undefined;
}
