"use client";

import { Check, Palette } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useSiteSkin } from "@/contexts/site-skin-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function SkinSwitch() {
  const t = useTranslations("skin-switch");
  const { currentSkinId, currentSkin, skins, setSkin } = useSiteSkin();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="bg-popover hover:bg-accent"
          title={t("select")}
        >
          <Palette className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">{t("select")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="px-2 py-1.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("title")}
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">{currentSkin.name}</p>
        </div>
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          {skins.map((candidate) => {
            const isActive = candidate.id === currentSkinId;
            const previewGraph = candidate.variants.light.graph;

            return (
              <DropdownMenuItem
                key={candidate.id}
                onClick={() => setSkin(candidate.id)}
                className={cn(
                  "relative flex cursor-pointer flex-col items-start gap-2",
                  isActive && "bg-accent",
                )}
              >
                <div className="flex w-full items-start gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{candidate.name}</span>
                      {isActive && <Check className="ml-auto h-4 w-4 text-accent-foreground" />}
                    </div>
                    <p className="mt-0.5 text-xs leading-tight text-muted-foreground">
                      {candidate.description}
                    </p>
                  </div>
                </div>

                <div className="flex h-6 w-full overflow-hidden rounded border border-border/50">
                  {Array.from({ length: 9 }).map((_, index) => {
                    const ratio = index / 8;
                    const hue =
                      previewGraph.hues.start +
                      (previewGraph.hues.end - previewGraph.hues.start) * ratio;

                    return (
                      <div
                        key={index}
                        className="h-full flex-1"
                        style={{
                          backgroundColor: `oklch(${previewGraph.node.lightness} ${previewGraph.node.chroma} ${hue})`,
                        }}
                      />
                    );
                  })}
                </div>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />
        <div className="px-2 py-2">
          <p className="text-xs italic text-muted-foreground">{t("hint")}</p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
