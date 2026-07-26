"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "../../../infrastructure/db";
import { creerCommande } from "../../../application/commandes/creerCommande";
import { listerCommandes } from "../../../application/commandes/listerCommandes";
import { validerCommande } from "../../../application/commandes/validerCommande";
import { annulerCommande } from "../../../application/commandes/annulerCommande";
import { receptionnerCommande } from "../../../application/commandes/receptionnerCommande";
import { creerProduit } from "../../../application/produits/creerProduit";
import type { NouvelleCommande, Commande } from "../../../domain/entities/Commande";
import type { NouveauProduit } from "../../../domain/entities/Produit";
import { CommandeInvalideError, validerNouvelleCommande } from "../../../domain/services/validerNouvelleCommande";
import { ProduitInvalideError, validerProduit as validerNouveauProduit } from "../../../domain/services/validerProduit";
import { PrismaCommandeRepository } from "../../../infrastructure/repositories/PrismaCommandeRepository";
import { PrismaProduitRepository } from "../../../infrastructure/repositories/PrismaProduitRepository";
import { PrismaFournisseurRepository } from "../../../infrastructure/repositories/PrismaFournisseurRepository";
import { PrismaMouvementStockRepository } from "../../../infrastructure/repositories/PrismaMouvementStockRepository";
import { PrismaAlerteRepository } from "../../../infrastructure/repositories/PrismaAlerteRepository";

export type CreerCommandeState = {
  message?: string;
  success?: boolean;
};

export type CreerProduitInlineState = {
  message?: string;
  success?: boolean;
};

const commandeRepository = new PrismaCommandeRepository();
const produitRepository = new PrismaProduitRepository();
const fournisseurRepository = new PrismaFournisseurRepository();
const mouvementRepository = new PrismaMouvementStockRepository();
const alerteRepository = new PrismaAlerteRepository();

function parserLignes(formData: FormData): NouvelleCommande["lignes"] {
  const lignesJson = String(formData.get("lignesJson") ?? "[]");
  const lignes = JSON.parse(lignesJson) as Array<{ produitId: string; quantite: number }>;
  return lignes.filter((ligne) => ligne.produitId && Number(ligne.quantite) > 0);
}

function parserCommande(formData: FormData): Commande {
  const commandeJson = String(formData.get("commandeJson") ?? "{}");
  return JSON.parse(commandeJson) as Commande;
}

function parserDelaiLivraisonJours(formData: FormData): number | undefined {
  const valeur = String(formData.get("delaiLivraisonJours") ?? "").trim();
  if (!valeur) {
    return undefined;
  }

  const nombre = Number(valeur);
  return Number.isNaN(nombre) ? undefined : nombre;
}

export async function creerCommandeAction(
  entrepriseId: string,
  utilisateurId: string,
  _previousState: CreerCommandeState,
  formData: FormData,
): Promise<CreerCommandeState> {
  const fournisseurId = String(formData.get("fournisseurId") ?? "").trim();
  const lignes = parserLignes(formData);

  const donnees: NouvelleCommande = {
    fournisseurId,
    lignes,
  };

  try {
    validerNouvelleCommande(donnees);
    await creerCommande(commandeRepository, produitRepository, entrepriseId, utilisateurId, donnees);
    revalidatePath("/commandes-fournisseurs");

    return {
      message: "Commande créée avec succès.",
      success: true,
    };
  } catch (error) {
    if (error instanceof CommandeInvalideError) {
      return {
        message: error.message,
        success: false,
      };
    }

    throw error;
  }
}

export async function creerProduitDepuisCommandeAction(
  entrepriseId: string,
  _previousState: CreerProduitInlineState,
  formData: FormData,
): Promise<CreerProduitInlineState> {
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
    await creerProduit(produitRepository, nouveauProduit, entrepriseId);
    revalidatePath("/commandes-fournisseurs");
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

export async function validerCommandeAction(
  _entrepriseId: string,
  formData: FormData,
): Promise<void> {
  const commande = parserCommande(formData);
  await validerCommande(commandeRepository, commande);
  revalidatePath("/commandes-fournisseurs");
}

export async function receptionnerCommandeAction(
  _entrepriseId: string,
  formData: FormData,
): Promise<void> {
  const commande = parserCommande(formData);
  await prisma.$transaction(async (transactionClient) => {
    const commandeRepositoryTransaction = new PrismaCommandeRepository(transactionClient);
    const mouvementRepositoryTransaction = new PrismaMouvementStockRepository(transactionClient);
    const alerteRepositoryTransaction = new PrismaAlerteRepository(transactionClient);
    const produitRepositoryTransaction = new PrismaProduitRepository(transactionClient);

    await receptionnerCommande(
      commandeRepositoryTransaction,
      mouvementRepositoryTransaction,
      alerteRepositoryTransaction,
      produitRepositoryTransaction,
      commande,
    );
  });
  revalidatePath("/commandes-fournisseurs");
  revalidatePath("/produits");
}

export async function annulerCommandeAction(
  _entrepriseId: string,
  formData: FormData,
): Promise<void> {
  const commande = parserCommande(formData);
  await annulerCommande(commandeRepository, commande);
  revalidatePath("/commandes-fournisseurs");
}