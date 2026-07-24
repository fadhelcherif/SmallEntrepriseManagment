"use server";

import { revalidatePath } from "next/cache";

import { marquerAlerteCommeLue } from "../../../application/alertes/marquerAlerteCommeLue";
import { getUtilisateurConnecte } from "../../../infrastructure/auth/getUtilisateurConnecte";
import { PrismaAlerteRepository } from "../../../infrastructure/repositories/PrismaAlerteRepository";

const repository = new PrismaAlerteRepository();

export async function marquerAlerteCommeLueAction(alerteId: string): Promise<void> {
  const utilisateurConnecte = await getUtilisateurConnecte();

  if (!utilisateurConnecte) {
    return;
  }

  await marquerAlerteCommeLue(repository, alerteId);
  revalidatePath("/alertes");
  revalidatePath("/produits");
}