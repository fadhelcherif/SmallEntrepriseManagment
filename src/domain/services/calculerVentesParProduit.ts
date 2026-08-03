import type { LigneCommande } from "../entities/LigneCommande";

export type ProduitVendu = {
  produitId: string;
  quantiteVendue: number;
  montantVendu: number;
};

export function calculerVentesParProduit(lignes: LigneCommande[]): ProduitVendu[] {
  const parProduit = new Map<string, ProduitVendu>();

  for (const ligne of lignes) {
    const existant = parProduit.get(ligne.produitId) ?? { produitId: ligne.produitId, quantiteVendue: 0, montantVendu: 0 };
    existant.quantiteVendue += ligne.quantite;
    existant.montantVendu += ligne.quantite * ligne.prixApplique;
    parProduit.set(ligne.produitId, existant);
  }

  return [...parProduit.values()].sort((a, b) => b.montantVendu - a.montantVendu);
}
