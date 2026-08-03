import type { Charge } from "../../domain/entities/Charge";
import type { ChargeRepository } from "../../domain/repositories/ChargeRepository";

export function listerCharges(repository: ChargeRepository, entrepriseId: string): Promise<Charge[]> {
  return repository.listerParEntreprise(entrepriseId);
}
