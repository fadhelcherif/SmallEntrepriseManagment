import type { UtilisateurRepository } from "../../domain/repositories/UtilisateurRepository";
import type { TokenReinitialisationRepository } from "../../domain/repositories/TokenReinitialisationRepository";
import type { PasswordHasher } from "../../domain/services/PasswordHasher";
import { validerMotDePasse } from "../../domain/services/validerMotDePasse";
import { tokenEstValide } from "../../domain/services/genererTokenReinitialisation";
import { TokenReinitialisationInvalideError } from "../../domain/services/errors";

export async function reinitialiserMotDePasse(
  tokenRepository: TokenReinitialisationRepository,
  utilisateurRepository: UtilisateurRepository,
  passwordHasher: PasswordHasher,
  token: string,
  nouveauMotDePasse: string,
): Promise<void> {
  validerMotDePasse(nouveauMotDePasse);

  const tokenTrouve = await tokenRepository.trouverParToken(token);

  if (!tokenTrouve || !tokenEstValide(tokenTrouve, new Date())) {
    throw new TokenReinitialisationInvalideError();
  }

  const motDePasseHash = await passwordHasher.hacher(nouveauMotDePasse);

  await utilisateurRepository.modifierMotDePasse(tokenTrouve.utilisateurId, motDePasseHash);
  await tokenRepository.marquerUtilise(tokenTrouve.id);
}
