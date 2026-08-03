import type { Charge, NouvelleCharge } from "../entities/Charge";

function clefSerie(charge: Pick<Charge, "utilisateurId" | "fournisseurId" | "type">): string {
  if (charge.utilisateurId) {
    return `utilisateur:${charge.utilisateurId}`;
  }

  if (charge.fournisseurId) {
    return `fournisseur:${charge.fournisseurId}:${charge.type.trim().toLowerCase()}`;
  }

  return `type:${charge.type.trim().toLowerCase()}`;
}

function memeMois(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

/**
 * Pure : a partir des charges existantes, retrouve pour chaque serie recurrente
 * (un salarie, un fournisseur+type, ou un type seul) la charge la plus recente,
 * et propose une nouvelle charge pour le mois en cours si elle n'existe pas deja
 * et que l'echeance precedente est passee. Ne cree rien elle-meme — c'est a
 * l'application d'utiliser le repository pour persister le resultat.
 */
export function genererChargesRecurrentesDuMois(chargesExistantes: Charge[], maintenant: Date): NouvelleCharge[] {
  const dernieresParSerie = new Map<string, Charge>();

  for (const charge of chargesExistantes) {
    if (!charge.recurrente) {
      continue;
    }

    const clef = clefSerie(charge);
    const derniere = dernieresParSerie.get(clef);

    if (!derniere || charge.dateEcheance > derniere.dateEcheance) {
      dernieresParSerie.set(clef, charge);
    }
  }

  const nouvellesCharges: NouvelleCharge[] = [];

  for (const derniere of dernieresParSerie.values()) {
    if (memeMois(derniere.dateEcheance, maintenant) || derniere.dateEcheance > maintenant) {
      continue;
    }

    const prochaineEcheance = new Date(maintenant.getFullYear(), maintenant.getMonth(), derniere.dateEcheance.getDate());

    nouvellesCharges.push({
      utilisateurId: derniere.utilisateurId,
      fournisseurId: derniere.fournisseurId,
      type: derniere.type,
      montant: derniere.montant,
      dateEcheance: prochaineEcheance,
      recurrente: true,
    });
  }

  return nouvellesCharges;
}
