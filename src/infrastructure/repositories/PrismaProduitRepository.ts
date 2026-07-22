import { Prisma } from "@prisma/client";

import type { NouveauProduit, Produit } from "../../domain/entities/Produit";
import type { ProduitRepository } from "../../domain/repositories/ProduitRepository";
import { prisma } from "../db";

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
  async creer(produit: NouveauProduit, entrepriseId: string): Promise<Produit> {
    const produitCree = await prisma.produit.create({
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

  async modifier(id: string, donnees: Partial<NouveauProduit>): Promise<Produit> {
    const produitModifie = await prisma.produit.update({
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

  async supprimer(id: string): Promise<void> {
    await prisma.produit.delete({
      where: { id },
    });
  }

  async listerParEntreprise(entrepriseId: string): Promise<Produit[]> {
    const produits = await prisma.produit.findMany({
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