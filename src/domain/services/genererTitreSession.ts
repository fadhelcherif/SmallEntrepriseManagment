const LONGUEUR_MAX_TITRE = 48;

export function genererTitreSession(premiereQuestion: string): string {
  const texte = premiereQuestion.trim().replace(/\s+/g, " ");

  if (texte.length <= LONGUEUR_MAX_TITRE) {
    return texte;
  }

  return `${texte.slice(0, LONGUEUR_MAX_TITRE - 1).trimEnd()}…`;
}
