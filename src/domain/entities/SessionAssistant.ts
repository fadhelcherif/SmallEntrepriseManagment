export type SessionAssistant = {
  id: string;
  entrepriseId: string;
  utilisateurId: string;
  titre: string;
  dateCreation: Date;
  derniereActivite: Date;
};

export type NouvelleSessionAssistant = {
  titre: string;
};
