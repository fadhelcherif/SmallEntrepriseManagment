import type { NouvelleEntreprise } from "../entities/Entreprise";

export class EntrepriseInvalideError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EntrepriseInvalideError";
  }
}

function validerTexteObligatoire(valeur: string | undefined | null, message: string): void {
  if (!valeur || valeur.trim().length === 0) {
    throw new EntrepriseInvalideError(message);
  }
}

function validerTexteOptionnel(valeur: string | undefined | null, message: string): void {
  if (valeur !== undefined && valeur !== null && valeur.trim().length === 0) {
    throw new EntrepriseInvalideError(message);
  }
}

export function validerNouvelleEntreprise(entreprise: Partial<NouvelleEntreprise>): void {
  validerTexteObligatoire(entreprise.nom, "Le nom de l'entreprise est obligatoire.");
  validerTexteObligatoire(entreprise.adresse, "L'adresse de l'entreprise est obligatoire.");
  validerTexteObligatoire(entreprise.devise, "La devise de l'entreprise est obligatoire.");
  validerTexteObligatoire(entreprise.typeMetier, "Le type de métier de l'entreprise est obligatoire.");

  validerTexteOptionnel(entreprise.categorie, "La catégorie de l'entreprise ne peut pas être vide.");
  validerTexteOptionnel(entreprise.logo, "Le logo de l'entreprise ne peut pas être vide.");
  validerTexteOptionnel(entreprise.couleurPrimaire, "La couleur primaire de l'entreprise ne peut pas être vide.");
  validerTexteOptionnel(entreprise.couleurSecondaire, "La couleur secondaire de l'entreprise ne peut pas être vide.");
}

export function validerModificationEntreprise(entreprise: Partial<NouvelleEntreprise>): void {
  validerTexteOptionnel(entreprise.nom, "Le nom de l'entreprise ne peut pas être vide.");
  validerTexteOptionnel(entreprise.adresse, "L'adresse de l'entreprise ne peut pas être vide.");
  validerTexteOptionnel(entreprise.devise, "La devise de l'entreprise ne peut pas être vide.");
  validerTexteOptionnel(entreprise.typeMetier, "Le type de métier de l'entreprise ne peut pas être vide.");

  validerTexteOptionnel(entreprise.categorie, "La catégorie de l'entreprise ne peut pas être vide.");
  validerTexteOptionnel(entreprise.logo, "Le logo de l'entreprise ne peut pas être vide.");
  validerTexteOptionnel(entreprise.couleurPrimaire, "La couleur primaire de l'entreprise ne peut pas être vide.");
  validerTexteOptionnel(entreprise.couleurSecondaire, "La couleur secondaire de l'entreprise ne peut pas être vide.");
}