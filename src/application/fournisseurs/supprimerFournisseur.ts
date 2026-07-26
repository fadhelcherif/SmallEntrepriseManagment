import type { FournisseurRepository } from "../../domain/repositories/FournisseurRepository";

export async function supprimerFournisseur(repository: FournisseurRepository, id: string): Promise<void> {
  await repository.supprimer(id);
}