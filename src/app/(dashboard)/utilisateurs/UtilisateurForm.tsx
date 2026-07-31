"use client";

import { useActionState } from "react";
import { UserPlus } from "lucide-react";

import type { CreerUtilisateurState } from "./actions";
import { Bouton } from "../../_components/ui/Bouton";
import { MessageFormulaire } from "../../_components/ui/MessageFormulaire";
import { champClasses } from "../../_components/ui/champClasses";
import { Panel } from "../../_components/ui/Panel";

type UtilisateurFormProps = {
  action: (previousState: CreerUtilisateurState, formData: FormData) => Promise<CreerUtilisateurState>;
};

const initialState: CreerUtilisateurState = {
  message: undefined,
  success: false,
};

export function UtilisateurForm({ action }: UtilisateurFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <Panel title="Nouvel utilisateur" description="Ajoute un employé à l'entreprise." className="h-fit">
      <form action={formAction} className="grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-stone-700">Nom</span>
          <input name="nom" type="text" required className={champClasses} placeholder="Ex: Sarah Martin" />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-stone-700">Email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className={champClasses}
            placeholder="employe@entreprise.com"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-stone-700">Mot de passe</span>
          <input
            name="motDePasse"
            type="password"
            required
            autoComplete="new-password"
            className={champClasses}
            placeholder="Au moins 8 caractères"
          />
        </label>

        <MessageFormulaire message={state.message} success={state.success} />

        <Bouton type="submit" disabled={isPending}>
          <UserPlus className="h-4 w-4" strokeWidth={1.75} />
          {isPending ? "Création..." : "Créer l'utilisateur"}
        </Bouton>
      </form>
    </Panel>
  );
}
