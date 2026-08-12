import type { PointBacktest } from "./backtesting";

export function mae(points: PointBacktest[]): number {
  return points.reduce((total, p) => total + Math.abs(p.reel - p.predit), 0) / points.length;
}

export function rmse(points: PointBacktest[]): number {
  const sommeCarres = points.reduce((total, p) => total + (p.reel - p.predit) ** 2, 0);
  return Math.sqrt(sommeCarres / points.length);
}

export function mape(points: PointBacktest[]): number {
  const valides = points.filter((p) => p.reel !== 0);
  if (valides.length === 0) return NaN;
  const somme = valides.reduce((total, p) => total + Math.abs((p.reel - p.predit) / p.reel), 0);
  return (somme / valides.length) * 100;
}

/** Symétrique : plus stable que le MAPE quand des mois ont un réel proche de 0. */
export function smape(points: PointBacktest[]): number {
  const valides = points.filter((p) => Math.abs(p.reel) + Math.abs(p.predit) !== 0);
  if (valides.length === 0) return NaN;
  const somme = valides.reduce((total, p) => total + (2 * Math.abs(p.reel - p.predit)) / (Math.abs(p.reel) + Math.abs(p.predit)), 0);
  return (somme / valides.length) * 100;
}

/** Écart-type des résidus de backtest — sert de base à une fourchette de confiance autour d'une prévision. */
export function ecartTypeResidus(points: PointBacktest[]): number {
  const erreurs = points.map((p) => p.reel - p.predit);
  const moyenne = erreurs.reduce((total, e) => total + e, 0) / erreurs.length;
  const variance = erreurs.reduce((total, e) => total + (e - moyenne) ** 2, 0) / erreurs.length;
  return Math.sqrt(variance);
}
