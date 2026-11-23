import en from "@/i18n/messages/en.json";
import it from "@/i18n/messages/it.json";
import {
  canUseSkin,
  getSiteSkin,
  getSkinCssVariables,
  getSkinVariant,
  resolveUsableSkinId,
  siteSkinOptions,
  type Entitlements,
} from "@/lib/skins";

const LOCKED: Entitlements = { premiumSkins: new Set() };

describe("skin entitlements", () => {
  test("the beta unlocks every skin", () => {
    for (const skin of siteSkinOptions) {
      expect(canUseSkin(skin)).toBe(true);
    }
    expect(resolveUsableSkinId("realm")).toBe("realm");
  });

  test("free skins are always usable, premium ones only when granted", () => {
    expect(canUseSkin("paperwave", LOCKED)).toBe(true);
    expect(canUseSkin("realm", LOCKED)).toBe(false);
    expect(canUseSkin("realm", { premiumSkins: new Set(["realm"]) })).toBe(true);
  });

  test("a locked premium skin does not resolve (callers fall back to the default)", () => {
    expect(resolveUsableSkinId("realm", LOCKED)).toBeUndefined();
    expect(resolveUsableSkinId("circuit", LOCKED)).toBe("circuit");
    expect(resolveUsableSkinId("aurora", LOCKED)).toBe("default");
    expect(resolveUsableSkinId("nope")).toBeUndefined();
  });

  test("illustrated skins are premium and define art colours in both modes", () => {
    const realm = getSiteSkin("realm");
    expect(realm.tier).toBe("premium");
    expect(realm.world).toBe("realm");
    for (const mode of ["light", "dark"] as const) {
      expect(getSkinVariant(realm, mode).art).toBeDefined();
    }
  });

  test("every skin defines the --art-* variables (fallbacks for abstract skins)", () => {
    for (const skin of siteSkinOptions) {
      const vars = getSkinCssVariables(getSkinVariant(skin, "dark"));
      for (const name of ["--art-ink", "--art-paper", "--art-shade", "--art-gold", "--art-road", "--art-torch"]) {
        expect(vars[name]).toBeTruthy();
      }
    }
  });
});

describe("world texts", () => {
  type Messages = typeof it;
  const keysOf = (m: Messages) =>
    Object.entries(m.worlds).flatMap(([world, games]) =>
      Object.entries(games).flatMap(([game, texts]) => Object.keys(texts).map((key) => `${world}.${game}.${key}`)),
    );

  test("it and en override the same keys", () => {
    expect(keysOf(it).sort()).toEqual(keysOf(en as Messages).sort());
  });

  test("every override replaces an existing game text", () => {
    for (const path of keysOf(it)) {
      const [, game, key] = path.split(".");
      expect(it.games[game as keyof Messages["games"]]).toHaveProperty(key);
    }
  });
});
