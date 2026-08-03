import type { Commande } from "../entities/Commande";
import type { LigneCommande } from "../entities/LigneCommande";

export function calculerMontantLigne(ligne: Pick<LigneCommande, "quantite" | "prixApplique">): number {
  return ligne.quantite * ligne.prixApplique;
}

export function calculerMontantTotalCommande(lignes: LigneCommande[]): number {
  return lignes.reduce((total, ligne) => total + calculerMontantLigne(ligne), 0);
}

export function calculerMontantCommandesActives(commandes: Commande[]): number {
  return calculerMontantTotalCommande(
    commandes.filter((commande) => commande.statut !== "ANNULEE").flatMap((commande) => commande.lignes),
  );
}
