import type {
  NouvelUtilisateurAvecMotDePasseHash,
  Utilisateur,
  UtilisateurAvecMotDePasse,
} from "../entities/Utilisateur";

export interface UtilisateurRepository {
  trouverParEmail(email: string): Promise<UtilisateurAvecMotDePasse | null>;
  creer(donnees: NouvelUtilisateurAvecMotDePasseHash): Promise<Utilisateur>;
  listerParEntreprise(entrepriseId: string): Promise<Utilisateur[]>;
}