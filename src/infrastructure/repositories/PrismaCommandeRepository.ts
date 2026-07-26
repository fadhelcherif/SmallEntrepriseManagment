import { Prisma, type PrismaClient } from "@prisma/client";

import type { Commande, StatutCommande, CommandeAEnregistrer } from "../../domain/entities/Commande";
import type { CommandeRepository } from "../../domain/repositories/CommandeRepository";
import { prisma as defaultPrisma } from "../db";

type PrismaClientLike = PrismaClient | Prisma.TransactionClient;

function toCommande(commande: {
  id: string;
  entrepriseId: string;
  fournisseurId: string | null;
  type: Prisma.TypeCommande;
  statut: Prisma.StatutCommande;
  dateCommande: Date;
  lignesCommande: Array<{
    id: string;
    commandeId: string;
    produitId: string;
    quantite: number;
    prixApplique: Prisma.Decimal;
  }>;
}): Commande {
  return {
    id: commande.id,
    entrepriseId: commande.entrepriseId,
    fournisseurId: commande.fournisseurId ?? "",
    type: commande.type,
    statut: commande.statut,
    dateCommande: commande.dateCommande,
    lignes: commande.lignesCommande.map((ligne) => ({
      id: ligne.id,
      commandeId: ligne.commandeId,
      produitId: ligne.produitId,
      quantite: ligne.quantite,
      prixApplique: ligne.prixApplique.toNumber(),
    })),
  };
}

export class PrismaCommandeRepository implements CommandeRepository {
  constructor(private readonly client: PrismaClientLike = defaultPrisma) {}

  private estPrismaClient(): this is { client: PrismaClient } {
    return typeof (this.client as PrismaClient).$transaction === "function";
  }

  async creer(donnees: CommandeAEnregistrer, entrepriseId: string): Promise<Commande> {
    const creerCommandeAvecLignes = async (client: PrismaClientLike) => {
      const commande = await client.commande.create({
        data: {
          entrepriseId,
          utilisateurId: donnees.utilisateurId,
          fournisseurId: donnees.fournisseurId,
          type: "ACHAT_FOURNISSEUR",
          statut: "BROUILLON",
          lignesCommande: {
            create: donnees.lignes.map((ligne) => ({
              produitId: ligne.produitId,
              quantite: ligne.quantite,
              prixApplique: new Prisma.Decimal(ligne.prixApplique),
            })),
          },
        },
        include: { lignesCommande: true },
      });

      return toCommande(commande);
    };

    if (this.estPrismaClient()) {
      return this.client.$transaction(async (transactionClient) => creerCommandeAvecLignes(transactionClient));
    }

    return creerCommandeAvecLignes(this.client);
  }

  async listerParEntreprise(entrepriseId: string): Promise<Commande[]> {
    const commandes = await this.client.commande.findMany({
      where: { entrepriseId },
      include: { lignesCommande: true },
      orderBy: { dateCommande: "desc" },
    });

    return commandes.map(toCommande);
  }

  async changerStatut(id: string, nouveauStatut: StatutCommande): Promise<Commande> {
    const commande = await this.client.commande.update({
      where: { id },
      data: { statut: nouveauStatut },
      include: { lignesCommande: true },
    });

    return toCommande(commande);
  }
}