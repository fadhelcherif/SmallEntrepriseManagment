import Link from "next/link";
import type { ReactNode } from "react";

import { deconnexionAction } from "./actions";
import { getUtilisateurConnecte } from "../../infrastructure/auth/getUtilisateurConnecte";
import { PrismaEntrepriseRepository } from "../../infrastructure/repositories/PrismaEntrepriseRepository";
import { redirect } from "next/navigation";

const entrepriseRepository = new PrismaEntrepriseRepository();

type DashboardLayoutProps = {
  children: ReactNode;
};

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const utilisateurConnecte = await getUtilisateurConnecte();

  if (!utilisateurConnecte) {
    redirect("/login");
  }

  const entreprise = await entrepriseRepository.trouverParId(utilisateurConnecte.entrepriseId);

  if (!entreprise) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 lg:flex">
      <aside className="border-b border-zinc-200 bg-white px-5 py-6 lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-72 lg:flex-col lg:border-b-0 lg:border-r">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">Vantik</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Zone connectée</h1>
        </div>

        <div className="mb-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <p className="text-sm font-medium text-zinc-900">{utilisateurConnecte.nom}</p>
          <p className="mt-1 text-sm text-zinc-600">{entreprise.nom}</p>
          <p className="mt-2 text-xs text-zinc-500">{utilisateurConnecte.role}</p>
        </div>

        <nav className="flex flex-col gap-2 text-sm font-medium">
          <Link className="rounded-xl px-3 py-2 transition hover:bg-zinc-100" href="/">
            Accueil
          </Link>
          <Link className="rounded-xl px-3 py-2 transition hover:bg-zinc-100" href="/produits">
            Produits
          </Link>
          <Link className="rounded-xl px-3 py-2 transition hover:bg-zinc-100" href="/fournisseurs">
            Fournisseurs
          </Link>
          <Link className="rounded-xl px-3 py-2 transition hover:bg-zinc-100" href="/commandes-fournisseurs">
            Commandes fournisseurs
          </Link>
          <Link className="rounded-xl px-3 py-2 transition hover:bg-zinc-100" href="/alertes">
            Alertes
          </Link>
          {utilisateurConnecte.role === "ADMINISTRATEUR" ? (
            <Link className="rounded-xl px-3 py-2 transition hover:bg-zinc-100" href="/parametres">
              Paramètres
            </Link>
          ) : null}
        </nav>

        <form action={deconnexionAction} className="mt-8">
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-900"
          >
            Se déconnecter
          </button>
        </form>
      </aside>

      <div className="flex-1">{children}</div>
    </div>
  );
}