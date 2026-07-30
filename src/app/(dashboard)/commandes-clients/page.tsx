import { redirect } from "next/navigation";
import { Receipt, Check, PackageMinus, XCircle } from "lucide-react";

import { listerCommandes } from "../../../application/commandes/listerCommandes";
import { listerProduits } from "../../../application/produits/listerProduits";
import { getUtilisateurConnecte } from "../../../infrastructure/auth/getUtilisateurConnecte";
import { PrismaCommandeRepository } from "../../../infrastructure/repositories/PrismaCommandeRepository";
import { PrismaProduitRepository } from "../../../infrastructure/repositories/PrismaProduitRepository";
import { creerCommandeVenteAction, validerCommandeVenteAction, annulerCommandeVenteAction, receptionnerCommandeVenteAction } from "./actions";
import { CommandeVenteForm } from "./CommandeVenteForm";
import { PageHeader } from "../../_components/ui/PageHeader";
import { Panel } from "../../_components/ui/Panel";
import { EmptyState } from "../../_components/ui/EmptyState";
import { Badge } from "../../_components/ui/Badge";
import { Bouton } from "../../_components/ui/Bouton";
import { LIBELLE_STATUT_COMMANDE } from "../../_lib/libellesStatuts";
import { calculerMontantTotalCommande } from "../../../domain/services/calculerMontantCommande";

const commandeRepository = new PrismaCommandeRepository();
const produitRepository = new PrismaProduitRepository();

export default async function CommandesClientsPage() {
  const utilisateurConnecte = await getUtilisateurConnecte();

  if (!utilisateurConnecte) {
    redirect("/login");
  }

  const [toutesLesCommandes, produits] = await Promise.all([
    listerCommandes(commandeRepository, utilisateurConnecte.entrepriseId),
    listerProduits(produitRepository, utilisateurConnecte.entrepriseId),
  ]);

  const commandes = toutesLesCommandes.filter((commande) => commande.type === "VENTE_CLIENT");
  const produitsParId = new Map(produits.map((produit) => [produit.id, produit.nom]));

  return (
    <main className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <PageHeader
          title="Commandes clients"
          description="Création des ventes, validation, livraison et annulation des commandes clients."
        />

        <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
          <CommandeVenteForm
            entrepriseId={utilisateurConnecte.entrepriseId}
            utilisateurId={utilisateurConnecte.id}
            produits={produits}
            action={creerCommandeVenteAction}
          />

          <Panel title="Commandes enregistrées" description={`${commandes.length} commande(s) trouvée(s).`}>
            {commandes.length === 0 ? (
              <EmptyState
                icon={Receipt}
                title="Aucune commande pour le moment"
                description="Crée ta première commande client avec le formulaire à gauche."
              />
            ) : (
              <div className="space-y-4">
                {commandes.map((commande) => {
                  const libelle = LIBELLE_STATUT_COMMANDE[commande.statut];
                  const montantTotal = calculerMontantTotalCommande(commande.lignes);

                  return (
                    <article key={commande.id} className="rounded-lg border border-stone-200 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex items-center gap-2 text-xs text-stone-500">
                            {libelle ? <Badge variante={libelle.variante}>{libelle.label}</Badge> : commande.statut}
                            <span>{commande.dateCommande.toLocaleDateString("fr-FR")}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {commande.statut === "BROUILLON" ? (
                            <form action={validerCommandeVenteAction.bind(null, utilisateurConnecte.entrepriseId)}>
                              <input type="hidden" name="commandeJson" value={JSON.stringify(commande)} />
                              <Bouton type="submit">
                                <Check className="h-3.5 w-3.5" strokeWidth={1.75} />
                                Valider
                              </Bouton>
                            </form>
                          ) : null}

                          {commande.statut === "VALIDEE" ? (
                            <form action={receptionnerCommandeVenteAction.bind(null, utilisateurConnecte.entrepriseId)}>
                              <input type="hidden" name="commandeJson" value={JSON.stringify(commande)} />
                              <Bouton type="submit" variante="succes">
                                <PackageMinus className="h-3.5 w-3.5" strokeWidth={1.75} />
                                Livrer
                              </Bouton>
                            </form>
                          ) : null}

                          {commande.statut === "BROUILLON" || commande.statut === "VALIDEE" ? (
                            <form action={annulerCommandeVenteAction.bind(null, utilisateurConnecte.entrepriseId)}>
                              <input type="hidden" name="commandeJson" value={JSON.stringify(commande)} />
                              <Bouton type="submit" variante="danger">
                                <XCircle className="h-3.5 w-3.5" strokeWidth={1.75} />
                                Annuler
                              </Bouton>
                            </form>
                          ) : null}
                        </div>
                      </div>

                      <div className="mt-4 overflow-hidden rounded-md border border-stone-200">
                        <table className="min-w-full divide-y divide-stone-200 text-left text-sm">
                          <thead className="bg-stone-50 text-stone-500">
                            <tr>
                              <th className="px-3 py-2 font-medium">Produit</th>
                              <th className="px-3 py-2 text-right font-medium">Quantité</th>
                              <th className="px-3 py-2 text-right font-medium">Prix appliqué</th>
                              <th className="px-3 py-2 text-right font-medium">Sous-total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-100 bg-white">
                            {commande.lignes.map((ligne) => (
                              <tr key={ligne.id}>
                                <td className="px-3 py-2 text-stone-700">{produitsParId.get(ligne.produitId) ?? ligne.produitId}</td>
                                <td className="px-3 py-2 text-right text-stone-700">{ligne.quantite}</td>
                                <td className="px-3 py-2 text-right text-stone-700">{ligne.prixApplique.toFixed(2)}</td>
                                <td className="px-3 py-2 text-right text-stone-700">{(ligne.quantite * ligne.prixApplique).toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="border-t border-stone-200 bg-stone-50">
                              <td colSpan={3} className="px-3 py-2 text-right text-sm font-medium text-stone-700">
                                Total commande
                              </td>
                              <td className="px-3 py-2 text-right font-heading font-semibold text-stone-900">{montantTotal.toFixed(2)}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </Panel>
        </div>
      </div>
    </main>
  );
}
