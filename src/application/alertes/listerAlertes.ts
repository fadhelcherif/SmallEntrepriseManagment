import type { Alerte } from "../../domain/entities/Alerte";
import type { AlerteRepository } from "../../domain/repositories/AlerteRepository";

export function listerAlertes(
  repository: AlerteRepository,
  entrepriseId: string,
): Promise<Alerte[]> {
  return repository.listerNonLuesParEntreprise(entrepriseId);
}