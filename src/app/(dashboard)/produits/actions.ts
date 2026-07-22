"use server";

import { revalidatePath } from "next/cache";

import { creerProduit } from "../../../application/produits/creerProduit";
import { modifierProduit } from "../../../application/produits/modifierProduit";
import { supprimerProduit } from "../../../application/produits/supprimerProduit";
import type { NouveauProduit } from "../../../domain/entities/Produit";
import { ProduitInvalideError, validerProduit as validerNouveauProduit } from "../../../domain/services/validerProduit";
import { PrismaProduitRepository } from "../../../infrastructure/repositories/PrismaProduitRepository";

export type CreerProduitState = {
  message?: string;
  success?: boolean;
};

const repository = new PrismaProduitRepository();

function parserDateExpiration(formData: FormData): Date | undefined {
  const valeur = String(formData.get("dateExpiration") ?? "").trim();

  if (!valeur) {
    return undefined;
  }

  const dateExpiration = new Date(`${valeur}T00:00:00`);
  return Number.isNaN(dateExpiration.getTime()) ? undefined : dateExpiration;
}

export async function creerProduitAction(
  entrepriseId: string,
  _previousState: CreerProduitState,
  formData: FormData,
): Promise<CreerProduitState> {
  const nom = String(formData.get("nom") ?? "").trim();
  const prixUnitaire = Number(formData.get("prixUnitaire"));
  const seuilAlerte = Number(formData.get("seuilAlerte"));

  const nouveauProduit: NouveauProduit = {
    nom,
    prixUnitaire,
    seuilAlerte,
  };

  try {
    validerNouveauProduit(nouveauProduit);
    await creerProduit(repository, nouveauProduit, entrepriseId);
    revalidatePath("/produits");

    return {
      message: "Produit créé avec succès.",
      success: true,
    };
  } catch (error) {
    if (error instanceof ProduitInvalideError) {
      return {
        message: error.message,
        success: false,
      };
    }

    throw error;
  }
}

export async function modifierProduitAction(
  _entrepriseId: string,
  produitId: string,
  formData: FormData,
): Promise<void> {
  const nom = String(formData.get("nom") ?? "").trim();
  const prixUnitaire = Number(formData.get("prixUnitaire"));
  const seuilAlerte = Number(formData.get("seuilAlerte"));
  const description = String(formData.get("description") ?? "").trim();
  const dateExpiration = parserDateExpiration(formData);

  const donnees: NouveauProduit = {
    nom,
    prixUnitaire,
    seuilAlerte,
    description: description.length > 0 ? description : undefined,
    dateExpiration,
  };

  try {
    await modifierProduit(repository, produitId, donnees);
    revalidatePath("/produits");
  } catch (error) {
    if (error instanceof ProduitInvalideError) {
      throw error;
    }

    throw error;
  }
}

export async function supprimerProduitAction(
  _entrepriseId: string,
  produitId: string,
): Promise<void> {
  await supprimerProduit(repository, produitId);
  revalidatePath("/produits");
}