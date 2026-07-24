import type { Entreprise, NouvelleEntreprise } from "../../domain/entities/Entreprise";
import type { Utilisateur } from "../../domain/entities/Utilisateur";
import type { EntrepriseRepository } from "../../domain/repositories/EntrepriseRepository";
import { validerModificationEntreprise } from "../../domain/services/validerNouvelleEntreprise";

export class AccesRefuseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AccesRefuseError";
  }
}

export async function modifierEntreprise(
  repository: EntrepriseRepository,
  utilisateurCourant: Pick<Utilisateur, "role" | "entrepriseId">,
  entrepriseId: string,
  donnees: Partial<NouvelleEntreprise>,
): Promise<Entreprise> {
  if (utilisateurCourant.role !== "ADMINISTRATEUR") {
    throw new AccesRefuseError("Seul un administrateur peut modifier les paramètres de l'entreprise.");
  }

  if (utilisateurCourant.entrepriseId !== entrepriseId) {
    throw new AccesRefuseError("Vous ne pouvez modifier que votre propre entreprise.");
  }

  validerModificationEntreprise(donnees);
  return repository.modifier(entrepriseId, donnees);
}