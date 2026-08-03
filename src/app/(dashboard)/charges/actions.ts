"use server";

import { revalidatePath } from "next/cache";

import { creerCharge } from "../../../application/charges/creerCharge";
import { supprimerCharge, AccesRefuseChargeError, ChargeIntrouvableError } from "../../../application/charges/supprimerCharge";
import { getUtilisateurConnecte } from "../../../infrastructure/auth/getUtilisateurConnecte";
import { PrismaChargeRepository } from "../../../infrastructure/repositories/PrismaChargeRepository";
import { ChargeInvalideError } from "../../../domain/services/validerCharge";
import type { NouvelleCharge } from "../../../domain/entities/Charge";

export type CreerChargeState = {
  message?: string;
  success?: boolean;
};

const repository = new PrismaChargeRepository();

export async function creerChargeAction(
  _previousState: CreerChargeState,
  formData: FormData,
): Promise<CreerChargeState> {
  const utilisateurConnecte = await getUtilisateurConnecte();

  if (!utilisateurConnecte || utilisateurConnecte.role !== "ADMINISTRATEUR") {
    return {
      message: "Seul un administrateur peut ajouter une charge.",
      success: false,
    };
  }

  const type = String(formData.get("type") ?? "").trim();
  const montant = Number(formData.get("montant"));
  const dateEcheanceBrute = String(formData.get("dateEcheance") ?? "");
  const dateEcheance = new Date(`${dateEcheanceBrute}T00:00:00`);
  const recurrente = formData.get("recurrente") === "on";

  const donnees: NouvelleCharge = {
    type,
    montant,
    dateEcheance,
    recurrente,
  };

  try {
    await creerCharge(repository, utilisateurConnecte.entrepriseId, donnees);
    revalidatePath("/charges");

    return {
      message: "Charge créée avec succès.",
      success: true,
    };
  } catch (error) {
    if (error instanceof ChargeInvalideError) {
      return {
        message: error.message,
        success: false,
      };
    }

    throw error;
  }
}

export async function supprimerChargeAction(chargeId: string, _formData: FormData): Promise<void> {
  const utilisateurConnecte = await getUtilisateurConnecte();

  if (!utilisateurConnecte) {
    return;
  }

  try {
    await supprimerCharge(repository, utilisateurConnecte, chargeId);
    revalidatePath("/charges");
  } catch (error) {
    if (error instanceof AccesRefuseChargeError || error instanceof ChargeIntrouvableError) {
      return;
    }

    throw error;
  }
}
