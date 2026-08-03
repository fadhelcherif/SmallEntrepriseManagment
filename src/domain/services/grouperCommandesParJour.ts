import type { Commande } from "../entities/Commande";
import { calculerMontantCommandesActives } from "./calculerMontantCommande";

export type GroupeCommandesJour = {
  cle: string;
  date: Date;
  commandes: Commande[];
  total: number;
};

export function cleJournaliere(date: Date): string {
  const annee = date.getFullYear();
  const mois = String(date.getMonth() + 1).padStart(2, "0");
  const jour = String(date.getDate()).padStart(2, "0");

  return `${annee}-${mois}-${jour}`;
}

export function grouperCommandesParJour(commandes: Commande[]): GroupeCommandesJour[] {
  const groupes = new Map<string, Commande[]>();

  for (const commande of commandes) {
    const cle = cleJournaliere(commande.dateCommande);
    const liste = groupes.get(cle);

    if (liste) {
      liste.push(commande);
    } else {
      groupes.set(cle, [commande]);
    }
  }

  return [...groupes.entries()]
    .map(([cle, commandesJour]) => ({
      cle,
      date: commandesJour[0].dateCommande,
      commandes: commandesJour,
      total: calculerMontantCommandesActives(commandesJour),
    }))
    .sort((a, b) => (a.cle < b.cle ? 1 : -1));
}
