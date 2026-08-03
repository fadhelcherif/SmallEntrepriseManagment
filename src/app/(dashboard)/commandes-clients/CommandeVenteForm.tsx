"use client";

import { useMemo, useState } from "react";
import { Plus, Receipt, Trash2 } from "lucide-react";

import type { CreerCommandeVenteState } from "./actions";
import { Bouton } from "../../_components/ui/Bouton";
import { MessageFormulaire } from "../../_components/ui/MessageFormulaire";
import { champClasses } from "../../_components/ui/champClasses";
import { Panel } from "../../_components/ui/Panel";

type ProduitOption = {
  id: string;
  nom: string;
  prixVente: number;
  attributsAffichage?: string;
};

type Ligne = {
  produitId: string;
  quantite: number;
  prixApplique: number;
};

type CommandeVenteFormProps = {
  entrepriseId: string;
  produits: ProduitOption[];
  action: (
    entrepriseId: string,
    utilisateurId: string,
    previousState: CreerCommandeVenteState,
    formData: FormData,
  ) => Promise<CreerCommandeVenteState>;
  utilisateurId: string;
};

const initialState: CreerCommandeVenteState = {
  message: undefined,
  success: false,
};

function creerLigneParDefaut(produits: ProduitOption[]): Ligne {
  const premierProduit = produits[0];
  return {
    produitId: premierProduit?.id ?? "",
    quantite: 1,
    prixApplique: premierProduit?.prixVente ?? 0,
  };
}

export function CommandeVenteForm({ entrepriseId, produits, action, utilisateurId }: CommandeVenteFormProps) {
  const [state, formAction, isPending] = useStateLike(action.bind(null, entrepriseId, utilisateurId), initialState);
  const [lignes, setLignes] = useState<Ligne[]>([creerLigneParDefaut(produits)]);

  const lignesJson = useMemo(() => JSON.stringify(lignes), [lignes]);
  const montantTotal = useMemo(
    () => lignes.reduce((total, ligne) => total + ligne.quantite * ligne.prixApplique, 0),
    [lignes],
  );

  return (
    <Panel
      title="Nouvelle commande client"
      description="Le prix de vente est proposé automatiquement mais reste modifiable ligne par ligne."
      className="h-fit"
    >
      <form action={formAction} className="grid gap-4">
        <input type="hidden" name="lignesJson" value={lignesJson} />

        <div className="grid gap-3">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-medium text-stone-700">Lignes</span>
            <button
              type="button"
              onClick={() => setLignes((current) => [...current, creerLigneParDefaut(produits)])}
              className="inline-flex items-center gap-1.5 rounded-md border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:border-stone-900 hover:text-stone-900"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
              Ajouter une ligne
            </button>
          </div>

          {lignes.map((ligne, index) => {
            const sousTotal = ligne.quantite * ligne.prixApplique;

            return (
              <div key={index} className="grid gap-2 rounded-md border border-stone-200 bg-stone-50 p-3">
                <select
                  value={ligne.produitId}
                  onChange={(event) => {
                    const produitId = event.target.value;
                    const produit = produits.find((option) => option.id === produitId);

                    setLignes((current) =>
                      current.map((ligneCourante, ligneIndex) =>
                        ligneIndex === index
                          ? { ...ligneCourante, produitId, prixApplique: produit?.prixVente ?? ligneCourante.prixApplique }
                          : ligneCourante,
                      ),
                    );
                  }}
                  className={champClasses}
                >
                  <option value="" disabled>
                    Sélectionner un produit
                  </option>
                  {produits.map((produit) => (
                    <option key={produit.id} value={produit.id}>
                      {produit.nom} — {produit.prixVente.toFixed(2)}
                      {produit.attributsAffichage ? ` (${produit.attributsAffichage})` : ""}
                    </option>
                  ))}
                </select>

                <div className="grid grid-cols-[1fr_1fr_auto] items-end gap-2">
                  <label className="grid gap-1">
                    <span className="text-xs font-medium uppercase tracking-wide text-stone-500">Quantité</span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={ligne.quantite}
                      onChange={(event) => {
                        const quantite = Number(event.target.value);
                        setLignes((current) => current.map((ligneCourante, ligneIndex) => (ligneIndex === index ? { ...ligneCourante, quantite } : ligneCourante)));
                      }}
                      className={champClasses}
                    />
                  </label>

                  <label className="grid gap-1">
                    <span className="text-xs font-medium uppercase tracking-wide text-stone-500">Prix unitaire</span>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={ligne.prixApplique}
                      onChange={(event) => {
                        const prixApplique = Number(event.target.value);
                        setLignes((current) => current.map((ligneCourante, ligneIndex) => (ligneIndex === index ? { ...ligneCourante, prixApplique } : ligneCourante)));
                      }}
                      className={champClasses}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => setLignes((current) => current.filter((_, ligneIndex) => ligneIndex !== index))}
                    disabled={lignes.length === 1}
                    aria-label="Supprimer la ligne"
                    title="Supprimer la ligne"
                    className="inline-flex h-10.5 w-10.5 shrink-0 items-center justify-center rounded-md border border-red-200 text-red-700 transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                  </button>
                </div>

                <p className="text-right text-xs text-stone-500">
                  Sous-total : <span className="font-medium text-stone-700">{sousTotal.toFixed(2)}</span>
                </p>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between rounded-md border border-stone-200 bg-stone-50 px-3 py-2.5">
          <span className="text-sm font-medium text-stone-700">Total commande</span>
          <span className="font-heading text-lg font-semibold text-stone-900">{montantTotal.toFixed(2)}</span>
        </div>

        <MessageFormulaire message={state.message} success={state.success} />

        <Bouton type="submit" disabled={isPending}>
          <Receipt className="h-4 w-4" strokeWidth={1.75} />
          {isPending ? "Création..." : "Créer la commande"}
        </Bouton>
      </form>
    </Panel>
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
