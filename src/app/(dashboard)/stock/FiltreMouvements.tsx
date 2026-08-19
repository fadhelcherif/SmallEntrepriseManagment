import Link from "next/link";
import { Filter } from "lucide-react";

import { boutonClasses } from "../../_components/ui/boutonClasses";
import { champClasses } from "../../_components/ui/champClasses";
import { LIBELLE_TYPE_MOUVEMENT } from "../../_lib/libellesStatuts";

type FiltreMouvementsProps = {
  du?: string;
  au?: string;
  produitId?: string;
  type?: string;
  produits: { id: string; nom: string; attributsAffichage?: string }[];
};

export function FiltreMouvements({ du, au, produitId, type, produits }: FiltreMouvementsProps) {
  const filtreActif = Boolean(du || au || produitId || type);

  return (
    <form method="get" className="shadow-card flex flex-wrap items-end gap-3 rounded-3xl bg-white p-4">
      <label className="grid gap-1.5">
        <span className="text-xs font-medium uppercase tracking-wide text-stone-500">Du</span>
        <input type="date" name="du" defaultValue={du} className={champClasses} />
      </label>

      <label className="grid gap-1.5">
        <span className="text-xs font-medium uppercase tracking-wide text-stone-500">Au</span>
        <input type="date" name="au" defaultValue={au} className={champClasses} />
      </label>

      <label className="grid gap-1.5">
        <span className="text-xs font-medium uppercase tracking-wide text-stone-500">Produit</span>
        <select name="produitId" defaultValue={produitId ?? ""} className={champClasses}>
          <option value="">Tous les produits</option>
          {produits.map((produit) => (
            <option key={produit.id} value={produit.id}>
              {produit.nom}
              {produit.attributsAffichage ? ` (${produit.attributsAffichage})` : ""}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-1.5">
        <span className="text-xs font-medium uppercase tracking-wide text-stone-500">Type</span>
        <select name="type" defaultValue={type ?? ""} className={champClasses}>
          <option value="">Tous les types</option>
          {Object.entries(LIBELLE_TYPE_MOUVEMENT).map(([valeur, libelle]) => (
            <option key={valeur} value={valeur}>
              {libelle.label}
            </option>
          ))}
        </select>
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
