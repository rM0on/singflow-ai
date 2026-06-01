import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-[6px] border px-2 py-1 text-[11px] font-medium leading-none tracking-normal transition-colors",
  {
    variants: {
      variant: {
        default: "border-white/[0.09] bg-white/[0.035] text-[#C9D0DD]",
        mint: "border-accent-mint/[0.18] bg-accent-mint/[0.08] text-accent-mint",
        cyan: "border-accent-cyan/[0.18] bg-accent-cyan/[0.08] text-accent-cyan",
        amber: "border-accent-amber/[0.18] bg-accent-amber/[0.08] text-accent-amber",
        coral: "border-accent-coral/[0.18] bg-accent-coral/[0.08] text-accent-coral",
        violet: "border-accent-violet/[0.18] bg-accent-violet/[0.08] text-accent-violet"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}
