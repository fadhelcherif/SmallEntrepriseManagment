"use server";

import { reinitialiserMotDePasse } from "../../../application/auth/reinitialiserMotDePasse";
import { PrismaUtilisateurRepository } from "../../../infrastructure/repositories/PrismaUtilisateurRepository";
import { PrismaTokenReinitialisationRepository } from "../../../infrastructure/repositories/PrismaTokenReinitialisationRepository";
import { BcryptPasswordHasher } from "../../../infrastructure/security/BcryptPasswordHasher";
import { TokenReinitialisationInvalideError } from "../../../domain/services/errors";
import { UtilisateurInvalideError } from "../../../domain/services/validerNouvelUtilisateur";

export type ReinitialisationState = {
  message?: string;
  success?: boolean;
};

const utilisateurRepository = new PrismaUtilisateurRepository();
const tokenRepository = new PrismaTokenReinitialisationRepository();
const passwordHasher = new BcryptPasswordHasher();

export async function reinitialiserMotDePasseAction(
  _previousState: ReinitialisationState,
  formData: FormData,
): Promise<ReinitialisationState> {
  const token = String(formData.get("token") ?? "");
  const motDePasse = String(formData.get("motDePasse") ?? "");
  const confirmationMotDePasse = String(formData.get("confirmationMotDePasse") ?? "");

  if (motDePasse !== confirmationMotDePasse) {
    return { message: "Les deux mots de passe ne correspondent pas.", success: false };
  }

  try {
    await reinitialiserMotDePasse(tokenRepository, utilisateurRepository, passwordHasher, token, motDePasse);

    return { message: "Mot de passe modifié avec succès. Vous pouvez maintenant vous connecter.", success: true };
  } catch (error) {
    if (error instanceof TokenReinitialisationInvalideError || error instanceof UtilisateurInvalideError) {
      return { message: error.message, success: false };
    }

    throw error;
  }
}
