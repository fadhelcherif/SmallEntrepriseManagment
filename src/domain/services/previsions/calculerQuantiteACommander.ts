/**
 * Quantité suggérée à commander : demande prévue le mois prochain, plus la demande attendue
 * PENDANT le délai de livraison du fournisseur habituel (plus ce délai est long, plus il faut
 * de stock pour tenir jusqu'à la prochaine livraison), plus le seuil d'alerte comme stock de
 * sécurité, moins ce qu'il reste déjà en stock. Jamais négatif.
 */
export function calculerQuantiteACommander(
  demandeMensuellePrevue: number,
  seuilAlerte: number,
  quantiteStockActuelle: number,
  delaiLivraisonJours: number | null,
): number {
  const demandeJournaliere = demandeMensuellePrevue / 30;
  const demandePendantDelai = delaiLivraisonJours !== null ? demandeJournaliere * delaiLivraisonJours : 0;

  return Math.max(0, Math.round(demandeMensuellePrevue + demandePendantDelai + seuilAlerte - quantiteStockActuelle));
}
