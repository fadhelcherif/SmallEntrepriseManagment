import type { ReactNode } from "react";

export type VarianteBadge = "neutre" | "info" | "succes" | "avertissement" | "danger";

const BASE = "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap";

const STATIQUES: Record<Exclude<VarianteBadge, "info">, string> = {
  neutre: "border-stone-200 bg-stone-100 text-stone-700",
  succes: "border-emerald-200 bg-emerald-50 text-emerald-700",
  avertissement: "border-amber-200 bg-amber-50 text-amber-800",
  danger: "border-red-200 bg-red-50 text-red-700",
};

const POINT_STATIQUES: Record<Exclude<VarianteBadge, "info">, string> = {
  neutre: "bg-stone-400",
  succes: "bg-emerald-500",
  avertissement: "bg-amber-500",
  danger: "bg-red-500",
};

type BadgeProps = {
  variante?: VarianteBadge;
  children: ReactNode;
};

export function Badge({ variante = "neutre", children }: BadgeProps) {
  if (variante === "info") {
    return (
      <span
        className={BASE}
        style={{
          borderColor: "color-mix(in srgb, var(--color-primary) 35%, transparent)",
          backgroundColor: "color-mix(in srgb, var(--color-primary) 12%, white)",
          color: "var(--color-primary)",
        }}
      >
        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "var(--color-primary)" }} />
        {children}
      </span>
    );
  }

  return (
    <span className={`${BASE} ${STATIQUES[variante]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${POINT_STATIQUES[variante]}`} />
      {children}
    </span>
  );
}
