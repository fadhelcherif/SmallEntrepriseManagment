// Types de charge geres automatiquement par l'application (jamais saisis a la main) :
// une charge "Salaire" est creee avec un utilisateurId a chaque creation d'employe,
// une charge "Achat fournisseur" est creee avec un fournisseurId a chaque reception
// de commande fournisseur (voir creerUtilisateurAvecSalaire / receptionnerCommandeFournisseur).
export const TYPE_CHARGE_SALAIRE = "Salaire";
export const TYPE_CHARGE_ACHAT_FOURNISSEUR = "Achat fournisseur";

export type Charge = {
  id: string;
  entrepriseId: string;
  utilisateurId?: string | null;
  fournisseurId?: string | null;
  type: string;
  montant: number;
  dateEcheance: Date;
  recurrente: boolean;
};

export type NouvelleCharge = {
  utilisateurId?: string | null;
  fournisseurId?: string | null;
  type: string;
  montant: number;
  dateEcheance: Date;
  recurrente?: boolean;
};
