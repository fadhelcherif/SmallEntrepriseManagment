import type { ProduitRepository } from "../../domain/repositories/ProduitRepository";

export async function supprimerProduit(repository: ProduitRepository, id: string): Promise<void> {
  await repository.supprimer(id);
}