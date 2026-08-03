import { Prisma, type PrismaClient } from "@prisma/client";

import type { AttributPersonnalise, NouvelAttributPersonnalise, TypeChampAttribut } from "../../domain/entities/AttributPersonnalise";
import type { AttributPersonnaliseRepository } from "../../domain/repositories/AttributPersonnaliseRepository";
import { prisma as defaultPrisma } from "../db";

type PrismaClientLike = PrismaClient | Prisma.TransactionClient;

function toAttributPersonnalise(attribut: {
  id: string;
  entrepriseId: string;
  nom: string;
  typeChamp: string;
  entiteCible: string;
  obligatoire: boolean;
}): AttributPersonnalise {
  return {
    id: attribut.id,
    entrepriseId: attribut.entrepriseId,
    nom: attribut.nom,
    typeChamp: attribut.typeChamp as TypeChampAttribut,
    entiteCible: attribut.entiteCible,
    obligatoire: attribut.obligatoire,
  };
}

export class PrismaAttributPersonnaliseRepository implements AttributPersonnaliseRepository {
  constructor(private readonly client: PrismaClientLike = defaultPrisma) {}

  async creer(donnees: NouvelAttributPersonnalise, entrepriseId: string): Promise<AttributPersonnalise> {
    const attribut = await this.client.attributPersonnalise.create({
      data: {
        entrepriseId,
        nom: donnees.nom,
        typeChamp: donnees.typeChamp,
        entiteCible: donnees.entiteCible,
        obligatoire: donnees.obligatoire ?? false,
      },
    });

    return toAttributPersonnalise(attribut);
  }

  async listerParEntreprise(entrepriseId: string, entiteCible?: string): Promise<AttributPersonnalise[]> {
    const attributs = await this.client.attributPersonnalise.findMany({
      where: { entrepriseId, ...(entiteCible !== undefined ? { entiteCible } : {}) },
      orderBy: { nom: "asc" },
    });

    return attributs.map(toAttributPersonnalise);
  }

  async trouverParId(id: string): Promise<AttributPersonnalise | null> {
    const attribut = await this.client.attributPersonnalise.findUnique({
      where: { id },
    });

    return attribut ? toAttributPersonnalise(attribut) : null;
  }

  async supprimer(id: string): Promise<void> {
    await this.client.attributPersonnalise.delete({
      where: { id },
    });
  }
}
