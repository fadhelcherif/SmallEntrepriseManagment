import type { MouvementStock } from "../../domain/entities/MouvementStock";
import type { MouvementStockRepository } from "../../domain/repositories/MouvementStockRepository";

export function listerMouvementsEntreprise(
  repository: MouvementStockRepository,
  entrepriseId: string,
): Promise<MouvementStock[]> {
  return repository.listerParEntreprise(entrepriseId);
}
