import type { CommandeRepository } from "../../domain/repositories/CommandeRepository";
import type { Commande } from "../../domain/entities/Commande";

export class CommandeDejaValideeError extends Error {
  constructor(message = "La commande ne peut être validée que depuis l'état BROUILLON.") {
    super(message);
    this.name = "CommandeDejaValideeError";
  }
}

export async function validerCommande(repository: CommandeRepository, commandeActuelle: Commande): Promise<Commande> {
  if (commandeActuelle.statut !== "BROUILLON") {
    throw new CommandeDejaValideeError();
  }

  return repository.changerStatut(commandeActuelle.id, "VALIDEE");
}