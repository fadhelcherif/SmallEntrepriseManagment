import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  hint?: string;
  couleur?: string;
};

export function StatCard({ icon: Icon, label, value, hint, couleur = "var(--color-primary)" }: StatCardProps) {
  return (
    <article className="shadow-card rounded-3xl bg-white p-5">
      <div
        className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl"
        style={{ backgroundColor: `color-mix(in srgb, ${couleur} 16%, white)`, color: couleur }}
      >
        <Icon className="h-5.5 w-5.5" strokeWidth={1.75} />
      </div>
      <p className="text-sm text-stone-500">{label}</p>
      <p className="mt-1 font-heading text-2xl font-bold text-stone-900">{value}</p>
      {hint ? <p className="mt-1 text-xs text-stone-400">{hint}</p> : null}
    </article>
  );
}
