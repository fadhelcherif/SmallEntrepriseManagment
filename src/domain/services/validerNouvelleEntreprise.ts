import type { NouvelleEntreprise } from "../entities/Entreprise";

export class EntrepriseInvalideError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EntrepriseInvalideError";
  }
}

const REGEX_COULEUR_HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function validerCouleurHex(valeur: string | null | undefined, nomChamp: string): void {
  if (valeur === undefined || valeur === null || valeur.trim().length === 0) {
    return;
  }

  if (!REGEX_COULEUR_HEX.test(valeur.trim())) {
    throw new EntrepriseInvalideError(`${nomChamp} doit être une couleur hexadécimale valide (ex: #1C1917).`);
  }
}

export function validerNouvelleEntreprise(entreprise: NouvelleEntreprise): void {
  if (!entreprise.nom || entreprise.nom.trim().length === 0) {
    throw new EntrepriseInvalideError("Le nom de l'entreprise est obligatoire.");
  }

  if (!entreprise.adresse || entreprise.adresse.trim().length === 0) {
    throw new EntrepriseInvalideError("L'adresse de l'entreprise est obligatoire.");
  }

  if (!entreprise.devise || entreprise.devise.trim().length === 0) {
    throw new EntrepriseInvalideError("La devise de l'entreprise est obligatoire.");
  }

  if (!entreprise.typeMetier || entreprise.typeMetier.trim().length === 0) {
    throw new EntrepriseInvalideError("Le type de métier de l'entreprise est obligatoire.");
  }

  validerCouleurHex(entreprise.couleurPrimaire, "La couleur primaire");
  validerCouleurHex(entreprise.couleurSecondaire, "La couleur secondaire");
}

export function validerModificationEntreprise(entreprise: Partial<NouvelleEntreprise>): void {
  if (entreprise.nom !== undefined && entreprise.nom.trim().length === 0) {
    throw new EntrepriseInvalideError("Le nom de l'entreprise est obligatoire.");
  }

  if (entreprise.adresse !== undefined && entreprise.adresse.trim().length === 0) {
    throw new EntrepriseInvalideError("L'adresse de l'entreprise est obligatoire.");
  }

  if (entreprise.devise !== undefined && entreprise.devise.trim().length === 0) {
    throw new EntrepriseInvalideError("La devise de l'entreprise est obligatoire.");
  }

  if (entreprise.typeMetier !== undefined && entreprise.typeMetier.trim().length === 0) {
    throw new EntrepriseInvalideError("Le type de métier de l'entreprise est obligatoire.");
  }

  validerCouleurHex(entreprise.couleurPrimaire, "La couleur primaire");
  validerCouleurHex(entreprise.couleurSecondaire, "La couleur secondaire");
}