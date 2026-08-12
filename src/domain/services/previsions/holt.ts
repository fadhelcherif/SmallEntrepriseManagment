const GRILLE_PARAMETRES = [0.05, 0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85, 0.95];

function appliquerHolt(historique: number[], alpha: number, beta: number): { niveau: number; tendance: number; erreurCarreeTotale: number } {
  let niveau = historique[0];
  let tendance = historique[1] - historique[0];
  let erreurCarreeTotale = 0;

  for (let t = 1; t < historique.length; t++) {
    const prevision = niveau + tendance;
    const erreur = historique[t] - prevision;
    erreurCarreeTotale += erreur * erreur;

    const nouveauNiveau = alpha * historique[t] + (1 - alpha) * (niveau + tendance);
    const nouvelleTendance = beta * (nouveauNiveau - niveau) + (1 - beta) * tendance;
    niveau = nouveauNiveau;
    tendance = nouvelleTendance;
  }

  return { niveau, tendance, erreurCarreeTotale };
}

/** Lissage exponentiel double (niveau + tendance) — pas de composante saisonnière. */
export function prevoirHolt(historique: number[], horizon: number): number[] {
  if (historique.length < 2) {
    throw new Error("Holt nécessite au moins 2 points.");
  }

  let meilleur = { alpha: 0.5, beta: 0.5, erreurCarreeTotale: Infinity };

  for (const alpha of GRILLE_PARAMETRES) {
    for (const beta of GRILLE_PARAMETRES) {
      const { erreurCarreeTotale } = appliquerHolt(historique, alpha, beta);
      if (erreurCarreeTotale < meilleur.erreurCarreeTotale) {
        meilleur = { alpha, beta, erreurCarreeTotale };
      }
    }
  }

  const { niveau, tendance } = appliquerHolt(historique, meilleur.alpha, meilleur.beta);
  return Array.from({ length: horizon }, (_, h) => niveau + tendance * (h + 1));
}
