import type { ValeurAttribut } from "../../domain/entities/ValeurAttribut";
import type { ValeurAttributRepository } from "../../domain/repositories/ValeurAttributRepository";

export function listerValeursProduit(repository: ValeurAttributRepository, produitId: string): Promise<ValeurAttribut[]> {
  return repository.listerParProduit(produitId);
}
