export type TokenReinitialisation = {
  id: string;
  utilisateurId: string;
  token: string;
  dateExpiration: Date;
  utilise: boolean;
  dateCreation: Date;
};

export type NouveauTokenReinitialisation = {
  utilisateurId: string;
  token: string;
  dateExpiration: Date;
};
