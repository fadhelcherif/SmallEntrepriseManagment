const GRILLE_PARAMETRES = [0.1, 0.3, 0.5, 0.7, 0.9];

function appliquerHoltWinters(
  historique: number[],
  alpha: number,
  beta: number,
  gamma: number,
  periodeSaisonniere: number,
): { niveau: number; tendance: number; saisonnalite: number[]; erreurCarreeTotale: number } {
  const premierCycle = historique.slice(0, periodeSaisonniere);
  const deuxiemeCycle = historique.slice(periodeSaisonniere, periodeSaisonniere * 2);
  const moyennePremierCycle = premierCycle.reduce((a, b) => a + b, 0) / periodeSaisonniere;
  const moyenneDeuxiemeCycle = deuxiemeCycle.reduce((a, b) => a + b, 0) / periodeSaisonniere;

  let niveau = moyennePremierCycle;
  let tendance = (moyenneDeuxiemeCycle - moyennePremierCycle) / periodeSaisonniere;
  const saisonnalite = premierCycle.map((valeur) => valeur - moyennePremierCycle);

  let erreurCarreeTotale = 0;

  for (let t = 0; t < historique.length; t++) {
    const indexSaison = t % periodeSaisonniere;
    const prevision = niveau + tendance + saisonnalite[indexSaison];
    const erreur = historique[t] - prevision;
    if (t >= periodeSaisonniere) {
      erreurCarreeTotale += erreur * erreur;
    }

    const niveauPrecedent = niveau;
    niveau = alpha * (historique[t] - saisonnalite[indexSaison]) + (1 - alpha) * (niveau + tendance);
    tendance = beta * (niveau - niveauPrecedent) + (1 - beta) * tendance;
    saisonnalite[indexSaison] = gamma * (historique[t] - niveau) + (1 - gamma) * saisonnalite[indexSaison];
  }

  return { niveau, tendance, saisonnalite, erreurCarreeTotale };
}

/**
 * Lissage exponentiel triple (niveau + tendance + saisonnalité additive).
 * Nécessite au moins 2 cycles complets (2 * periodeSaisonniere points) pour être ajusté.
 */
export function prevoirHoltWinters(historique: number[], horizon: number, periodeSaisonniere: number): number[] {
  if (historique.length < 2 * periodeSaisonniere) {
    throw new Error(`Holt-Winters nécessite au moins ${2 * periodeSaisonniere} points.`);
  }

  let meilleur = { alpha: 0.5, beta: 0.5, gamma: 0.5, erreurCarreeTotale: Infinity };

  for (const alpha of GRILLE_PARAMETRES) {
    for (const beta of GRILLE_PARAMETRES) {
      for (const gamma of GRILLE_PARAMETRES) {
        const { erreurCarreeTotale } = appliquerHoltWinters(historique, alpha, beta, gamma, periodeSaisonniere);
        if (erreurCarreeTotale < meilleur.erreurCarreeTotale) {
          meilleur = { alpha, beta, gamma, erreurCarreeTotale };
        }
      }
    }
  }

  const { niveau, tendance, saisonnalite } = appliquerHoltWinters(
    historique,
    meilleur.alpha,
    meilleur.beta,
    meilleur.gamma,
    periodeSaisonniere,
  );

  return Array.from({ length: horizon }, (_, h) => niveau + tendance * (h + 1) + saisonnalite[(historique.length + h) % periodeSaisonniere]);
}
