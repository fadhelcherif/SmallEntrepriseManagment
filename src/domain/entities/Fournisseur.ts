export type Fournisseur = {
  id: string;
  entrepriseId: string;
  nom: string;
  contact?: string | null;
  adresse?: string | null;
  delaiLivraisonJours?: number | null;
};

export type NouveauFournisseur = {
  nom: string;
  contact?: string | null;
  adresse?: string | null;
  delaiLivraisonJours?: number | null;
};