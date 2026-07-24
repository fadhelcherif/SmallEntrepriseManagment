export type Alerte = {
  id: string;
  produitId: string;
  type: string;
  message: string;
  dateGeneration: Date;
  lue: boolean;
};

export type NouvelleAlerte = {
  produitId: string;
  type: string;
  message: string;
  dateGeneration?: Date;
  lue?: boolean;
};