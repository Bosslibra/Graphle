"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { useWorld } from "@/components/game/worlds/registry";
import type { GameId } from "@/components/game/worlds/types";

type Values = Record<string, string | number>;

/**
 * `useTranslations("games.<game>")`, but an illustrated skin may override short texts
 * under `worlds.<world>.<game>.<key>` (e.g. "Tolls: 12 coins"). Missing keys fall back to the game's.
 */
export function useGameText(game: GameId): (key: string, values?: Values) => string {
  const world = useWorld();
  const base = useTranslations(`games.${game}`);
  const worlds = useTranslations("worlds");

  return useCallback(
    (key: string, values?: Values) => {
      const override = world ? `${world.id}.${game}.${key}` : undefined;
      return override && worlds.has(override) ? worlds(override, values) : base(key, values);
    },
    [world, game, base, worlds],
  );
}
