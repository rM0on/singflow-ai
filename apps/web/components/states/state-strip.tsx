import { CheckCircle2, CircleDashed, Loader2, MousePointer2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { ApiConnectionState } from "@/lib/api";

const stateItems = [
  {
    label: "Mock",
    icon: CheckCircle2,
    variant: "mint" as const
  },
  {
    label: "Empty",
    icon: CircleDashed,
    variant: "default" as const
  },
  {
    label: "Loading",
    icon: Loader2,
    variant: "cyan" as const
  },
  {
    label: "Hover",
    icon: MousePointer2,
    variant: "violet" as const
  }
];

export function StateStrip({
  apiState,
  apiLabel
}: {
  apiState?: ApiConnectionState;
  apiLabel?: string;
}) {
  const items = apiState
    ? [
        {
          label: apiLabel ?? getStateLabel(apiState),
          icon: apiState === "fallback" ? CircleDashed : CheckCircle2,
          variant: getStateVariant(apiState)
        },
        ...stateItems.slice(1)
      ]
    : stateItems;

  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5 opacity-75">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Badge key={item.label} variant={item.variant}>
            <Icon className="h-3 w-3" />
            {item.label}
          </Badge>
        );
      })}
    </div>
  );
}

function getStateLabel(state: ApiConnectionState) {
  if (state === "connected") return "API connected";
  if (state === "fallback") return "API fallback";
  return "Mock data";
}

function getStateVariant(state: ApiConnectionState) {
  if (state === "connected") return "mint" as const;
  if (state === "fallback") return "amber" as const;
  return "default" as const;
}

export function EmptyState({
  title,
  description
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-card border border-dashed border-white/[0.12] bg-white/[0.025] p-4 text-sm text-[#AEB4C2]">
      <p className="text-sm font-medium text-[#F7F8FA]">{title}</p>
      <p className="mt-2 leading-6">{description}</p>
    </div>
  );
}

export function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-card border border-border bg-white/[0.03] px-4 py-3 text-sm text-[#C8CDD8]">
      <Loader2 className="h-3.5 w-3.5 animate-spin text-accent-cyan" />
      <span>{label}</span>
    </div>
  );
}
