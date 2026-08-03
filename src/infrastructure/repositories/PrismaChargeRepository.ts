import { Prisma, type PrismaClient } from "@prisma/client";

import type { Charge, NouvelleCharge } from "../../domain/entities/Charge";
import type { ChargeRepository } from "../../domain/repositories/ChargeRepository";
import { prisma as defaultPrisma } from "../db";

type PrismaClientLike = PrismaClient | Prisma.TransactionClient;

function toCharge(charge: {
  id: string;
  entrepriseId: string;
  utilisateurId: string | null;
  fournisseurId: string | null;
  type: string;
  montant: Prisma.Decimal;
  dateEcheance: Date;
  recurrente: boolean;
}): Charge {
  return {
    id: charge.id,
    entrepriseId: charge.entrepriseId,
    utilisateurId: charge.utilisateurId,
    fournisseurId: charge.fournisseurId,
    type: charge.type,
    montant: charge.montant.toNumber(),
    dateEcheance: charge.dateEcheance,
    recurrente: charge.recurrente,
  };
}

export class PrismaChargeRepository implements ChargeRepository {
  constructor(private readonly client: PrismaClientLike = defaultPrisma) {}

  async creer(donnees: NouvelleCharge, entrepriseId: string): Promise<Charge> {
    const charge = await this.client.charge.create({
      data: {
        entrepriseId,
        utilisateurId: donnees.utilisateurId ?? null,
        fournisseurId: donnees.fournisseurId ?? null,
        type: donnees.type,
        montant: new Prisma.Decimal(donnees.montant),
        dateEcheance: donnees.dateEcheance,
        recurrente: donnees.recurrente ?? false,
      },
    });

    return toCharge(charge);
  }

  async listerParEntreprise(entrepriseId: string): Promise<Charge[]> {
    const charges = await this.client.charge.findMany({
      where: { entrepriseId },
      orderBy: { dateEcheance: "desc" },
    });

    return charges.map(toCharge);
  }

  async trouverParId(id: string): Promise<Charge | null> {
    const charge = await this.client.charge.findUnique({
      where: { id },
    });

    return charge ? toCharge(charge) : null;
  }

  async supprimer(id: string): Promise<void> {
    await this.client.charge.delete({
      where: { id },
    });
  }
}
