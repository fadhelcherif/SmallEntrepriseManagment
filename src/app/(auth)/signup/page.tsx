"use client";

import Link from "next/link";
import { useActionState } from "react";
import { AlertTriangle, UserPlus } from "lucide-react";

import { signupAction, type SignupState } from "./actions";
import { Bouton } from "../../_components/ui/Bouton";
import { MessageFormulaire } from "../../_components/ui/MessageFormulaire";
import { champClasses } from "../../_components/ui/champClasses";

const initialState: SignupState = {
  message: undefined,
  success: false,
};

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState(signupAction, initialState);

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="hidden flex-col justify-between bg-[var(--color-primary)] p-12 text-[var(--color-primary-foreground)] lg:flex">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] opacity-70">Vantik</p>
          <h1 className="mt-6 max-w-sm font-heading text-4xl font-semibold leading-tight">
            Créez l’espace de votre entreprise en quelques minutes.
          </h1>
        </div>
        <p className="max-w-sm text-sm leading-6 opacity-70">
          Un espace isolé pour votre entreprise, votre catalogue et votre équipe, avec un premier compte administrateur.
        </p>
      </section>

      <section className="flex items-center justify-center overflow-y-auto bg-white px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-stone-400 lg:hidden">Vantik</p>
            <h2 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-stone-900">Créer un compte</h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              Créez votre entreprise et son premier administrateur en une seule inscription.
            </p>
          </div>

          <form action={formAction} className="grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-stone-700">Nom de l’entreprise</span>
              <input name="nomEntreprise" type="text" required className={champClasses} placeholder="Ex: Atelier Dumas" />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-stone-700">Adresse</span>
              <input name="adresseEntreprise" type="text" required className={champClasses} placeholder="Adresse complète" />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-stone-700">Devise</span>
              <input name="deviseEntreprise" type="text" required className={champClasses} placeholder="Ex: EUR" />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-stone-700">Type de métier</span>
              <input name="typeMetierEntreprise" type="text" required className={champClasses} placeholder="Ex: Restauration" />
            </label>

            <div className="mt-2 border-t border-stone-200 pt-4">
              <p className="mb-3 text-sm font-medium text-stone-700">Administrateur principal</p>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-stone-700">Nom</span>
                <input
                  name="nomAdministrateur"
                  type="text"
                  autoComplete="name"
                  required
                  className={champClasses}
                  placeholder="Votre nom"
                />
              </label>

              <label className="mt-4 grid gap-2">
                <span className="text-sm font-medium text-stone-700">Email</span>
                <input
                  name="emailAdministrateur"
                  type="email"
                  autoComplete="email"
                  required
                  className={champClasses}
                  placeholder="vous@entreprise.com"
                />
              </label>

              <label className="mt-4 grid gap-2">
                <span className="text-sm font-medium text-stone-700">Mot de passe</span>
                <input
                  name="motDePasseAdministrateur"
                  type="password"
                  autoComplete="new-password"
                  required
                  className={champClasses}
                  placeholder="Au moins 8 caractères"
                />
              </label>
            </div>

            <p className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
              Un compte créé ici est le premier administrateur de la nouvelle entreprise.
            </p>

            <MessageFormulaire message={state.message} success={state.success} />

            <Bouton type="submit" disabled={isPending} className="mt-2">
              <UserPlus className="h-4 w-4" strokeWidth={1.75} />
              {isPending ? "Création..." : "Créer l'entreprise"}
            </Bouton>
          </form>

          <p className="mt-6 text-sm text-stone-600">
            Déjà un compte ?{" "}
            <Link className="font-medium text-stone-900 underline decoration-stone-300 underline-offset-4" href="/login">
              Se connecter
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
