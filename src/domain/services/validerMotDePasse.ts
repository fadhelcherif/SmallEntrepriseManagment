import { UtilisateurInvalideError } from "./validerNouvelUtilisateur";

export function validerMotDePasse(motDePasse: string): void {
  if (!motDePasse || motDePasse.trim().length < 8) {
    throw new UtilisateurInvalideError("Le mot de passe doit contenir au moins 8 caractères.");
  }
}
