import type { ValeurAttribut } from "../../domain/entities/ValeurAttribut";
import type { ValeurAttributRepository } from "../../domain/repositories/ValeurAttributRepository";

export function listerValeursPourProduits(
  repository: ValeurAttributRepository,
  produitIds: string[],
): Promise<ValeurAttribut[]> {
  return repository.listerParProduits(produitIds);
}
