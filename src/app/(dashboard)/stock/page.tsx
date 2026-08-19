import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ChevronRight, History, Package } from "lucide-react";

import { listerMouvementsEntreprise } from "../../../application/stock/listerMouvementsEntreprise";
import { listerProduits } from "../../../application/produits/listerProduits";
import { listerUtilisateurs } from "../../../application/utilisateurs/listerUtilisateurs";
import { listerAttributs } from "../../../application/attributs/listerAttributs";
import { listerValeursPourProduits } from "../../../application/attributs/listerValeursPourProduits";
import { getUtilisateurConnecte } from "../../../infrastructure/auth/getUtilisateurConnecte";
import { PrismaMouvementStockRepository } from "../../../infrastructure/repositories/PrismaMouvementStockRepository";
import { PrismaProduitRepository } from "../../../infrastructure/repositories/PrismaProduitRepository";
import { PrismaUtilisateurRepository } from "../../../infrastructure/repositories/PrismaUtilisateurRepository";
import { PrismaAttributPersonnaliseRepository } from "../../../infrastructure/repositories/PrismaAttributPersonnaliseRepository";
import { PrismaValeurAttributRepository } from "../../../infrastructure/repositories/PrismaValeurAttributRepository";
import { ENTITE_CIBLE_PRODUIT } from "../../../domain/entities/AttributPersonnalise";
import { FiltreMouvements } from "./FiltreMouvements";
import { HistoriqueProduitBouton, type MouvementAffichage } from "./HistoriqueProduitBouton";
import { PageHeader } from "../../_components/ui/PageHeader";
import { Panel } from "../../_components/ui/Panel";
import { EmptyState } from "../../_components/ui/EmptyState";
import { Badge } from "../../_components/ui/Badge";
import { boutonClasses } from "../../_components/ui/boutonClasses";
import { LIBELLE_TYPE_MOUVEMENT } from "../../_lib/libellesStatuts";
import { formaterAttributsProduit, grouperValeursParProduit } from "../../../domain/services/formaterAttributsProduit";

const mouvementRepository = new PrismaMouvementStockRepository();
const produitRepository = new PrismaProduitRepository();
const utilisateurRepository = new PrismaUtilisateurRepository();
const attributRepository = new PrismaAttributPersonnaliseRepository();
const valeurAttributRepository = new PrismaValeurAttributRepository();

function parserBorneDate(valeur: string | undefined, finDeJournee: boolean): Date | undefined {
  if (!valeur) {
    return undefined;
  }

  const date = new Date(`${valeur}T${finDeJournee ? "23:59:59.999" : "00:00:00"}`);

  return Number.isNaN(date.getTime()) ? undefined : date;
}

function formaterDate(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

type PageProps = {
  searchParams: Promise<{ du?: string; au?: string; produitId?: string; type?: string }>;
};

export default async function StockPage({ searchParams }: PageProps) {
  const utilisateurConnecte = await getUtilisateurConnecte();

  if (!utilisateurConnecte) {
    redirect("/login");
  }

  const { du, au, produitId, type } = await searchParams;

  const [toutesLesMouvements, produits, utilisateurs] = await Promise.all([
    listerMouvementsEntreprise(mouvementRepository, utilisateurConnecte.entrepriseId),
    listerProduits(produitRepository, utilisateurConnecte.entrepriseId),
    listerUtilisateurs(utilisateurRepository, utilisateurConnecte.entrepriseId),
  ]);

  const attributsProduit = await listerAttributs(attributRepository, utilisateurConnecte.entrepriseId, ENTITE_CIBLE_PRODUIT);
  const valeursParProduit = grouperValeursParProduit(
    await listerValeursPourProduits(valeurAttributRepository, produits.map((produit) => produit.id)),
  );
  const produitsAvecAttributs = produits.map((produit) => ({
    ...produit,
    attributsAffichage: formaterAttributsProduit(attributsProduit, valeursParProduit.get(produit.id)),
  }));

  const produitsParId = new Map(
    produitsAvecAttributs.map((produit) => [produit.id, produit.attributsAffichage ? `${produit.nom} (${produit.attributsAffichage})` : produit.nom]),
  );
  const utilisateursParId = new Map(utilisateurs.map((utilisateur) => [utilisateur.id, utilisateur.nom]));

  const mouvementsParProduit = new Map<string, MouvementAffichage[]>();
  for (const mouvement of toutesLesMouvements) {
    const ligne: MouvementAffichage = {
      id: mouvement.id,
      dateAffichage: formaterDate(mouvement.date),
      type: mouvement.type,
      quantite: mouvement.quantite,
      motif: mouvement.motif,
      utilisateurNom: mouvement.utilisateurId ? utilisateursParId.get(mouvement.utilisateurId) : undefined,
    };
    const liste = mouvementsParProduit.get(mouvement.produitId) ?? [];
    liste.push(ligne);
    mouvementsParProduit.set(mouvement.produitId, liste);
  }

  const borneDebut = parserBorneDate(du, false);
  const borneFin = parserBorneDate(au, true);

  const mouvements = toutesLesMouvements.filter((mouvement) => {
    if (borneDebut && mouvement.date < borneDebut) {
      return false;
    }

    if (borneFin && mouvement.date > borneFin) {
      return false;
    }

    if (produitId && mouvement.produitId !== produitId) {
      return false;
    }

    if (type && mouvement.type !== type) {
      return false;
    }

    return true;
  });

  const filtreActif = Boolean(du || au || produitId || type);

  return (
    <main className="px-5 py-6 sm:px-8">
      <div className="flex w-full flex-col gap-6">
        <PageHeader
          title="Stock"
          description="Niveau de stock de tous les produits, et historique des mouvements sur demande."
          actions={
            <Link href="/produits" className={boutonClasses("discret")}>
              <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
              Voir les produits
            </Link>
          }
        />

        <Panel title="Produits en stock" description={`${produits.length} produit(s).`}>
          {produits.length === 0 ? (
            <EmptyState
              icon={Package}
              title="Aucun produit pour le moment"
              description="Ajoute des produits depuis l'écran Produits pour suivre leur stock ici."
            />
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-stone-200">
              <table className="min-w-full divide-y divide-stone-200 text-left text-sm">
                <thead className="bg-stone-50 text-stone-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Nom</th>
                    <th className="px-4 py-3 text-right font-medium">Stock</th>
                    <th className="px-4 py-3 text-right font-medium">Seuil</th>
                    {attributsProduit.map((attribut) => (
                      <th key={attribut.id} className="px-4 py-3 font-medium whitespace-nowrap">
                        {attribut.nom}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 bg-white">
                  {produits.map((produit) => {
                    const stockBas = produit.quantiteStock <= produit.seuilAlerte;
                    const valeursDuProduit = valeursParProduit.get(produit.id);

                    return (
                      <tr key={produit.id}>
                        <td className="px-4 py-3">
                          <div className="font-medium text-stone-900">{produit.nom}</div>
                          {produit.description ? (
                            <div className="mt-1 text-xs text-stone-500">{produit.description}</div>
                          ) : null}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {stockBas ? (
                              <Badge variante="avertissement">Stock bas</Badge>
                            ) : (
                              <Badge variante="succes">Stock bon</Badge>
                            )}
                            <span className="text-stone-700">{produit.quantiteStock}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-stone-700">{produit.seuilAlerte}</td>
                        {attributsProduit.map((attribut) => (
                          <td key={attribut.id} className="px-4 py-3 text-stone-700 whitespace-nowrap">
                            {valeursDuProduit?.get(attribut.id) ?? "—"}
                          </td>
                        ))}
                        <td className="px-4 py-3 text-right">
                          <HistoriqueProduitBouton
                            produitNom={produitsParId.get(produit.id) ?? produit.nom}
                            mouvements={mouvementsParProduit.get(produit.id) ?? []}
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

        <details open={filtreActif} className="shadow-card group rounded-2xl border border-stone-200 bg-white">
          <summary className="flex cursor-pointer list-none items-center gap-2 px-6 py-4 [&::-webkit-details-marker]:hidden">
            <ChevronRight className="h-4 w-4 shrink-0 text-stone-400 transition-transform group-open:rotate-90" strokeWidth={1.75} />
            <span className="font-heading text-lg font-semibold text-stone-900">Historique des mouvements</span>
            <span className="text-sm text-stone-500">({mouvements.length} mouvement(s))</span>
          </summary>

          <div className="flex flex-col gap-4 border-t border-stone-200 p-6">
            <FiltreMouvements du={du} au={au} produitId={produitId} type={type} produits={produitsAvecAttributs} />

            {mouvements.length === 0 ? (
              <EmptyState
                icon={History}
                title={filtreActif ? "Aucun mouvement pour ce filtre" : "Aucun mouvement pour le moment"}
                description={
                  filtreActif
                    ? "Élargis le filtre ou réinitialise-le."
                    : "Les mouvements de stock apparaîtront ici au fur et à mesure des entrées, sorties et ajustements."
                }
              />
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-stone-200">
                <table className="min-w-full divide-y divide-stone-200 text-left text-sm">
                  <thead className="bg-stone-50 text-stone-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Produit</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 text-right font-medium">Quantité</th>
                      <th className="px-4 py-3 font-medium">Motif</th>
                      <th className="px-4 py-3 font-medium">Par</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 bg-white">
                    {mouvements.map((mouvement) => {
                      const libelle = LIBELLE_TYPE_MOUVEMENT[mouvement.type];

                      return (
                        <tr key={mouvement.id}>
                          <td className="px-4 py-3 text-stone-700 whitespace-nowrap">{formaterDate(mouvement.date)}</td>
                          <td className="px-4 py-3">
                            <Link
                              href={`/produits/${mouvement.produitId}/mouvements`}
                              className="font-medium text-stone-900 underline decoration-stone-300 underline-offset-4 hover:text-stone-600"
                            >
                              {produitsParId.get(mouvement.produitId) ?? mouvement.produitId}
                            </Link>
                          </td>
                          <td className="px-4 py-3">
                            {libelle ? <Badge variante={libelle.variante}>{libelle.label}</Badge> : mouvement.type}
                          </td>
                          <td className="px-4 py-3 text-right text-stone-700">{mouvement.quantite}</td>
                          <td className="px-4 py-3 text-stone-700">{mouvement.motif ?? "—"}</td>
                          <td className="px-4 py-3 text-stone-700">
                            {(mouvement.utilisateurId && utilisateursParId.get(mouvement.utilisateurId)) ?? "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </details>
      </div>
    </main>
  );
}
