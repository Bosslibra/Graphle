import { Network } from "lucide-react";
import { cn } from "@/lib/utils";

/** Logo tile. Colours come from the skin (--primary). */
export default function BrandMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm",
        className,
      )}
    >
      <Network className="relative h-[55%] w-[55%]" strokeWidth={1.75} />
    </span>
  );
}
