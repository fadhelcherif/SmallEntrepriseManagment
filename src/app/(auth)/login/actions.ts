"use server";

import { redirect } from "next/navigation";

import { authentifierUtilisateur } from "../../../application/auth/authentifierUtilisateur";
import { creerSession } from "../../../infrastructure/auth/session";
import { PrismaUtilisateurRepository } from "../../../infrastructure/repositories/PrismaUtilisateurRepository";
import { BcryptPasswordHasher } from "../../../infrastructure/security/BcryptPasswordHasher";
import { IdentifiantsInvalidesError } from "../../../domain/services/errors";

export type LoginState = {
  message?: string;
  success?: boolean;
};

const repository = new PrismaUtilisateurRepository();
const passwordHasher = new BcryptPasswordHasher();

export async function loginAction(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const motDePasse = String(formData.get("motDePasse") ?? "");

  try {
    const utilisateur = await authentifierUtilisateur(repository, passwordHasher, email, motDePasse);
    await creerSession(utilisateur);
    redirect("/produits");
  } catch (error) {
    if (error instanceof IdentifiantsInvalidesError) {
      return {
        message: "Email ou mot de passe incorrect.",
        success: false,
      };
    }

    throw error;
  }
}