import type { MouvementStock, NouveauMouvementStock } from "../entities/MouvementStock";

export interface MouvementStockRepository {
  creer(donnees: NouveauMouvementStock): Promise<MouvementStock>;
  listerParProduit(produitId: string): Promise<MouvementStock[]>;
}