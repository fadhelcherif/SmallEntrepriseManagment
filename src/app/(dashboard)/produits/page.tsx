import { redirect } from "next/navigation";
import { Package } from "lucide-react";

import { creerProduitAction } from "./actions";
import { ProduitActions } from "./ProduitActions";
import { ProduitForm } from "./ProduitForm";
import type { AttributLigne } from "./AttributsEditeur";
import { SupprimerAttributBouton } from "./SupprimerAttributBouton";
import { listerProduits } from "../../../application/produits/listerProduits";
import { listerAttributs } from "../../../application/attributs/listerAttributs";
import { listerValeursPourProduits } from "../../../application/attributs/listerValeursPourProduits";
import { getUtilisateurConnecte } from "../../../infrastructure/auth/getUtilisateurConnecte";
import { PrismaProduitRepository } from "../../../infrastructure/repositories/PrismaProduitRepository";
import { PrismaAttributPersonnaliseRepository } from "../../../infrastructure/repositories/PrismaAttributPersonnaliseRepository";
import { PrismaValeurAttributRepository } from "../../../infrastructure/repositories/PrismaValeurAttributRepository";
import { ENTITE_CIBLE_PRODUIT } from "../../../domain/entities/AttributPersonnalise";
import { grouperValeursParProduit } from "../../_lib/formaterAttributsProduit";
import { PageHeader } from "../../_components/ui/PageHeader";
import { Panel } from "../../_components/ui/Panel";
import { EmptyState } from "../../_components/ui/EmptyState";

const repository = new PrismaProduitRepository();
const attributRepository = new PrismaAttributPersonnaliseRepository();
const valeurAttributRepository = new PrismaValeurAttributRepository();

export default async function ProduitsPage() {
  const utilisateurConnecte = await getUtilisateurConnecte();

  if (!utilisateurConnecte) {
    redirect("/login");
  }

  const produits = await listerProduits(repository, utilisateurConnecte.entrepriseId);
  const attributs = await listerAttributs(attributRepository, utilisateurConnecte.entrepriseId, ENTITE_CIBLE_PRODUIT);
  const toutesLesValeurs = await listerValeursPourProduits(
    valeurAttributRepository,
    produits.map((produit) => produit.id),
  );

  const valeursParProduit = grouperValeursParProduit(toutesLesValeurs);
  const nomsAttributsExistants = attributs.map((attribut) => attribut.nom);

  return (
    <main className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <PageHeader
          title="Produits"
          description="Gestion du catalogue produits de l'entreprise. La page liste les produits existants et permet d'en créer un nouveau."
        />

        <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
          <ProduitForm
            entrepriseId={utilisateurConnecte.entrepriseId}
            nomsAttributsExistants={nomsAttributsExistants}
            action={creerProduitAction}
          />

          <Panel title="Produits enregistrés" description={`${produits.length} produit(s) trouvé(s).`}>
            {produits.length === 0 ? (
              <EmptyState
                icon={Package}
                title="Aucun produit pour le moment"
                description="Ajoute ton premier produit avec le formulaire à gauche pour démarrer le catalogue."
              />
            ) : (
              <div className="overflow-x-auto rounded-lg border border-stone-200">
                <table className="min-w-full divide-y divide-stone-200 text-left text-sm">
                  <thead className="bg-stone-50 text-stone-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Nom</th>
                      <th className="px-4 py-3 text-right font-medium">Prix d’achat</th>
                      <th className="px-4 py-3 text-right font-medium">Prix de vente</th>
                      {attributs.map((attribut) => (
                        <th key={attribut.id} className="px-4 py-3 font-medium whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5">
                            {attribut.nom}
                            {utilisateurConnecte.role === "ADMINISTRATEUR" ? (
                              <SupprimerAttributBouton attributId={attribut.id} nom={attribut.nom} />
                            ) : null}
                          </span>
                        </th>
                      ))}
                      <th className="px-4 py-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 bg-white">
                    {produits.map((produit) => {
                      const valeursDuProduit = valeursParProduit.get(produit.id);

                      const attributsInitiaux: AttributLigne[] = attributs
                        .filter((attribut) => valeursDuProduit?.has(attribut.id))
                        .map((attribut) => ({ nom: attribut.nom, valeur: valeursDuProduit!.get(attribut.id)! }));

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
                          {attributs.map((attribut) => (
                            <td key={attribut.id} className="px-4 py-3 text-stone-700 whitespace-nowrap">
                              {valeursDuProduit?.get(attribut.id) ?? "—"}
                            </td>
                          ))}
                          <td className="px-4 py-3">
                            <ProduitActions
                              entrepriseId={utilisateurConnecte.entrepriseId}
                              produit={produit}
                              nomsAttributsExistants={nomsAttributsExistants}
                              attributsInitiaux={attributsInitiaux}
                            />
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
