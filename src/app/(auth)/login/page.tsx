"use client";

import { useActionState } from "react";
import Link from "next/link";

import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = {
  message: undefined,
  success: false,
};

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#fafafa,#e4e4e7)] px-4 py-12 text-zinc-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-md items-center">
        <section className="w-full rounded-3xl border border-zinc-200 bg-white p-8 shadow-[0_25px_60px_rgba(0,0,0,0.08)]">
          <div className="mb-6">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-zinc-500">Vantik</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Connexion</h1>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Connectez-vous pour accéder à votre espace entreprise.
            </p>
          </div>

          <form action={formAction} className="grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-zinc-700">Email</span>
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                className="rounded-xl border border-zinc-300 px-3 py-2.5 text-sm outline-none transition focus:border-zinc-900"
                placeholder="vous@entreprise.com"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-zinc-700">Mot de passe</span>
              <input
                name="motDePasse"
                type="password"
                autoComplete="current-password"
                required
                className="rounded-xl border border-zinc-300 px-3 py-2.5 text-sm outline-none transition focus:border-zinc-900"
                placeholder="Votre mot de passe"
              />
            </label>

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
              {isPending ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <p className="mt-6 text-sm text-zinc-600">
            Pas encore de compte ?{" "}
            <Link className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-4" href="/signup">
              Créer un compte
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}