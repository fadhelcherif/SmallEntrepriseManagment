import type { SessionAssistant } from "../../domain/entities/SessionAssistant";
import type { SessionAssistantRepository } from "../../domain/repositories/SessionAssistantRepository";

export async function listerSessionsAssistant(
  sessionAssistantRepository: SessionAssistantRepository,
  entrepriseId: string,
  utilisateurId: string,
): Promise<SessionAssistant[]> {
  return sessionAssistantRepository.listerParUtilisateur(entrepriseId, utilisateurId);
}
