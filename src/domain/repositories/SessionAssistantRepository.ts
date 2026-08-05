import type { NouvelleSessionAssistant, SessionAssistant } from "../entities/SessionAssistant";

export interface SessionAssistantRepository {
  creer(donnees: NouvelleSessionAssistant, entrepriseId: string, utilisateurId: string): Promise<SessionAssistant>;
  trouverParId(id: string): Promise<SessionAssistant | null>;
  listerParUtilisateur(entrepriseId: string, utilisateurId: string): Promise<SessionAssistant[]>;
  toucherDerniereActivite(id: string): Promise<void>;
  supprimer(id: string): Promise<void>;
}
