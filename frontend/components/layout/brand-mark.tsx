import { Network } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Logo tile. Colours come from the skin (--primary); a skin can also provide
 * its own icon through assets.siteChromeIconSvg (--skin-brand-icon), drawn as a background image (none by default).
 */
export default function BrandMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm",
        className,
      )}
    >
      <span className="pointer-events-none absolute inset-[18%] [background-image:var(--skin-brand-icon)] [background-position:center] [background-repeat:no-repeat] [background-size:contain]" />
      <Network className="relative h-[55%] w-[55%]" strokeWidth={1.75} />
    </span>
  );
}
