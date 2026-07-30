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

  async trouverParId(id: string): Promise<Entreprise | null> {
    const entreprise = await this.client.entreprise.findUnique({
      where: { id },
    });

    return entreprise ? toEntreprise(entreprise) : null;
  }

  async modifier(id: string, donnees: Partial<NouvelleEntreprise>): Promise<Entreprise> {
    const entreprise = await this.client.entreprise.update({
      where: { id },
      data: {
        ...(donnees.nom !== undefined ? { nom: donnees.nom } : {}),
        ...(donnees.adresse !== undefined ? { adresse: donnees.adresse } : {}),
        ...(donnees.devise !== undefined ? { devise: donnees.devise } : {}),
        ...(donnees.typeMetier !== undefined ? { typeMetier: donnees.typeMetier } : {}),
        ...(donnees.categorie !== undefined ? { categorie: donnees.categorie } : {}),
        ...(donnees.logo !== undefined ? { logo: donnees.logo } : {}),
        ...(donnees.couleurPrimaire !== undefined ? { couleurPrimaire: donnees.couleurPrimaire } : {}),
        ...(donnees.couleurSecondaire !== undefined ? { couleurSecondaire: donnees.couleurSecondaire } : {}),
      },
    });

    return toEntreprise(entreprise);
  }
}
