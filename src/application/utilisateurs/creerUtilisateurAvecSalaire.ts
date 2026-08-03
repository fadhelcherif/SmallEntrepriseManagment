import { TYPE_CHARGE_SALAIRE, type Charge, type NouvelleCharge } from "../../domain/entities/Charge";
import type { NouvelUtilisateur, Utilisateur } from "../../domain/entities/Utilisateur";
import type { ChargeRepository } from "../../domain/repositories/ChargeRepository";
import type { UtilisateurRepository } from "../../domain/repositories/UtilisateurRepository";
import type { PasswordHasher } from "../../domain/services/PasswordHasher";
import { UtilisateurDejaExistantError } from "../../domain/services/errors";
import { validerCharge } from "../../domain/services/validerCharge";
import { validerNouvelUtilisateur } from "../../domain/services/validerNouvelUtilisateur";

export type ResultatCreationUtilisateurAvecSalaire = {
  utilisateur: Utilisateur;
  chargeSalaire: Charge;
};

export async function creerUtilisateurAvecSalaire(
  utilisateurRepository: UtilisateurRepository,
  chargeRepository: ChargeRepository,
  passwordHasher: PasswordHasher,
  nouvelUtilisateur: NouvelUtilisateur,
  dateEcheanceSalaire: Date,
): Promise<ResultatCreationUtilisateurAvecSalaire> {
  validerNouvelUtilisateur(nouvelUtilisateur);

  const donneesCharge: NouvelleCharge = {
    type: TYPE_CHARGE_SALAIRE,
    montant: nouvelUtilisateur.salaire ?? 0,
    dateEcheance: dateEcheanceSalaire,
    recurrente: true,
  };

  validerCharge(donneesCharge);

  const utilisateurExistant = await utilisateurRepository.trouverParEmail(nouvelUtilisateur.email);

  if (utilisateurExistant) {
    throw new UtilisateurDejaExistantError();
  }

  const motDePasseHash = await passwordHasher.hacher(nouvelUtilisateur.motDePasse);

  const utilisateur = await utilisateurRepository.creer({
    entrepriseId: nouvelUtilisateur.entrepriseId,
    nom: nouvelUtilisateur.nom,
    email: nouvelUtilisateur.email,
    role: nouvelUtilisateur.role,
    motDePasseHash,
    actif: nouvelUtilisateur.actif,
    salaire: nouvelUtilisateur.salaire,
  });

  const chargeSalaire = await chargeRepository.creer(
    { ...donneesCharge, utilisateurId: utilisateur.id },
    nouvelUtilisateur.entrepriseId,
  );

  return { utilisateur, chargeSalaire };
}
