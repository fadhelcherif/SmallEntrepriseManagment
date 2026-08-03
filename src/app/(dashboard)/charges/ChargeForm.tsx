"use client";

import { useActionState, useMemo } from "react";
import { ReceiptText } from "lucide-react";

import type { CreerChargeState } from "./actions";
import { Bouton } from "../../_components/ui/Bouton";
import { MessageFormulaire } from "../../_components/ui/MessageFormulaire";
import { champClasses } from "../../_components/ui/champClasses";
import { Panel } from "../../_components/ui/Panel";

type ChargeFormProps = {
  typesExistants: string[];
  action: (previousState: CreerChargeState, formData: FormData) => Promise<CreerChargeState>;
};

const initialState: CreerChargeState = {
  message: undefined,
  success: false,
};

const TYPES_SUGGERES_BASE = ["Loyer", "Facture électricité", "Facture eau", "Emballage", "Assurance", "Internet / Téléphone"];

export function ChargeForm({ typesExistants, action }: ChargeFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  const typesSuggeres = useMemo(() => {
    const vus = new Set<string>();
    const resultat: string[] = [];

    for (const type of [...typesExistants, ...TYPES_SUGGERES_BASE]) {
      const clef = type.trim().toLowerCase();
      if (clef.length === 0 || vus.has(clef)) {
        continue;
      }

      vus.add(clef);
      resultat.push(type);
    }

    return resultat.sort((a, b) => a.localeCompare(b, "fr"));
  }, [typesExistants]);

  return (
    <Panel
      title="Nouvelle charge"
      description="Loyer, factures, emballage... Le salaire et les achats fournisseurs sont ajoutés automatiquement."
      className="h-fit"
    >
      <form action={formAction} className="grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-stone-700">Type</span>
          <input name="type" type="text" required list="types-charges" className={champClasses} placeholder="Ex: Loyer" />
          <datalist id="types-charges">
            {typesSuggeres.map((type) => (
              <option key={type} value={type} />
            ))}
          </datalist>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-stone-700">Montant</span>
          <input name="montant" type="number" step="0.01" min="0.01" required className={champClasses} placeholder="450.00" />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-stone-700">Date d'échéance</span>
          <input name="dateEcheance" type="date" required className={champClasses} />
        </label>

        <label className="flex items-center gap-2 text-sm font-medium text-stone-700">
          <input
            type="checkbox"
            name="recurrente"
            className="h-4 w-4 rounded border-stone-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
          />
          Charge récurrente (régénérée chaque mois automatiquement)
        </label>

        <MessageFormulaire message={state.message} success={state.success} />

        <Bouton type="submit" disabled={isPending}>
          <ReceiptText className="h-4 w-4" strokeWidth={1.75} />
          {isPending ? "Création..." : "Créer la charge"}
        </Bouton>
      </form>
    </Panel>
  );
}
