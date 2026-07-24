"use server";

import { revalidatePath } from "next/cache";

import { modifierEntreprise, AccesRefuseError } from "../../../application/entreprises/modifierEntreprise";
import type { NouvelleEntreprise } from "../../../domain/entities/Entreprise";
import { EntrepriseInvalideError } from "../../../domain/services/validerNouvelleEntreprise";
import { getUtilisateurConnecte } from "../../../infrastructure/auth/getUtilisateurConnecte";
import { PrismaEntrepriseRepository } from "../../../infrastructure/repositories/PrismaEntrepriseRepository";

export type ParametresEntrepriseState = {
  message?: string;
  success?: boolean;
};

const repository = new PrismaEntrepriseRepository();

function lireChampObligatoire(formData: FormData, nomChamp: string): string {
  return String(formData.get(nomChamp) ?? "").trim();
}

function lireChampOptionnel(formData: FormData, nomChamp: string): string | null {
  const valeur = String(formData.get(nomChamp) ?? "").trim();
  return valeur.length > 0 ? valeur : null;
}

export async function modifierEntrepriseAction(
  _previousState: ParametresEntrepriseState,
  formData: FormData,
): Promise<ParametresEntrepriseState> {
  const utilisateurConnecte = await getUtilisateurConnecte();

  if (!utilisateurConnecte) {
    return {
      message: "Vous devez être connecté pour modifier les paramètres de l'entreprise.",
      success: false,
    };
  }

  const donnees: Partial<NouvelleEntreprise> = {
    nom: lireChampObligatoire(formData, "nom"),
    adresse: lireChampObligatoire(formData, "adresse"),
    devise: lireChampObligatoire(formData, "devise"),
    typeMetier: lireChampObligatoire(formData, "typeMetier"),
    categorie: lireChampOptionnel(formData, "categorie"),
    logo: lireChampOptionnel(formData, "logo"),
    couleurPrimaire: lireChampOptionnel(formData, "couleurPrimaire"),
    couleurSecondaire: lireChampOptionnel(formData, "couleurSecondaire"),
  };

  try {
    await modifierEntreprise(repository, utilisateurConnecte, utilisateurConnecte.entrepriseId, donnees);
    revalidatePath("/parametres");

    return {
      message: "Paramètres de l'entreprise mis à jour.",
      success: true,
    };
  } catch (error) {
    if (error instanceof EntrepriseInvalideError || error instanceof AccesRefuseError) {
      return {
        message: error.message,
        success: false,
      };
    }

    throw error;
  }
}
