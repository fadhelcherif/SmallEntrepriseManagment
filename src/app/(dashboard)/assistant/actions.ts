"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { poserQuestionAssistant } from "../../../application/assistant/poserQuestionAssistant";
import { supprimerSessionAssistant } from "../../../application/assistant/supprimerSessionAssistant";
import { getUtilisateurConnecte } from "../../../infrastructure/auth/getUtilisateurConnecte";
import { PrismaProduitRepository } from "../../../infrastructure/repositories/PrismaProduitRepository";
import { PrismaAlerteRepository } from "../../../infrastructure/repositories/PrismaAlerteRepository";
import { PrismaCommandeRepository } from "../../../infrastructure/repositories/PrismaCommandeRepository";
import { PrismaChargeRepository } from "../../../infrastructure/repositories/PrismaChargeRepository";
import { PrismaEntrepriseRepository } from "../../../infrastructure/repositories/PrismaEntrepriseRepository";
import { PrismaFournisseurRepository } from "../../../infrastructure/repositories/PrismaFournisseurRepository";
import { PrismaUtilisateurRepository } from "../../../infrastructure/repositories/PrismaUtilisateurRepository";
import { PrismaAttributPersonnaliseRepository } from "../../../infrastructure/repositories/PrismaAttributPersonnaliseRepository";
import { PrismaValeurAttributRepository } from "../../../infrastructure/repositories/PrismaValeurAttributRepository";
import { PrismaSessionAssistantRepository } from "../../../infrastructure/repositories/PrismaSessionAssistantRepository";
import { PrismaMessageAssistantRepository } from "../../../infrastructure/repositories/PrismaMessageAssistantRepository";
import { GroqAssistantIA } from "../../../infrastructure/ia/GroqAssistantIA";

export type AssistantState = {
  sessionId?: string;
  question?: string;
  reponse?: string;
  erreur?: string;
};

const produitRepository = new PrismaProduitRepository();
const alerteRepository = new PrismaAlerteRepository();
const commandeRepository = new PrismaCommandeRepository();
const chargeRepository = new PrismaChargeRepository();
const entrepriseRepository = new PrismaEntrepriseRepository();
const fournisseurRepository = new PrismaFournisseurRepository();
const utilisateurRepository = new PrismaUtilisateurRepository();
const attributRepository = new PrismaAttributPersonnaliseRepository();
const valeurAttributRepository = new PrismaValeurAttributRepository();
const sessionAssistantRepository = new PrismaSessionAssistantRepository();
const messageAssistantRepository = new PrismaMessageAssistantRepository();
const assistantIA = new GroqAssistantIA();

export async function poserQuestionAction(
  _previousState: AssistantState,
  formData: FormData,
): Promise<AssistantState> {
  const question = String(formData.get("question") ?? "").trim();
  const sessionId = String(formData.get("sessionId") ?? "").trim() || null;

  if (!question) {
    return { sessionId: sessionId ?? undefined, erreur: "Pose une question." };
  }

  const utilisateurConnecte = await getUtilisateurConnecte();

  if (!utilisateurConnecte) {
    return { sessionId: sessionId ?? undefined, question, erreur: "Vous devez être connecté." };
  }

  const entreprise = await entrepriseRepository.trouverParId(utilisateurConnecte.entrepriseId);

  if (!entreprise) {
    return { sessionId: sessionId ?? undefined, question, erreur: "Entreprise introuvable." };
  }

  try {
    const { session, reponse } = await poserQuestionAssistant(
      produitRepository,
      alerteRepository,
      commandeRepository,
      chargeRepository,
      fournisseurRepository,
      utilisateurRepository,
      attributRepository,
      valeurAttributRepository,
      sessionAssistantRepository,
      messageAssistantRepository,
      assistantIA,
      utilisateurConnecte.entrepriseId,
      entreprise.nom,
      utilisateurConnecte.id,
      utilisateurConnecte.role === "ADMINISTRATEUR",
      question,
      sessionId,
    );

    revalidatePath("/assistant");

    return { sessionId: session.id, question, reponse };
  } catch {
    return {
      sessionId: sessionId ?? undefined,
      question,
      erreur: "L'assistant est momentanément indisponible. Réessaie dans un instant.",
    };
  }
}

export async function supprimerSessionAction(_entrepriseId: string, _utilisateurId: string, sessionId: string): Promise<void> {
  const utilisateurConnecte = await getUtilisateurConnecte();

  if (!utilisateurConnecte) {
    redirect("/login");
  }

  await supprimerSessionAssistant(sessionAssistantRepository, utilisateurConnecte.entrepriseId, utilisateurConnecte.id, sessionId);
  revalidatePath("/assistant");
  redirect("/assistant");
}
