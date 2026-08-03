"use server";

import { revalidatePath } from "next/cache";

import { creerProduit } from "../../../application/produits/creerProduit";
import { modifierProduit } from "../../../application/produits/modifierProduit";
import { supprimerProduit } from "../../../application/produits/supprimerProduit";
import { trouverOuCreerAttribut } from "../../../application/attributs/trouverOuCreerAttribut";
import { enregistrerValeursProduit } from "../../../application/attributs/enregistrerValeursProduit";
import {
  supprimerAttribut,
  AccesRefuseAttributError,
  AttributIntrouvableError,
} from "../../../application/attributs/supprimerAttribut";
import type { NouveauProduit } from "../../../domain/entities/Produit";
import { ENTITE_CIBLE_PRODUIT } from "../../../domain/entities/AttributPersonnalise";
import { ProduitInvalideError, validerProduit as validerNouveauProduit } from "../../../domain/services/validerProduit";
import { ValeurAttributInvalideError } from "../../../domain/services/validerValeursAttributs";
import { AttributInvalideError } from "../../../domain/services/validerAttributPersonnalise";
import { getUtilisateurConnecte } from "../../../infrastructure/auth/getUtilisateurConnecte";
import { PrismaProduitRepository } from "../../../infrastructure/repositories/PrismaProduitRepository";
import { PrismaAttributPersonnaliseRepository } from "../../../infrastructure/repositories/PrismaAttributPersonnaliseRepository";
import { PrismaValeurAttributRepository } from "../../../infrastructure/repositories/PrismaValeurAttributRepository";

export type CreerProduitState = {
  message?: string;
  success?: boolean;
};

const repository = new PrismaProduitRepository();
const attributRepository = new PrismaAttributPersonnaliseRepository();
const valeurAttributRepository = new PrismaValeurAttributRepository();

function parserDateExpiration(formData: FormData): Date | undefined {
  const valeur = String(formData.get("dateExpiration") ?? "").trim();

  if (!valeur) {
    return undefined;
  }

  const dateExpiration = new Date(`${valeur}T00:00:00`);
  return Number.isNaN(dateExpiration.getTime()) ? undefined : dateExpiration;
}

type AttributSoumis = { nom: string; valeur: string };

function parserAttributsSoumis(formData: FormData): AttributSoumis[] {
  const attributsJson = String(formData.get("attributsJson") ?? "[]");

  try {
    const lignes = JSON.parse(attributsJson) as AttributSoumis[];
    return lignes.filter((ligne) => ligne.nom?.trim().length > 0 && ligne.valeur?.trim().length > 0);
  } catch {
    return [];
  }
}

async function enregistrerAttributsSoumis(entrepriseId: string, produitId: string, attributsSoumis: AttributSoumis[]): Promise<void> {
  const valeursSoumises = new Map<string, string>();

  for (const attributSoumis of attributsSoumis) {
    const attribut = await trouverOuCreerAttribut(attributRepository, entrepriseId, attributSoumis.nom, ENTITE_CIBLE_PRODUIT);
    valeursSoumises.set(attribut.id, attributSoumis.valeur.trim());
  }

  await enregistrerValeursProduit(attributRepository, valeurAttributRepository, entrepriseId, produitId, valeursSoumises);
}

export async function creerProduitAction(
  entrepriseId: string,
  _previousState: CreerProduitState,
  formData: FormData,
): Promise<CreerProduitState> {
  const nom = String(formData.get("nom") ?? "").trim();
  const prixAchat = Number(formData.get("prixAchat"));
  const prixVente = Number(formData.get("prixVente"));
  const seuilAlerte = Number(formData.get("seuilAlerte"));

  const nouveauProduit: NouveauProduit = {
    nom,
    prixAchat,
    prixVente,
    seuilAlerte,
  };

  try {
    validerNouveauProduit(nouveauProduit);

    const produitCree = await creerProduit(repository, nouveauProduit, entrepriseId);
    await enregistrerAttributsSoumis(entrepriseId, produitCree.id, parserAttributsSoumis(formData));

    revalidatePath("/produits");

    return {
      message: "Produit créé avec succès.",
      success: true,
    };
  } catch (error) {
    if (error instanceof ProduitInvalideError || error instanceof ValeurAttributInvalideError || error instanceof AttributInvalideError) {
      return {
        message: error.message,
        success: false,
      };
    }

    throw error;
  }
}

export async function modifierProduitAction(
  entrepriseId: string,
  produitId: string,
  formData: FormData,
): Promise<void> {
  const nom = String(formData.get("nom") ?? "").trim();
  const prixAchat = Number(formData.get("prixAchat"));
  const prixVente = Number(formData.get("prixVente"));
  const seuilAlerte = Number(formData.get("seuilAlerte"));
  const description = String(formData.get("description") ?? "").trim();
  const dateExpiration = parserDateExpiration(formData);

  const donnees: NouveauProduit = {
    nom,
    prixAchat,
    prixVente,
    seuilAlerte,
    description: description.length > 0 ? description : undefined,
    dateExpiration,
  };

  await modifierProduit(repository, produitId, donnees);
  await enregistrerAttributsSoumis(entrepriseId, produitId, parserAttributsSoumis(formData));

  revalidatePath("/produits");
}

export async function supprimerProduitAction(
  _entrepriseId: string,
  produitId: string,
): Promise<void> {
  await supprimerProduit(repository, produitId);
  revalidatePath("/produits");
}

export async function supprimerAttributAction(attributId: string, _formData: FormData): Promise<void> {
  const utilisateurConnecte = await getUtilisateurConnecte();

  if (!utilisateurConnecte) {
    return;
  }

  try {
    await supprimerAttribut(attributRepository, utilisateurConnecte, attributId);
    revalidatePath("/produits");
  } catch (error) {
    if (error instanceof AccesRefuseAttributError || error instanceof AttributIntrouvableError) {
      return;
    }

    throw error;
  }
}
