import { redirect } from "next/navigation";

import { getUtilisateurConnecte } from "../../../infrastructure/auth/getUtilisateurConnecte";
import { PrismaEntrepriseRepository } from "../../../infrastructure/repositories/PrismaEntrepriseRepository";
import { modifierEntrepriseAction } from "./actions";
import { ParametresEntrepriseForm } from "./ParametresEntrepriseForm";
import { PageHeader } from "../../_components/ui/PageHeader";

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
    <main className="px-5 py-6 sm:px-8">
      <div className="flex w-full flex-col gap-6">
        <PageHeader
          title="Paramètres de l'entreprise"
          description="Mise à jour des informations de base et de l'identité visuelle de l'entreprise."
        />

        <ParametresEntrepriseForm entreprise={entreprise} action={modifierEntrepriseAction} />
      </div>
    </main>
  );
}
