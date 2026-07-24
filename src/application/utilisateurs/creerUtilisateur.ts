import type { NouvelUtilisateur, Utilisateur } from "../../domain/entities/Utilisateur";
import type { UtilisateurRepository } from "../../domain/repositories/UtilisateurRepository";
import type { PasswordHasher } from "../../domain/services/PasswordHasher";
import { UtilisateurDejaExistantError } from "../../domain/services/errors";
import { validerNouvelUtilisateur } from "../../domain/services/validerNouvelUtilisateur";

export async function creerUtilisateur(
  repository: UtilisateurRepository,
  passwordHasher: PasswordHasher,
  nouvelUtilisateur: NouvelUtilisateur,
): Promise<Utilisateur> {
  validerNouvelUtilisateur(nouvelUtilisateur);

  const utilisateurExistant = await repository.trouverParEmail(nouvelUtilisateur.email);

  if (utilisateurExistant) {
    throw new UtilisateurDejaExistantError();
  }

  const motDePasseHash = await passwordHasher.hacher(nouvelUtilisateur.motDePasse);

  return repository.creer({
    entrepriseId: nouvelUtilisateur.entrepriseId,
    nom: nouvelUtilisateur.nom,
    email: nouvelUtilisateur.email,
    role: nouvelUtilisateur.role,
    motDePasseHash,
    actif: nouvelUtilisateur.actif,
  });
}