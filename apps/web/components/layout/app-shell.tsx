"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  Activity,
  BarChart3,
  Bot,
  CircleDot,
  Home,
  ListMusic,
  Radio,
  SlidersHorizontal,
  UsersRound
} from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Studio", icon: Home, match: ["/"] },
  { href: "/planner", label: "Planner", icon: SlidersHorizontal, match: ["/planner"] },
  { href: "/timeline", label: "Timeline", icon: ListMusic, match: ["/timeline", "/sessions"] },
  { href: "/mixer", label: "Mixer", icon: UsersRound, match: ["/mixer"] },
  { href: "/agent-runs/demo", label: "Agent", icon: Bot, match: ["/agent-runs"] },
  { href: "/dashboard", label: "Memory", icon: BarChart3, match: ["/dashboard"] }
];

export function AppShell({
  eyebrow,
  title,
  description,
  children,
  aside
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  aside?: ReactNode;
}) {
  const pathname = usePathname();
  const isActive = (item: (typeof navItems)[number]) =>
    item.match.some((path) => (path === "/" ? pathname === "/" : pathname.startsWith(path)));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:72px_72px] opacity-30" />
      <div className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.08] bg-background/80 backdrop-blur-xl lg:hidden">
        <nav className="flex items-center gap-1 overflow-x-auto px-3 py-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex min-w-fit items-center gap-2 rounded-card px-3 py-2 text-xs font-medium text-[#AEB4C2] transition hover:bg-white/[0.07] hover:text-foreground",
                  active && "border border-white/[0.1] bg-white/[0.09] text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <aside className="fixed left-0 top-0 hidden h-screen w-[248px] border-r border-white/[0.08] bg-[#07090D]/90 px-4 py-5 backdrop-blur-2xl lg:block">
        <Link href="/" className="group flex items-center gap-3 rounded-panel px-2 py-2">
          <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-[14px] border border-white/[0.14] bg-[radial-gradient(circle_at_30%_20%,rgba(102,217,239,0.36),transparent_42%),radial-gradient(circle_at_70%_80%,rgba(47,230,166,0.2),transparent_38%),rgba(255,255,255,0.045)] text-accent-cyan shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_16px_38px_rgba(0,0,0,0.28)]">
            <Activity className="h-4 w-4" />
            <span className="absolute bottom-1.5 left-2 right-2 h-px bg-gradient-to-r from-transparent via-accent-mint/70 to-transparent" />
          </span>
          <span>
            <span className="block text-[15px] font-semibold leading-5">SingFlow AI</span>
            <span className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
              <Radio className="h-3 w-3" />
              Studio preview
            </span>
          </span>
        </Link>

        <nav className="mt-8 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-3 rounded-card px-3 py-2.5 text-sm text-[#AEB4C2] transition hover:bg-white/[0.06] hover:text-foreground",
                  active &&
                    "border border-white/[0.1] bg-[linear-gradient(90deg,rgba(102,217,239,0.13),rgba(255,255,255,0.055))] text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.09)]"
                )}
              >
                {active && (
                  <>
                    <span className="absolute left-0 top-1/2 h-5 w-px -translate-y-1/2 bg-accent-cyan" />
                    <span className="absolute right-3 h-1.5 w-1.5 rounded-full bg-accent-mint shadow-[0_0_14px_rgba(47,230,166,0.45)]" />
                  </>
                )}
                <Icon
                  className={cn(
                    "h-4 w-4 text-[#858C9D] transition group-hover:text-accent-cyan",
                    active && "text-accent-cyan"
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-5 left-4 right-4 rounded-card border border-white/[0.07] bg-white/[0.025] p-3">
          <p className="flex items-center gap-2 text-[11px] font-medium text-[#8F97A8]">
            <CircleDot className="h-3 w-3 text-accent-mint" />
            Phase 1.2 screenshot pass
          </p>
          <p className="mt-2 text-xs leading-5 text-[#7E8798]">
            Mock-only surfaces. No backend, media, or external music assets.
          </p>
        </div>
      </aside>

      <main className="relative px-4 pb-10 pt-20 sm:px-6 lg:ml-[248px] lg:px-8 lg:pt-8">
        <div className="mx-auto flex w-full max-w-[1520px] flex-col gap-8">
          <header className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <p className="text-sm font-medium text-accent-cyan">{eyebrow}</p>
              <h1 className="mt-3 max-w-5xl text-3xl font-semibold leading-[1.08] tracking-normal md:text-[46px]">
                {title}
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-[#AEB4C2] md:text-base">
                {description}
              </p>
            </div>
            {aside}
          </header>
          {children}
        </div>
      </main>
    </div>
  );
}
