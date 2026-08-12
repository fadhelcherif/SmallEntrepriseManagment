import { backtesterRollingOrigin, type FonctionPrevision } from "./backtesting";
import { ecartTypeResidus, mae, mape, rmse, smape } from "./metriquesErreur";
import { prevoirHolt } from "./holt";
import { prevoirHoltWinters } from "./holtWinters";
import { prevoirRegressionLineaire } from "./regressionLineaire";

export const TAILLE_MIN_ENTRAINEMENT = 8;
export const PERIODE_SAISONNIERE = 12;
export const MIN_POINTS_BACKTEST_HOLT_WINTERS = 4;

export type NomModele = "REGRESSION_LINEAIRE" | "HOLT" | "HOLT_WINTERS";

type ModeleCandidat = {
  nom: NomModele;
  fonction: FonctionPrevision;
  tailleMinEntrainement: number;
};

function modelesCandidats(longueurSerie: number): ModeleCandidat[] {
  const modeles: ModeleCandidat[] = [
    { nom: "REGRESSION_LINEAIRE", fonction: prevoirRegressionLineaire, tailleMinEntrainement: TAILLE_MIN_ENTRAINEMENT },
    { nom: "HOLT", fonction: prevoirHolt, tailleMinEntrainement: TAILLE_MIN_ENTRAINEMENT },
  ];

  const minimumHoltWinters = 2 * PERIODE_SAISONNIERE;
  if (longueurSerie - minimumHoltWinters >= MIN_POINTS_BACKTEST_HOLT_WINTERS) {
    modeles.push({
      nom: "HOLT_WINTERS",
      fonction: (historique, horizon) => prevoirHoltWinters(historique, horizon, PERIODE_SAISONNIERE),
      tailleMinEntrainement: minimumHoltWinters,
    });
  }

  return modeles;
}

export type ResultatModele = {
  nom: NomModele;
  mae: number;
  rmse: number;
  mape: number;
  smape: number;
  ecartTypeResidus: number;
  nombrePointsTestes: number;
};

export type NiveauConfiance = "FIABLE" | "MOYENNE" | "FAIBLE";

export function classerConfiance(mapeOuSmape: number): NiveauConfiance {
  if (Number.isNaN(mapeOuSmape) || mapeOuSmape > 70) return "FAIBLE";
  if (mapeOuSmape > 30) return "MOYENNE";
  return "FIABLE";
}

export type SelectionModele = {
  meilleurModele: NomModele;
  fonctionPrevision: FonctionPrevision;
  comparaison: ResultatModele[];
  confiance: NiveauConfiance;
};

/**
 * Compare Régression linéaire / Holt / Holt-Winters (si assez de données) par rolling-origin
 * backtesting, et retourne le modèle gagnant (plus petit RMSE) — voir notebooks/previsions.ipynb
 * pour la méthodologie complète et sa validation sur données réelles.
 *
 * Retourne null si l'historique est trop court (< TAILLE_MIN_ENTRAINEMENT points) : pas de
 * comparaison fiable possible, l'appelant doit se rabattre sur une simple tendance avec avertissement.
 */
export function choisirMeilleurModele(serie: number[]): SelectionModele | null {
  if (serie.length < TAILLE_MIN_ENTRAINEMENT) return null;

  const candidats = modelesCandidats(serie.length);
  const comparaison: ResultatModele[] = [];

  for (const candidat of candidats) {
    const points = backtesterRollingOrigin(serie, candidat.fonction, candidat.tailleMinEntrainement);
    if (points.length === 0) continue;

    comparaison.push({
      nom: candidat.nom,
      mae: mae(points),
      rmse: rmse(points),
      mape: mape(points),
      smape: smape(points),
      ecartTypeResidus: ecartTypeResidus(points),
      nombrePointsTestes: points.length,
    });
  }

  if (comparaison.length === 0) return null;

  const meilleur = comparaison.reduce((a, b) => (b.rmse < a.rmse ? b : a));
  const candidatGagnant = candidats.find((c) => c.nom === meilleur.nom);
  if (!candidatGagnant) return null;

  return {
    meilleurModele: meilleur.nom,
    fonctionPrevision: candidatGagnant.fonction,
    comparaison,
    confiance: classerConfiance(Number.isNaN(meilleur.mape) ? meilleur.smape : meilleur.mape),
  };
}
