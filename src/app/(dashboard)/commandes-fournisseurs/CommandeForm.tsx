"use client";

import { useMemo, useState } from "react";
import { Plus, ShoppingCart, Trash2 } from "lucide-react";

import type { CreerCommandeState } from "./actions";
import { Bouton } from "../../_components/ui/Bouton";
import { MessageFormulaire } from "../../_components/ui/MessageFormulaire";
import { champClasses } from "../../_components/ui/champClasses";
import { Panel } from "../../_components/ui/Panel";

type FournisseurOption = {
  id: string;
  nom: string;
};

type ProduitOption = {
  id: string;
  nom: string;
  prixAchat: number;
  attributsAffichage?: string;
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
    <Panel
      title="Nouvelle commande fournisseur"
      description="Le prix est copié automatiquement depuis le produit au moment de la création."
      className="h-fit"
    >
      <form action={formAction} className="grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-stone-700">Fournisseur</span>
          <select
            name="fournisseurId"
            required
            value={fournisseurId}
            onChange={(event) => setFournisseurId(event.target.value)}
            className={champClasses}
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
            <span className="text-sm font-medium text-stone-700">Lignes</span>
            <button
              type="button"
              onClick={() => setLignes((current) => [...current, { produitId: produits[0]?.id ?? "", quantite: 1 }])}
              className="inline-flex items-center gap-1.5 rounded-md border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:border-stone-900 hover:text-stone-900"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
              Ajouter une ligne
            </button>
          </div>

          {lignes.map((ligne, index) => (
            <div key={index} className="grid gap-2 rounded-md border border-stone-200 bg-stone-50 p-3">
              <select
                value={ligne.produitId}
                onChange={(event) => {
                  const produitId = event.target.value;
                  setLignes((current) => current.map((ligneCourante, ligneIndex) => (ligneIndex === index ? { ...ligneCourante, produitId } : ligneCourante)));
                }}
                className={champClasses}
              >
                <option value="" disabled>
                  Sélectionner un produit
                </option>
                {produits.map((produit) => (
                  <option key={produit.id} value={produit.id}>
                    {produit.nom} — {produit.prixAchat.toFixed(2)}
                    {produit.attributsAffichage ? ` (${produit.attributsAffichage})` : ""}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={ligne.quantite}
                  onChange={(event) => {
                    const quantite = Number(event.target.value);
                    setLignes((current) => current.map((ligneCourante, ligneIndex) => (ligneIndex === index ? { ...ligneCourante, quantite } : ligneCourante)));
                  }}
                  className={`${champClasses} !w-24 shrink-0`}
                />

                <button
                  type="button"
                  onClick={() => setLignes((current) => current.filter((_, ligneIndex) => ligneIndex !== index))}
                  disabled={lignes.length === 1}
                  aria-label="Supprimer la ligne"
                  title="Supprimer la ligne"
                  className="ml-auto inline-flex h-10.5 w-10.5 shrink-0 items-center justify-center rounded-md border border-red-200 text-red-700 transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <MessageFormulaire message={state.message} success={state.success} />

        <Bouton type="submit" disabled={isPending}>
          <ShoppingCart className="h-4 w-4" strokeWidth={1.75} />
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
