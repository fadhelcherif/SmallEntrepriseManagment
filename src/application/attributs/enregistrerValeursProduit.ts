import { ENTITE_CIBLE_PRODUIT } from "../../domain/entities/AttributPersonnalise";
import type { NouvelleValeurAttribut, ValeurAttribut } from "../../domain/entities/ValeurAttribut";
import type { AttributPersonnaliseRepository } from "../../domain/repositories/AttributPersonnaliseRepository";
import type { ValeurAttributRepository } from "../../domain/repositories/ValeurAttributRepository";
import { validerValeursAttributs } from "../../domain/services/validerValeursAttributs";

export async function enregistrerValeursProduit(
  attributRepository: AttributPersonnaliseRepository,
  valeurAttributRepository: ValeurAttributRepository,
  entrepriseId: string,
  produitId: string,
  valeursSoumises: Map<string, string>,
): Promise<ValeurAttribut[]> {
  const attributs = await attributRepository.listerParEntreprise(entrepriseId, ENTITE_CIBLE_PRODUIT);

  validerValeursAttributs(attributs, valeursSoumises);

  const valeurs: NouvelleValeurAttribut[] = [];

  for (const attribut of attributs) {
    const valeur = valeursSoumises.get(attribut.id);

    if (valeur !== undefined && valeur.trim().length > 0) {
      valeurs.push({ attributId: attribut.id, valeur: valeur.trim() });
    }
  }

  return valeurAttributRepository.enregistrerPourProduit(produitId, valeurs);
}
