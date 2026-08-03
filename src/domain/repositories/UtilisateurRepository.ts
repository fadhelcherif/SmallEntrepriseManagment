import type {
  NouvelUtilisateurAvecMotDePasseHash,
  Utilisateur,
  UtilisateurAvecMotDePasse,
} from "../entities/Utilisateur";

export type ModificationUtilisateur = Partial<Pick<Utilisateur, "nom" | "email" | "role" | "actif" | "salaire">>;

export interface UtilisateurRepository {
  trouverParEmail(email: string): Promise<UtilisateurAvecMotDePasse | null>;
  trouverParId(id: string): Promise<Utilisateur | null>;
  creer(donnees: NouvelUtilisateurAvecMotDePasseHash): Promise<Utilisateur>;
  listerParEntreprise(entrepriseId: string): Promise<Utilisateur[]>;
  modifier(id: string, donnees: ModificationUtilisateur): Promise<Utilisateur>;
  modifierMotDePasse(id: string, motDePasseHash: string): Promise<void>;
}
