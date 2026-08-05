import type { Prisma, PrismaClient } from "@prisma/client";

import type { MessageAssistant, NouveauMessageAssistant, RoleMessageAssistant } from "../../domain/entities/MessageAssistant";
import type { MessageAssistantRepository } from "../../domain/repositories/MessageAssistantRepository";
import { prisma as defaultPrisma } from "../db";

type PrismaClientLike = PrismaClient | Prisma.TransactionClient;

function toMessageAssistant(message: {
  id: string;
  sessionId: string;
  role: string;
  contenu: string;
  dateCreation: Date;
}): MessageAssistant {
  return {
    id: message.id,
    sessionId: message.sessionId,
    role: message.role as RoleMessageAssistant,
    contenu: message.contenu,
    dateCreation: message.dateCreation,
  };
}

export class PrismaMessageAssistantRepository implements MessageAssistantRepository {
  constructor(private readonly client: PrismaClientLike = defaultPrisma) {}

  async ajouter(donnees: NouveauMessageAssistant, sessionId: string): Promise<MessageAssistant> {
    const message = await this.client.messageAssistant.create({
      data: {
        sessionId,
        role: donnees.role,
        contenu: donnees.contenu,
      },
    });

    return toMessageAssistant(message);
  }

  async listerParSession(sessionId: string): Promise<MessageAssistant[]> {
    const messages = await this.client.messageAssistant.findMany({
      where: { sessionId },
      orderBy: { dateCreation: "asc" },
    });

    return messages.map(toMessageAssistant);
  }
}
