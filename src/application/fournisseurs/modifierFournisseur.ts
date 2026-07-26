import type { Fournisseur, NouveauFournisseur } from "../../domain/entities/Fournisseur";
import type { FournisseurRepository } from "../../domain/repositories/FournisseurRepository";
import { validerFournisseur } from "../../domain/services/validerFournisseur";

export async function modifierFournisseur(
  repository: FournisseurRepository,
  id: string,
  donnees: NouveauFournisseur,
): Promise<Fournisseur> {
  validerFournisseur(donnees);
  return repository.modifier(id, donnees);
}