import type { NouvelUtilisateur } from "../entities/Utilisateur";
import type { ModificationUtilisateur } from "../repositories/UtilisateurRepository";

export class UtilisateurInvalideError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UtilisateurInvalideError";
  }
}

export function validerNouvelUtilisateur(utilisateur: NouvelUtilisateur): void {
  if (!utilisateur.nom || utilisateur.nom.trim().length === 0) {
    throw new UtilisateurInvalideError("Le nom de l'utilisateur est obligatoire.");
  }

  if (!utilisateur.email || !utilisateur.email.includes("@")) {
    throw new UtilisateurInvalideError("L'email de l'utilisateur doit contenir un '@'.");
  }

  if (!utilisateur.motDePasse || utilisateur.motDePasse.trim().length < 8) {
    throw new UtilisateurInvalideError("Le mot de passe doit contenir au moins 8 caractères.");
  }
}

export function validerModificationUtilisateur(donnees: ModificationUtilisateur): void {
  if (donnees.nom !== undefined && donnees.nom.trim().length === 0) {
    throw new UtilisateurInvalideError("Le nom de l'utilisateur est obligatoire.");
  }

  if (donnees.email !== undefined && !donnees.email.includes("@")) {
    throw new UtilisateurInvalideError("L'email de l'utilisateur doit contenir un '@'.");
  }
}