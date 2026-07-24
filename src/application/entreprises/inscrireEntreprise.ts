import type { EntrepriseRepository } from "../../domain/repositories/EntrepriseRepository";
import type { UtilisateurRepository } from "../../domain/repositories/UtilisateurRepository";
import type { PasswordHasher } from "../../domain/services/PasswordHasher";
import { UtilisateurDejaExistantError } from "../../domain/services/errors";
import { validerNouvelUtilisateur } from "../../domain/services/validerNouvelUtilisateur";
import { validerNouvelleEntreprise } from "../../domain/services/validerNouvelleEntreprise";
import type { Entreprise, NouvelleEntreprise } from "../../domain/entities/Entreprise";
import type { NouvelUtilisateur, Utilisateur } from "../../domain/entities/Utilisateur";

export type DonneesInscriptionEntreprise = NouvelleEntreprise & {
  nomAdministrateur: string;
  emailAdministrateur: string;
  motDePasseAdministrateur: string;
};

export type ResultatInscriptionEntreprise = {
  entreprise: Entreprise;
  administrateur: Utilisateur;
};

export async function inscrireEntreprise(
  entrepriseRepository: EntrepriseRepository,
  utilisateurRepository: UtilisateurRepository,
  passwordHasher: PasswordHasher,
  donnees: DonneesInscriptionEntreprise,
): Promise<ResultatInscriptionEntreprise> {
  validerNouvelleEntreprise(donnees);

  validerNouvelUtilisateur({
    entrepriseId: "temporaire",
    nom: donnees.nomAdministrateur,
    email: donnees.emailAdministrateur,
    motDePasse: donnees.motDePasseAdministrateur,
    role: "ADMINISTRATEUR",
  });

  const administrateurExistant = await utilisateurRepository.trouverParEmail(donnees.emailAdministrateur);

  if (administrateurExistant) {
    throw new UtilisateurDejaExistantError();
  }

  const entreprise = await entrepriseRepository.creer({
    nom: donnees.nom,
    adresse: donnees.adresse,
    devise: donnees.devise,
    typeMetier: donnees.typeMetier,
  });

  const nouvelAdministrateur: NouvelUtilisateur = {
    entrepriseId: entreprise.id,
    nom: donnees.nomAdministrateur,
    email: donnees.emailAdministrateur,
    motDePasse: donnees.motDePasseAdministrateur,
    role: "ADMINISTRATEUR",
  };

  const motDePasseHash = await passwordHasher.hacher(nouvelAdministrateur.motDePasse);
  const administrateur = await utilisateurRepository.creer({
    entrepriseId: nouvelAdministrateur.entrepriseId,
    nom: nouvelAdministrateur.nom,
    email: nouvelAdministrateur.email,
    role: nouvelAdministrateur.role,
    motDePasseHash,
    actif: true,
  });

  return {
    entreprise,
    administrateur,
  };
}