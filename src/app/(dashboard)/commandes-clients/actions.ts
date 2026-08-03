"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "../../../infrastructure/db";
import { creerCommande } from "../../../application/commandes/creerCommande";
import { validerCommande } from "../../../application/commandes/validerCommande";
import { annulerCommande } from "../../../application/commandes/annulerCommande";
import { receptionnerCommande, CommandeReceptionnableSeulementDepuisValideeError } from "../../../application/commandes/receptionnerCommande";
import { StockInsuffisantError } from "../../../application/stock/enregistrerMouvement";
import type { NouvelleCommande, Commande } from "../../../domain/entities/Commande";
import { CommandeInvalideError, validerNouvelleCommande } from "../../../domain/services/validerNouvelleCommande";
import { PrismaCommandeRepository } from "../../../infrastructure/repositories/PrismaCommandeRepository";
import { PrismaProduitRepository } from "../../../infrastructure/repositories/PrismaProduitRepository";
import { PrismaMouvementStockRepository } from "../../../infrastructure/repositories/PrismaMouvementStockRepository";
import { PrismaAlerteRepository } from "../../../infrastructure/repositories/PrismaAlerteRepository";

export type CreerCommandeVenteState = {
  message?: string;
  success?: boolean;
};

export type LivrerCommandeVenteState = {
  message?: string;
  success?: boolean;
};

const commandeRepository = new PrismaCommandeRepository();
const produitRepository = new PrismaProduitRepository();

function parserLignes(formData: FormData): NouvelleCommande["lignes"] {
  const lignesJson = String(formData.get("lignesJson") ?? "[]");
  const lignes = JSON.parse(lignesJson) as Array<{ produitId: string; quantite: number; prixApplique?: number }>;

  return lignes
    .filter((ligne) => ligne.produitId && Number(ligne.quantite) > 0)
    .map((ligne) => ({
      produitId: ligne.produitId,
      quantite: Number(ligne.quantite),
      prixApplique: ligne.prixApplique !== undefined && Number(ligne.prixApplique) > 0 ? Number(ligne.prixApplique) : undefined,
    }));
}

function parserCommande(formData: FormData): Commande {
  const commandeJson = String(formData.get("commandeJson") ?? "{}");
  return JSON.parse(commandeJson) as Commande;
}

export async function creerCommandeVenteAction(
  entrepriseId: string,
  utilisateurId: string,
  _previousState: CreerCommandeVenteState,
  formData: FormData,
): Promise<CreerCommandeVenteState> {
  const donnees: NouvelleCommande = {
    type: "VENTE_CLIENT",
    lignes: parserLignes(formData),
  };

  try {
    validerNouvelleCommande(donnees);
    await creerCommande(commandeRepository, produitRepository, entrepriseId, utilisateurId, donnees);
    revalidatePath("/commandes-clients");

    return {
      message: "Commande créée avec succès.",
      success: true,
    };
  } catch (error) {
    if (error instanceof CommandeInvalideError || error instanceof StockInsuffisantError) {
      return {
        message: error.message,
        success: false,
      };
    }

    throw error;
  }
}

export async function validerCommandeVenteAction(_entrepriseId: string, formData: FormData): Promise<void> {
  const commande = parserCommande(formData);
  await validerCommande(commandeRepository, commande);
  revalidatePath("/commandes-clients");
}

export async function receptionnerCommandeVenteAction(
  _entrepriseId: string,
  _previousState: LivrerCommandeVenteState,
  formData: FormData,
): Promise<LivrerCommandeVenteState> {
  const commande = parserCommande(formData);

  try {
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

    revalidatePath("/commandes-clients");
    revalidatePath("/produits");
    revalidatePath("/stock");

    return { success: true };
  } catch (error) {
    if (error instanceof StockInsuffisantError || error instanceof CommandeReceptionnableSeulementDepuisValideeError) {
      return { message: error.message, success: false };
    }

    throw error;
  }
}

export async function annulerCommandeVenteAction(_entrepriseId: string, formData: FormData): Promise<void> {
  const commande = parserCommande(formData);
  await annulerCommande(commandeRepository, commande);
  revalidatePath("/commandes-clients");
}
