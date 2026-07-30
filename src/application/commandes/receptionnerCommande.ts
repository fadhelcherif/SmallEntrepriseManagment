import type { Commande } from "../../domain/entities/Commande";
import type { CommandeRepository } from "../../domain/repositories/CommandeRepository";
import type { AlerteRepository } from "../../domain/repositories/AlerteRepository";
import type { ProduitRepository } from "../../domain/repositories/ProduitRepository";
import type { MouvementStockRepository } from "../../domain/repositories/MouvementStockRepository";
import { directionMouvementPourTypeCommande } from "../../domain/services/directionMouvementCommande";
import { enregistrerMouvement } from "../stock/enregistrerMouvement";

export class CommandeReceptionnableSeulementDepuisValideeError extends Error {
  constructor(message = "La commande ne peut être réceptionnée que depuis l'état VALIDEE.") {
    super(message);
    this.name = "CommandeReceptionnableSeulementDepuisValideeError";
  }
}

export async function receptionnerCommande(
  commandeRepository: CommandeRepository,
  mouvementRepository: MouvementStockRepository,
  alerteRepository: AlerteRepository,
  produitRepository: ProduitRepository,
  commandeActuelle: Commande,
): Promise<Commande> {
  if (commandeActuelle.statut !== "VALIDEE") {
    throw new CommandeReceptionnableSeulementDepuisValideeError();
  }

  const type = directionMouvementPourTypeCommande(commandeActuelle.type);
  const motif =
    commandeActuelle.type === "ACHAT_FOURNISSEUR"
      ? `Réception commande ${commandeActuelle.id}`
      : `Vente commande ${commandeActuelle.id}`;

  for (const ligne of commandeActuelle.lignes) {
    await enregistrerMouvement(mouvementRepository, alerteRepository, produitRepository, {
      produitId: ligne.produitId,
      type,
      quantite: ligne.quantite,
      motif,
    });
  }

  return commandeRepository.changerStatut(commandeActuelle.id, "RECUE");
}
