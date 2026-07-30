import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  hint?: string;
};

export function StatCard({ icon: Icon, label, value, hint }: StatCardProps) {
  return (
    <article className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-stone-500">{label}</p>
        <div
          className="flex h-9 w-9 items-center justify-center rounded-md"
          style={{ backgroundColor: "color-mix(in srgb, var(--color-primary) 12%, white)", color: "var(--color-primary)" }}
        >
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </div>
      </div>
      <p className="mt-3 font-heading text-2xl font-semibold text-stone-900">{value}</p>
      {hint ? <p className="mt-1 text-sm text-stone-500">{hint}</p> : null}
    </article>
  );
}
