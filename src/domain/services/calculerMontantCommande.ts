import type { LigneCommande } from "../entities/LigneCommande";

export function calculerMontantLigne(ligne: Pick<LigneCommande, "quantite" | "prixApplique">): number {
  return ligne.quantite * ligne.prixApplique;
}

export function calculerMontantTotalCommande(lignes: LigneCommande[]): number {
  return lignes.reduce((total, ligne) => total + calculerMontantLigne(ligne), 0);
}
