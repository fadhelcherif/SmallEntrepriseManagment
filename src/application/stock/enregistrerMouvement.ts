import type { AlerteRepository } from "../../domain/repositories/AlerteRepository";
import type { MouvementStockRepository } from "../../domain/repositories/MouvementStockRepository";
import type { ProduitRepository } from "../../domain/repositories/ProduitRepository";
import type { NouveauMouvementStock, MouvementStock } from "../../domain/entities/MouvementStock";
import type { Alerte } from "../../domain/entities/Alerte";
import { appliquerMouvementStock, StockInsuffisantError } from "../../domain/services/appliquerMouvementStock";
import { doitDeclencherAlerte } from "../../domain/services/doitDeclencherAlerte";

export class ProduitIntrouvableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProduitIntrouvableError";
  }
}

export type EnregistrerMouvementResultat = {
  produitId: string;
  nouveauStock: number;
  mouvement: MouvementStock;
  alerte?: Alerte;
};

export async function enregistrerMouvement(
  mouvementRepository: MouvementStockRepository,
  alerteRepository: AlerteRepository,
  produitRepository: ProduitRepository,
  donnees: NouveauMouvementStock,
): Promise<EnregistrerMouvementResultat> {
  const produit = await produitRepository.trouverParId(donnees.produitId);

  if (!produit) {
    throw new ProduitIntrouvableError("Le produit ciblé est introuvable.");
  }

  let nouveauStock: number;

  try {
    nouveauStock = appliquerMouvementStock(produit.quantiteStock, donnees);
  } catch (error) {
    if (error instanceof StockInsuffisantError) {
      throw new StockInsuffisantError(
        `Stock insuffisant pour « ${produit.nom} » (stock actuel : ${produit.quantiteStock}, quantité demandée : ${donnees.quantite}).`,
      );
    }

    throw error;
  }

  await produitRepository.modifierStock(produit.id, nouveauStock);

  const mouvement = await mouvementRepository.creer(donnees);

  let alerte: Alerte | undefined;

  if (doitDeclencherAlerte(nouveauStock, produit.seuilAlerte)) {
    const alertesNonLues = await alerteRepository.listerNonLuesParEntreprise(produit.entrepriseId);
    const alerteExistante = alertesNonLues.find((alerteCourante) => alerteCourante.produitId === produit.id);

    if (!alerteExistante) {
      alerte = await alerteRepository.creer({
        produitId: produit.id,
        type: "STOCK_FAIBLE",
        message: `Le stock du produit ${produit.nom} est inférieur ou égal au seuil d'alerte.`,
        lue: false,
        dateGeneration: new Date(),
      });
    }
  }

  return {
    produitId: produit.id,
    nouveauStock,
    mouvement,
    alerte,
  };
}

export { StockInsuffisantError };