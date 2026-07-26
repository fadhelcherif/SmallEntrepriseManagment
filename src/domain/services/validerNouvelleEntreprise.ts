import type { NouvelleEntreprise } from "../entities/Entreprise";

export class EntrepriseInvalideError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EntrepriseInvalideError";
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
}