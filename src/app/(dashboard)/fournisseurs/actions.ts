"use server";

import { revalidatePath } from "next/cache";

import { creerFournisseur } from "../../../application/fournisseurs/creerFournisseur";
import { modifierFournisseur } from "../../../application/fournisseurs/modifierFournisseur";
import { supprimerFournisseur } from "../../../application/fournisseurs/supprimerFournisseur";
import type { NouveauFournisseur } from "../../../domain/entities/Fournisseur";
import { FournisseurInvalideError, validerFournisseur as validerNouveauFournisseur } from "../../../domain/services/validerFournisseur";
import { PrismaFournisseurRepository } from "../../../infrastructure/repositories/PrismaFournisseurRepository";

export type CreerFournisseurState = {
  message?: string;
  success?: boolean;
};

const repository = new PrismaFournisseurRepository();

function parserDelaiLivraisonJours(formData: FormData): number | undefined {
  const valeur = String(formData.get("delaiLivraisonJours") ?? "").trim();

  if (!valeur) {
    return undefined;
  }

  const delaiLivraisonJours = Number(valeur);
  return Number.isNaN(delaiLivraisonJours) ? undefined : delaiLivraisonJours;
}

function construireDonnees(formData: FormData): NouveauFournisseur {
  const nom = String(formData.get("nom") ?? "").trim();
  const contact = String(formData.get("contact") ?? "").trim();
  const adresse = String(formData.get("adresse") ?? "").trim();
  const delaiLivraisonJours = parserDelaiLivraisonJours(formData);

  return {
    nom,
    contact: contact.length > 0 ? contact : undefined,
    adresse: adresse.length > 0 ? adresse : undefined,
    delaiLivraisonJours,
  };
}

export async function creerFournisseurAction(
  entrepriseId: string,
  _previousState: CreerFournisseurState,
  formData: FormData,
): Promise<CreerFournisseurState> {
  const donnees = construireDonnees(formData);

  try {
    validerNouveauFournisseur(donnees);
    await creerFournisseur(repository, entrepriseId, donnees);
    revalidatePath("/fournisseurs");

    return {
      message: "Fournisseur créé avec succès.",
      success: true,
    };
  } catch (error) {
    if (error instanceof FournisseurInvalideError) {
      return {
        message: error.message,
        success: false,
      };
    }

    throw error;
  }
}

export async function modifierFournisseurAction(
  _entrepriseId: string,
  fournisseurId: string,
  formData: FormData,
): Promise<void> {
  const donnees = construireDonnees(formData);

  validerNouveauFournisseur(donnees);
  await modifierFournisseur(repository, fournisseurId, donnees);
  revalidatePath("/fournisseurs");
}

export async function supprimerFournisseurAction(
  _entrepriseId: string,
  fournisseurId: string,
): Promise<void> {
  await supprimerFournisseur(repository, fournisseurId);
  revalidatePath("/fournisseurs");
}