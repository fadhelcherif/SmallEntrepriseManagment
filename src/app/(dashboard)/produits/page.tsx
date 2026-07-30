import { creerProduitAction } from "./actions";
import { ProduitActions } from "./ProduitActions";
import { ProduitForm } from "./ProduitForm";
import { listerProduits } from "../../../application/produits/listerProduits";
import { getUtilisateurConnecte } from "../../../infrastructure/auth/getUtilisateurConnecte";
import { PrismaProduitRepository } from "../../../infrastructure/repositories/PrismaProduitRepository";
import { redirect } from "next/navigation";
import { Package } from "lucide-react";
import { PageHeader } from "../../_components/ui/PageHeader";
import { Panel } from "../../_components/ui/Panel";
import { EmptyState } from "../../_components/ui/EmptyState";
import { Badge } from "../../_components/ui/Badge";

const repository = new PrismaProduitRepository();

export default async function ProduitsPage() {
  const utilisateurConnecte = await getUtilisateurConnecte();

  if (!utilisateurConnecte) {
    redirect("/login");
  }

  const produits = await listerProduits(repository, utilisateurConnecte.entrepriseId);

  return (
    <main className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <PageHeader
          title="Produits"
          description="Gestion du catalogue produits de l'entreprise. La page liste les produits existants et permet d'en créer un nouveau."
        />

        <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
          <ProduitForm entrepriseId={utilisateurConnecte.entrepriseId} action={creerProduitAction} />

          <Panel title="Produits enregistrés" description={`${produits.length} produit(s) trouvé(s).`}>
            {produits.length === 0 ? (
              <EmptyState
                icon={Package}
                title="Aucun produit pour le moment"
                description="Ajoute ton premier produit avec le formulaire à gauche pour démarrer le catalogue."
              />
            ) : (
              <div className="overflow-hidden rounded-lg border border-stone-200">
                <table className="min-w-full divide-y divide-stone-200 text-left text-sm">
                  <thead className="bg-stone-50 text-stone-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Nom</th>
                      <th className="px-4 py-3 text-right font-medium">Prix d’achat</th>
                      <th className="px-4 py-3 text-right font-medium">Prix de vente</th>
                      <th className="px-4 py-3 text-right font-medium">Stock</th>
                      <th className="px-4 py-3 text-right font-medium">Seuil</th>
                      <th className="px-4 py-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 bg-white">
                    {produits.map((produit) => {
                      const stockBas = produit.quantiteStock <= produit.seuilAlerte;

                      return (
                        <tr key={produit.id}>
                          <td className="px-4 py-3">
                            <div className="font-medium text-stone-900">{produit.nom}</div>
                            {produit.description ? (
                              <div className="mt-1 text-xs text-stone-500">{produit.description}</div>
                            ) : null}
                          </td>
                          <td className="px-4 py-3 text-right text-stone-700">{produit.prixAchat.toFixed(2)}</td>
                          <td className="px-4 py-3 text-right text-stone-700">{produit.prixVente.toFixed(2)}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {stockBas ? <Badge variante="avertissement">Stock bas</Badge> : null}
                              <span className="text-stone-700">{produit.quantiteStock}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right text-stone-700">{produit.seuilAlerte}</td>
                          <td className="px-4 py-3">
                            <ProduitActions entrepriseId={utilisateurConnecte.entrepriseId} produit={produit} />
                          </td>
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
