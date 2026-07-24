export type TypeMouvementStock = "ENTREE" | "SORTIE" | "AJUSTEMENT";

export type MouvementStock = {
  id: string;
  produitId: string;
  utilisateurId?: string | null;
  type: TypeMouvementStock;
  quantite: number;
  date: Date;
  motif?: string | null;
};

export type NouveauMouvementStock = {
  produitId: string;
  type: TypeMouvementStock;
  quantite: number;
  motif?: string | null;
  utilisateurId?: string | null;
};