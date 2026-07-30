"use client";

import { useActionState } from "react";
import { PackagePlus } from "lucide-react";

import type { CreerProduitState } from "./actions";
import { Bouton } from "../../_components/ui/Bouton";
import { MessageFormulaire } from "../../_components/ui/MessageFormulaire";
import { champClasses } from "../../_components/ui/champClasses";
import { Panel } from "../../_components/ui/Panel";

type ProduitFormProps = {
  entrepriseId: string;
  action: (entrepriseId: string, previousState: CreerProduitState, formData: FormData) => Promise<CreerProduitState>;
};

const initialState: CreerProduitState = {
  message: undefined,
  success: false,
};

export function ProduitForm({ entrepriseId, action }: ProduitFormProps) {
  const boundAction = action.bind(null, entrepriseId);
  const [state, formAction, isPending] = useActionState(boundAction, initialState);

  return (
    <Panel id="nouveau-produit" title="Nouveau produit" description="Ajoute un produit au catalogue de l'entreprise." className="h-fit">
      <form action={formAction} className="grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-stone-700">Nom</span>
          <input name="nom" type="text" required className={champClasses} placeholder="Ex: Café moulu 1kg" />
        </label>

        <div className="grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-stone-700">Prix d’achat</span>
            <input
              name="prixAchat"
              type="number"
              step="0.01"
              min="0"
              required
              className={champClasses}
              placeholder="12.00"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-stone-700">Prix de vente</span>
            <input
              name="prixVente"
              type="number"
              step="0.01"
              min="0"
              required
              className={champClasses}
              placeholder="19.90"
            />
          </label>
        </div>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-stone-700">Seuil d’alerte</span>
          <input name="seuilAlerte" type="number" min="0" step="1" required className={champClasses} placeholder="3" />
        </label>

        <MessageFormulaire message={state.message} success={state.success} />

        <Bouton type="submit" disabled={isPending}>
          <PackagePlus className="h-4 w-4" strokeWidth={1.75} />
          {isPending ? "Création..." : "Créer le produit"}
        </Bouton>
      </form>
    </Panel>
  );
}
