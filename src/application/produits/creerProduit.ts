import type { NouveauProduit, Produit } from "../../domain/entities/Produit";
import type { ProduitRepository } from "../../domain/repositories/ProduitRepository";
import { validerProduit as validerNouveauProduit } from "../../domain/services/validerProduit";

export async function creerProduit(
  repository: ProduitRepository,
  nouveauProduit: NouveauProduit,
  entrepriseId: string,
): Promise<Produit> {
  validerNouveauProduit(nouveauProduit);
  return repository.creer(nouveauProduit, entrepriseId);
}