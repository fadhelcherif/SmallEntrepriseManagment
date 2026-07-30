export type PaletteLogo = {
  primaire: string;
  secondaire: string;
};

const PAS_QUANTIFICATION = 24;
const DISTANCE_MIN_SECONDAIRE = 40;
const TAILLE_ECHANTILLON = 64;
const TAILLE_STOCKAGE_MAX = 256;

function composantHex(valeur: number): string {
  return valeur.toString(16).padStart(2, "0");
}

function rgbVersHex(r: number, g: number, b: number): string {
  return `#${composantHex(r)}${composantHex(g)}${composantHex(b)}`;
}

/**
 * Pure : regroupe les pixels par couleur quantifiée et retourne la couleur la plus
 * fréquente (primaire) et la couleur suffisamment distincte la plus fréquente (secondaire).
 * Ignore les pixels transparents ainsi que le quasi-blanc / quasi-noir (fond probable du logo).
 */
export function extraireCouleursDominantes(pixels: Uint8ClampedArray): PaletteLogo | null {
  const classes = new Map<string, { r: number; g: number; b: number; nombre: number }>();

  for (let i = 0; i < pixels.length; i += 4) {
    const alpha = pixels[i + 3];
    if (alpha < 128) {
      continue;
    }

    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];

    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    if (luminance > 245 || luminance < 12) {
      continue;
    }

    const rq = Math.round(r / PAS_QUANTIFICATION) * PAS_QUANTIFICATION;
    const gq = Math.round(g / PAS_QUANTIFICATION) * PAS_QUANTIFICATION;
    const bq = Math.round(b / PAS_QUANTIFICATION) * PAS_QUANTIFICATION;
    const cle = `${rq}-${gq}-${bq}`;

    const existant = classes.get(cle);
    if (existant) {
      existant.nombre += 1;
    } else {
      classes.set(cle, { r: rq, g: gq, b: bq, nombre: 1 });
    }
  }

  const classesTriees = [...classes.values()].sort((a, b) => b.nombre - a.nombre);

  if (classesTriees.length === 0) {
    return null;
  }

  const primaire = classesTriees[0];
  const secondaire =
    classesTriees.find((classe) => {
      const distance = Math.sqrt((classe.r - primaire.r) ** 2 + (classe.g - primaire.g) ** 2 + (classe.b - primaire.b) ** 2);
      return distance > DISTANCE_MIN_SECONDAIRE;
    }) ?? primaire;

  return {
    primaire: rgbVersHex(primaire.r, primaire.g, primaire.b),
    secondaire: rgbVersHex(secondaire.r, secondaire.g, secondaire.b),
  };
}

function chargerImageDepuisFichier(fichier: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const lecteur = new FileReader();

    lecteur.onload = () => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Impossible de lire ce fichier comme une image."));
      image.src = String(lecteur.result);
    };

    lecteur.onerror = () => reject(new Error("Impossible de lire ce fichier."));
    lecteur.readAsDataURL(fichier);
  });
}

function creerCanvasRedimensionne(image: HTMLImageElement, tailleMax: number): HTMLCanvasElement {
  const ratio = Math.min(tailleMax / image.width, tailleMax / image.height, 1);
  const largeur = Math.max(1, Math.round(image.width * ratio));
  const hauteur = Math.max(1, Math.round(image.height * ratio));

  const canvas = document.createElement("canvas");
  canvas.width = largeur;
  canvas.height = hauteur;

  const contexte = canvas.getContext("2d");
  contexte?.drawImage(image, 0, 0, largeur, hauteur);

  return canvas;
}

export type ResultatTraitementLogo = {
  logoDataUrl: string;
  palette: PaletteLogo | null;
};

/**
 * Cote client uniquement (Image, canvas, FileReader) : redimensionne le logo pour le
 * stockage et echantillonne une version reduite pour en extraire la palette dominante.
 */
export async function traiterLogoDepuisFichier(fichier: File): Promise<ResultatTraitementLogo> {
  const image = await chargerImageDepuisFichier(fichier);

  const canvasStockage = creerCanvasRedimensionne(image, TAILLE_STOCKAGE_MAX);
  const logoDataUrl = canvasStockage.toDataURL("image/png");

  const canvasEchantillon = creerCanvasRedimensionne(image, TAILLE_ECHANTILLON);
  const contexteEchantillon = canvasEchantillon.getContext("2d");
  const palette = contexteEchantillon
    ? extraireCouleursDominantes(
        contexteEchantillon.getImageData(0, 0, canvasEchantillon.width, canvasEchantillon.height).data,
      )
    : null;

  return { logoDataUrl, palette };
}
