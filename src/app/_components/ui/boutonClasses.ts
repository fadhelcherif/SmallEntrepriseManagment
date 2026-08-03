export type VarianteBouton = "primaire" | "sombre" | "discret" | "danger" | "succes";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition disabled:cursor-not-allowed disabled:opacity-60";

const VARIANTES: Record<VarianteBouton, string> = {
  primaire: `${BASE} bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:opacity-90`,
  sombre: `${BASE} bg-stone-900 text-white hover:bg-stone-800`,
  discret: `${BASE} border border-stone-300 bg-white text-stone-700 hover:border-stone-900 hover:text-stone-900`,
  danger: `${BASE} border border-red-600 bg-white text-red-600 hover:bg-red-600 hover:text-white`,
  succes: `${BASE} border border-emerald-600 bg-white text-emerald-700 hover:bg-emerald-600 hover:text-white`,
};

export function boutonClasses(variante: VarianteBouton = "primaire", classeSupplementaire = ""): string {
  return `${VARIANTES[variante]} ${classeSupplementaire}`.trim();
}
