const FRACTION_REINVESTISSEMENT = 0.4;

/**
 * Montant suggéré à réinvestir le mois prochain, à partir de la marge lissée des derniers
 * mois (pas la marge brute du dernier mois seul — trop bruitée, voir notebooks/previsions.ipynb).
 * Retourne 0 si la marge moyenne récente est négative ou nulle : pas de recommandation de
 * réinvestissement tant que l'activité est déficitaire.
 */
export function recommanderInvestissement(margesMensuellesRecentes: number[]): number {
  if (margesMensuellesRecentes.length === 0) return 0;

  const moyenne = margesMensuellesRecentes.reduce((total, marge) => total + marge, 0) / margesMensuellesRecentes.length;
  if (moyenne <= 0) return 0;

  return Math.round(moyenne * FRACTION_REINVESTISSEMENT * 100) / 100;
}
