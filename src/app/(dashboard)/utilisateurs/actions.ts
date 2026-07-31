"use server";

import { revalidatePath } from "next/cache";

import { creerUtilisateur } from "../../../application/utilisateurs/creerUtilisateur";
import {
  modifierUtilisateur,
  AccesRefuseUtilisateurError,
  ModificationPropreCompteInterditeError,
  UtilisateurIntrouvableError,
} from "../../../application/utilisateurs/modifierUtilisateur";
import { getUtilisateurConnecte } from "../../../infrastructure/auth/getUtilisateurConnecte";
import { PrismaUtilisateurRepository } from "../../../infrastructure/repositories/PrismaUtilisateurRepository";
import { BcryptPasswordHasher } from "../../../infrastructure/security/BcryptPasswordHasher";
import { UtilisateurDejaExistantError } from "../../../domain/services/errors";
import { UtilisateurInvalideError } from "../../../domain/services/validerNouvelUtilisateur";
import type { ModificationUtilisateur } from "../../../domain/repositories/UtilisateurRepository";

export type CreerUtilisateurState = {
  message?: string;
  success?: boolean;
};

const repository = new PrismaUtilisateurRepository();
const passwordHasher = new BcryptPasswordHasher();

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

  try {
    await creerUtilisateur(repository, passwordHasher, {
      entrepriseId: utilisateurConnecte.entrepriseId,
      nom,
      email,
      role: "EMPLOYE",
      motDePasse,
    });

    revalidatePath("/utilisateurs");

    return {
      message: "Utilisateur créé avec succès.",
      success: true,
    };
  } catch (error) {
    if (error instanceof UtilisateurInvalideError || error instanceof UtilisateurDejaExistantError) {
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

  const donnees: ModificationUtilisateur = { nom, email, role, actif };

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
