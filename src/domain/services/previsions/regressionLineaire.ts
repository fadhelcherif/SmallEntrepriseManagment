export function prevoirRegressionLineaire(historique: number[], horizon: number): number[] {
  const n = historique.length;
  const xMoyenne = (n - 1) / 2;
  const yMoyenne = historique.reduce((total, valeur) => total + valeur, 0) / n;

  let numerateur = 0;
  let denominateur = 0;
  for (let i = 0; i < n; i++) {
    numerateur += (i - xMoyenne) * (historique[i] - yMoyenne);
    denominateur += (i - xMoyenne) ** 2;
  }

  const pente = denominateur === 0 ? 0 : numerateur / denominateur;
  const ordonnee = yMoyenne - pente * xMoyenne;

  return Array.from({ length: horizon }, (_, h) => ordonnee + pente * (n + h));
}
