import type { Produit } from "../../domain/entities/Produit";
import type { ProduitRepository } from "../../domain/repositories/ProduitRepository";

export function listerProduits(
  repository: ProduitRepository,
  entrepriseId: string,
): Promise<Produit[]> {
  return repository.listerParEntreprise(entrepriseId);
}