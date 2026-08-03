import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, History } from "lucide-react";

import { getUtilisateurConnecte } from "../../../../../infrastructure/auth/getUtilisateurConnecte";
import { PrismaMouvementStockRepository } from "../../../../../infrastructure/repositories/PrismaMouvementStockRepository";
import { PrismaProduitRepository } from "../../../../../infrastructure/repositories/PrismaProduitRepository";
import { listerMouvementsProduit } from "../../../../../application/stock/listerMouvementsProduit";
import { enregistrerMouvementAction } from "./actions";
import { MouvementStockForm } from "./MouvementStockForm";
import { PageHeader } from "../../../../_components/ui/PageHeader";
import { Panel } from "../../../../_components/ui/Panel";
import { EmptyState } from "../../../../_components/ui/EmptyState";
import { Badge } from "../../../../_components/ui/Badge";
import { boutonClasses } from "../../../../_components/ui/boutonClasses";
import { LIBELLE_TYPE_MOUVEMENT } from "../../../../_lib/libellesStatuts";

type PageProps = {
  params: Promise<{ id: string }>;
};

const produitRepository = new PrismaProduitRepository();
const mouvementRepository = new PrismaMouvementStockRepository();

function formaterDate(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function MouvementsProduitPage({ params }: PageProps) {
  const { id: produitId } = await params;
  const utilisateurConnecte = await getUtilisateurConnecte();

  if (!utilisateurConnecte) {
    redirect("/login");
  }

  const produit = await produitRepository.trouverParId(produitId);

  if (!produit || produit.entrepriseId !== utilisateurConnecte.entrepriseId) {
    redirect("/produits");
  }

  const mouvements = await listerMouvementsProduit(mouvementRepository, produitId);

  return (
    <main className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <PageHeader
          title="Mouvement de stock"
          description={`Produit : ${produit.nom}. Stock actuel : ${produit.quantiteStock}. Seuil d'alerte : ${produit.seuilAlerte}.`}
          actions={
            <Link href="/produits" className={boutonClasses("discret")}>
              <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
              Retour aux produits
            </Link>
          }
        />

        <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
          <MouvementStockForm produitId={produitId} action={enregistrerMouvementAction} />

          <Panel title="Historique des mouvements" description={`${mouvements.length} mouvement(s) enregistré(s).`}>
            {mouvements.length === 0 ? (
              <EmptyState
                icon={History}
                title="Aucun mouvement pour le moment"
                description="Enregistre une entrée, une sortie ou un ajustement avec le formulaire à gauche."
              />
            ) : (
              <div className="overflow-hidden rounded-lg border border-stone-200">
                <table className="min-w-full divide-y divide-stone-200 text-left text-sm">
                  <thead className="bg-stone-50 text-stone-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">Quantité</th>
                      <th className="px-4 py-3 font-medium">Motif</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 bg-white">
                    {mouvements.map((mouvement) => {
                      const libelle = LIBELLE_TYPE_MOUVEMENT[mouvement.type];

                      return (
                        <tr key={mouvement.id}>
                          <td className="px-4 py-3 text-stone-700">{formaterDate(mouvement.date)}</td>
                          <td className="px-4 py-3">
                            {libelle ? <Badge variante={libelle.variante}>{libelle.label}</Badge> : mouvement.type}
                          </td>
                          <td className="px-4 py-3 text-stone-700">{mouvement.quantite}</td>
                          <td className="px-4 py-3 text-stone-700">{mouvement.motif ?? "—"}</td>
                        </tr>
                      );
                    })}
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
