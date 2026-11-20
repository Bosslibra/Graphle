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
  DEFAULT_SITE_SKIN_ID,
  getSiteSkin,
  getSkinVariant,
  normalizeSiteSkinId,
  applySkinVariant,
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

function readSkinFromUrl(): SiteSkinId | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  const urlValue = new URLSearchParams(window.location.search).get("skin");
  return normalizeSiteSkinId(urlValue);
}

function syncSkinInUrl(skinId: SiteSkinId) {
  const url = new URL(window.location.href);
  url.searchParams.set("skin", skinId);
  window.history.replaceState(window.history.state, "", url.toString());
}

const noopSubscribe = () => () => {};

/** False during SSR and hydration, true afterwards. */
function useHydrated(): boolean {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

export function SiteSkinProvider({ children }: { children: ReactNode }) {
  // Until hydration is done, expose exactly what the server rendered (default skin, light mode);
  // otherwise skin-dependent markup (e.g. graph colours) would not match and React would warn.
  const hydrated = useHydrated();
  const { resolvedTheme, setTheme } = useTheme();
  const [skinId, setSkinId] = useState<SiteSkinId>(() => {
    if (typeof window === "undefined") {
      return DEFAULT_SITE_SKIN_ID;
    }

    const fromUrl = readSkinFromUrl();
    if (fromUrl) {
      return fromUrl;
    }

    const storedSkin = normalizeSiteSkinId(localStorage.getItem(SITE_SKIN_STORAGE_KEY));
    if (storedSkin) {
      return storedSkin;
    }

    return DEFAULT_SITE_SKIN_ID;
  });

  const setSkin = useCallback((nextSkinId: SiteSkinId) => {
    setSkinId(nextSkinId);
  }, []);

  useEffect(() => {
    localStorage.setItem(SITE_SKIN_STORAGE_KEY, skinId);
    syncSkinInUrl(skinId);
  }, [skinId]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== SITE_SKIN_STORAGE_KEY || !event.newValue) {
        return;
      }

      const next = normalizeSiteSkinId(event.newValue);
      if (next) {
        setSkinId(next);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const effectiveSkinId = hydrated ? skinId : DEFAULT_SITE_SKIN_ID;
  const skin = useMemo(() => getSiteSkin(effectiveSkinId), [effectiveSkinId]);
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
      currentSkinId: effectiveSkinId,
      currentSkin: skin,
      currentMode,
      currentVariant,
      skins: siteSkinOptions,
      setSkin,
      setMode,
    }),
    [currentMode, currentVariant, effectiveSkinId, setMode, setSkin, skin],
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
