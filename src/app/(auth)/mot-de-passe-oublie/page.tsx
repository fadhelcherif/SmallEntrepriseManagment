"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";

import { demanderReinitialisationAction, type DemandeReinitialisationState } from "./actions";
import { Bouton } from "../../_components/ui/Bouton";
import { MessageFormulaire } from "../../_components/ui/MessageFormulaire";
import { champClasses } from "../../_components/ui/champClasses";

const initialState: DemandeReinitialisationState = {
  message: undefined,
  success: false,
};

export default function MotDePasseOubliePage() {
  const [state, formAction, isPending] = useActionState(demanderReinitialisationAction, initialState);

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="hidden flex-col justify-between bg-[var(--color-primary)] p-12 text-[var(--color-primary-foreground)] lg:flex">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] opacity-70">Vantik</p>
          <h1 className="mt-6 max-w-sm font-heading text-4xl font-semibold leading-tight">
            La gestion de votre entreprise, en un seul endroit.
          </h1>
        </div>
        <p className="max-w-sm text-sm leading-6 opacity-70">
          Stock, fournisseurs, commandes et alertes, pilotés au quotidien pour chaque entreprise connectée.
        </p>
      </section>

      <section className="flex items-center justify-center bg-white px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-stone-400 lg:hidden">Vantik</p>
            <h2 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-stone-900">Mot de passe oublié</h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              Indiquez votre email, on vous envoie un lien pour choisir un nouveau mot de passe.
            </p>
          </div>

          <form action={formAction} className="grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-stone-700">Email</span>
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                className={champClasses}
                placeholder="vous@entreprise.com"
              />
            </label>

            <MessageFormulaire message={state.message} success={state.success} />

            <Bouton type="submit" disabled={isPending} className="mt-2">
              <Mail className="h-4 w-4" strokeWidth={1.75} />
              {isPending ? "Envoi..." : "Envoyer le lien"}
            </Bouton>
          </form>

          <p className="mt-6 text-sm text-stone-600">
            <Link className="font-medium text-stone-900 underline decoration-stone-300 underline-offset-4" href="/login">
              Retour à la connexion
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
