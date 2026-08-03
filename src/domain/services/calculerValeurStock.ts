import type { Produit } from "../entities/Produit";

export function calculerValeurStock(produits: Pick<Produit, "quantiteStock" | "prixAchat">[]): number {
  return produits.reduce((total, produit) => total + produit.quantiteStock * produit.prixAchat, 0);
}
