import { TYPES_CHAMP_ATTRIBUT, type NouvelAttributPersonnalise } from "../entities/AttributPersonnalise";

export class AttributInvalideError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AttributInvalideError";
  }
}

export function validerAttributPersonnalise(attribut: NouvelAttributPersonnalise): void {
  if (!attribut.nom || attribut.nom.trim().length === 0) {
    throw new AttributInvalideError("Le nom de l'attribut est obligatoire.");
  }

  if (!TYPES_CHAMP_ATTRIBUT.includes(attribut.typeChamp)) {
    throw new AttributInvalideError("Le type de champ n'est pas valide.");
  }

  if (!attribut.entiteCible || attribut.entiteCible.trim().length === 0) {
    throw new AttributInvalideError("L'entité cible est obligatoire.");
  }
}
