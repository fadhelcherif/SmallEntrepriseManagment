import { Prisma, type PrismaClient } from "@prisma/client";

import type { NouveauProduit, Produit } from "../../domain/entities/Produit";
import type { ProduitRepository } from "../../domain/repositories/ProduitRepository";
import { prisma as defaultPrisma } from "../db";

type PrismaClientLike = PrismaClient | Prisma.TransactionClient;

function toProduit(
  produit: {
    id: string;
    entrepriseId: string;
    nom: string;
    description: string | null;
    prixUnitaire: Prisma.Decimal;
    quantiteStock: number;
    seuilAlerte: number;
    dateExpiration: Date | null;
  },
): Produit {
  return {
    id: produit.id,
    entrepriseId: produit.entrepriseId,
    nom: produit.nom,
    description: produit.description,
    prixUnitaire: produit.prixUnitaire.toNumber(),
    quantiteStock: produit.quantiteStock,
    seuilAlerte: produit.seuilAlerte,
    dateExpiration: produit.dateExpiration,
  };
}

export class PrismaProduitRepository implements ProduitRepository {
  constructor(private readonly client: PrismaClientLike = defaultPrisma) {}

  async creer(produit: NouveauProduit, entrepriseId: string): Promise<Produit> {
    const produitCree = await this.client.produit.create({
      data: {
        entrepriseId,
        nom: produit.nom,
        description: produit.description ?? null,
        prixUnitaire: new Prisma.Decimal(produit.prixUnitaire),
        quantiteStock: produit.quantiteStock ?? 0,
        seuilAlerte: produit.seuilAlerte ?? 0,
        dateExpiration: produit.dateExpiration ?? null,
      },
    });

    return toProduit(produitCree);
  }

  async modifierStock(id: string, quantiteStock: number): Promise<Produit> {
    const produitModifie = await this.client.produit.update({
      where: { id },
      data: { quantiteStock },
    });

    return toProduit(produitModifie);
  }

  async modifier(id: string, donnees: Partial<NouveauProduit>): Promise<Produit> {
    const produitModifie = await this.client.produit.update({
      where: { id },
      data: {
        ...(donnees.nom !== undefined ? { nom: donnees.nom } : {}),
        ...(donnees.description !== undefined ? { description: donnees.description } : {}),
        ...(donnees.prixUnitaire !== undefined ? { prixUnitaire: new Prisma.Decimal(donnees.prixUnitaire) } : {}),
        ...(donnees.quantiteStock !== undefined ? { quantiteStock: donnees.quantiteStock } : {}),
        ...(donnees.seuilAlerte !== undefined ? { seuilAlerte: donnees.seuilAlerte } : {}),
        ...(donnees.dateExpiration !== undefined ? { dateExpiration: donnees.dateExpiration } : {}),
      },
    });

    return toProduit(produitModifie);
  }

  async trouverParId(id: string): Promise<Produit | null> {
    const produit = await this.client.produit.findUnique({
      where: { id },
    });

    return produit ? toProduit(produit) : null;
  }

  async supprimer(id: string): Promise<void> {
    await this.client.produit.delete({
      where: { id },
    });
  }

  async listerParEntreprise(entrepriseId: string): Promise<Produit[]> {
    const produits = await this.client.produit.findMany({
      where: {
        entrepriseId,
      },
      orderBy: {
        nom: "asc",
      },
    });

    return produits.map(toProduit);
  }
}