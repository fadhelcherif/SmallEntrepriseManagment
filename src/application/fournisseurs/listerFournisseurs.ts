import type { Fournisseur } from "../../domain/entities/Fournisseur";
import type { FournisseurRepository } from "../../domain/repositories/FournisseurRepository";

export function listerFournisseurs(
  repository: FournisseurRepository,
  entrepriseId: string,
): Promise<Fournisseur[]> {
  return repository.listerParEntreprise(entrepriseId);
}