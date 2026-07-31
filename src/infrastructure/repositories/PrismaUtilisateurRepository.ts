import { Prisma, RoleUtilisateur as PrismaRoleUtilisateur, type PrismaClient } from "@prisma/client";

import type {
  NouvelUtilisateurAvecMotDePasseHash,
  Utilisateur,
  UtilisateurAvecMotDePasse,
} from "../../domain/entities/Utilisateur";
import type { ModificationUtilisateur, UtilisateurRepository } from "../../domain/repositories/UtilisateurRepository";
import { prisma as defaultPrisma } from "../db";

type PrismaClientLike = PrismaClient | Prisma.TransactionClient;

function toUtilisateur(
  utilisateur: {
    id: string;
    entrepriseId: string;
    nom: string;
    email: string;
    role: PrismaRoleUtilisateur;
    actif: boolean;
  },
): Utilisateur {
  return {
    id: utilisateur.id,
    entrepriseId: utilisateur.entrepriseId,
    nom: utilisateur.nom,
    email: utilisateur.email,
    role: utilisateur.role,
    actif: utilisateur.actif,
  };
}

function toUtilisateurAvecMotDePasse(
  utilisateur: {
    id: string;
    entrepriseId: string;
    nom: string;
    email: string;
    role: PrismaRoleUtilisateur;
    actif: boolean;
    motDePasseHash: string;
  },
): UtilisateurAvecMotDePasse {
  return {
    ...toUtilisateur(utilisateur),
    motDePasseHash: utilisateur.motDePasseHash,
  };
}

export class PrismaUtilisateurRepository implements UtilisateurRepository {
  constructor(private readonly client: PrismaClientLike = defaultPrisma) {}

  async trouverParEmail(email: string): Promise<UtilisateurAvecMotDePasse | null> {
    const utilisateur = await this.client.utilisateur.findUnique({
      where: { email },
    });

    return utilisateur ? toUtilisateurAvecMotDePasse(utilisateur) : null;
  }

  async creer(donnees: NouvelUtilisateurAvecMotDePasseHash): Promise<Utilisateur> {
    const utilisateur = await this.client.utilisateur.create({
      data: {
        entrepriseId: donnees.entrepriseId,
        nom: donnees.nom,
        email: donnees.email,
        role: donnees.role,
        motDePasseHash: donnees.motDePasseHash,
        actif: donnees.actif ?? true,
      },
    });

    return toUtilisateur(utilisateur);
  }

  async listerParEntreprise(entrepriseId: string): Promise<Utilisateur[]> {
    const utilisateurs = await this.client.utilisateur.findMany({
      where: { entrepriseId },
      orderBy: { nom: "asc" },
    });

    return utilisateurs.map(toUtilisateur);
  }

  async trouverParId(id: string): Promise<Utilisateur | null> {
    const utilisateur = await this.client.utilisateur.findUnique({
      where: { id },
    });

    return utilisateur ? toUtilisateur(utilisateur) : null;
  }

  async modifier(id: string, donnees: ModificationUtilisateur): Promise<Utilisateur> {
    const utilisateur = await this.client.utilisateur.update({
      where: { id },
      data: {
        ...(donnees.nom !== undefined ? { nom: donnees.nom } : {}),
        ...(donnees.email !== undefined ? { email: donnees.email } : {}),
        ...(donnees.role !== undefined ? { role: donnees.role } : {}),
        ...(donnees.actif !== undefined ? { actif: donnees.actif } : {}),
      },
    });

    return toUtilisateur(utilisateur);
  }
}