export interface EnvoyeurEmail {
  envoyer(destinataire: string, sujet: string, contenuTexte: string): Promise<void>;
}
