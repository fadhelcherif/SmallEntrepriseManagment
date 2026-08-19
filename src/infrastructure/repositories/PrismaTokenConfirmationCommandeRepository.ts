import { Prisma, type PrismaClient } from "@prisma/client";

import type { NouveauTokenConfirmationCommande, TokenConfirmationCommande } from "../../domain/entities/TokenConfirmationCommande";
import type { TokenConfirmationCommandeRepository } from "../../domain/repositories/TokenConfirmationCommandeRepository";
import { prisma as defaultPrisma } from "../db";

type PrismaClientLike = PrismaClient | Prisma.TransactionClient;

function toTokenConfirmationCommande(token: {
  id: string;
  commandeId: string;
  token: string;
  dateExpiration: Date;
  dateCreation: Date;
}): TokenConfirmationCommande {
  return {
    id: token.id,
    commandeId: token.commandeId,
    token: token.token,
    dateExpiration: token.dateExpiration,
    dateCreation: token.dateCreation,
  };
}

export class PrismaTokenConfirmationCommandeRepository implements TokenConfirmationCommandeRepository {
  constructor(private readonly client: PrismaClientLike = defaultPrisma) {}

  async creer(donnees: NouveauTokenConfirmationCommande): Promise<TokenConfirmationCommande> {
    const token = await this.client.tokenConfirmationCommande.create({
      data: {
        commandeId: donnees.commandeId,
        token: donnees.token,
        dateExpiration: donnees.dateExpiration,
      },
    });

    return toTokenConfirmationCommande(token);
  }

  async trouverParToken(token: string): Promise<TokenConfirmationCommande | null> {
    const tokenTrouve = await this.client.tokenConfirmationCommande.findUnique({
      where: { token },
    });

    return tokenTrouve ? toTokenConfirmationCommande(tokenTrouve) : null;
  }
}
