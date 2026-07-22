import type { Produit } from "../../../domain/entities/Produit";

import { modifierProduitAction, supprimerProduitAction } from "./actions";

type ProduitActionsProps = {
  entrepriseId: string;
  produit: Produit;
};

function formaterDatePourInput(date?: Date | null): string {
  if (!date) {
    return "";
  }

  const annee = date.getFullYear();
  const mois = String(date.getMonth() + 1).padStart(2, "0");
  const jour = String(date.getDate()).padStart(2, "0");

  return `${annee}-${mois}-${jour}`;
}

export function ProduitActions({ entrepriseId, produit }: ProduitActionsProps) {
  return (
    <div className="flex flex-col gap-3">
      <details className="group rounded-xl border border-zinc-200 bg-zinc-50 p-3">
        <summary className="cursor-pointer list-none rounded-lg border border-zinc-300 bg-white px-3 py-2 text-center text-sm font-medium text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-900">
          Modifier
        </summary>

        <form action={modifierProduitAction.bind(null, entrepriseId, produit.id)} className="mt-3 grid gap-3">
          <label className="grid gap-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">Nom</span>
            <input
              name="nom"
              type="text"
              required
              defaultValue={produit.nom}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-zinc-900"
            />
          </label>

          <label className="grid gap-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">Prix unitaire</span>
            <input
              name="prixUnitaire"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={produit.prixUnitaire}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-zinc-900"
            />
          </label>

          <label className="grid gap-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">Seuil d’alerte</span>
            <input
              name="seuilAlerte"
              type="number"
              min="0"
              step="1"
              required
              defaultValue={produit.seuilAlerte}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-zinc-900"
            />
          </label>

          <label className="grid gap-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">Description</span>
            <textarea
              name="description"
              rows={3}
              defaultValue={produit.description ?? ""}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-zinc-900"
            />
          </label>

          <label className="grid gap-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">Date d’expiration</span>
            <input
              name="dateExpiration"
              type="date"
              defaultValue={formaterDatePourInput(produit.dateExpiration)}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-zinc-900"
            />
          </label>

          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-zinc-700"
          >
            Enregistrer
          </button>
        </form>
      </details>

      <form action={supprimerProduitAction.bind(null, entrepriseId, produit.id)}>
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 transition hover:border-rose-300 hover:bg-rose-100"
        >
          Supprimer
        </button>
      </form>
    </div>
  );
}