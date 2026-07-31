import Link from "next/link";
import { Filter } from "lucide-react";

import { boutonClasses } from "./boutonClasses";
import { champClasses } from "./champClasses";

type FiltreDatesProps = {
  du?: string;
  au?: string;
};

export function FiltreDates({ du, au }: FiltreDatesProps) {
  const filtreActif = Boolean(du || au);

  return (
    <form method="get" className="flex flex-wrap items-end gap-3 rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <label className="grid gap-1.5">
        <span className="text-xs font-medium uppercase tracking-wide text-stone-500">Du</span>
        <input type="date" name="du" defaultValue={du} className={champClasses} />
      </label>

      <label className="grid gap-1.5">
        <span className="text-xs font-medium uppercase tracking-wide text-stone-500">Au</span>
        <input type="date" name="au" defaultValue={au} className={champClasses} />
      </label>

      <button type="submit" className={boutonClasses("discret")}>
        <Filter className="h-4 w-4" strokeWidth={1.75} />
        Filtrer
      </button>

      {filtreActif ? (
        <Link
          href="?"
          className="text-sm font-medium text-stone-500 underline decoration-stone-300 underline-offset-4 hover:text-stone-900"
        >
          Réinitialiser
        </Link>
      ) : null}
    </form>
  );
}
