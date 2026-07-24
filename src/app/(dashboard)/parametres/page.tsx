import { redirect } from "next/navigation";

import { getUtilisateurConnecte } from "../../../infrastructure/auth/getUtilisateurConnecte";
import { PrismaEntrepriseRepository } from "../../../infrastructure/repositories/PrismaEntrepriseRepository";
import { modifierEntrepriseAction } from "./actions";
import { ParametresEntrepriseForm } from "./ParametresEntrepriseForm";

const repository = new PrismaEntrepriseRepository();

export default async function ParametresPage() {
  const utilisateurConnecte = await getUtilisateurConnecte();

  if (!utilisateurConnecte) {
    redirect("/login");
  }

  if (utilisateurConnecte.role !== "ADMINISTRATEUR") {
    redirect("/produits");
  }

  const entreprise = await repository.trouverParId(utilisateurConnecte.entrepriseId);

  if (!entreprise) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <header className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">Vantik</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Paramètres de l'entreprise</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
            Mise à jour des informations de base et de l'identité visuelle de l'entreprise.
          </p>
        </header>

        <ParametresEntrepriseForm entreprise={entreprise} action={modifierEntrepriseAction} />
      </div>
    </main>
  );
}
