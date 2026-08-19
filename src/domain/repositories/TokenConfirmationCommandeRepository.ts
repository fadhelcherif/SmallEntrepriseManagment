import type { NouveauTokenConfirmationCommande, TokenConfirmationCommande } from "../entities/TokenConfirmationCommande";

export interface TokenConfirmationCommandeRepository {
  creer(donnees: NouveauTokenConfirmationCommande): Promise<TokenConfirmationCommande>;
  trouverParToken(token: string): Promise<TokenConfirmationCommande | null>;
}
