import type { NouveauProduit, Produit } from "../entities/Produit";

export interface ProduitRepository {
  creer(produit: NouveauProduit, entrepriseId: string): Promise<Produit>;
  modifier(id: string, donnees: Partial<NouveauProduit>): Promise<Produit>;
  modifierStock(id: string, quantiteStock: number): Promise<Produit>;
  trouverParId(id: string): Promise<Produit | null>;
  supprimer(id: string): Promise<void>;
  estUtiliseDansCommande(id: string): Promise<boolean>;
  listerParEntreprise(entrepriseId: string): Promise<Produit[]>;
}