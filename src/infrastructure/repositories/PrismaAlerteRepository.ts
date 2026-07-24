import { Prisma, type PrismaClient } from "@prisma/client";

import type { Alerte, NouvelleAlerte } from "../../domain/entities/Alerte";
import type { AlerteRepository } from "../../domain/repositories/AlerteRepository";
import { prisma as defaultPrisma } from "../db";

type PrismaClientLike = PrismaClient | Prisma.TransactionClient;

function toAlerte(alerte: {
  id: string;
  produitId: string;
  type: string;
  message: string;
  dateGeneration: Date;
  lue: boolean;
}): Alerte {
  return {
    id: alerte.id,
    produitId: alerte.produitId,
    type: alerte.type,
    message: alerte.message,
    dateGeneration: alerte.dateGeneration,
    lue: alerte.lue,
  };
}

export class PrismaAlerteRepository implements AlerteRepository {
  constructor(private readonly client: PrismaClientLike = defaultPrisma) {}

  async creer(donnees: NouvelleAlerte): Promise<Alerte> {
    const alerte = await this.client.alerte.create({
      data: {
        produitId: donnees.produitId,
        type: donnees.type,
        message: donnees.message,
        dateGeneration: donnees.dateGeneration ?? new Date(),
        lue: donnees.lue ?? false,
      },
    });

    return toAlerte(alerte);
  }

  async listerNonLuesParEntreprise(entrepriseId: string): Promise<Alerte[]> {
    const alertes = await this.client.alerte.findMany({
      where: {
        lue: false,
        produit: {
          entrepriseId,
        },
      },
      orderBy: {
        dateGeneration: "desc",
      },
    });

    return alertes.map(toAlerte);
  }

  async marquerCommeLue(id: string): Promise<Alerte> {
    const alerte = await this.client.alerte.update({
      where: { id },
      data: { lue: true },
    });

    return toAlerte(alerte);
  }
}