export type VarianteBouton = "primaire" | "discret" | "danger" | "succes";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60";

const VARIANTES: Record<VarianteBouton, string> = {
  primaire: `${BASE} bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:opacity-90`,
  discret: `${BASE} border border-stone-300 bg-white text-stone-700 hover:border-stone-900 hover:text-stone-900`,
  danger: `${BASE} border border-red-200 bg-red-50 text-red-700 hover:border-red-300 hover:bg-red-100`,
  succes: `${BASE} border border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100`,
};

export function boutonClasses(variante: VarianteBouton = "primaire", classeSupplementaire = ""): string {
  return `${VARIANTES[variante]} ${classeSupplementaire}`.trim();
}
