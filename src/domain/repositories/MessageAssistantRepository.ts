import type { MessageAssistant, NouveauMessageAssistant } from "../entities/MessageAssistant";

export interface MessageAssistantRepository {
  ajouter(donnees: NouveauMessageAssistant, sessionId: string): Promise<MessageAssistant>;
  listerParSession(sessionId: string): Promise<MessageAssistant[]>;
}
