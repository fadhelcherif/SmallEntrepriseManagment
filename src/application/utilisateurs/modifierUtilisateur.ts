import type { Utilisateur } from "../../domain/entities/Utilisateur";
import type { ModificationUtilisateur, UtilisateurRepository } from "../../domain/repositories/UtilisateurRepository";
import { validerModificationUtilisateur } from "../../domain/services/validerNouvelUtilisateur";

export class AccesRefuseUtilisateurError extends Error {
  constructor(message = "Seul un administrateur peut modifier un utilisateur.") {
    super(message);
    this.name = "AccesRefuseUtilisateurError";
  }
}

export class UtilisateurIntrouvableError extends Error {
  constructor(message = "Utilisateur introuvable.") {
    super(message);
    this.name = "UtilisateurIntrouvableError";
  }
}

export class ModificationPropreCompteInterditeError extends Error {
  constructor(message = "Vous ne pouvez pas modifier votre propre rôle ou statut.") {
    super(message);
    this.name = "ModificationPropreCompteInterditeError";
  }
}

export async function modifierUtilisateur(
  repository: UtilisateurRepository,
  utilisateurCourant: Pick<Utilisateur, "id" | "role" | "entrepriseId">,
  utilisateurCibleId: string,
  donnees: ModificationUtilisateur,
): Promise<Utilisateur> {
  if (utilisateurCourant.role !== "ADMINISTRATEUR") {
    throw new AccesRefuseUtilisateurError();
  }

  const utilisateurCible = await repository.trouverParId(utilisateurCibleId);

  if (!utilisateurCible || utilisateurCible.entrepriseId !== utilisateurCourant.entrepriseId) {
    throw new UtilisateurIntrouvableError();
  }

  if (utilisateurCibleId === utilisateurCourant.id && (donnees.role !== undefined || donnees.actif !== undefined)) {
    throw new ModificationPropreCompteInterditeError();
  }

  validerModificationUtilisateur(donnees);

  return repository.modifier(utilisateurCibleId, donnees);
}
