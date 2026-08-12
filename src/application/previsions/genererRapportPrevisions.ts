import type { ChargeRepository } from "../../domain/repositories/ChargeRepository";
import type { CommandeRepository } from "../../domain/repositories/CommandeRepository";
import type { FournisseurRepository } from "../../domain/repositories/FournisseurRepository";
import type { ProduitRepository } from "../../domain/repositories/ProduitRepository";
import { calculerMontantTotalCommande } from "../../domain/services/calculerMontantCommande";
import { calculerQuantiteACommander } from "../../domain/services/previsions/calculerQuantiteACommander";
import { choisirMeilleurModele, type NiveauConfiance, type NomModele } from "../../domain/services/previsions/choisirMeilleurModele";
import { evaluerRisquePerte, type NiveauRisque } from "../../domain/services/previsions/evaluerRisquePerte";
import { recommanderInvestissement } from "../../domain/services/previsions/recommanderInvestissement";
import { choisirMeilleurFournisseur, type StatsFournisseurProduit } from "../../domain/services/previsions/choisirMeilleurFournisseur";
import { listerCharges } from "../charges/listerCharges";
import { listerCommandes } from "../commandes/listerCommandes";
import { listerFournisseurs } from "../fournisseurs/listerFournisseurs";
import { listerProduits } from "../produits/listerProduits";

const NOMBRE_MOIS_MARGE_RECENTE = 3;
const JOUR_LIMITE_MOIS_COURANT = 25;
const HORIZON_GRAPHIQUE = 3;
const NOMBRE_MOIS_CONTEXTE_GRAPHIQUE = 3;

function round2(valeur: number): number {
  return Math.round(valeur * 100) / 100;
}

function libelleMois(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(date);
}

/**
 * Agrège une liste d'événements datés en série mensuelle continue, du premier mois observé
 * jusqu'au dernier mois COMPLET avant `maintenant` (le mois en cours est exclu s'il a moins
 * de JOUR_LIMITE_MOIS_COURANT jours écoulés — même règle que notebooks/previsions.ipynb, pour
 * ne pas fausser la fin de série avec un mois partiel).
 */
function construireSerieMensuelle(
  evenements: { date: Date; montant: number }[],
  maintenant: Date,
): { libelles: string[]; valeurs: number[]; premierMoisPrevision: Date | null } {
  if (evenements.length === 0) return { libelles: [], valeurs: [], premierMoisPrevision: null };

  const dateMin = evenements.reduce((min, e) => (e.date < min ? e.date : min), evenements[0].date);
  const debutSerie = new Date(dateMin.getFullYear(), dateMin.getMonth(), 1);

  const finSerieExclusive =
    maintenant.getDate() < JOUR_LIMITE_MOIS_COURANT
      ? new Date(maintenant.getFullYear(), maintenant.getMonth(), 1)
      : new Date(maintenant.getFullYear(), maintenant.getMonth() + 1, 1);

  const nombreMois =
    (finSerieExclusive.getFullYear() - debutSerie.getFullYear()) * 12 + (finSerieExclusive.getMonth() - debutSerie.getMonth());

  if (nombreMois <= 0) return { libelles: [], valeurs: [], premierMoisPrevision: null };

  const valeurs = new Array(nombreMois).fill(0);
  for (const evenement of evenements) {
    const indexMois =
      (evenement.date.getFullYear() - debutSerie.getFullYear()) * 12 + (evenement.date.getMonth() - debutSerie.getMonth());
    if (indexMois >= 0 && indexMois < nombreMois) {
      valeurs[indexMois] += evenement.montant;
    }
  }

  const libelles = Array.from({ length: nombreMois }, (_, i) => libelleMois(new Date(debutSerie.getFullYear(), debutSerie.getMonth() + i, 1)));

  return { libelles, valeurs, premierMoisPrevision: finSerieExclusive };
}

export type PointCourbePrevision = {
  libelle: string;
  valeur: number;
  estPrevision: boolean;
  basse?: number;
  haute?: number;
};

export type PrevisionProduit = {
  nom: string;
  demandePrevueProchainMois: number;
  quantiteACommander: number;
  confiance: NiveauConfiance;
  /** Conservé pour un usage interne/diagnostic futur — pas affiché à l'utilisateur (trop technique). */
  modeleUtilise: NomModele | null;
  fournisseurRecommande: string | null;
  critereFournisseur: "PRIX" | "DELAI" | null;
  delaiLivraisonJours: number | null;
  dernierPrixPaye: number | null;
  coutEstime: number | null;
};

export type RapportPrevisions = {
  chiffreAffaires: {
    courbe: PointCourbePrevision[];
    previsionProchainMois: number | null;
    confiance: NiveauConfiance | null;
    historiqueInsuffisant: boolean;
  };
  produits: PrevisionProduit[];
  volumeMaxProduits: number;
  finance?: {
    margeProjeteeProchainMois: number | null;
    niveauRisque: NiveauRisque | null;
    montantAInvestirRecommande: number;
  };
};

export async function genererRapportPrevisions(
  produitRepository: ProduitRepository,
  commandeRepository: CommandeRepository,
  chargeRepository: ChargeRepository,
  fournisseurRepository: FournisseurRepository,
  entrepriseId: string,
  estAdministrateur: boolean,
): Promise<RapportPrevisions> {
  const maintenant = new Date();

  const [produits, commandes, fournisseurs] = await Promise.all([
    listerProduits(produitRepository, entrepriseId),
    listerCommandes(commandeRepository, entrepriseId),
    listerFournisseurs(fournisseurRepository, entrepriseId),
  ]);

  const nomsFournisseurs = new Map(fournisseurs.map((fournisseur) => [fournisseur.id, fournisseur.nom]));
  const delaisFournisseurs = new Map(fournisseurs.map((fournisseur) => [fournisseur.id, fournisseur.delaiLivraisonJours ?? null]));

  const achatsRecus = commandes.filter((commande) => commande.type === "ACHAT_FOURNISSEUR" && commande.statut === "RECUE");
  const achatsParProduitEtFournisseur = new Map<string, Map<string, { date: Date; prix: number }[]>>();

  for (const commande of achatsRecus) {
    if (!commande.fournisseurId) continue;

    for (const ligne of commande.lignes) {
      const parFournisseur = achatsParProduitEtFournisseur.get(ligne.produitId) ?? new Map<string, { date: Date; prix: number }[]>();
      const liste = parFournisseur.get(commande.fournisseurId) ?? [];
      liste.push({ date: commande.dateCommande, prix: ligne.prixApplique });
      parFournisseur.set(commande.fournisseurId, liste);
      achatsParProduitEtFournisseur.set(ligne.produitId, parFournisseur);
    }
  }

  const ventesRecues = commandes.filter((commande) => commande.type === "VENTE_CLIENT" && commande.statut === "RECUE");

  const evenementsVentes = ventesRecues.map((commande) => ({
    date: commande.dateCommande,
    montant: calculerMontantTotalCommande(commande.lignes),
  }));
  const { valeurs: serieVentes } = construireSerieMensuelle(evenementsVentes, maintenant);

  const selectionVentes = choisirMeilleurModele(serieVentes);
  const previsionsVentes = selectionVentes ? selectionVentes.fonctionPrevision(serieVentes, HORIZON_GRAPHIQUE) : null;
  const previsionVentesProchainMois = previsionsVentes ? previsionsVentes[0] : null;
  const meilleurResultatVentes = selectionVentes?.comparaison.find((r) => r.nom === selectionVentes.meilleurModele);

  const courbeVentes: PointCourbePrevision[] = [];
  const { libelles: libellesVentes, premierMoisPrevision } = construireSerieMensuelle(evenementsVentes, maintenant);
  const debutContexte = Math.max(0, serieVentes.length - NOMBRE_MOIS_CONTEXTE_GRAPHIQUE);
  for (let i = debutContexte; i < serieVentes.length; i++) {
    courbeVentes.push({ libelle: libellesVentes[i], valeur: round2(serieVentes[i]), estPrevision: false });
  }

  if (previsionsVentes && meilleurResultatVentes && premierMoisPrevision) {
    for (let h = 0; h < previsionsVentes.length; h++) {
      const date = new Date(premierMoisPrevision.getFullYear(), premierMoisPrevision.getMonth() + h, 1);
      const largeurBande = meilleurResultatVentes.ecartTypeResidus * Math.sqrt(h + 1);
      courbeVentes.push({
        libelle: libelleMois(date),
        valeur: round2(Math.max(0, previsionsVentes[h])),
        estPrevision: true,
        basse: round2(Math.max(0, previsionsVentes[h] - largeurBande)),
        haute: round2(previsionsVentes[h] + largeurBande),
      });
    }
  }

  const chiffreAffaires: RapportPrevisions["chiffreAffaires"] = {
    courbe: courbeVentes,
    previsionProchainMois: previsionVentesProchainMois !== null ? round2(previsionVentesProchainMois) : null,
    confiance: selectionVentes?.confiance ?? null,
    historiqueInsuffisant: selectionVentes === null,
  };

  const evenementsParProduit = new Map<string, { date: Date; montant: number }[]>();
  for (const commande of ventesRecues) {
    for (const ligne of commande.lignes) {
      const liste = evenementsParProduit.get(ligne.produitId) ?? [];
      liste.push({ date: commande.dateCommande, montant: ligne.quantite });
      evenementsParProduit.set(ligne.produitId, liste);
    }
  }

  const previsionsProduits: PrevisionProduit[] = produits.map((produit) => {
    const statsFournisseurs: StatsFournisseurProduit[] = [
      ...(achatsParProduitEtFournisseur.get(produit.id) ?? new Map<string, { date: Date; prix: number }[]>()),
    ].map(([fournisseurId, achats]) => {
      const dernier = achats.reduce((a, b) => (b.date > a.date ? b : a));
      return {
        fournisseurId,
        nombreCommandes: achats.length,
        dernierPrixPaye: dernier.prix,
        delaiLivraisonJours: delaisFournisseurs.get(fournisseurId) ?? null,
        dateDernierAchat: dernier.date,
      };
    });
    const meilleurFournisseur = choisirMeilleurFournisseur(statsFournisseurs, produit.quantiteStock, produit.seuilAlerte);
    const delaiLivraisonJours = meilleurFournisseur?.delaiLivraisonJours ?? null;

    const evenements = evenementsParProduit.get(produit.id) ?? [];
    const { valeurs: serieProduit } = construireSerieMensuelle(evenements, maintenant);
    const selection = choisirMeilleurModele(serieProduit);

    if (!selection) {
      return {
        nom: produit.nom,
        demandePrevueProchainMois: 0,
        quantiteACommander: 0,
        confiance: "FAIBLE",
        modeleUtilise: null,
        fournisseurRecommande: meilleurFournisseur ? (nomsFournisseurs.get(meilleurFournisseur.fournisseurId) ?? null) : null,
        critereFournisseur: meilleurFournisseur?.critere ?? null,
        delaiLivraisonJours,
        dernierPrixPaye: meilleurFournisseur?.dernierPrixPaye ?? null,
        coutEstime: null,
      };
    }

    const demandePrevue = Math.max(0, selection.fonctionPrevision(serieProduit, 1)[0]);
    const quantiteACommander = calculerQuantiteACommander(demandePrevue, produit.seuilAlerte, produit.quantiteStock, delaiLivraisonJours);

    return {
      nom: produit.nom,
      demandePrevueProchainMois: round2(demandePrevue),
      quantiteACommander,
      confiance: selection.confiance,
      modeleUtilise: selection.meilleurModele,
      fournisseurRecommande: meilleurFournisseur ? (nomsFournisseurs.get(meilleurFournisseur.fournisseurId) ?? null) : null,
      critereFournisseur: meilleurFournisseur?.critere ?? null,
      delaiLivraisonJours,
      dernierPrixPaye: meilleurFournisseur?.dernierPrixPaye ?? null,
      coutEstime: meilleurFournisseur ? round2(quantiteACommander * meilleurFournisseur.dernierPrixPaye) : null,
    };
  });

  let finance: RapportPrevisions["finance"];

  if (estAdministrateur) {
    const charges = await listerCharges(chargeRepository, entrepriseId);
    const evenementsCharges = charges.map((charge) => ({ date: charge.dateEcheance, montant: charge.montant }));
    const { valeurs: serieCharges } = construireSerieMensuelle(evenementsCharges, maintenant);

    const selectionCharges = choisirMeilleurModele(serieCharges);
    const previsionChargesProchainMois = selectionCharges
      ? Math.max(0, selectionCharges.fonctionPrevision(serieCharges, 1)[0])
      : null;

    const margeProjetee =
      previsionVentesProchainMois !== null && previsionChargesProchainMois !== null
        ? previsionVentesProchainMois - previsionChargesProchainMois
        : null;

    const nombreMoisRecents = Math.min(NOMBRE_MOIS_MARGE_RECENTE, serieVentes.length, serieCharges.length);
    const margesRecentes: number[] = [];
    for (let i = 1; i <= nombreMoisRecents; i++) {
      margesRecentes.push(serieVentes[serieVentes.length - i] - serieCharges[serieCharges.length - i]);
    }

    finance = {
      margeProjeteeProchainMois: margeProjetee !== null ? round2(margeProjetee) : null,
      niveauRisque: margeProjetee !== null ? evaluerRisquePerte(margeProjetee, margesRecentes) : null,
      montantAInvestirRecommande: recommanderInvestissement(margesRecentes),
    };
  }

  const volumeMaxProduits = previsionsProduits.reduce((max, produit) => Math.max(max, produit.demandePrevueProchainMois), 0);

  return { chiffreAffaires, produits: previsionsProduits, volumeMaxProduits, finance };
}
