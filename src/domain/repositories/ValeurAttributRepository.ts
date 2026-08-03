import type { NouvelleValeurAttribut, ValeurAttribut } from "../entities/ValeurAttribut";

export interface ValeurAttributRepository {
  /** Remplace toutes les valeurs d'un produit par celles fournies (upsert simple : supprime puis recree). */
  enregistrerPourProduit(produitId: string, valeurs: NouvelleValeurAttribut[]): Promise<ValeurAttribut[]>;
  listerParProduit(produitId: string): Promise<ValeurAttribut[]>;
  listerParProduits(produitIds: string[]): Promise<ValeurAttribut[]>;
}
