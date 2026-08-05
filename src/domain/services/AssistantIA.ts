import type { RoleMessageAssistant } from "../entities/MessageAssistant";

export type TourConversation = {
  role: RoleMessageAssistant;
  contenu: string;
};

export interface AssistantIA {
  repondre(historique: TourConversation[], question: string, contexte: string): Promise<string>;
}
