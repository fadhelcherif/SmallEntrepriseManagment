import type { NouveauMouvementStock } from "../entities/MouvementStock";

export class StockInsuffisantError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StockInsuffisantError";
  }
}

export function appliquerMouvementStock(
  quantiteStockActuel: number,
  mouvement: NouveauMouvementStock,
): number {
  if (mouvement.type === "ENTREE") {
    return quantiteStockActuel + mouvement.quantite;
  }

  if (mouvement.type === "SORTIE") {
    const nouveauStock = quantiteStockActuel - mouvement.quantite;

    if (nouveauStock < 0) {
      throw new StockInsuffisantError("Le stock serait négatif après ce mouvement de sortie.");
    }

    return nouveauStock;
  }

  return mouvement.quantite;
}