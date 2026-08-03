import Link from "next/link";
import { redirect } from "next/navigation";
import { BellRing, ClipboardList, Package, Truck, Trophy, TrendingUp, ShoppingCart, Warehouse, PiggyBank } from "lucide-react";

import { listerAlertes } from "../../application/alertes/listerAlertes";
import { listerCommandes } from "../../application/commandes/listerCommandes";
import { listerFournisseurs } from "../../application/fournisseurs/listerFournisseurs";
import { listerProduits } from "../../application/produits/listerProduits";
import { listerCharges } from "../../application/charges/listerCharges";
import { TYPE_CHARGE_ACHAT_FOURNISSEUR } from "../../domain/entities/Charge";
import { listerAttributs } from "../../application/attributs/listerAttributs";
import { listerValeursPourProduits } from "../../application/attributs/listerValeursPourProduits";
import { ENTITE_CIBLE_PRODUIT } from "../../domain/entities/AttributPersonnalise";
import { getUtilisateurConnecte } from "../../infrastructure/auth/getUtilisateurConnecte";
import { PrismaAlerteRepository } from "../../infrastructure/repositories/PrismaAlerteRepository";
import { PrismaCommandeRepository } from "../../infrastructure/repositories/PrismaCommandeRepository";
import { PrismaEntrepriseRepository } from "../../infrastructure/repositories/PrismaEntrepriseRepository";
import { PrismaFournisseurRepository } from "../../infrastructure/repositories/PrismaFournisseurRepository";
import { PrismaProduitRepository } from "../../infrastructure/repositories/PrismaProduitRepository";
import { PrismaChargeRepository } from "../../infrastructure/repositories/PrismaChargeRepository";
import { PrismaAttributPersonnaliseRepository } from "../../infrastructure/repositories/PrismaAttributPersonnaliseRepository";
import { PrismaValeurAttributRepository } from "../../infrastructure/repositories/PrismaValeurAttributRepository";
import { calculerMontantTotalCommande } from "../../domain/services/calculerMontantCommande";
import { calculerValeurStock } from "../../domain/services/calculerValeurStock";
import { calculerVentesParProduit } from "../../domain/services/calculerVentesParProduit";
import { Panel } from "../_components/ui/Panel";
import { PageHeader } from "../_components/ui/PageHeader";
import { StatCard } from "../_components/ui/StatCard";
import { EmptyState } from "../_components/ui/EmptyState";
import { GraphiqueDonut, type SegmentDonut } from "../_components/ui/GraphiqueDonut";
import { FiltreMois } from "../_components/ui/FiltreMois";
import { formaterAttributsProduit, grouperValeursParProduit } from "../_lib/formaterAttributsProduit";

const produitRepository = new PrismaProduitRepository();
const alerteRepository = new PrismaAlerteRepository();
const entrepriseRepository = new PrismaEntrepriseRepository();
const fournisseurRepository = new PrismaFournisseurRepository();
const commandeRepository = new PrismaCommandeRepository();
const chargeRepository = new PrismaChargeRepository();
const attributRepository = new PrismaAttributPersonnaliseRepository();
const valeurAttributRepository = new PrismaValeurAttributRepository();

function formaterDate(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function debutDuMois(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function finDuMois(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function formaterNomMois(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(date);
}

function formaterMoisPourInput(date: Date): string {
  const annee = date.getFullYear();
  const mois = String(date.getMonth() + 1).padStart(2, "0");
  return `${annee}-${mois}`;
}

function parserMois(valeur: string | undefined): Date {
  if (valeur) {
    const [anneeTexte, moisTexte] = valeur.split("-");
    const annee = Number(anneeTexte);
    const moisIndex = Number(moisTexte) - 1;

    if (Number.isInteger(annee) && Number.isInteger(moisIndex) && moisIndex >= 0 && moisIndex <= 11) {
      return new Date(annee, moisIndex, 1);
    }
  }

  return new Date();
}

type PageProps = {
  searchParams: Promise<{ mois?: string }>;
};

export default async function AccueilDashboardPage({ searchParams }: PageProps) {
  const utilisateurConnecte = await getUtilisateurConnecte();

  if (!utilisateurConnecte) {
    redirect("/login");
  }

  const [entreprise, produits, alertes, fournisseurs, commandes] = await Promise.all([
    entrepriseRepository.trouverParId(utilisateurConnecte.entrepriseId),
    listerProduits(produitRepository, utilisateurConnecte.entrepriseId),
    listerAlertes(alerteRepository, utilisateurConnecte.entrepriseId),
    listerFournisseurs(fournisseurRepository, utilisateurConnecte.entrepriseId),
    listerCommandes(commandeRepository, utilisateurConnecte.entrepriseId),
  ]);

  if (!entreprise) {
    redirect("/login");
  }

  const estAdministrateur = utilisateurConnecte.role === "ADMINISTRATEUR";

  const commandesEnCours = commandes.filter(
    (commande) => commande.statut === "BROUILLON" || commande.statut === "VALIDEE",
  ).length;
  const alertesRecentes = alertes.slice(0, 3);

  const { mois } = await searchParams;
  const moisSelectionne = parserMois(mois);
  const moisValeurInput = formaterMoisPourInput(moisSelectionne);
  const estMoisCourant = moisValeurInput === formaterMoisPourInput(new Date());

  const borneDebut = debutDuMois(moisSelectionne);
  const borneFin = finDuMois(moisSelectionne);

  const commandesDuMois = commandes.filter(
    (commande) => commande.dateCommande >= borneDebut && commande.dateCommande <= borneFin,
  );
  const ventesRecuesDuMois = commandesDuMois.filter((commande) => commande.type === "VENTE_CLIENT" && commande.statut === "RECUE");

  const montantVentesDuMois = calculerMontantTotalCommande(ventesRecuesDuMois.flatMap((commande) => commande.lignes));
  const valeurStock = calculerValeurStock(produits);

  // Les achats sont calcules a partir des charges "Achat fournisseur" (datees au jour de la
  // reception) plutot qu'a partir des commandes (datees au jour de la commande) : une commande
  // passee un mois et recue le mois suivant ne doit compter que dans le mois ou l'argent est
  // reellement sorti, sous peine de deux totaux d'achats qui ne concordent pas a l'ecran.
  const charges = await listerCharges(chargeRepository, utilisateurConnecte.entrepriseId);
  const chargesDuMois = charges.filter((charge) => charge.dateEcheance >= borneDebut && charge.dateEcheance <= borneFin);
  const montantAchatsDuMois = chargesDuMois
    .filter((charge) => charge.type === TYPE_CHARGE_ACHAT_FOURNISSEUR)
    .reduce((total, charge) => total + charge.montant, 0);

  const ventesParProduit = calculerVentesParProduit(ventesRecuesDuMois.flatMap((commande) => commande.lignes));

  const attributsProduit = await listerAttributs(attributRepository, utilisateurConnecte.entrepriseId, ENTITE_CIBLE_PRODUIT);
  const valeursParProduit = grouperValeursParProduit(
    await listerValeursPourProduits(valeurAttributRepository, produits.map((produit) => produit.id)),
  );
  const nomAffichageParProduit = new Map(
    produits.map((produit) => {
      const attributsAffichage = formaterAttributsProduit(attributsProduit, valeursParProduit.get(produit.id));
      return [produit.id, attributsAffichage ? `${produit.nom} (${attributsAffichage})` : produit.nom];
    }),
  );

  let montantChargesDuMois: number | undefined;
  let margeEstimee: number | undefined;
  let segmentsRepartition: SegmentDonut[] | undefined;

  if (estAdministrateur) {
    montantChargesDuMois = chargesDuMois.reduce((total, charge) => total + charge.montant, 0);
    margeEstimee = montantVentesDuMois - montantChargesDuMois;
    const chargesAutres = montantChargesDuMois - montantAchatsDuMois;

    segmentsRepartition = [
      { label: "Achats fournisseurs", valeur: montantAchatsDuMois, affichage: montantAchatsDuMois.toFixed(2), couleur: "#f59e0b" },
      { label: "Autres charges", valeur: chargesAutres, affichage: chargesAutres.toFixed(2), couleur: "#f43f5e" },
      { label: "Bénéfice", valeur: margeEstimee, affichage: margeEstimee.toFixed(2), couleur: "#10b981" },
    ];
  }

  const COULEURS_PRODUITS = ["#6366f1", "#0ea5e9", "#a855f7", "#ec4899"];
  const NOMBRE_PRODUITS_AFFICHES = 4;

  const segmentsProduits: SegmentDonut[] = ventesParProduit.slice(0, NOMBRE_PRODUITS_AFFICHES).map((produitVendu, index) => ({
    label: nomAffichageParProduit.get(produitVendu.produitId) ?? produitVendu.produitId,
    valeur: produitVendu.montantVendu,
    affichage: produitVendu.montantVendu.toFixed(2),
    couleur: COULEURS_PRODUITS[index],
  }));

  const montantAutresProduits = ventesParProduit
    .slice(NOMBRE_PRODUITS_AFFICHES)
    .reduce((total, produitVendu) => total + produitVendu.montantVendu, 0);

  if (montantAutresProduits > 0) {
    segmentsProduits.push({ label: "Autres produits", valeur: montantAutresProduits, affichage: montantAutresProduits.toFixed(2), couleur: "#a8a29e" });
  }

  const panneauVentesParProduit = (
    <Panel title="Ventes par produit" description={`Sur les commandes clients livrées — ${formaterNomMois(moisSelectionne)}.`}>
      {segmentsProduits.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="Aucune vente livrée ce mois-ci"
          description="La répartition par produit apparaîtra ici une fois des commandes clients livrées."
        />
      ) : (
        <GraphiqueDonut segments={segmentsProduits} centreLabel="Ventes" centreValeur={montantVentesDuMois.toFixed(2)} />
      )}
    </Panel>
  );

  return (
    <main className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <PageHeader
          eyebrow="Accueil"
          title={`Bienvenue, ${utilisateurConnecte.nom}`}
          description={`${entreprise.nom} — ${entreprise.typeMetier}`}
          actions={
            entreprise.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={entreprise.logo}
                alt={entreprise.nom}
                className="h-[5cm] w-[5cm] shrink-0 rounded-md border border-stone-200 bg-white object-contain p-2"
              />
            ) : undefined
          }
        />

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Package} label="Produits" value={produits.length} hint="Références au catalogue" />
          <StatCard icon={Truck} label="Fournisseurs" value={fournisseurs.length} hint="Partenaires actifs" />
          <StatCard icon={ClipboardList} label="Commandes en cours" value={commandesEnCours} hint="Brouillons et validées" />
          <StatCard icon={BellRing} label="Alertes non lues" value={alertes.length} hint="À traiter" />
        </section>

        <FiltreMois mois={moisValeurInput} estMoisCourant={estMoisCourant} />

        <Panel title="Ce mois-ci" description={formaterNomMois(moisSelectionne)}>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard icon={TrendingUp} label="Ventes livrées" value={montantVentesDuMois.toFixed(2)} hint="Commandes clients reçues" couleur="#10b981" />
            <StatCard icon={ShoppingCart} label="Achats reçus" value={montantAchatsDuMois.toFixed(2)} hint="Commandes fournisseurs reçues" couleur="#f59e0b" />
            <StatCard icon={Warehouse} label="Valeur du stock" value={valeurStock.toFixed(2)} hint="Stock actuel au prix d'achat" couleur="#0ea5e9" />
          </div>
        </Panel>

        {estAdministrateur && segmentsRepartition ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <Panel title="Répartition des ventes du mois" description="D'où vient l'argent, où il part.">
              {montantVentesDuMois <= 0 && (montantChargesDuMois ?? 0) <= 0 ? (
                <EmptyState
                  icon={PiggyBank}
                  title="Aucune donnée financière ce mois-ci"
                  description="La répartition apparaîtra ici dès qu'il y aura des ventes livrées ou des charges enregistrées."
                />
              ) : (
                <>
                  <GraphiqueDonut
                    segments={segmentsRepartition}
                    centreLabel="Bénéfice"
                    centreValeur={(margeEstimee ?? 0).toFixed(2)}
                    centreCouleur={(margeEstimee ?? 0) < 0 ? "#dc2626" : "#10b981"}
                  />
                  {(margeEstimee ?? 0) < 0 ? (
                    <p className="mt-4 text-sm font-medium text-red-600">
                      Les charges dépassent les ventes livrées ce mois-ci.
                    </p>
                  ) : null}
                </>
              )}
            </Panel>

            {panneauVentesParProduit}
          </div>
        ) : (
          panneauVentesParProduit
        )}

        <Panel
          title="Alertes récentes"
          description={`${alertes.length} alerte(s) non lue(s) au total.`}
          actions={
            <Link href="/alertes" className="text-sm font-medium text-stone-600 underline decoration-stone-300 underline-offset-4 hover:text-stone-900">
              Voir toutes les alertes
            </Link>
          }
        >
          {alertesRecentes.length === 0 ? (
            <EmptyState
              icon={BellRing}
              title="Aucune alerte non lue"
              description="Tout est sous contrôle : les alertes de stock ou d'expiration apparaîtront ici."
            />
          ) : (
            <div className="grid gap-3">
              {alertesRecentes.map((alerte) => (
                <article key={alerte.id} className="rounded-lg border border-stone-200 bg-stone-50 p-4">
                  <p className="text-sm font-semibold text-stone-900">{alerte.type}</p>
                  <p className="mt-1 text-sm text-stone-700">{alerte.message}</p>
                  <p className="mt-2 text-xs text-stone-500">{formaterDate(alerte.dateGeneration)}</p>
                </article>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </main>
  );
}
