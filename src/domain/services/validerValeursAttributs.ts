import type { AttributPersonnalise } from "../entities/AttributPersonnalise";

export class ValeurAttributInvalideError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValeurAttributInvalideError";
  }
}

/**
 * Verifie que les valeurs soumises pour un produit respectent les regles de
 * chaque attribut personnalise defini par l'entreprise (obligatoire, type nombre).
 */
export function validerValeursAttributs(
  attributs: AttributPersonnalise[],
  valeursParAttributId: Map<string, string>,
): void {
  for (const attribut of attributs) {
    const valeur = valeursParAttributId.get(attribut.id);
    const estVide = valeur === undefined || valeur.trim().length === 0;

    if (attribut.obligatoire && estVide) {
      throw new ValeurAttributInvalideError(`Le champ « ${attribut.nom} » est obligatoire.`);
    }

    if (attribut.typeChamp === "nombre" && !estVide && Number.isNaN(Number(valeur))) {
      throw new ValeurAttributInvalideError(`Le champ « ${attribut.nom} » doit être un nombre.`);
    }
  }
}
