import type { Charge } from "../../domain/entities/Charge";
import type { ChargeRepository } from "../../domain/repositories/ChargeRepository";
import { genererChargesRecurrentesDuMois } from "../../domain/services/genererChargesRecurrentesDuMois";

export async function genererChargesRecurrentesManquantes(
  repository: ChargeRepository,
  entrepriseId: string,
  maintenant: Date = new Date(),
): Promise<Charge[]> {
  const chargesExistantes = await repository.listerParEntreprise(entrepriseId);
  const chargesManquantes = genererChargesRecurrentesDuMois(chargesExistantes, maintenant);

  if (chargesManquantes.length === 0) {
    return chargesExistantes;
  }

  const nouvellesCharges = await Promise.all(
    chargesManquantes.map((charge) => repository.creer(charge, entrepriseId)),
  );

  return [...chargesExistantes, ...nouvellesCharges];
}
