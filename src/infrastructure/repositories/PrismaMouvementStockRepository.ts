import { Prisma, TypeMouvement as PrismaTypeMouvement, type PrismaClient } from "@prisma/client";

import type { MouvementStock, NouveauMouvementStock } from "../../domain/entities/MouvementStock";
import type { MouvementStockRepository } from "../../domain/repositories/MouvementStockRepository";
import { prisma as defaultPrisma } from "../db";

type PrismaClientLike = PrismaClient | Prisma.TransactionClient;

function toMouvementStock(mouvement: {
  id: string;
  produitId: string;
  utilisateurId: string | null;
  type: PrismaTypeMouvement;
  quantite: number;
  date: Date;
  motif: string | null;
}): MouvementStock {
  return {
    id: mouvement.id,
    produitId: mouvement.produitId,
    utilisateurId: mouvement.utilisateurId,
    type: mouvement.type,
    quantite: mouvement.quantite,
    date: mouvement.date,
    motif: mouvement.motif,
  };
}

export class PrismaMouvementStockRepository implements MouvementStockRepository {
  constructor(private readonly client: PrismaClientLike = defaultPrisma) {}

  async creer(donnees: NouveauMouvementStock): Promise<MouvementStock> {
    const mouvement = await this.client.mouvementStock.create({
      data: {
        produitId: donnees.produitId,
        utilisateurId: donnees.utilisateurId ?? null,
        type: donnees.type,
        quantite: donnees.quantite,
        motif: donnees.motif ?? null,
      },
    });

    return toMouvementStock(mouvement);
  }

  async listerParProduit(produitId: string): Promise<MouvementStock[]> {
    const mouvements = await this.client.mouvementStock.findMany({
      where: { produitId },
      orderBy: { date: "desc" },
    });

    return mouvements.map(toMouvementStock);
  }
}