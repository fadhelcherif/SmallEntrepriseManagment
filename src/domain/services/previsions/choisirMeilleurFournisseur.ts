import { doitDeclencherAlerte } from "../doitDeclencherAlerte";

export type StatsFournisseurProduit = {
  fournisseurId: string;
  nombreCommandes: number;
  dernierPrixPaye: number;
  delaiLivraisonJours: number | null;
  dateDernierAchat: Date;
};

export type CritereChoixFournisseur = "PRIX" | "DELAI";

export type ChoixFournisseur = StatsFournisseurProduit & { critere: CritereChoixFournisseur };

/**
 * Choisit le fournisseur le plus avantageux pour un produit, parmi ceux qui l'ont déjà fourni.
 * - Stock en zone d'alerte (même seuil que doitDeclencherAlerte) : priorité au délai le plus
 *   court — on a besoin vite, le prix passe au second plan.
 * - Sinon : priorité au prix le plus bas (toujours le DERNIER prix payé, jamais une moyenne,
 *   car le prix négocié change d'une commande à l'autre — voir trouverFournisseurHabituel).
 * Le critère non prioritaire sert de départage en cas d'égalité. Un fournisseur sans délai
 * renseigné est traité comme le plus lent (dernier recours en mode urgent).
 */
export function choisirMeilleurFournisseur(
  statsParFournisseur: StatsFournisseurProduit[],
  quantiteStockActuelle: number,
  seuilAlerte: number,
): ChoixFournisseur | null {
  if (statsParFournisseur.length === 0) return null;

  const urgent = doitDeclencherAlerte(quantiteStockActuelle, seuilAlerte);
  const critere: CritereChoixFournisseur = urgent ? "DELAI" : "PRIX";

  const gagnant = statsParFournisseur.reduce((meilleur, actuel) => {
    if (urgent) {
      const delaiActuel = actuel.delaiLivraisonJours ?? Infinity;
      const delaiMeilleur = meilleur.delaiLivraisonJours ?? Infinity;
      if (delaiActuel < delaiMeilleur) return actuel;
      if (delaiActuel === delaiMeilleur && actuel.dernierPrixPaye < meilleur.dernierPrixPaye) return actuel;
      return meilleur;
    }

    if (actuel.dernierPrixPaye < meilleur.dernierPrixPaye) return actuel;
    if (actuel.dernierPrixPaye === meilleur.dernierPrixPaye) {
      const delaiActuel = actuel.delaiLivraisonJours ?? Infinity;
      const delaiMeilleur = meilleur.delaiLivraisonJours ?? Infinity;
      if (delaiActuel < delaiMeilleur) return actuel;
    }
    return meilleur;
  });

  return { ...gagnant, critere };
}
