import type { UtilisateurRepository } from "../../domain/repositories/UtilisateurRepository";
import type { TokenReinitialisationRepository } from "../../domain/repositories/TokenReinitialisationRepository";
import type { EnvoyeurEmail } from "../../domain/services/EnvoyeurEmail";
import { genererToken, calculerExpirationToken } from "../../domain/services/genererTokenReinitialisation";

export async function demanderReinitialisationMotDePasse(
  utilisateurRepository: UtilisateurRepository,
  tokenRepository: TokenReinitialisationRepository,
  envoyeurEmail: EnvoyeurEmail,
  email: string,
  urlBase: string,
): Promise<void> {
  const utilisateur = await utilisateurRepository.trouverParEmail(email);

  if (!utilisateur || !utilisateur.actif) {
    return;
  }

  const token = genererToken();
  const dateExpiration = calculerExpirationToken(new Date());

  await tokenRepository.creer({
    utilisateurId: utilisateur.id,
    token,
    dateExpiration,
  });

  const lien = `${urlBase}/reinitialiser-mot-de-passe?token=${token}`;

  await envoyeurEmail.envoyer(
    email,
    "Réinitialisation de votre mot de passe Vantik",
    `Bonjour ${utilisateur.nom},\n\n` +
      "Vous avez demandé la réinitialisation de votre mot de passe Vantik.\n" +
      `Cliquez sur ce lien pour choisir un nouveau mot de passe (valable 1 heure) :\n${lien}\n\n` +
      "Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet email.",
  );
}
