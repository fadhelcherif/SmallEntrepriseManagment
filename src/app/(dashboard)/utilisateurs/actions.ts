"use server";

import { revalidatePath } from "next/cache";

import { creerUtilisateurAvecSalaire } from "../../../application/utilisateurs/creerUtilisateurAvecSalaire";
import {
  modifierUtilisateur,
  AccesRefuseUtilisateurError,
  ModificationPropreCompteInterditeError,
  UtilisateurIntrouvableError,
} from "../../../application/utilisateurs/modifierUtilisateur";
import { getUtilisateurConnecte } from "../../../infrastructure/auth/getUtilisateurConnecte";
import { prisma } from "../../../infrastructure/db";
import { PrismaUtilisateurRepository } from "../../../infrastructure/repositories/PrismaUtilisateurRepository";
import { PrismaChargeRepository } from "../../../infrastructure/repositories/PrismaChargeRepository";
import { BcryptPasswordHasher } from "../../../infrastructure/security/BcryptPasswordHasher";
import { UtilisateurDejaExistantError } from "../../../domain/services/errors";
import { UtilisateurInvalideError } from "../../../domain/services/validerNouvelUtilisateur";
import { ChargeInvalideError } from "../../../domain/services/validerCharge";
import type { ModificationUtilisateur } from "../../../domain/repositories/UtilisateurRepository";

export type CreerUtilisateurState = {
  message?: string;
  success?: boolean;
};

const repository = new PrismaUtilisateurRepository();
const passwordHasher = new BcryptPasswordHasher();

function finDuMoisCourant(): Date {
  const maintenant = new Date();
  return new Date(maintenant.getFullYear(), maintenant.getMonth() + 1, 0);
}

export async function creerUtilisateurAction(
  _previousState: CreerUtilisateurState,
  formData: FormData,
): Promise<CreerUtilisateurState> {
  const utilisateurConnecte = await getUtilisateurConnecte();

  if (!utilisateurConnecte || utilisateurConnecte.role !== "ADMINISTRATEUR") {
    return {
      message: "Seul un administrateur peut ajouter un utilisateur.",
      success: false,
    };
  }

  const nom = String(formData.get("nom") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const motDePasse = String(formData.get("motDePasse") ?? "");
  const salaire = Number(formData.get("salaire"));

  try {
    await prisma.$transaction(async (transactionClient) => {
      const utilisateurRepositoryTransaction = new PrismaUtilisateurRepository(transactionClient);
      const chargeRepositoryTransaction = new PrismaChargeRepository(transactionClient);

      return creerUtilisateurAvecSalaire(
        utilisateurRepositoryTransaction,
        chargeRepositoryTransaction,
        passwordHasher,
        {
          entrepriseId: utilisateurConnecte.entrepriseId,
          nom,
          email,
          role: "EMPLOYE",
          motDePasse,
          salaire,
        },
        finDuMoisCourant(),
      );
    });

    revalidatePath("/utilisateurs");
    revalidatePath("/charges");

    return {
      message: "Utilisateur créé avec succès, avec sa première charge de salaire.",
      success: true,
    };
  } catch (error) {
    if (
      error instanceof UtilisateurInvalideError ||
      error instanceof UtilisateurDejaExistantError ||
      error instanceof ChargeInvalideError
    ) {
      return {
        message: error.message,
        success: false,
      };
    }

    throw error;
  }
}

export async function modifierUtilisateurAction(utilisateurId: string, formData: FormData): Promise<void> {
  const utilisateurConnecte = await getUtilisateurConnecte();

  if (!utilisateurConnecte) {
    return;
  }

  const nom = String(formData.get("nom") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const roleBrut = String(formData.get("role") ?? "");
  const role = roleBrut === "ADMINISTRATEUR" || roleBrut === "EMPLOYE" ? roleBrut : undefined;
  const actif = formData.get("actif") === "on";
  const salaireBrut = String(formData.get("salaire") ?? "").trim();
  const salaire = salaireBrut.length > 0 ? Number(salaireBrut) : undefined;

  const donnees: ModificationUtilisateur = { nom, email, role, actif, salaire };

  try {
    await modifierUtilisateur(repository, utilisateurConnecte, utilisateurId, donnees);
    revalidatePath("/utilisateurs");
  } catch (error) {
    if (
      error instanceof UtilisateurInvalideError ||
      error instanceof AccesRefuseUtilisateurError ||
      error instanceof UtilisateurIntrouvableError ||
      error instanceof ModificationPropreCompteInterditeError
    ) {
      return;
    }

    throw error;
  }
}
