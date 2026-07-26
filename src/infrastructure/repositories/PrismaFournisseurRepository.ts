import { Prisma, type PrismaClient } from "@prisma/client";

import type { Fournisseur, NouveauFournisseur } from "../../domain/entities/Fournisseur";
import type { FournisseurRepository } from "../../domain/repositories/FournisseurRepository";
import { prisma as defaultPrisma } from "../db";

type PrismaClientLike = PrismaClient | Prisma.TransactionClient;

function toFournisseur(fournisseur: {
  id: string;
  entrepriseId: string;
  nom: string;
  contact: string | null;
  adresse: string | null;
  delaiLivraisonJours: number | null;
}): Fournisseur {
  return {
    id: fournisseur.id,
    entrepriseId: fournisseur.entrepriseId,
    nom: fournisseur.nom,
    contact: fournisseur.contact,
    adresse: fournisseur.adresse,
    delaiLivraisonJours: fournisseur.delaiLivraisonJours,
  };
}

export class PrismaFournisseurRepository implements FournisseurRepository {
  constructor(private readonly client: PrismaClientLike = defaultPrisma) {}

  async creer(donnees: NouveauFournisseur, entrepriseId: string): Promise<Fournisseur> {
    const fournisseur = await this.client.fournisseur.create({
      data: {
        entrepriseId,
        nom: donnees.nom,
        contact: donnees.contact ?? null,
        adresse: donnees.adresse ?? null,
        delaiLivraisonJours: donnees.delaiLivraisonJours ?? null,
      },
    });

    return toFournisseur(fournisseur);
  }

  async listerParEntreprise(entrepriseId: string): Promise<Fournisseur[]> {
    const fournisseurs = await this.client.fournisseur.findMany({
      where: { entrepriseId },
      orderBy: { nom: "asc" },
    });

    return fournisseurs.map(toFournisseur);
  }

  async modifier(id: string, donnees: Partial<NouveauFournisseur>): Promise<Fournisseur> {
    const fournisseur = await this.client.fournisseur.update({
      where: { id },
      data: {
        ...(donnees.nom !== undefined ? { nom: donnees.nom } : {}),
        ...(donnees.contact !== undefined ? { contact: donnees.contact } : {}),
        ...(donnees.adresse !== undefined ? { adresse: donnees.adresse } : {}),
        ...(donnees.delaiLivraisonJours !== undefined ? { delaiLivraisonJours: donnees.delaiLivraisonJours } : {}),
      },
    });

    return toFournisseur(fournisseur);
  }

  async supprimer(id: string): Promise<void> {
    await this.client.fournisseur.delete({
      where: { id },
    });
  }
}