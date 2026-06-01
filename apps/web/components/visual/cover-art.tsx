import { Music2 } from "lucide-react";

import { cn } from "@/lib/utils";
import type { MockSong } from "@/lib/mock-data";

const toneClass: Record<MockSong["coverTone"], string> = {
  cyan: "from-accent-cyan/55 via-[#16243A] to-[#0B0D13]",
  mint: "from-accent-mint/50 via-[#153229] to-[#0B0D13]",
  amber: "from-accent-amber/50 via-[#332B17] to-[#0B0D13]",
  coral: "from-accent-coral/50 via-[#361C24] to-[#0B0D13]",
  violet: "from-accent-violet/55 via-[#201B36] to-[#0B0D13]"
};

const sizeClass = {
  sm: "h-14 w-14 rounded-card",
  md: "h-20 w-20 rounded-[16px]",
  lg: "h-32 w-32 rounded-[22px]"
};

export function CoverArt({
  song,
  size = "md",
  className
}: {
  song: MockSong;
  size?: keyof typeof sizeClass;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden border border-white/[0.12] bg-gradient-to-br shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_18px_42px_rgba(0,0,0,0.28)]",
        toneClass[song.coverTone],
        sizeClass[size],
        className
      )}
      aria-label={`Original abstract cover placeholder for ${song.title}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_18%,rgba(255,255,255,0.28),transparent_26%),linear-gradient(135deg,rgba(255,255,255,0.16),transparent_34%,rgba(255,255,255,0.06)_62%,transparent)]" />
      <div className="absolute inset-x-2 bottom-3 flex h-8 items-end gap-1 opacity-80">
        {[44, 70, 36, 86, 58, 48, 76, 42].map((height, index) => (
          <span
            key={`${song.id}-${height}-${index}`}
            className="flex-1 rounded-full bg-white/55 shadow-[0_0_16px_rgba(255,255,255,0.16)]"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
      <div className="absolute left-2 top-2 flex items-center gap-1.5 rounded-full border border-white/[0.12] bg-black/20 px-2 py-1 text-white/70 backdrop-blur-md">
        <Music2 className="h-3 w-3" />
        <span className="h-1 w-5 rounded-full bg-white/35" />
      </div>
    </div>
  );
}
