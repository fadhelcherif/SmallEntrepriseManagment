"use server";

import { demanderReinitialisationMotDePasse } from "../../../application/auth/demanderReinitialisationMotDePasse";
import { PrismaUtilisateurRepository } from "../../../infrastructure/repositories/PrismaUtilisateurRepository";
import { PrismaTokenReinitialisationRepository } from "../../../infrastructure/repositories/PrismaTokenReinitialisationRepository";
import { EnvoyeurEmailGmail } from "../../../infrastructure/email/EnvoyeurEmailGmail";

export type DemandeReinitialisationState = {
  message?: string;
  success?: boolean;
};

const utilisateurRepository = new PrismaUtilisateurRepository();
const tokenRepository = new PrismaTokenReinitialisationRepository();
const envoyeurEmail = new EnvoyeurEmailGmail();

const MESSAGE_GENERIQUE = "Si un compte existe avec cet email, un lien de réinitialisation vient d'être envoyé.";

export async function demanderReinitialisationAction(
  _previousState: DemandeReinitialisationState,
  formData: FormData,
): Promise<DemandeReinitialisationState> {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    return { message: "L'email est obligatoire.", success: false };
  }

  await demanderReinitialisationMotDePasse(
    utilisateurRepository,
    tokenRepository,
    envoyeurEmail,
    email,
    process.env.APP_URL ?? "http://localhost:3000",
  );

  return { message: MESSAGE_GENERIQUE, success: true };
}
