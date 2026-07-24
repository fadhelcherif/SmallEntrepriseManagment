"use server";

import { redirect } from "next/navigation";

import { creerSession } from "../../../infrastructure/auth/session";
import { BcryptPasswordHasher } from "../../../infrastructure/security/BcryptPasswordHasher";
import { PrismaUtilisateurRepository } from "../../../infrastructure/repositories/PrismaUtilisateurRepository";
import { PrismaEntrepriseRepository } from "../../../infrastructure/repositories/PrismaEntrepriseRepository";
import { inscrireEntreprise } from "../../../application/entreprises/inscrireEntreprise";
import { prisma } from "../../../infrastructure/db";
import { UtilisateurDejaExistantError } from "../../../domain/services/errors";
import { UtilisateurInvalideError } from "../../../domain/services/validerNouvelUtilisateur";
import { EntrepriseInvalideError } from "../../../domain/services/validerNouvelleEntreprise";

export type SignupState = {
  message?: string;
  success?: boolean;
};

const passwordHasher = new BcryptPasswordHasher();

export async function signupAction(
  _previousState: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const nomEntreprise = String(formData.get("nomEntreprise") ?? "").trim();
  const adresseEntreprise = String(formData.get("adresseEntreprise") ?? "").trim();
  const deviseEntreprise = String(formData.get("deviseEntreprise") ?? "").trim();
  const typeMetierEntreprise = String(formData.get("typeMetierEntreprise") ?? "").trim();
  const nomAdministrateur = String(formData.get("nomAdministrateur") ?? "").trim();
  const emailAdministrateur = String(formData.get("emailAdministrateur") ?? "").trim();
  const motDePasseAdministrateur = String(formData.get("motDePasseAdministrateur") ?? "");

  try {
    const resultat = await prisma.$transaction(async (tx) => {
      const entrepriseRepository = new PrismaEntrepriseRepository(tx);
      const utilisateurRepository = new PrismaUtilisateurRepository(tx);

      return inscrireEntreprise(entrepriseRepository, utilisateurRepository, passwordHasher, {
        nom: nomEntreprise,
        adresse: adresseEntreprise,
        devise: deviseEntreprise,
        typeMetier: typeMetierEntreprise,
        nomAdministrateur,
        emailAdministrateur,
        motDePasseAdministrateur,
      });
    });

    await creerSession(resultat.administrateur);
    redirect("/produits");
  } catch (error) {
    if (error instanceof UtilisateurInvalideError) {
      return {
        message: error.message,
        success: false,
      };
    }

    if (error instanceof EntrepriseInvalideError) {
      return {
        message: error.message,
        success: false,
      };
    }

    if (error instanceof UtilisateurDejaExistantError) {
      return {
        message: error.message,
        success: false,
      };
    }

    throw error;
  }
}