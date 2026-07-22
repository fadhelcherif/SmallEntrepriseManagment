import type { NouveauProduit, Produit } from "../entities/Produit";

export interface ProduitRepository {
  creer(produit: NouveauProduit, entrepriseId: string): Promise<Produit>;
  modifier(id: string, donnees: Partial<NouveauProduit>): Promise<Produit>;
  supprimer(id: string): Promise<void>;
  listerParEntreprise(entrepriseId: string): Promise<Produit[]>;
}