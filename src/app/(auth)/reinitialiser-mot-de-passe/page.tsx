import Link from "next/link";

import { ReinitialiserMotDePasseForm } from "./ReinitialiserMotDePasseForm";

type PageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ReinitialiserMotDePassePage({ searchParams }: PageProps) {
  const { token } = await searchParams;

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
            <h2 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-stone-900">Nouveau mot de passe</h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">Choisissez un nouveau mot de passe pour votre compte.</p>
          </div>

          <ReinitialiserMotDePasseForm token={token ?? ""} />

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
