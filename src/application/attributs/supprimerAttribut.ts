import type { Utilisateur } from "../../domain/entities/Utilisateur";
import type { AttributPersonnaliseRepository } from "../../domain/repositories/AttributPersonnaliseRepository";

export class AccesRefuseAttributError extends Error {
  constructor(message = "Seul un administrateur peut supprimer un attribut personnalisé.") {
    super(message);
    this.name = "AccesRefuseAttributError";
  }
}

export class AttributIntrouvableError extends Error {
  constructor(message = "Attribut personnalisé introuvable.") {
    super(message);
    this.name = "AttributIntrouvableError";
  }
}

export async function supprimerAttribut(
  repository: AttributPersonnaliseRepository,
  utilisateurCourant: Pick<Utilisateur, "role" | "entrepriseId">,
  attributId: string,
): Promise<void> {
  if (utilisateurCourant.role !== "ADMINISTRATEUR") {
    throw new AccesRefuseAttributError();
  }

  const attribut = await repository.trouverParId(attributId);

  if (!attribut || attribut.entrepriseId !== utilisateurCourant.entrepriseId) {
    throw new AttributIntrouvableError();
  }

  await repository.supprimer(attributId);
}
