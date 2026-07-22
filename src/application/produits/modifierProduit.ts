import type { NouveauProduit, Produit } from "../../domain/entities/Produit";
import type { ProduitRepository } from "../../domain/repositories/ProduitRepository";
import { validerProduit } from "../../domain/services/validerProduit";

export async function modifierProduit(
  repository: ProduitRepository,
  id: string,
  donnees: NouveauProduit,
): Promise<Produit> {
  validerProduit(donnees);
  return repository.modifier(id, donnees);
}