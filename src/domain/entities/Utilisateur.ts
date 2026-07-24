export type Utilisateur = {
  id: string;
  entrepriseId: string;
  nom: string;
  email: string;
  role: "ADMINISTRATEUR" | "EMPLOYE";
  actif: boolean;
};

export type UtilisateurAvecMotDePasse = Utilisateur & {
  motDePasseHash: string;
};

export type NouvelUtilisateur = {
  entrepriseId: string;
  nom: string;
  email: string;
  role: Utilisateur["role"];
  motDePasse: string;
  actif?: boolean;
};

export type NouvelUtilisateurAvecMotDePasseHash = Omit<NouvelUtilisateur, "motDePasse"> & {
  motDePasseHash: string;
};