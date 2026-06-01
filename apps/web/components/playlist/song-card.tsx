import { Badge } from "@/components/ui/badge";
import { CoverArt } from "@/components/visual/cover-art";
import type { MockSong } from "@/lib/mock-data";

function Meter({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[11px] text-[#828A9B]">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="mt-2 h-1 rounded-full bg-white/[0.07]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent-cyan via-accent-mint to-accent-amber"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export function SongCard({ song, compact = false }: { song: MockSong; compact?: boolean }) {
  return (
    <article className="group relative overflow-hidden rounded-card border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.052),rgba(255,255,255,0.026))] p-3 transition duration-200 hover:-translate-y-px hover:border-accent-cyan/28 hover:bg-white/[0.058] hover:shadow-[0_18px_46px_rgba(0,0,0,0.24)]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition group-hover:opacity-100" />
      <div className="flex gap-3">
        <CoverArt song={song} size={compact ? "sm" : "md"} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-[15px] font-semibold leading-5 text-[#F7F8FA]">
                {song.title}
              </h3>
              <p className="mt-1 truncate text-xs text-[#9EA6B7]">{song.artist}</p>
            </div>
            <Badge variant={song.fitScore >= 92 ? "mint" : "cyan"}>{song.fitScore}% fit</Badge>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Badge>{song.language}</Badge>
            <Badge>{song.mood}</Badge>
            <Badge variant={song.energy > 78 ? "coral" : "default"}>{song.energy} energy</Badge>
          </div>
        </div>
      </div>

      {!compact && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Meter label="Vocal load" value={song.vocalDifficulty} />
          <Meter label="Energy" value={song.energy} />
        </div>
      )}

      <p className="mt-4 border-t border-white/[0.07] pt-3 text-sm leading-6 text-[#B8BECC]">
        {song.reason}
      </p>
    </article>
  );
}
