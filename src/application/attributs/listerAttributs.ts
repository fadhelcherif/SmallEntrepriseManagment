import type { AttributPersonnalise } from "../../domain/entities/AttributPersonnalise";
import type { AttributPersonnaliseRepository } from "../../domain/repositories/AttributPersonnaliseRepository";

export function listerAttributs(
  repository: AttributPersonnaliseRepository,
  entrepriseId: string,
  entiteCible?: string,
): Promise<AttributPersonnalise[]> {
  return repository.listerParEntreprise(entrepriseId, entiteCible);
}
