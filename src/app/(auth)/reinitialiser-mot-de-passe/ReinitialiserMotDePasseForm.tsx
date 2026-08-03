"use client";

import { useActionState } from "react";
import { KeyRound } from "lucide-react";

import { reinitialiserMotDePasseAction, type ReinitialisationState } from "./actions";
import { Bouton } from "../../_components/ui/Bouton";
import { MessageFormulaire } from "../../_components/ui/MessageFormulaire";
import { champClasses } from "../../_components/ui/champClasses";

const initialState: ReinitialisationState = {
  message: undefined,
  success: false,
};

type ReinitialiserMotDePasseFormProps = {
  token: string;
};

export function ReinitialiserMotDePasseForm({ token }: ReinitialiserMotDePasseFormProps) {
  const [state, formAction, isPending] = useActionState(reinitialiserMotDePasseAction, initialState);

  if (!token) {
    return <MessageFormulaire message="Lien invalide : aucun jeton de réinitialisation fourni." success={false} />;
  }

  if (state.success) {
    return <MessageFormulaire message={state.message} success={state.success} />;
  }

  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="token" value={token} />

      <label className="grid gap-2">
        <span className="text-sm font-medium text-stone-700">Nouveau mot de passe</span>
        <input
          name="motDePasse"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className={champClasses}
          placeholder="Au moins 8 caractères"
        />
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-stone-700">Confirmer le mot de passe</span>
        <input
          name="confirmationMotDePasse"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className={champClasses}
          placeholder="Retapez le mot de passe"
        />
      </label>

      <MessageFormulaire message={state.message} success={state.success} />

      <Bouton type="submit" disabled={isPending} className="mt-2">
        <KeyRound className="h-4 w-4" strokeWidth={1.75} />
        {isPending ? "Modification..." : "Changer le mot de passe"}
      </Bouton>
    </form>
  );
}
