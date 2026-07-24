"use server";

import { revalidatePath } from "next/cache";

import { enregistrerMouvement, ProduitIntrouvableError, StockInsuffisantError } from "../../../../../application/stock/enregistrerMouvement";
import type { NouveauMouvementStock } from "../../../../../domain/entities/MouvementStock";
import { getUtilisateurConnecte } from "../../../../../infrastructure/auth/getUtilisateurConnecte";
import { PrismaAlerteRepository } from "../../../../../infrastructure/repositories/PrismaAlerteRepository";
import { PrismaMouvementStockRepository } from "../../../../../infrastructure/repositories/PrismaMouvementStockRepository";
import { PrismaProduitRepository } from "../../../../../infrastructure/repositories/PrismaProduitRepository";

export type MouvementStockState = {
  message?: string;
  success?: boolean;
};

const mouvementRepository = new PrismaMouvementStockRepository();
const alerteRepository = new PrismaAlerteRepository();
const produitRepository = new PrismaProduitRepository();

export async function enregistrerMouvementAction(
  produitId: string,
  _previousState: MouvementStockState,
  formData: FormData,
): Promise<MouvementStockState> {
  const utilisateurConnecte = await getUtilisateurConnecte();

  if (!utilisateurConnecte) {
    return {
      message: "Vous devez être connecté pour enregistrer un mouvement de stock.",
      success: false,
    };
  }

  const type = String(formData.get("type") ?? "");
  const quantite = Number(formData.get("quantite"));
  const motif = String(formData.get("motif") ?? "").trim();

  const donnees: NouveauMouvementStock = {
    produitId,
    type: type as NouveauMouvementStock["type"],
    quantite,
    motif: motif.length > 0 ? motif : undefined,
    utilisateurId: utilisateurConnecte.id,
  };

  try {
    await enregistrerMouvement(mouvementRepository, alerteRepository, produitRepository, donnees);
    revalidatePath(`/produits/${produitId}/mouvements`);
    revalidatePath("/produits");
    revalidatePath("/alertes");

    return {
      message: "Mouvement enregistré avec succès.",
      success: true,
    };
  } catch (error) {
    if (error instanceof StockInsuffisantError || error instanceof ProduitIntrouvableError) {
      return {
        message: error.message,
        success: false,
      };
    }

    throw error;
  }
}