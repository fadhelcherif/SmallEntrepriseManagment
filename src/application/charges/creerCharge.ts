import type { Charge, NouvelleCharge } from "../../domain/entities/Charge";
import type { ChargeRepository } from "../../domain/repositories/ChargeRepository";
import { validerCharge } from "../../domain/services/validerCharge";

export async function creerCharge(
  repository: ChargeRepository,
  entrepriseId: string,
  donnees: NouvelleCharge,
): Promise<Charge> {
  validerCharge(donnees);
  return repository.creer(donnees, entrepriseId);
}
