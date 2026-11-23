"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useTheme } from "next-themes";
import {
  getSiteSkin,
  getSkinVariant,
  resolveUsableSkinId,
  canUseSkin,
  DEFAULT_SITE_SKIN_ID,
  applySkinVariant,
  SITE_SKIN_COOKIE,
  SITE_SKIN_STORAGE_KEY,
  siteSkinOptions,
  type ColorMode,
  type SkinVariant,
  type SiteSkin,
  type SiteSkinId,
} from "@/lib/skins";

interface SiteSkinContextValue {
  currentSkinId: SiteSkinId;
  currentSkin: SiteSkin;
  currentMode: ColorMode;
  currentVariant: SkinVariant;
  skins: SiteSkin[];
  setSkin: (skinId: SiteSkinId) => void;
  setMode: (mode: ColorMode) => void;
}

const SiteSkinContext = createContext<SiteSkinContextValue | undefined>(undefined);

const ONE_YEAR = 60 * 60 * 24 * 365;

function readSkinFromUrl(): SiteSkinId | undefined {
  return resolveUsableSkinId(new URLSearchParams(window.location.search).get("skin"));
}

function syncSkinInUrl(skinId: SiteSkinId) {
  const url = new URL(window.location.href);
  url.searchParams.set("skin", skinId);
  window.history.replaceState(window.history.state, "", url.toString());
}

function persistSkin(skinId: SiteSkinId) {
  document.cookie = `${SITE_SKIN_COOKIE}=${skinId}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
  // localStorage is kept only to sync other open tabs (storage event).
  localStorage.setItem(SITE_SKIN_STORAGE_KEY, skinId);
}

const noopSubscribe = () => () => {};

/** False during SSR and hydration, true afterwards. */
function useHydrated(): boolean {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

/**
 * `initialSkinId` comes from the skin cookie, read by the root layout. The server renders that
 * skin's CSS, so the first paint is already correct and server/client markup match.
 */
export function SiteSkinProvider({
  children,
  initialSkinId,
}: {
  children: ReactNode;
  initialSkinId: SiteSkinId;
}) {
  const hydrated = useHydrated();
  const { resolvedTheme, setTheme } = useTheme();
  const [skinId, setSkinId] = useState<SiteSkinId>(initialSkinId);

  const setSkin = useCallback((nextSkinId: SiteSkinId) => {
    // Locked premium skins cannot be applied (the switcher shows them as locked).
    const allowed = canUseSkin(nextSkinId) ? nextSkinId : DEFAULT_SITE_SKIN_ID;
    setSkinId(allowed);
    persistSkin(allowed);
  }, []);

  // After hydration: a ?skin= link wins; otherwise migrate a skin saved before the cookie existed.
  useEffect(() => {
    const preferred =
      readSkinFromUrl() ??
      (document.cookie.includes(`${SITE_SKIN_COOKIE}=`)
        ? undefined
        : resolveUsableSkinId(localStorage.getItem(SITE_SKIN_STORAGE_KEY)));
    if (preferred && preferred !== initialSkinId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-off sync with browser-only state
      setSkinId(preferred);
    }
    persistSkin(preferred ?? initialSkinId);
  }, [initialSkinId]);

  useEffect(() => {
    syncSkinInUrl(skinId);
  }, [skinId]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== SITE_SKIN_STORAGE_KEY || !event.newValue) {
        return;
      }

      const next = resolveUsableSkinId(event.newValue);
      if (next) {
        setSkinId(next);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const skin = useMemo(() => getSiteSkin(skinId), [skinId]);
  // The colour mode is only known in the browser (system preference), so stay "light" until hydrated.
  const currentMode: ColorMode = hydrated && resolvedTheme === "dark" ? "dark" : "light";
  const currentVariant = useMemo(() => getSkinVariant(skin, currentMode), [currentMode, skin]);

  const setMode = useCallback(
    (mode: ColorMode) => {
      setTheme(mode);
    },
    [setTheme],
  );

  useEffect(() => {
    applySkinVariant(skin, currentMode);
  }, [currentMode, skin]);

  const contextValue = useMemo<SiteSkinContextValue>(
    () => ({
      currentSkinId: skinId,
      currentSkin: skin,
      currentMode,
      currentVariant,
      skins: siteSkinOptions,
      setSkin,
      setMode,
    }),
    [currentMode, currentVariant, skinId, setMode, setSkin, skin],
  );

  return <SiteSkinContext.Provider value={contextValue}>{children}</SiteSkinContext.Provider>;
}

export function useSiteSkin(): SiteSkinContextValue {
  const context = useContext(SiteSkinContext);

  if (!context) {
    throw new Error("useSiteSkin must be used within a SiteSkinProvider");
  }

  return context;
}

export function useCurrentSkinVariant(): SkinVariant {
  return useSiteSkin().currentVariant;
}
