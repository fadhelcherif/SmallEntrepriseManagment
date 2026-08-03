import type { ProduitRepository } from "../../domain/repositories/ProduitRepository";

export class ProduitUtiliseError extends Error {
  constructor(message = "Ce produit est présent dans une ou plusieurs commandes et ne peut pas être supprimé.") {
    super(message);
    this.name = "ProduitUtiliseError";
  }
}

export async function supprimerProduit(repository: ProduitRepository, id: string): Promise<void> {
  const utilise = await repository.estUtiliseDansCommande(id);

  if (utilise) {
    throw new ProduitUtiliseError();
  }

  await repository.supprimer(id);
}
