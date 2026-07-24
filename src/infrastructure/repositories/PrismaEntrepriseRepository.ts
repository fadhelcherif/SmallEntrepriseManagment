import { Prisma, type PrismaClient } from "@prisma/client";

import type { Entreprise, NouvelleEntreprise } from "../../domain/entities/Entreprise";
import type { EntrepriseRepository } from "../../domain/repositories/EntrepriseRepository";
import { prisma as defaultPrisma } from "../db";

type PrismaClientLike = PrismaClient | Prisma.TransactionClient;

function toEntreprise(entreprise: {
  id: string;
  nom: string;
  adresse: string;
  devise: string;
  typeMetier: string;
  categorie: string | null;
  logo: string | null;
  couleurPrimaire: string | null;
  couleurSecondaire: string | null;
}): Entreprise {
  return {
    id: entreprise.id,
    nom: entreprise.nom,
    adresse: entreprise.adresse,
    devise: entreprise.devise,
    typeMetier: entreprise.typeMetier,
    categorie: entreprise.categorie,
    logo: entreprise.logo,
    couleurPrimaire: entreprise.couleurPrimaire,
    couleurSecondaire: entreprise.couleurSecondaire,
  };
}

export class PrismaEntrepriseRepository implements EntrepriseRepository {
  constructor(private readonly client: PrismaClientLike = defaultPrisma) {}

  async creer(donnees: NouvelleEntreprise): Promise<Entreprise> {
    const entreprise = await this.client.entreprise.create({
      data: donnees,
    });

    return toEntreprise(entreprise);
  }

  async modifier(id: string, donnees: Partial<NouvelleEntreprise>): Promise<Entreprise> {
    const entreprise = await this.client.entreprise.update({
      where: { id },
      data: donnees,
    });

    return toEntreprise(entreprise);
  }

  async trouverParId(id: string): Promise<Entreprise | null> {
    const entreprise = await this.client.entreprise.findUnique({
      where: { id },
    });

    return entreprise ? toEntreprise(entreprise) : null;
  }
}