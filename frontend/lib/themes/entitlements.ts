import { getSiteSkin, normalizeSiteSkinId } from "@/lib/themes/registry";
import type { SiteSkin, SiteSkinId } from "@/lib/themes/types";

/**
 * Which premium skins the visitor may use.
 *
 * This is the ONLY place that decides access. When payments arrive, change `getEntitlements`
 * (e.g. read a signed licence from a cookie, verified on the server in the root layout) and
 * everything else (layout, provider, switcher) follows.
 */
export interface Entitlements {
  premiumSkins: ReadonlySet<SiteSkinId> | "all";
}

/** Beta: every premium skin is free. Set to false to test the locked state. */
export const BETA_UNLOCK_ALL = true;

const NONE: Entitlements = { premiumSkins: new Set() };
const ALL: Entitlements = { premiumSkins: "all" };

/** Must give the same answer on server and client, or skin markup will not hydrate. */
export function getEntitlements(): Entitlements {
  return BETA_UNLOCK_ALL ? ALL : NONE;
}

export function canUseSkin(skin: SiteSkin | SiteSkinId, entitlements: Entitlements = getEntitlements()): boolean {
  const resolved = typeof skin === "string" ? getSiteSkin(skin) : skin;
  if (resolved.tier !== "premium") {
    return true;
  }
  return entitlements.premiumSkins === "all" || entitlements.premiumSkins.has(resolved.id);
}

/** `normalizeSiteSkinId` plus the access check: a locked skin resolves to undefined. */
export function resolveUsableSkinId(
  value: string | null | undefined,
  entitlements: Entitlements = getEntitlements(),
): SiteSkinId | undefined {
  const id = normalizeSiteSkinId(value);
  return id && canUseSkin(id, entitlements) ? id : undefined;
}
