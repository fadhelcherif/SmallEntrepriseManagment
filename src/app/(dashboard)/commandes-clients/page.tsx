import { redirect } from "next/navigation";
import { Receipt, Check, ChevronRight, PackageMinus, XCircle } from "lucide-react";

import { listerCommandes } from "../../../application/commandes/listerCommandes";
import { listerProduits } from "../../../application/produits/listerProduits";
import { listerAttributs } from "../../../application/attributs/listerAttributs";
import { listerValeursPourProduits } from "../../../application/attributs/listerValeursPourProduits";
import { getUtilisateurConnecte } from "../../../infrastructure/auth/getUtilisateurConnecte";
import { PrismaCommandeRepository } from "../../../infrastructure/repositories/PrismaCommandeRepository";
import { PrismaProduitRepository } from "../../../infrastructure/repositories/PrismaProduitRepository";
import { PrismaAttributPersonnaliseRepository } from "../../../infrastructure/repositories/PrismaAttributPersonnaliseRepository";
import { PrismaValeurAttributRepository } from "../../../infrastructure/repositories/PrismaValeurAttributRepository";
import { ENTITE_CIBLE_PRODUIT } from "../../../domain/entities/AttributPersonnalise";
import { creerCommandeVenteAction, validerCommandeVenteAction, annulerCommandeVenteAction, receptionnerCommandeVenteAction } from "./actions";
import { CommandeVenteForm } from "./CommandeVenteForm";
import { PageHeader } from "../../_components/ui/PageHeader";
import { Panel } from "../../_components/ui/Panel";
import { EmptyState } from "../../_components/ui/EmptyState";
import { Badge } from "../../_components/ui/Badge";
import { Bouton } from "../../_components/ui/Bouton";
import { FiltreDates } from "../../_components/ui/FiltreDates";
import { LIBELLE_STATUT_COMMANDE } from "../../_lib/libellesStatuts";
import { calculerMontantTotalCommande } from "../../../domain/services/calculerMontantCommande";
import { cleJournaliere, grouperCommandesParJour } from "../../../domain/services/grouperCommandesParJour";
import { formaterAttributsProduit, grouperValeursParProduit } from "../../_lib/formaterAttributsProduit";

const commandeRepository = new PrismaCommandeRepository();
const produitRepository = new PrismaProduitRepository();
const attributRepository = new PrismaAttributPersonnaliseRepository();
const valeurAttributRepository = new PrismaValeurAttributRepository();

function parserBorneDate(valeur: string | undefined, finDeJournee: boolean): Date | undefined {
  if (!valeur) {
    return undefined;
  }

  const date = new Date(`${valeur}T${finDeJournee ? "23:59:59.999" : "00:00:00"}`);

  return Number.isNaN(date.getTime()) ? undefined : date;
}

function formaterEnTeteJour(cle: string, aujourdHui: string): string {
  if (cle === aujourdHui) {
    return "Aujourd'hui";
  }

  const [annee, mois, jour] = cle.split("-").map(Number);
  const date = new Date(annee, mois - 1, jour);

  return new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(date);
}

type PageProps = {
  searchParams: Promise<{ du?: string; au?: string }>;
};

export default async function CommandesClientsPage({ searchParams }: PageProps) {
  const utilisateurConnecte = await getUtilisateurConnecte();

  if (!utilisateurConnecte) {
    redirect("/login");
  }

  const { du, au } = await searchParams;

  const [toutesLesCommandes, produits] = await Promise.all([
    listerCommandes(commandeRepository, utilisateurConnecte.entrepriseId),
    listerProduits(produitRepository, utilisateurConnecte.entrepriseId),
  ]);

  const borneDebut = parserBorneDate(du, false);
  const borneFin = parserBorneDate(au, true);

  const commandes = toutesLesCommandes.filter((commande) => {
    if (commande.type !== "VENTE_CLIENT") {
      return false;
    }

    if (borneDebut && commande.dateCommande < borneDebut) {
      return false;
    }

    if (borneFin && commande.dateCommande > borneFin) {
      return false;
    }

    return true;
  });

  const produitsParId = new Map(produits.map((produit) => [produit.id, produit.nom]));

  const attributsProduit = await listerAttributs(attributRepository, utilisateurConnecte.entrepriseId, ENTITE_CIBLE_PRODUIT);
  const valeursParProduit = grouperValeursParProduit(
    await listerValeursPourProduits(valeurAttributRepository, produits.map((produit) => produit.id)),
  );
  const produitsAvecAttributs = produits.map((produit) => ({
    ...produit,
    attributsAffichage: formaterAttributsProduit(attributsProduit, valeursParProduit.get(produit.id)),
  }));

  const montantPeriode = calculerMontantTotalCommande(commandes.flatMap((commande) => commande.lignes));
  const groupesParJour = grouperCommandesParJour(commandes);
  const aujourdHui = cleJournaliere(new Date());

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
            produits={produitsAvecAttributs}
            action={creerCommandeVenteAction}
          />

          <div className="flex flex-col gap-6">
            <FiltreDates du={du} au={au} />

            <Panel
              title="Commandes enregistrées"
              description={`${commandes.length} commande(s) — total ventes sur la période : ${montantPeriode.toFixed(2)}`}
            >
              {commandes.length === 0 ? (
                <EmptyState
                  icon={Receipt}
                  title={du || au ? "Aucune commande sur cette période" : "Aucune commande pour le moment"}
                  description={
                    du || au
                      ? "Élargis la période filtrée ou réinitialise le filtre."
                      : "Crée ta première commande client avec le formulaire à gauche."
                  }
                />
              ) : (
                <div className="space-y-3">
                  {groupesParJour.map((groupe) => (
                    <details
                      key={groupe.cle}
                      open={groupe.cle === aujourdHui}
                      className="group rounded-lg border border-stone-200 bg-white"
                    >
                      <summary className="flex list-none cursor-pointer items-center justify-between gap-4 px-4 py-3 [&::-webkit-details-marker]:hidden">
                        <span className="flex items-center gap-2">
                          <ChevronRight className="h-4 w-4 shrink-0 text-stone-400 transition-transform group-open:rotate-90" strokeWidth={1.75} />
                          <span className="text-sm font-semibold text-stone-900">{formaterEnTeteJour(groupe.cle, aujourdHui)}</span>
                          <span className="text-xs text-stone-500">
                            ({groupe.commandes.length} commande{groupe.commandes.length > 1 ? "s" : ""})
                          </span>
                        </span>
                        <span className="font-heading text-sm font-semibold text-stone-900">
                          Total journée : {groupe.total.toFixed(2)}
                        </span>
                      </summary>

                      <div className="space-y-4 border-t border-stone-200 p-4">
                        {groupe.commandes.map((commande) => {
                          const libelle = LIBELLE_STATUT_COMMANDE[commande.statut];
                          const montantTotal = calculerMontantTotalCommande(commande.lignes);

                          return (
                            <article key={commande.id} className="rounded-lg border border-stone-200 p-4">
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                  <div className="flex items-center gap-2 text-xs text-stone-500">
                                    {libelle ? <Badge variante={libelle.variante}>{libelle.label}</Badge> : commande.statut}
                                    <span>{commande.dateCommande.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
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
                    </details>
                  ))}
                </div>
              )}
            </Panel>
          </div>
        </div>
      </div>
    </main>
  );
}
