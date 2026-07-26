export type LigneCommande = {
  id: string;
  commandeId: string;
  produitId: string;
  quantite: number;
  prixApplique: number;
};

export type NouvelleLigneCommande = {
  produitId: string;
  quantite: number;
};