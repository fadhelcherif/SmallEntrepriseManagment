export type Produit = {
  id: string;
  entrepriseId: string;
  nom: string;
  prixAchat: number;
  prixVente: number;
  quantiteStock: number;
  seuilAlerte: number;
  description?: string | null;
  dateExpiration?: Date | null;
};

export type NouveauProduit = {
  nom: string;
  prixAchat: number;
  prixVente: number;
  quantiteStock?: number;
  seuilAlerte?: number;
  description?: string | null;
  dateExpiration?: Date | null;
};
