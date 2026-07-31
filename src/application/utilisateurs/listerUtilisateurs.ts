import type { Utilisateur } from "../../domain/entities/Utilisateur";
import type { UtilisateurRepository } from "../../domain/repositories/UtilisateurRepository";

export function listerUtilisateurs(repository: UtilisateurRepository, entrepriseId: string): Promise<Utilisateur[]> {
  return repository.listerParEntreprise(entrepriseId);
}
