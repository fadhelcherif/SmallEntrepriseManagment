export type PointBacktest = {
  indexOrigine: number;
  reel: number;
  predit: number;
};

export type FonctionPrevision = (historique: number[], horizon: number) => number[];

/**
 * Rolling-origin backtesting : entraîne sur les points 0..k, prédit k+1, avance l'origine,
 * recommence. Donne autant de points de comparaison réel/prédit que l'historique le permet —
 * plus fiable qu'un simple split train/test sur une série courte (voir notebooks/previsions.ipynb).
 */
export function backtesterRollingOrigin(
  serie: number[],
  fonctionPrevision: FonctionPrevision,
  tailleMinEntrainement: number,
  horizon = 1,
): PointBacktest[] {
  const points: PointBacktest[] = [];

  for (let finEntrainement = tailleMinEntrainement; finEntrainement <= serie.length - horizon; finEntrainement++) {
    const entrainement = serie.slice(0, finEntrainement);

    let predit: number[];
    try {
      predit = fonctionPrevision(entrainement, horizon);
    } catch {
      continue;
    }

    for (let h = 0; h < horizon; h++) {
      points.push({
        indexOrigine: finEntrainement - 1,
        reel: serie[finEntrainement + h],
        predit: predit[h],
      });
    }
  }

  return points;
}
