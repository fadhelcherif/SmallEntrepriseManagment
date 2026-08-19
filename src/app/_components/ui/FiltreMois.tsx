import Link from "next/link";
import { Calendar, Filter } from "lucide-react";

type FiltreMoisProps = {
  mois: string;
  estMoisCourant: boolean;
};

export function FiltreMois({ mois, estMoisCourant }: FiltreMoisProps) {
  return (
    <form method="get" className="shadow-card flex flex-wrap items-center gap-2 rounded-full bg-white py-2 pr-2 pl-4">
      <Calendar className="h-4 w-4 shrink-0 text-stone-400" strokeWidth={1.75} />
      <input
        type="month"
        name="mois"
        defaultValue={mois}
        className="border-none bg-transparent text-sm font-medium text-stone-700 outline-none"
      />

      <button
        type="submit"
        className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap transition hover:opacity-90"
        style={{ backgroundColor: "var(--color-primary)", color: "var(--color-primary-foreground)" }}
      >
        <Filter className="h-3.5 w-3.5" strokeWidth={2} />
        Afficher
      </button>

      {estMoisCourant ? null : (
        <Link
          href="?"
          className="px-1 text-xs font-medium whitespace-nowrap text-stone-500 underline decoration-stone-300 underline-offset-4 hover:text-stone-900"
        >
          Revenir au mois en cours
        </Link>
      )}
    </form>
  );
}
