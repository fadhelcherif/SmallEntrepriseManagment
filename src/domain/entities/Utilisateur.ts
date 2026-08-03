export type Utilisateur = {
  id: string;
  entrepriseId: string;
  nom: string;
  email: string;
  role: "ADMINISTRATEUR" | "EMPLOYE";
  actif: boolean;
  salaire?: number | null;
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
  salaire?: number | null;
};

export type NouvelUtilisateurAvecMotDePasseHash = Omit<NouvelUtilisateur, "motDePasse"> & {
  motDePasseHash: string;
};