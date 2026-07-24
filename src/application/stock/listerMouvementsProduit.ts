import type { MouvementStock } from "../../domain/entities/MouvementStock";
import type { MouvementStockRepository } from "../../domain/repositories/MouvementStockRepository";

export function listerMouvementsProduit(
  repository: MouvementStockRepository,
  produitId: string,
): Promise<MouvementStock[]> {
  return repository.listerParProduit(produitId);
}