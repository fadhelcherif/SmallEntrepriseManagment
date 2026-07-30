import type { LigneCommande, NouvelleLigneCommande } from "./LigneCommande";

export type StatutCommande = "BROUILLON" | "VALIDEE" | "RECUE" | "ANNULEE";
export type TypeCommande = "ACHAT_FOURNISSEUR" | "VENTE_CLIENT";

export type LigneCommandeAEnregistrer = {
  produitId: string;
  quantite: number;
  prixApplique: number;
};

export type Commande = {
  id: string;
  entrepriseId: string;
  fournisseurId?: string | null;
  type: TypeCommande;
  statut: StatutCommande;
  dateCommande: Date;
  lignes: LigneCommande[];
};

export type NouvelleCommandeAchat = {
  type: "ACHAT_FOURNISSEUR";
  fournisseurId: string;
  lignes: NouvelleLigneCommande[];
};

export type NouvelleCommandeVente = {
  type: "VENTE_CLIENT";
  lignes: NouvelleLigneCommande[];
};

export type NouvelleCommande = NouvelleCommandeAchat | NouvelleCommandeVente;

export type CommandeAchatAEnregistrer = {
  type: "ACHAT_FOURNISSEUR";
  fournisseurId: string;
  utilisateurId: string;
  lignes: LigneCommandeAEnregistrer[];
};

export type CommandeVenteAEnregistrer = {
  type: "VENTE_CLIENT";
  utilisateurId: string;
  lignes: LigneCommandeAEnregistrer[];
};

export type CommandeAEnregistrer = CommandeAchatAEnregistrer | CommandeVenteAEnregistrer;
