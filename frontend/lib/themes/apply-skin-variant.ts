import {
  getSiteSkin,
  getSkinVariant,
} from "@/lib/themes/registry";
import { type ColorMode, type SiteSkin, type SiteSkinId } from "@/lib/themes/types";
import { getSkinCssVariables } from "@/lib/themes/css-variables";

export function applySkinVariant(
  skinInput: SiteSkinId | SiteSkin,
  mode: ColorMode,
  target: HTMLElement = document.documentElement,
) {
  const skin = typeof skinInput === "string" ? getSiteSkin(skinInput) : skinInput;
  const variant = getSkinVariant(skin, mode);
  const cssVariables = getSkinCssVariables(variant);

  target.dataset.skin = skin.id;
  target.dataset.skinMode = mode;

  for (const [variable, value] of Object.entries(cssVariables)) {
    target.style.setProperty(variable, value);
  }
}
