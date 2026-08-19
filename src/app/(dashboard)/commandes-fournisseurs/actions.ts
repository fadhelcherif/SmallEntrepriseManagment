"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "../../../infrastructure/db";
import { creerCommandeFournisseur } from "../../../application/commandes/creerCommandeFournisseur";
import { listerCommandes } from "../../../application/commandes/listerCommandes";
import { validerCommande } from "../../../application/commandes/validerCommande";
import { annulerCommande } from "../../../application/commandes/annulerCommande";
import { receptionnerCommandeFournisseur } from "../../../application/commandes/receptionnerCommandeFournisseur";
import type { NouvelleCommande, NouvelleCommandeAchat, Commande } from "../../../domain/entities/Commande";
import { CommandeInvalideError, validerNouvelleCommande } from "../../../domain/services/validerNouvelleCommande";
import { PrismaCommandeRepository } from "../../../infrastructure/repositories/PrismaCommandeRepository";
import { PrismaProduitRepository } from "../../../infrastructure/repositories/PrismaProduitRepository";
import { PrismaFournisseurRepository } from "../../../infrastructure/repositories/PrismaFournisseurRepository";
import { PrismaEntrepriseRepository } from "../../../infrastructure/repositories/PrismaEntrepriseRepository";
import { PrismaTokenConfirmationCommandeRepository } from "../../../infrastructure/repositories/PrismaTokenConfirmationCommandeRepository";
import { PrismaMouvementStockRepository } from "../../../infrastructure/repositories/PrismaMouvementStockRepository";
import { PrismaAlerteRepository } from "../../../infrastructure/repositories/PrismaAlerteRepository";
import { PrismaChargeRepository } from "../../../infrastructure/repositories/PrismaChargeRepository";
import { EnvoyeurEmailGmail } from "../../../infrastructure/email/EnvoyeurEmailGmail";

export type CreerCommandeState = {
  message?: string;
  success?: boolean;
};

const commandeRepository = new PrismaCommandeRepository();
const produitRepository = new PrismaProduitRepository();
const fournisseurRepository = new PrismaFournisseurRepository();
const entrepriseRepository = new PrismaEntrepriseRepository();
const tokenConfirmationRepository = new PrismaTokenConfirmationCommandeRepository();
const mouvementRepository = new PrismaMouvementStockRepository();
const alerteRepository = new PrismaAlerteRepository();
const envoyeurEmail = new EnvoyeurEmailGmail();

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

  const donnees: NouvelleCommandeAchat = {
    type: "ACHAT_FOURNISSEUR",
    fournisseurId,
    lignes,
  };

  try {
    validerNouvelleCommande(donnees);
    await creerCommandeFournisseur(
      commandeRepository,
      produitRepository,
      fournisseurRepository,
      entrepriseRepository,
      tokenConfirmationRepository,
      envoyeurEmail,
      entrepriseId,
      utilisateurId,
      donnees,
      process.env.APP_URL ?? "http://localhost:3000",
    );
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
    const chargeRepositoryTransaction = new PrismaChargeRepository(transactionClient);

    await receptionnerCommandeFournisseur(
      commandeRepositoryTransaction,
      mouvementRepositoryTransaction,
      alerteRepositoryTransaction,
      produitRepositoryTransaction,
      chargeRepositoryTransaction,
      commande,
    );
  });
  revalidatePath("/commandes-fournisseurs");
  revalidatePath("/produits");
  revalidatePath("/charges");
}

export async function annulerCommandeAction(
  _entrepriseId: string,
  formData: FormData,
): Promise<void> {
  const commande = parserCommande(formData);
  await annulerCommande(commandeRepository, commande);
  revalidatePath("/commandes-fournisseurs");
}