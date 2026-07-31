import { redirect } from "next/navigation";
import { Users } from "lucide-react";

import { listerUtilisateurs } from "../../../application/utilisateurs/listerUtilisateurs";
import { getUtilisateurConnecte } from "../../../infrastructure/auth/getUtilisateurConnecte";
import { PrismaUtilisateurRepository } from "../../../infrastructure/repositories/PrismaUtilisateurRepository";
import { creerUtilisateurAction } from "./actions";
import { UtilisateurForm } from "./UtilisateurForm";
import { UtilisateurActions } from "./UtilisateurActions";
import { PageHeader } from "../../_components/ui/PageHeader";
import { Panel } from "../../_components/ui/Panel";
import { EmptyState } from "../../_components/ui/EmptyState";
import { Badge } from "../../_components/ui/Badge";

const repository = new PrismaUtilisateurRepository();

export default async function UtilisateursPage() {
  const utilisateurConnecte = await getUtilisateurConnecte();

  if (!utilisateurConnecte) {
    redirect("/login");
  }

  if (utilisateurConnecte.role !== "ADMINISTRATEUR") {
    redirect("/produits");
  }

  const utilisateurs = await listerUtilisateurs(repository, utilisateurConnecte.entrepriseId);

  return (
    <main className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <PageHeader
          title="Utilisateurs"
          description="Gestion des membres de l'équipe. Réservé aux administrateurs."
        />

        <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
          <UtilisateurForm action={creerUtilisateurAction} />

          <Panel title="Membres de l'équipe" description={`${utilisateurs.length} utilisateur(s) trouvé(s).`}>
            {utilisateurs.length === 0 ? (
              <EmptyState
                icon={Users}
                title="Aucun utilisateur"
                description="Ajoute ton premier employé avec le formulaire à gauche."
              />
            ) : (
              <div className="overflow-hidden rounded-lg border border-stone-200">
                <table className="min-w-full divide-y divide-stone-200 text-left text-sm">
                  <thead className="bg-stone-50 text-stone-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Nom</th>
                      <th className="px-4 py-3 font-medium">Email</th>
                      <th className="px-4 py-3 font-medium">Rôle</th>
                      <th className="px-4 py-3 font-medium">Statut</th>
                      <th className="px-4 py-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 bg-white">
                    {utilisateurs.map((utilisateur) => (
                      <tr key={utilisateur.id}>
                        <td className="px-4 py-3 font-medium text-stone-900">{utilisateur.nom}</td>
                        <td className="px-4 py-3 text-stone-700">{utilisateur.email}</td>
                        <td className="px-4 py-3">
                          <Badge variante={utilisateur.role === "ADMINISTRATEUR" ? "info" : "neutre"}>
                            {utilisateur.role === "ADMINISTRATEUR" ? "Administrateur" : "Employé"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variante={utilisateur.actif ? "succes" : "danger"}>
                            {utilisateur.actif ? "Actif" : "Inactif"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {utilisateur.id === utilisateurConnecte.id ? (
                            <span className="text-xs text-stone-400">Vous</span>
                          ) : (
                            <UtilisateurActions utilisateur={utilisateur} />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        </div>
      </div>
    </main>
  );
}
