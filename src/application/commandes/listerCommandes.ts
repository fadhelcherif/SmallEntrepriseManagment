import type { Commande } from "../../domain/entities/Commande";
import type { CommandeRepository } from "../../domain/repositories/CommandeRepository";

export function listerCommandes(repository: CommandeRepository, entrepriseId: string): Promise<Commande[]> {
  return repository.listerParEntreprise(entrepriseId);
}