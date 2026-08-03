export type TypeChampAttribut = "texte" | "nombre" | "case_a_cocher";

export const TYPES_CHAMP_ATTRIBUT: TypeChampAttribut[] = ["texte", "nombre", "case_a_cocher"];

// Pour l'instant la seule entite cible geree par l'interface est "Produit".
export const ENTITE_CIBLE_PRODUIT = "Produit";

export type AttributPersonnalise = {
  id: string;
  entrepriseId: string;
  nom: string;
  typeChamp: TypeChampAttribut;
  entiteCible: string;
  obligatoire: boolean;
};

export type NouvelAttributPersonnalise = {
  nom: string;
  typeChamp: TypeChampAttribut;
  entiteCible: string;
  obligatoire?: boolean;
};
