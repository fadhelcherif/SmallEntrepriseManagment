import { redirect } from "next/navigation";
import { TrendingUp, PiggyBank, ShoppingBasket, AlertTriangle } from "lucide-react";

import { genererRapportPrevisions } from "../../../application/previsions/genererRapportPrevisions";
import { getUtilisateurConnecte } from "../../../infrastructure/auth/getUtilisateurConnecte";
import { PrismaProduitRepository } from "../../../infrastructure/repositories/PrismaProduitRepository";
import { PrismaCommandeRepository } from "../../../infrastructure/repositories/PrismaCommandeRepository";
import { PrismaChargeRepository } from "../../../infrastructure/repositories/PrismaChargeRepository";
import { PrismaFournisseurRepository } from "../../../infrastructure/repositories/PrismaFournisseurRepository";
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
    utilisateurConnecte.entrepriseId,
    estAdministrateur,
  );

  return (
    <main className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
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
          <>
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

            <div className="grid gap-4 sm:grid-cols-2">
              <StatCard
                icon={TrendingUp}
                label="Chiffre d'affaires prévu (prochain mois)"
                value={rapport.chiffreAffaires.previsionProchainMois !== null ? formaterMontant(rapport.chiffreAffaires.previsionProchainMois) : "—"}
              />

              {rapport.finance ? (
                <StatCard
                  icon={PiggyBank}
                  label="Montant à investir recommandé"
                  value={formaterMontant(rapport.finance.montantAInvestirRecommande)}
                  hint="Basé sur la marge moyenne lissée des 3 derniers mois"
                />
              ) : null}
            </div>

            {rapport.finance ? (
              <Panel
                title="Marge projetée et risque"
                description="La marge projetée compare les ventes ET les charges prévues séparément — un revenu qui progresse peut cacher des charges qui progressent plus vite."
              >
                <div className="flex flex-wrap items-center gap-4">
                  <p className="font-heading text-2xl font-bold text-stone-900">
                    {rapport.finance.margeProjeteeProchainMois !== null ? formaterMontant(rapport.finance.margeProjeteeProchainMois) : "—"}
                  </p>
                  {rapport.finance.niveauRisque ? (
                    <Badge variante={LIBELLE_RISQUE_PREVISION[rapport.finance.niveauRisque].variante}>
                      {rapport.finance.niveauRisque === "RISQUE_PERTE" ? <AlertTriangle className="h-3.5 w-3.5" strokeWidth={1.75} /> : null}
                      {LIBELLE_RISQUE_PREVISION[rapport.finance.niveauRisque].label}
                    </Badge>
                  ) : null}
                </div>
              </Panel>
            ) : null}

            <Panel
              title="Réapprovisionnement suggéré"
              description="Quantité à commander = volume attendu le mois prochain + demande pendant le délai de livraison + seuil d'alerte − stock actuel."
            >
              {rapport.produits.length === 0 ? (
                <EmptyState icon={ShoppingBasket} title="Aucun produit" description="Ajoute des produits pour voir des suggestions de réapprovisionnement." />
              ) : (
                <div className="grid gap-2">
                  {rapport.produits.map((produit) => (
                    <div key={produit.nom} className="rounded-lg border border-stone-200 p-4">
                      <div className="grid grid-cols-[1fr_auto] items-center gap-4 sm:grid-cols-[200px_1fr_auto_auto]">
                        <p className="font-medium text-stone-900">{produit.nom}</p>

                        <div className="hidden sm:block">
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

                        <p className="text-right sm:text-left">
                          <span className="font-heading text-lg font-bold text-stone-900">{produit.quantiteACommander}</span>
                          <span className="ml-1.5 text-xs text-stone-500">à commander</span>
                        </p>

                        <Badge variante={LIBELLE_CONFIANCE_PREVISION[produit.confiance].variante}>
                          {LIBELLE_CONFIANCE_PREVISION[produit.confiance].label}
                        </Badge>
                      </div>

                      {produit.fournisseurRecommande ? (
                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-stone-100 pt-3 text-xs text-stone-500">
                          <span>
                            Fournisseur recommandé : <span className="font-medium text-stone-700">{produit.fournisseurRecommande}</span>
                            {produit.critereFournisseur ? (
                              <span className="ml-1 text-stone-400">
                                ({produit.critereFournisseur === "DELAI" ? "stock bas, livraison la plus rapide" : "meilleur prix"})
                              </span>
                            ) : null}
                          </span>
                          {produit.delaiLivraisonJours !== null ? <span>Délai de livraison : {produit.delaiLivraisonJours} jour(s)</span> : null}
                          {produit.dernierPrixPaye !== null ? <span>Dernier prix payé : {produit.dernierPrixPaye.toFixed(2)}</span> : null}
                          {produit.coutEstime !== null ? (
                            <span className="font-medium text-stone-700">Coût estimé de la commande : {produit.coutEstime.toFixed(2)}</span>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </>
        )}
      </div>
    </main>
  );
}
