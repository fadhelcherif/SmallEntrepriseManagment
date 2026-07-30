"use client";

import { useActionState } from "react";
import { Truck } from "lucide-react";

import type { CreerFournisseurState } from "./actions";
import { Bouton } from "../../_components/ui/Bouton";
import { MessageFormulaire } from "../../_components/ui/MessageFormulaire";
import { champClasses } from "../../_components/ui/champClasses";
import { Panel } from "../../_components/ui/Panel";

type FournisseursFormProps = {
  entrepriseId: string;
  action: (entrepriseId: string, previousState: CreerFournisseurState, formData: FormData) => Promise<CreerFournisseurState>;
};

const initialState: CreerFournisseurState = {
  message: undefined,
  success: false,
};

export function FournisseursForm({ entrepriseId, action }: FournisseursFormProps) {
  const [state, formAction, isPending] = useActionState(action.bind(null, entrepriseId), initialState);

  return (
    <Panel title="Nouveau fournisseur" description="Ajoute un fournisseur au catalogue de l'entreprise." className="h-fit">
      <form action={formAction} className="grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-stone-700">Nom</span>
          <input name="nom" type="text" required className={champClasses} placeholder="Ex: Fournitures Express" />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-stone-700">Contact</span>
          <input name="contact" type="text" className={champClasses} placeholder="Téléphone ou email" />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-stone-700">Adresse</span>
          <input name="adresse" type="text" className={champClasses} placeholder="Adresse du fournisseur" />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-stone-700">Délai de livraison (jours)</span>
          <input name="delaiLivraisonJours" type="number" min="0" step="1" className={champClasses} placeholder="3" />
        </label>

        <MessageFormulaire message={state.message} success={state.success} />

        <Bouton type="submit" disabled={isPending}>
          <Truck className="h-4 w-4" strokeWidth={1.75} />
          {isPending ? "Création..." : "Créer le fournisseur"}
        </Bouton>
      </form>
    </Panel>
  );
}
