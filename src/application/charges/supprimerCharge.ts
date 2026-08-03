import type { Utilisateur } from "../../domain/entities/Utilisateur";
import type { ChargeRepository } from "../../domain/repositories/ChargeRepository";

export class AccesRefuseChargeError extends Error {
  constructor(message = "Seul un administrateur peut supprimer une charge.") {
    super(message);
    this.name = "AccesRefuseChargeError";
  }
}

export class ChargeIntrouvableError extends Error {
  constructor(message = "Charge introuvable.") {
    super(message);
    this.name = "ChargeIntrouvableError";
  }
}

export async function supprimerCharge(
  repository: ChargeRepository,
  utilisateurCourant: Pick<Utilisateur, "role" | "entrepriseId">,
  chargeId: string,
): Promise<void> {
  if (utilisateurCourant.role !== "ADMINISTRATEUR") {
    throw new AccesRefuseChargeError();
  }

  const charge = await repository.trouverParId(chargeId);

  if (!charge || charge.entrepriseId !== utilisateurCourant.entrepriseId) {
    throw new ChargeIntrouvableError();
  }

  await repository.supprimer(chargeId);
}
