"use client";

import Link from "next/link";
import { useActionState } from "react";

import { signupAction, type SignupState } from "./actions";

const initialState: SignupState = {
  message: undefined,
  success: false,
};

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState(signupAction, initialState);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#fafafa,#e4e4e7)] px-4 py-12 text-zinc-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-md items-center">
        <section className="w-full rounded-3xl border border-zinc-200 bg-white p-8 shadow-[0_25px_60px_rgba(0,0,0,0.08)]">
          <div className="mb-6">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-zinc-500">Vantik</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Créer un compte</h1>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Créez votre entreprise et son premier administrateur en une seule inscription.
            </p>
          </div>

          <form action={formAction} className="grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-zinc-700">Nom de l'entreprise</span>
              <input
                name="nomEntreprise"
                type="text"
                required
                className="rounded-xl border border-zinc-300 px-3 py-2.5 text-sm outline-none transition focus:border-zinc-900"
                placeholder="Ex: Atelier Dumas"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-zinc-700">Adresse</span>
              <input
                name="adresseEntreprise"
                type="text"
                required
                className="rounded-xl border border-zinc-300 px-3 py-2.5 text-sm outline-none transition focus:border-zinc-900"
                placeholder="Adresse complète"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-zinc-700">Devise</span>
              <input
                name="deviseEntreprise"
                type="text"
                required
                className="rounded-xl border border-zinc-300 px-3 py-2.5 text-sm outline-none transition focus:border-zinc-900"
                placeholder="Ex: EUR"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-zinc-700">Type de métier</span>
              <input
                name="typeMetierEntreprise"
                type="text"
                required
                className="rounded-xl border border-zinc-300 px-3 py-2.5 text-sm outline-none transition focus:border-zinc-900"
                placeholder="Ex: Restauration"
              />
            </label>

            <div className="mt-2 border-t border-zinc-200 pt-4">
              <p className="mb-3 text-sm font-medium text-zinc-700">Administrateur principal</p>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-zinc-700">Nom</span>
                <input
                  name="nomAdministrateur"
                  type="text"
                  autoComplete="name"
                  required
                  className="rounded-xl border border-zinc-300 px-3 py-2.5 text-sm outline-none transition focus:border-zinc-900"
                  placeholder="Votre nom"
                />
              </label>

              <label className="mt-4 grid gap-2">
                <span className="text-sm font-medium text-zinc-700">Email</span>
                <input
                  name="emailAdministrateur"
                  type="email"
                  autoComplete="email"
                  required
                  className="rounded-xl border border-zinc-300 px-3 py-2.5 text-sm outline-none transition focus:border-zinc-900"
                  placeholder="vous@entreprise.com"
                />
              </label>

              <label className="mt-4 grid gap-2">
                <span className="text-sm font-medium text-zinc-700">Mot de passe</span>
                <input
                  name="motDePasseAdministrateur"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="rounded-xl border border-zinc-300 px-3 py-2.5 text-sm outline-none transition focus:border-zinc-900"
                  placeholder="Au moins 8 caractères"
                />
              </label>
            </div>

            <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Un compte créé ici est le premier administrateur de la nouvelle entreprise.
            </p>

            {state.message ? (
              <p className={`rounded-xl px-3 py-2 text-sm ${state.success ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                {state.message}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Création..." : "Créer l'entreprise"}
            </button>
          </form>

          <p className="mt-6 text-sm text-zinc-600">
            Déjà un compte ?{" "}
            <Link className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-4" href="/login">
              Se connecter
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
