import { Prisma, type PrismaClient } from "@prisma/client";

import type { NouvelleValeurAttribut, ValeurAttribut } from "../../domain/entities/ValeurAttribut";
import type { ValeurAttributRepository } from "../../domain/repositories/ValeurAttributRepository";
import { prisma as defaultPrisma } from "../db";

type PrismaClientLike = PrismaClient | Prisma.TransactionClient;

function toValeurAttribut(valeur: { id: string; attributId: string; produitId: string; valeur: string }): ValeurAttribut {
  return {
    id: valeur.id,
    attributId: valeur.attributId,
    produitId: valeur.produitId,
    valeur: valeur.valeur,
  };
}

export class PrismaValeurAttributRepository implements ValeurAttributRepository {
  constructor(private readonly client: PrismaClientLike = defaultPrisma) {}

  private estPrismaClient(client: PrismaClientLike): client is PrismaClient {
    return typeof (client as PrismaClient).$transaction === "function";
  }

  async enregistrerPourProduit(produitId: string, valeurs: NouvelleValeurAttribut[]): Promise<ValeurAttribut[]> {
    const executerOperations = async (client: PrismaClientLike) => {
      await client.valeurAttribut.deleteMany({ where: { produitId } });

      if (valeurs.length > 0) {
        await client.valeurAttribut.createMany({
          data: valeurs.map((valeur) => ({
            produitId,
            attributId: valeur.attributId,
            valeur: valeur.valeur,
          })),
        });
      }

      return client.valeurAttribut.findMany({ where: { produitId } });
    };

    if (this.estPrismaClient(this.client)) {
      const resultat = await this.client.$transaction((transactionClient) => executerOperations(transactionClient));
      return resultat.map(toValeurAttribut);
    }

    const resultat = await executerOperations(this.client);
    return resultat.map(toValeurAttribut);
  }

  async listerParProduit(produitId: string): Promise<ValeurAttribut[]> {
    const valeurs = await this.client.valeurAttribut.findMany({
      where: { produitId },
    });

    return valeurs.map(toValeurAttribut);
  }

  async listerParProduits(produitIds: string[]): Promise<ValeurAttribut[]> {
    if (produitIds.length === 0) {
      return [];
    }

    const valeurs = await this.client.valeurAttribut.findMany({
      where: { produitId: { in: produitIds } },
    });

    return valeurs.map(toValeurAttribut);
  }
}
