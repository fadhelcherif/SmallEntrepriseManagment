"use client";

import { useMemo, useState } from "react";

import type { CreerCommandeState } from "./actions";

type FournisseurOption = {
  id: string;
  nom: string;
};

type ProduitOption = {
  id: string;
  nom: string;
  prixUnitaire: number;
};

type Ligne = {
  produitId: string;
  quantite: number;
};

type CommandeFormProps = {
  entrepriseId: string;
  fournisseurs: FournisseurOption[];
  produits: ProduitOption[];
  action: (entrepriseId: string, utilisateurId: string, previousState: CreerCommandeState, formData: FormData) => Promise<CreerCommandeState>;
  utilisateurId: string;
};

const initialState: CreerCommandeState = {
  message: undefined,
  success: false,
};

export function CommandeForm({ entrepriseId, fournisseurs, produits, action, utilisateurId }: CommandeFormProps) {
  const [state, formAction, isPending] = useStateLike(action.bind(null, entrepriseId, utilisateurId), initialState);
  const [fournisseurId, setFournisseurId] = useState(fournisseurs[0]?.id ?? "");
  const [lignes, setLignes] = useState<Ligne[]>([{ produitId: produits[0]?.id ?? "", quantite: 1 }]);

  const lignesJson = useMemo(() => JSON.stringify(lignes), [lignes]);

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-zinc-900">Nouvelle commande fournisseur</h2>
        <p className="mt-1 text-sm text-zinc-500">Le prix est copié automatiquement depuis le produit au moment de la création.</p>
      </div>

      <form action={formAction} className="grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-zinc-700">Fournisseur</span>
          <select
            name="fournisseurId"
            required
            value={fournisseurId}
            onChange={(event) => setFournisseurId(event.target.value)}
            className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-900"
          >
            <option value="" disabled>
              Sélectionner un fournisseur
            </option>
            {fournisseurs.map((fournisseur) => (
              <option key={fournisseur.id} value={fournisseur.id}>
                {fournisseur.nom}
              </option>
            ))}
          </select>
        </label>

        <input type="hidden" name="lignesJson" value={lignesJson} />

        <div className="grid gap-3">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-medium text-zinc-700">Lignes</span>
            <button
              type="button"
              onClick={() => setLignes((current) => [...current, { produitId: produits[0]?.id ?? "", quantite: 1 }])}
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-900"
            >
              Ajouter une ligne
            </button>
          </div>

          {lignes.map((ligne, index) => (
            <div key={index} className="grid gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 sm:grid-cols-[1fr_120px_auto]">
              <select
                value={ligne.produitId}
                onChange={(event) => {
                  const produitId = event.target.value;
                  setLignes((current) => current.map((ligneCourante, ligneIndex) => (ligneIndex === index ? { ...ligneCourante, produitId } : ligneCourante)));
                }}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-900"
              >
                <option value="" disabled>
                  Sélectionner un produit
                </option>
                {produits.map((produit) => (
                  <option key={produit.id} value={produit.id}>
                    {produit.nom} - {produit.prixUnitaire.toFixed(2)}
                  </option>
                ))}
              </select>

              <input
                type="number"
                min="1"
                step="1"
                value={ligne.quantite}
                onChange={(event) => {
                  const quantite = Number(event.target.value);
                  setLignes((current) => current.map((ligneCourante, ligneIndex) => (ligneIndex === index ? { ...ligneCourante, quantite } : ligneCourante)));
                }}
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-zinc-900"
              />

              <button
                type="button"
                onClick={() => setLignes((current) => current.filter((_, ligneIndex) => ligneIndex !== index))}
                disabled={lignes.length === 1}
                className="rounded-lg border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 transition hover:border-rose-300 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Supprimer
              </button>
            </div>
          ))}
        </div>

        {state.message ? (
          <p className={`rounded-xl px-3 py-2 text-sm ${state.success ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
            {state.message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Création..." : "Créer la commande"}
        </button>
      </form>
    </section>
  );
}

function useStateLike<T>(action: (previousState: T, formData: FormData) => Promise<T>, initialState: T) {
  // Small wrapper to keep this file self-contained and avoid importing an extra hook helper.
  const [state, setState] = useState(initialState);
  const [isPending, setIsPending] = useState(false);

  async function formAction(formData: FormData) {
    setIsPending(true);
    try {
      const nextState = await action(state, formData);
      setState(nextState);
      return nextState;
    } finally {
      setIsPending(false);
    }
  }

  return [state, formAction, isPending] as const;
}