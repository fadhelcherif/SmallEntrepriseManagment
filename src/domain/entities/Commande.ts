import type { LigneCommande, NouvelleLigneCommande } from "./LigneCommande";

export type StatutCommande = "BROUILLON" | "VALIDEE" | "RECUE" | "ANNULEE";
export type TypeCommande = "ACHAT_FOURNISSEUR";

export type LigneCommandeAEnregistrer = {
  produitId: string;
  quantite: number;
  prixApplique: number;
};

export type Commande = {
  id: string;
  entrepriseId: string;
  fournisseurId: string;
  type: TypeCommande;
  statut: StatutCommande;
  dateCommande: Date;
  lignes: LigneCommande[];
};

export type NouvelleCommande = {
  fournisseurId: string;
  lignes: NouvelleLigneCommande[];
};

export type CommandeAEnregistrer = {
  fournisseurId: string;
  utilisateurId: string;
  lignes: LigneCommandeAEnregistrer[];
};