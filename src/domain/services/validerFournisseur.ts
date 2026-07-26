import type { NouveauFournisseur } from "../entities/Fournisseur";

export class FournisseurInvalideError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FournisseurInvalideError";
  }
}

export function validerFournisseur(fournisseur: NouveauFournisseur): void {
  if (!fournisseur.nom || fournisseur.nom.trim().length === 0) {
    throw new FournisseurInvalideError("Le nom du fournisseur est obligatoire.");
  }
}