import type { NouveauTokenReinitialisation, TokenReinitialisation } from "../entities/TokenReinitialisation";

export interface TokenReinitialisationRepository {
  creer(donnees: NouveauTokenReinitialisation): Promise<TokenReinitialisation>;
  trouverParToken(token: string): Promise<TokenReinitialisation | null>;
  marquerUtilise(id: string): Promise<void>;
}
