"use client";

import type { CSSProperties } from "react";
import { Check, Crown, Lock, Palette } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useSiteSkin } from "@/contexts/site-skin-context";
import { canUseSkin, type SiteSkin } from "@/lib/skins";
import { Guard, Stand } from "@/components/game/worlds/realm/shared";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/** Strip of the skin's node hues (abstract skins). */
function HuePreview({ skin }: { skin: SiteSkin }) {
  const graph = skin.variants.light.graph;
  return (
    <div className="flex h-6 w-full overflow-hidden rounded border border-border/50">
      {Array.from({ length: 9 }).map((_, index) => {
        const hue = graph.hues.start + (graph.hues.end - graph.hues.start) * (index / 8);
        return (
          <div
            key={index}
            className="h-full flex-1"
            style={{ backgroundColor: `oklch(${graph.node.lightness} ${graph.node.chroma} ${hue})` }}
          />
        );
      })}
    </div>
  );
}

/** Small scene drawn with the skin's own art colours (not the active skin's). */
function WorldPreview({ skin }: { skin: SiteSkin }) {
  const variant = skin.variants.light;
  const art = variant.art;
  const vars = {
    "--art-ink": art?.ink,
    "--art-paper": art?.paper,
    "--art-shade": art?.shade,
    "--art-gold": art?.gold,
    "--art-road": art?.road,
    "--art-torch": art?.torch,
    "--primary": variant.colors.primary,
    "--muted-foreground": variant.colors.mutedForeground,
  } as CSSProperties;
  return (
    <div
      className="h-12 w-full overflow-hidden rounded border border-border/50"
      style={{ ...vars, background: variant.graph.boardBackground }}
    >
      {/* `size-full`: menu items shrink every svg without a size-* class to icon size. */}
      <svg viewBox="0 0 200 48" className="size-full" aria-hidden>
        <path d="M0 40 C 50 30, 70 44, 110 36 S 170 30, 200 38" stroke="var(--art-road)" strokeWidth={6} fill="none" />
        <path d="M0 40 C 50 30, 70 44, 110 36 S 170 30, 200 38" stroke="var(--art-torch)" strokeWidth={2} fill="none" />
        <g transform="translate(100 30) scale(0.75)">
          <Stand />
          <Guard />
        </g>
      </svg>
    </div>
  );
}

export function SkinSwitch() {
  const t = useTranslations("skin-switch");
  const { currentSkinId, currentSkin, skins, setSkin } = useSiteSkin();
  const groups = [
    { key: "classic", items: skins.filter((s) => s.tier === "free") },
    { key: "premium", items: skins.filter((s) => s.tier === "premium") },
  ].filter((g) => g.items.length > 0);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="bg-popover hover:bg-accent" title={t("select")}>
          <Palette className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">{t("select")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-[80dvh] w-80 overflow-y-auto">
        <div className="px-2 py-1.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("title")}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{currentSkin.name}</p>
        </div>

        {groups.map((group) => (
          <DropdownMenuGroup key={group.key}>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
              {group.key === "premium" && <Crown className="h-3.5 w-3.5" />}
              {t(group.key)}
            </DropdownMenuLabel>
            {group.items.map((candidate) => {
              const isActive = candidate.id === currentSkinId;
              const locked = !canUseSkin(candidate);

              return (
                <DropdownMenuItem
                  key={candidate.id}
                  disabled={locked}
                  onClick={() => setSkin(candidate.id)}
                  className={cn("relative flex cursor-pointer flex-col items-start gap-2", isActive && "bg-accent")}
                >
                  <div className="w-full">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{candidate.name}</span>
                      {candidate.world && (
                        <span className="rounded-full border border-border px-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                          {t("premiumBadge")}
                        </span>
                      )}
                      {isActive && <Check className="ml-auto h-4 w-4 text-accent-foreground" />}
                      {locked && (
                        <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                          <Lock className="h-3.5 w-3.5" />
                          {t("locked")}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs leading-tight text-muted-foreground">{candidate.description}</p>
                  </div>
                  {candidate.world ? <WorldPreview skin={candidate} /> : <HuePreview skin={candidate} />}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuGroup>
        ))}

        <DropdownMenuSeparator />
        <div className="px-2 py-2">
          <p className="text-xs italic text-muted-foreground">{t("hint")}</p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
