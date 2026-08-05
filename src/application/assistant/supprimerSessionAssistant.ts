import type { SessionAssistantRepository } from "../../domain/repositories/SessionAssistantRepository";
import { SessionAssistantIntrouvableError } from "./chargerSessionAssistant";

export async function supprimerSessionAssistant(
  sessionAssistantRepository: SessionAssistantRepository,
  entrepriseId: string,
  utilisateurId: string,
  sessionId: string,
): Promise<void> {
  const session = await sessionAssistantRepository.trouverParId(sessionId);

  if (!session || session.entrepriseId !== entrepriseId || session.utilisateurId !== utilisateurId) {
    throw new SessionAssistantIntrouvableError();
  }

  await sessionAssistantRepository.supprimer(sessionId);
}
