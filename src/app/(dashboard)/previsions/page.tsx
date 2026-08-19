import { redirect } from "next/navigation";
import { TrendingUp, PiggyBank, ShoppingBasket, AlertTriangle } from "lucide-react";

import { genererRapportPrevisions } from "../../../application/previsions/genererRapportPrevisions";
import { getUtilisateurConnecte } from "../../../infrastructure/auth/getUtilisateurConnecte";
import { PrismaProduitRepository } from "../../../infrastructure/repositories/PrismaProduitRepository";
import { PrismaCommandeRepository } from "../../../infrastructure/repositories/PrismaCommandeRepository";
import { PrismaChargeRepository } from "../../../infrastructure/repositories/PrismaChargeRepository";
import { PrismaFournisseurRepository } from "../../../infrastructure/repositories/PrismaFournisseurRepository";
import { PrismaAttributPersonnaliseRepository } from "../../../infrastructure/repositories/PrismaAttributPersonnaliseRepository";
import { PrismaValeurAttributRepository } from "../../../infrastructure/repositories/PrismaValeurAttributRepository";
import { PageHeader } from "../../_components/ui/PageHeader";
import { Panel } from "../../_components/ui/Panel";
import { StatCard } from "../../_components/ui/StatCard";
import { EmptyState } from "../../_components/ui/EmptyState";
import { Badge } from "../../_components/ui/Badge";
import { GraphiqueBarresPrevision } from "../../_components/ui/GraphiqueBarresPrevision";
import { LIBELLE_CONFIANCE_PREVISION, LIBELLE_RISQUE_PREVISION } from "../../_lib/libellesStatuts";

const produitRepository = new PrismaProduitRepository();
const commandeRepository = new PrismaCommandeRepository();
const chargeRepository = new PrismaChargeRepository();
const fournisseurRepository = new PrismaFournisseurRepository();
const attributRepository = new PrismaAttributPersonnaliseRepository();
const valeurAttributRepository = new PrismaValeurAttributRepository();

function formaterMontant(valeur: number): string {
  return valeur.toFixed(2);
}

export default async function PrevisionsPage() {
  const utilisateurConnecte = await getUtilisateurConnecte();

  if (!utilisateurConnecte) {
    redirect("/login");
  }

  const estAdministrateur = utilisateurConnecte.role === "ADMINISTRATEUR";

  const rapport = await genererRapportPrevisions(
    produitRepository,
    commandeRepository,
    chargeRepository,
    fournisseurRepository,
    attributRepository,
    valeurAttributRepository,
    utilisateurConnecte.entrepriseId,
    estAdministrateur,
  );

  return (
    <main className="px-5 py-6 sm:px-8">
      <div className="flex w-full flex-col gap-6">
        <PageHeader
          title="Prévisions"
          description="Recalculées à chaque visite de cette page, à partir de l'historique réel de l'entreprise."
        />

        {rapport.chiffreAffaires.historiqueInsuffisant ? (
          <Panel>
            <EmptyState
              icon={TrendingUp}
              title="Historique insuffisant pour prévoir"
              description="Il faut au moins 8 mois de commandes reçues pour prévoir de façon fiable. Reviens sur cette page une fois plus d'historique accumulé."
            />
          </Panel>
        ) : (
          <div className="grid gap-5 lg:grid-cols-3">
            <StatCard
              icon={TrendingUp}
              label="Chiffre d'affaires prévu (prochain mois)"
              value={rapport.chiffreAffaires.previsionProchainMois !== null ? formaterMontant(rapport.chiffreAffaires.previsionProchainMois) : "—"}
              couleur="#10b981"
            />

            {rapport.finance ? (
              <>
                <article className="shadow-card rounded-3xl bg-white p-5">
                  <div
                    className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: "color-mix(in srgb, #8b5cf6 16%, white)", color: "#8b5cf6" }}
                  >
                    <AlertTriangle className="h-5.5 w-5.5" strokeWidth={1.75} />
                  </div>
                  <p className="text-sm text-stone-500">Marge projetée (prochain mois)</p>
                  <p className="mt-1 font-heading text-2xl font-bold text-stone-900">
                    {rapport.finance.margeProjeteeProchainMois !== null ? formaterMontant(rapport.finance.margeProjeteeProchainMois) : "—"}
                  </p>
                  {rapport.finance.niveauRisque ? (
                    <div className="mt-2">
                      <Badge variante={LIBELLE_RISQUE_PREVISION[rapport.finance.niveauRisque].variante}>
                        {LIBELLE_RISQUE_PREVISION[rapport.finance.niveauRisque].label}
                      </Badge>
                    </div>
                  ) : null}
                </article>

                <StatCard
                  icon={PiggyBank}
                  label="Montant à investir recommandé"
                  value={formaterMontant(rapport.finance.montantAInvestirRecommande)}
                  hint="Basé sur la marge moyenne lissée des 3 derniers mois"
                  couleur="#f59e0b"
                />
              </>
            ) : null}

            <div className="lg:col-span-3">
              <Panel
                title="Chiffre d'affaires — réel et prévu"
                description="Barres pleines : mois réels. Barres pointillées : prévision, avec la fourchette possible en trait vertical."
                actions={
                  rapport.chiffreAffaires.confiance ? (
                    <Badge variante={LIBELLE_CONFIANCE_PREVISION[rapport.chiffreAffaires.confiance].variante}>
                      Confiance : {LIBELLE_CONFIANCE_PREVISION[rapport.chiffreAffaires.confiance].label}
                    </Badge>
                  ) : undefined
                }
              >
                <GraphiqueBarresPrevision points={rapport.chiffreAffaires.courbe} />
              </Panel>
            </div>

            <div className="lg:col-span-3">
              <Panel
                title="Réapprovisionnement suggéré"
                description="Quantité à commander = volume attendu le mois prochain + demande pendant le délai de livraison + seuil d'alerte − stock actuel."
              >
                {rapport.produits.length === 0 ? (
                  <EmptyState icon={ShoppingBasket} title="Aucun produit" description="Ajoute des produits pour voir des suggestions de réapprovisionnement." />
                ) : (
                  <div className="grid gap-3 lg:grid-cols-2">
                    {rapport.produits.map((produit) => (
                      <div key={produit.nom} className="rounded-2xl border border-stone-200 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-medium text-stone-900">{produit.nom}</p>
                          <Badge variante={LIBELLE_CONFIANCE_PREVISION[produit.confiance].variante}>
                            {LIBELLE_CONFIANCE_PREVISION[produit.confiance].label}
                          </Badge>
                        </div>

                        <div className="mt-3">
                          <div className="h-2 w-full overflow-hidden rounded-full bg-stone-100">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${rapport.volumeMaxProduits > 0 ? Math.max(4, (produit.demandePrevueProchainMois / rapport.volumeMaxProduits) * 100) : 0}%`,
                                backgroundColor: "var(--color-primary)",
                              }}
                            />
                          </div>
                          <p className="mt-1 text-xs text-stone-500">{produit.demandePrevueProchainMois} unité(s) attendues le mois prochain</p>
                        </div>

                        <p className="mt-3">
                          <span className="font-heading text-lg font-bold text-stone-900">{produit.quantiteACommander}</span>
                          <span className="ml-1.5 text-xs text-stone-500">à commander</span>
                        </p>

                        {produit.fournisseurRecommande ? (
                          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-stone-100 pt-3 text-xs text-stone-500">
                            <span>
                              <span className="font-medium text-stone-700">{produit.fournisseurRecommande}</span>
                              {produit.critereFournisseur ? (
                                <span className="ml-1 text-stone-400">
                                  ({produit.critereFournisseur === "DELAI" ? "livraison rapide" : "meilleur prix"})
                                </span>
                              ) : null}
                            </span>
                            {produit.delaiLivraisonJours !== null ? <span>{produit.delaiLivraisonJours} j</span> : null}
                            {produit.dernierPrixPaye !== null ? <span>{produit.dernierPrixPaye.toFixed(2)} / unité</span> : null}
                            {produit.coutEstime !== null ? (
                              <span className="font-medium text-stone-700">≈ {produit.coutEstime.toFixed(2)}</span>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </Panel>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
