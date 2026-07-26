import type { Fournisseur, NouveauFournisseur } from "../../domain/entities/Fournisseur";
import type { FournisseurRepository } from "../../domain/repositories/FournisseurRepository";
import { validerFournisseur } from "../../domain/services/validerFournisseur";

export async function creerFournisseur(
  repository: FournisseurRepository,
  entrepriseId: string,
  donnees: NouveauFournisseur,
): Promise<Fournisseur> {
  validerFournisseur(donnees);
  return repository.creer(donnees, entrepriseId);
}