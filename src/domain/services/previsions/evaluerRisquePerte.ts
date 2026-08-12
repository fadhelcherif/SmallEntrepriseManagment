export type NiveauRisque = "AUCUN" | "SURVEILLER" | "RISQUE_PERTE";

/**
 * Le risque se lit sur la marge PROJETÉE (ventes projetées - charges projetées), pas sur le
 * chiffre d'affaires projeté seul — un revenu qui progresse peut cacher des charges qui
 * progressent plus vite encore. Voir ROADMAP.md, section Intelligence artificielle.
 */
export function evaluerRisquePerte(margeProjeteeProchainMois: number, margesMensuellesRecentes: number[]): NiveauRisque {
  if (margeProjeteeProchainMois < 0) return "RISQUE_PERTE";

  if (margesMensuellesRecentes.length > 0) {
    const moyenneRecente = margesMensuellesRecentes.reduce((total, marge) => total + marge, 0) / margesMensuellesRecentes.length;
    if (moyenneRecente > 0 && margeProjeteeProchainMois < moyenneRecente * 0.5) {
      return "SURVEILLER";
    }
  }

  return "AUCUN";
}
