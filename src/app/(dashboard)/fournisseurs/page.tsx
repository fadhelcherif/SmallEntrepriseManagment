import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Trash2, Truck } from "lucide-react";

import { getUtilisateurConnecte } from "../../../infrastructure/auth/getUtilisateurConnecte";
import { PrismaFournisseurRepository } from "../../../infrastructure/repositories/PrismaFournisseurRepository";
import { listerFournisseurs } from "../../../application/fournisseurs/listerFournisseurs";
import { FournisseursForm } from "./FournisseursForm";
import { creerFournisseurAction, modifierFournisseurAction, supprimerFournisseurAction } from "./actions";
import { PageHeader } from "../../_components/ui/PageHeader";
import { Panel } from "../../_components/ui/Panel";
import { EmptyState } from "../../_components/ui/EmptyState";
import { Bouton } from "../../_components/ui/Bouton";
import { boutonClasses } from "../../_components/ui/boutonClasses";
import { champClasses } from "../../_components/ui/champClasses";

const repository = new PrismaFournisseurRepository();

function formaterValeurEntree(nombre?: number | null): string {
  return nombre === undefined || nombre === null ? "" : String(nombre);
}

function FournisseurActions({
  entrepriseId,
  fournisseur,
}: {
  entrepriseId: string;
  fournisseur: { id: string; nom: string; contact?: string | null; adresse?: string | null; delaiLivraisonJours?: number | null };
}) {
  return (
    <div className="flex flex-col gap-3">
      <details className="rounded-md border border-stone-200 bg-stone-50 p-3">
        <summary className={`${boutonClasses("discret")} cursor-pointer list-none text-center`}>
          <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
          Modifier
        </summary>

        <form action={modifierFournisseurAction.bind(null, entrepriseId, fournisseur.id)} className="mt-3 grid gap-3">
          <label className="grid gap-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-stone-500">Nom</span>
            <input name="nom" type="text" required defaultValue={fournisseur.nom} className={champClasses} />
          </label>
          <label className="grid gap-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-stone-500">Contact</span>
            <input name="contact" type="text" defaultValue={fournisseur.contact ?? ""} className={champClasses} />
          </label>
          <label className="grid gap-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-stone-500">Adresse</span>
            <input name="adresse" type="text" defaultValue={fournisseur.adresse ?? ""} className={champClasses} />
          </label>
          <label className="grid gap-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-stone-500">Délai de livraison (jours)</span>
            <input
              name="delaiLivraisonJours"
              type="number"
              min="0"
              step="1"
              defaultValue={formaterValeurEntree(fournisseur.delaiLivraisonJours)}
              className={champClasses}
            />
          </label>
          <Bouton type="submit">Enregistrer</Bouton>
        </form>
      </details>

      <form action={supprimerFournisseurAction.bind(null, entrepriseId, fournisseur.id)}>
        <Bouton type="submit" variante="danger" className="w-full">
          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
          Supprimer
        </Bouton>
      </form>
    </div>
  );
}

export default async function FournisseursPage() {
  const utilisateurConnecte = await getUtilisateurConnecte();

  if (!utilisateurConnecte) {
    redirect("/login");
  }

  const fournisseurs = await listerFournisseurs(repository, utilisateurConnecte.entrepriseId);

  return (
    <main className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <PageHeader
          title="Fournisseurs"
          description="Gestion des fournisseurs liés à l'entreprise connectée."
          actions={
            <Link href="/produits" className={boutonClasses("discret")}>
              <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
              Retour aux produits
            </Link>
          }
        />

        <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
          <FournisseursForm entrepriseId={utilisateurConnecte.entrepriseId} action={creerFournisseurAction} />

          <Panel title="Fournisseurs enregistrés" description={`${fournisseurs.length} fournisseur(s) trouvé(s).`}>
            {fournisseurs.length === 0 ? (
              <EmptyState
                icon={Truck}
                title="Aucun fournisseur pour le moment"
                description="Ajoute ton premier fournisseur avec le formulaire à gauche."
              />
            ) : (
              <div className="overflow-hidden rounded-lg border border-stone-200">
                <table className="min-w-full divide-y divide-stone-200 text-left text-sm">
                  <thead className="bg-stone-50 text-stone-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Nom</th>
                      <th className="px-4 py-3 font-medium">Contact</th>
                      <th className="px-4 py-3 font-medium">Adresse</th>
                      <th className="px-4 py-3 font-medium">Délai</th>
                      <th className="px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 bg-white">
                    {fournisseurs.map((fournisseur) => (
                      <tr key={fournisseur.id} className="align-top">
                        <td className="px-4 py-3 font-medium text-stone-900">{fournisseur.nom}</td>
                        <td className="px-4 py-3 text-stone-700">{fournisseur.contact ?? "-"}</td>
                        <td className="px-4 py-3 text-stone-700">{fournisseur.adresse ?? "-"}</td>
                        <td className="px-4 py-3 text-stone-700">{fournisseur.delaiLivraisonJours ?? "-"}</td>
                        <td className="px-4 py-3 align-top">
                          <FournisseurActions entrepriseId={utilisateurConnecte.entrepriseId} fournisseur={fournisseur} />
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
