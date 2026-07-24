import type { Utilisateur } from "../../domain/entities/Utilisateur";
import type { UtilisateurRepository } from "../../domain/repositories/UtilisateurRepository";
import type { PasswordHasher } from "../../domain/services/PasswordHasher";
import { IdentifiantsInvalidesError } from "../../domain/services/errors";

export async function authentifierUtilisateur(
  repository: UtilisateurRepository,
  passwordHasher: PasswordHasher,
  email: string,
  motDePasse: string,
): Promise<Utilisateur> {
  const utilisateur = await repository.trouverParEmail(email);

  if (!utilisateur || !utilisateur.actif) {
    throw new IdentifiantsInvalidesError();
  }

  const motDePasseValide = await passwordHasher.comparer(motDePasse, utilisateur.motDePasseHash);

  if (!motDePasseValide) {
    throw new IdentifiantsInvalidesError();
  }

  const { motDePasseHash: _motDePasseHash, ...utilisateurSansHash } = utilisateur;
  return utilisateurSansHash;
}