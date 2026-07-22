import type { NouveauProduit } from "../entities/Produit";

export class ProduitInvalideError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProduitInvalideError";
  }
}

export function validerProduit(produit: NouveauProduit): void {
  if (!produit.nom || produit.nom.trim().length === 0) {
    throw new ProduitInvalideError("Le nom du produit est obligatoire.");
  }

  if (produit.prixUnitaire <= 0) {
    throw new ProduitInvalideError("Le prix unitaire doit être supérieur à 0.");
  }

  if ((produit.seuilAlerte ?? 0) < 0) {
    throw new ProduitInvalideError("Le seuil d'alerte doit être supérieur ou égal à 0.");
  }
}