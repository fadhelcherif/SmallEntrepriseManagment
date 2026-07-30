const COULEUR_PRIMAIRE_PAR_DEFAUT = "#1c1917";
const COULEUR_SECONDAIRE_PAR_DEFAUT = "#f5f5f4";

type EntrepriseCouleurs = {
  couleurPrimaire?: string | null;
  couleurSecondaire?: string | null;
};

function hexVersRgb(hex: string): [number, number, number] | null {
  const nettoye = hex.trim().replace("#", "");
  const complet =
    nettoye.length === 3
      ? nettoye
          .split("")
          .map((caractere) => caractere + caractere)
          .join("")
      : nettoye;

  if (!/^[0-9a-fA-F]{6}$/.test(complet)) {
    return null;
  }

  return [
    parseInt(complet.slice(0, 2), 16),
    parseInt(complet.slice(2, 4), 16),
    parseInt(complet.slice(4, 6), 16),
  ];
}

function estHexValide(valeur: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(valeur.trim());
}

export function texteLisibleSur(couleurFond: string): string {
  const rgb = hexVersRgb(couleurFond);

  if (!rgb) {
    return "#ffffff";
  }

  const [r, g, b] = rgb;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.6 ? "#111111" : "#ffffff";
}

export function variablesThemeEntreprise(entreprise?: EntrepriseCouleurs | null): Record<string, string> {
  const couleurPrimaireBrute = entreprise?.couleurPrimaire?.trim();
  const couleurSecondaireBrute = entreprise?.couleurSecondaire?.trim();

  const primaire = couleurPrimaireBrute && estHexValide(couleurPrimaireBrute) ? couleurPrimaireBrute : COULEUR_PRIMAIRE_PAR_DEFAUT;
  const secondaire =
    couleurSecondaireBrute && estHexValide(couleurSecondaireBrute) ? couleurSecondaireBrute : COULEUR_SECONDAIRE_PAR_DEFAUT;

  return {
    "--color-primary": primaire,
    "--color-primary-foreground": texteLisibleSur(primaire),
    "--color-secondary": secondaire,
    "--color-secondary-foreground": texteLisibleSur(secondaire),
    "--color-surface": `color-mix(in srgb, ${primaire} 7%, #fafaf9)`,
  };
}
