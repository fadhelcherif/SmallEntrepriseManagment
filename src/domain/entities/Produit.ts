export type Produit = {
  id: string;
  entrepriseId: string;
  nom: string;
  prixUnitaire: number;
  quantiteStock: number;
  seuilAlerte: number;
  description?: string | null;
  dateExpiration?: Date | null;
};

export type NouveauProduit = {
  nom: string;
  prixUnitaire: number;
  quantiteStock?: number;
  seuilAlerte?: number;
  description?: string | null;
  dateExpiration?: Date | null;
};