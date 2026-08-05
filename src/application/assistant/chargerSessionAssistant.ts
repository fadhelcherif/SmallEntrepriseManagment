import type { MessageAssistant } from "../../domain/entities/MessageAssistant";
import type { SessionAssistant } from "../../domain/entities/SessionAssistant";
import type { MessageAssistantRepository } from "../../domain/repositories/MessageAssistantRepository";
import type { SessionAssistantRepository } from "../../domain/repositories/SessionAssistantRepository";

export class SessionAssistantIntrouvableError extends Error {
  constructor(message = "Cette conversation est introuvable.") {
    super(message);
    this.name = "SessionAssistantIntrouvableError";
  }
}

export async function chargerSessionAssistant(
  sessionAssistantRepository: SessionAssistantRepository,
  messageAssistantRepository: MessageAssistantRepository,
  entrepriseId: string,
  utilisateurId: string,
  sessionId: string,
): Promise<{ session: SessionAssistant; messages: MessageAssistant[] }> {
  const session = await sessionAssistantRepository.trouverParId(sessionId);

  if (!session || session.entrepriseId !== entrepriseId || session.utilisateurId !== utilisateurId) {
    throw new SessionAssistantIntrouvableError();
  }

  const messages = await messageAssistantRepository.listerParSession(sessionId);

  return { session, messages };
}
