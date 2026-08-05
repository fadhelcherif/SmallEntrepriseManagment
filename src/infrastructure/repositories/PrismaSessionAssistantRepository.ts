import type { Prisma, PrismaClient } from "@prisma/client";

import type { NouvelleSessionAssistant, SessionAssistant } from "../../domain/entities/SessionAssistant";
import type { SessionAssistantRepository } from "../../domain/repositories/SessionAssistantRepository";
import { prisma as defaultPrisma } from "../db";

type PrismaClientLike = PrismaClient | Prisma.TransactionClient;

function toSessionAssistant(session: {
  id: string;
  entrepriseId: string;
  utilisateurId: string;
  titre: string;
  dateCreation: Date;
  derniereActivite: Date;
}): SessionAssistant {
  return {
    id: session.id,
    entrepriseId: session.entrepriseId,
    utilisateurId: session.utilisateurId,
    titre: session.titre,
    dateCreation: session.dateCreation,
    derniereActivite: session.derniereActivite,
  };
}

export class PrismaSessionAssistantRepository implements SessionAssistantRepository {
  constructor(private readonly client: PrismaClientLike = defaultPrisma) {}

  async creer(donnees: NouvelleSessionAssistant, entrepriseId: string, utilisateurId: string): Promise<SessionAssistant> {
    const session = await this.client.sessionAssistant.create({
      data: {
        entrepriseId,
        utilisateurId,
        titre: donnees.titre,
      },
    });

    return toSessionAssistant(session);
  }

  async trouverParId(id: string): Promise<SessionAssistant | null> {
    const session = await this.client.sessionAssistant.findUnique({ where: { id } });
    return session ? toSessionAssistant(session) : null;
  }

  async listerParUtilisateur(entrepriseId: string, utilisateurId: string): Promise<SessionAssistant[]> {
    const sessions = await this.client.sessionAssistant.findMany({
      where: { entrepriseId, utilisateurId },
      orderBy: { derniereActivite: "desc" },
    });

    return sessions.map(toSessionAssistant);
  }

  async toucherDerniereActivite(id: string): Promise<void> {
    await this.client.sessionAssistant.update({
      where: { id },
      data: { derniereActivite: new Date() },
    });
  }

  async supprimer(id: string): Promise<void> {
    await this.client.sessionAssistant.delete({ where: { id } });
  }
}
