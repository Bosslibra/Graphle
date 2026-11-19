// The registry imports the game components; only their ids are needed here.
jest.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));
jest.mock("@/i18n/navigation", () => ({}));

import en from "@/i18n/messages/en.json";
import it from "@/i18n/messages/it.json";
import { GAMES } from "@/components/game/games/registry";

function keys(obj: unknown, prefix = ""): string[] {
  if (Array.isArray(obj) || typeof obj !== "object" || obj === null) return [prefix];
  return Object.entries(obj).flatMap(([k, v]) => keys(v, prefix ? `${prefix}.${k}` : k));
}

describe("i18n messages", () => {
  test("en and it define the same keys", () => {
    expect(keys(it).sort()).toEqual(keys(en).sort());
  });

  test.each(GAMES.map((g) => g.id))("game %s has name, rules and theory", (id) => {
    for (const messages of [en, it]) {
      const game = (messages.games as Record<string, { name: string; rules: string[]; theory: string[] }>)[id];
      expect(game.name).toBeTruthy();
      expect(game.rules.length).toBeGreaterThan(0);
      expect(game.theory.length).toBeGreaterThan(0);
    }
  });
});
