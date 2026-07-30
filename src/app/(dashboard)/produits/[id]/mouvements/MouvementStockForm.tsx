"use client";

import { useActionState } from "react";
import { PackageCheck } from "lucide-react";

import type { MouvementStockState } from "./actions";
import { Bouton } from "../../../../_components/ui/Bouton";
import { MessageFormulaire } from "../../../../_components/ui/MessageFormulaire";
import { champClasses } from "../../../../_components/ui/champClasses";
import { Panel } from "../../../../_components/ui/Panel";

type MouvementStockFormProps = {
  produitId: string;
  action: (produitId: string, previousState: MouvementStockState, formData: FormData) => Promise<MouvementStockState>;
};

const initialState: MouvementStockState = {
  message: undefined,
  success: false,
};

export function MouvementStockForm({ produitId, action }: MouvementStockFormProps) {
  const boundAction = action.bind(null, produitId);
  const [state, formAction, isPending] = useActionState(boundAction, initialState);

  return (
    <Panel title="Nouveau mouvement" description="Enregistre une entrée, une sortie ou un ajustement." className="h-fit">
      <form action={formAction} className="grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-stone-700">Type</span>
          <select name="type" required className={champClasses}>
            <option value="ENTREE">Entrée</option>
            <option value="SORTIE">Sortie</option>
            <option value="AJUSTEMENT">Ajustement</option>
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-stone-700">Quantité</span>
          <input name="quantite" type="number" min="0" step="1" required className={champClasses} placeholder="1" />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-stone-700">Motif</span>
          <textarea name="motif" rows={3} className={champClasses} placeholder="Ex: correction d'inventaire" />
        </label>

        <MessageFormulaire message={state.message} success={state.success} />

        <Bouton type="submit" disabled={isPending}>
          <PackageCheck className="h-4 w-4" strokeWidth={1.75} />
          {isPending ? "Enregistrement..." : "Enregistrer le mouvement"}
        </Bouton>
      </form>
    </Panel>
  );
}
