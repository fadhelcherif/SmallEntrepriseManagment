import type { Fournisseur, NouveauFournisseur } from "../entities/Fournisseur";

export interface FournisseurRepository {
  creer(donnees: NouveauFournisseur, entrepriseId: string): Promise<Fournisseur>;
  listerParEntreprise(entrepriseId: string): Promise<Fournisseur[]>;
  trouverParId(id: string): Promise<Fournisseur | null>;
  modifier(id: string, donnees: Partial<NouveauFournisseur>): Promise<Fournisseur>;
  supprimer(id: string): Promise<void>;
}