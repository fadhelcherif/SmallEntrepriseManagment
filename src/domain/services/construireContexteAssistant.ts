import type { Alerte } from "../entities/Alerte";
import type { Produit } from "../entities/Produit";
import type { ProduitVendu } from "./calculerVentesParProduit";

export type MoisTendance = {
  libelle: string;
  montantVentes: number;
  montantAchats: number;
};

export type FicheProduit = {
  nom: string;
  attributs: string;
  prixAchat: number;
  prixVente: number;
  margeUnitaire: number;
  margePourcentage: number;
  quantiteStock: number;
  seuilAlerte: number;
  quantiteVendueTotale: number;
  montantVenduTotal: number;
};

export type ProduitFourni = {
  nom: string;
  quantiteTotale: number;
  montantTotal: number;
};

export type FicheFournisseur = {
  nom: string;
  contact?: string | null;
  delaiLivraisonJours: number | null;
  nombreCommandes: number;
  montantTotalAchete: number;
  produitsFournis: ProduitFourni[];
};

export type FicheChargeParType = {
  type: string;
  nombre: number;
  montantTotal: number;
  recurrente: boolean;
};

export type MembreEquipe = {
  nom: string;
  role: string;
  actif: boolean;
  salaire: number | null;
};

export type ContexteAssistant = {
  nomEntreprise: string;
  nombreProduits: number;
  valeurStock: number;
  alertes: Alerte[];
  montantVentesDuMois: number;
  montantAchatsDuMois: number;
  topProduitsVendus: ProduitVendu[];
  produitsParId: Map<string, string>;
  catalogue: FicheProduit[];
  tendanceMensuelle: MoisTendance[];
  fournisseurs: FicheFournisseur[];
  commandesEnCours: number;
  tauxAnnulationCommandes: number;
  finance?: {
    montantChargesDuMois: number;
    margeEstimee: number;
    chargesParType: FicheChargeParType[];
    equipe: MembreEquipe[];
  };
};

export function construireContexteAssistant(contexte: ContexteAssistant): string {
  const lignes: string[] = [];

  lignes.push(`Entreprise : ${contexte.nomEntreprise}`);
  lignes.push(`Nombre de produits au catalogue : ${contexte.nombreProduits}`);
  lignes.push(`Nombre de fournisseurs actifs : ${contexte.fournisseurs.length}`);
  lignes.push(`Valeur du stock actuel (au prix d'achat) : ${contexte.valeurStock.toFixed(2)}`);
  lignes.push(`Commandes en cours (brouillon/validée) : ${contexte.commandesEnCours}`);
  lignes.push(`Taux d'annulation des commandes : ${contexte.tauxAnnulationCommandes.toFixed(1)}%`);
  lignes.push(`Ventes livrées ce mois-ci : ${contexte.montantVentesDuMois.toFixed(2)}`);
  lignes.push(`Achats reçus ce mois-ci : ${contexte.montantAchatsDuMois.toFixed(2)}`);

  if (contexte.finance) {
    lignes.push(`Charges du mois : ${contexte.finance.montantChargesDuMois.toFixed(2)}`);
    lignes.push(`Marge estimée du mois : ${contexte.finance.margeEstimee.toFixed(2)}`);

    if (contexte.finance.chargesParType.length > 0) {
      lignes.push("Répartition de toutes les charges enregistrées (toutes périodes confondues), par type :");
      for (const charge of contexte.finance.chargesParType) {
        lignes.push(
          `- ${charge.type} : ${charge.nombre} charge(s), montant total ${charge.montantTotal.toFixed(2)}` +
            (charge.recurrente ? " (récurrente)" : ""),
        );
      }
    }

    if (contexte.finance.equipe.length > 0) {
      lignes.push("Équipe (nom, rôle, statut, salaire) :");
      for (const membre of contexte.finance.equipe) {
        lignes.push(
          `- ${membre.nom} (${membre.role}${membre.actif ? "" : ", inactif"}) : ` +
            `salaire ${membre.salaire !== null ? membre.salaire.toFixed(2) : "non renseigné"}`,
        );
      }
    }
  }

  if (contexte.tendanceMensuelle.length > 0) {
    lignes.push("Évolution mensuelle (ventes / achats), du plus ancien au plus récent :");
    for (const mois of contexte.tendanceMensuelle) {
      lignes.push(`- ${mois.libelle} : ventes ${mois.montantVentes.toFixed(2)}, achats ${mois.montantAchats.toFixed(2)}`);
    }
  }

  if (contexte.topProduitsVendus.length > 0) {
    lignes.push("Produits les plus vendus ce mois-ci :");
    for (const produitVendu of contexte.topProduitsVendus) {
      const nom = contexte.produitsParId.get(produitVendu.produitId) ?? produitVendu.produitId;
      lignes.push(`- ${nom} : ${produitVendu.quantiteVendue} unité(s), ${produitVendu.montantVendu.toFixed(2)}`);
    }
  }

  if (contexte.catalogue.length > 0) {
    lignes.push(
      "Catalogue complet (nom, attributs qui différencient le produit, prix d'achat, prix de vente, marge unitaire, " +
        "marge %, stock, seuil d'alerte, ventes totales depuis toujours) :",
    );
    for (const produit of contexte.catalogue) {
      lignes.push(
        `- ${produit.nom}` +
          (produit.attributs ? ` (${produit.attributs})` : "") +
          ` : achat ${produit.prixAchat.toFixed(2)}, vente ${produit.prixVente.toFixed(2)}, ` +
          `marge ${produit.margeUnitaire.toFixed(2)} (${produit.margePourcentage.toFixed(0)}%), ` +
          `stock ${produit.quantiteStock}, seuil ${produit.seuilAlerte}, ` +
          `ventes totales ${produit.quantiteVendueTotale} unité(s) pour ${produit.montantVenduTotal.toFixed(2)}`,
      );
    }
  }

  if (contexte.fournisseurs.length > 0) {
    lignes.push(
      "Détail par fournisseur (nom, contact, délai de livraison annoncé, nombre de commandes reçues, montant total acheté) :",
    );
    for (const fournisseur of contexte.fournisseurs) {
      const produitsFournis =
        fournisseur.produitsFournis.length > 0
          ? ` ; produits fournis : ${fournisseur.produitsFournis
              .map((produit) => `${produit.nom} (${produit.quantiteTotale} unité(s), ${produit.montantTotal.toFixed(2)})`)
              .join(", ")}`
          : " ; aucun produit reçu pour l'instant";

      lignes.push(
        `- ${fournisseur.nom}` +
          (fournisseur.contact ? ` (${fournisseur.contact})` : "") +
          ` : délai annoncé ${fournisseur.delaiLivraisonJours ?? "non renseigné"} jour(s), ` +
          `${fournisseur.nombreCommandes} commande(s) reçue(s), montant total acheté ${fournisseur.montantTotalAchete.toFixed(2)}` +
          produitsFournis,
      );
    }
  }

  if (contexte.alertes.length > 0) {
    lignes.push("Alertes de stock non lues :");
    for (const alerte of contexte.alertes) {
      lignes.push(`- ${alerte.message}`);
    }
  } else {
    lignes.push("Aucune alerte de stock non lue.");
  }

  return lignes.join("\n");
}

export function nomsProduitsParId(produits: Produit[]): Map<string, string> {
  return new Map(produits.map((produit) => [produit.id, produit.nom]));
}

export function construireCatalogue(
  produits: Produit[],
  ventesParProduit: Map<string, ProduitVendu>,
  attributsAffichageParProduit: Map<string, string>,
): FicheProduit[] {
  return produits.map((produit) => {
    const margeUnitaire = produit.prixVente - produit.prixAchat;
    const margePourcentage = produit.prixVente > 0 ? (margeUnitaire / produit.prixVente) * 100 : 0;
    const ventes = ventesParProduit.get(produit.id);

    return {
      nom: produit.nom,
      attributs: attributsAffichageParProduit.get(produit.id) ?? "",
      prixAchat: produit.prixAchat,
      prixVente: produit.prixVente,
      margeUnitaire,
      margePourcentage,
      quantiteStock: produit.quantiteStock,
      seuilAlerte: produit.seuilAlerte,
      quantiteVendueTotale: ventes?.quantiteVendue ?? 0,
      montantVenduTotal: ventes?.montantVendu ?? 0,
    };
  });
}
