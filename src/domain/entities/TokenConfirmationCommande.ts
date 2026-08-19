export type TokenConfirmationCommande = {
  id: string;
  commandeId: string;
  token: string;
  dateExpiration: Date;
  dateCreation: Date;
};

export type NouveauTokenConfirmationCommande = {
  commandeId: string;
  token: string;
  dateExpiration: Date;
};
