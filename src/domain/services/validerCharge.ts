import type { NouvelleCharge } from "../entities/Charge";

export class ChargeInvalideError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ChargeInvalideError";
  }
}

export function validerCharge(charge: NouvelleCharge): void {
  if (!charge.type || charge.type.trim().length === 0) {
    throw new ChargeInvalideError("Le type de charge est obligatoire.");
  }

  if (!(charge.montant > 0)) {
    throw new ChargeInvalideError("Le montant de la charge doit être supérieur à 0.");
  }

  if (!charge.dateEcheance || Number.isNaN(charge.dateEcheance.getTime())) {
    throw new ChargeInvalideError("La date d'échéance est obligatoire.");
  }
}
