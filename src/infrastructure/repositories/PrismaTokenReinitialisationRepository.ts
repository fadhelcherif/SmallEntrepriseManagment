import { Prisma, type PrismaClient } from "@prisma/client";

import type { NouveauTokenReinitialisation, TokenReinitialisation } from "../../domain/entities/TokenReinitialisation";
import type { TokenReinitialisationRepository } from "../../domain/repositories/TokenReinitialisationRepository";
import { prisma as defaultPrisma } from "../db";

type PrismaClientLike = PrismaClient | Prisma.TransactionClient;

function toTokenReinitialisation(token: {
  id: string;
  utilisateurId: string;
  token: string;
  dateExpiration: Date;
  utilise: boolean;
  dateCreation: Date;
}): TokenReinitialisation {
  return {
    id: token.id,
    utilisateurId: token.utilisateurId,
    token: token.token,
    dateExpiration: token.dateExpiration,
    utilise: token.utilise,
    dateCreation: token.dateCreation,
  };
}

export class PrismaTokenReinitialisationRepository implements TokenReinitialisationRepository {
  constructor(private readonly client: PrismaClientLike = defaultPrisma) {}

  async creer(donnees: NouveauTokenReinitialisation): Promise<TokenReinitialisation> {
    const token = await this.client.tokenReinitialisationMotDePasse.create({
      data: {
        utilisateurId: donnees.utilisateurId,
        token: donnees.token,
        dateExpiration: donnees.dateExpiration,
      },
    });

    return toTokenReinitialisation(token);
  }

  async trouverParToken(token: string): Promise<TokenReinitialisation | null> {
    const tokenTrouve = await this.client.tokenReinitialisationMotDePasse.findUnique({
      where: { token },
    });

    return tokenTrouve ? toTokenReinitialisation(tokenTrouve) : null;
  }

  async marquerUtilise(id: string): Promise<void> {
    await this.client.tokenReinitialisationMotDePasse.update({
      where: { id },
      data: { utilise: true },
    });
  }
}
