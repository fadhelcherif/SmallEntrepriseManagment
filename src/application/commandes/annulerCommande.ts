import type { Commande } from "../../domain/entities/Commande";
import type { CommandeRepository } from "../../domain/repositories/CommandeRepository";

export class CommandeAnnulableSeulementDepuisBrouillonOuValideeError extends Error {
  constructor(message = "La commande ne peut être annulée que depuis BROUILLON ou VALIDEE.") {
    super(message);
    this.name = "CommandeAnnulableSeulementDepuisBrouillonOuValideeError";
  }
}

export async function annulerCommande(
  repository: CommandeRepository,
  commandeActuelle: Commande,
): Promise<Commande> {
  if (commandeActuelle.statut !== "BROUILLON" && commandeActuelle.statut !== "VALIDEE") {
    throw new CommandeAnnulableSeulementDepuisBrouillonOuValideeError();
  }

  return repository.changerStatut(commandeActuelle.id, "ANNULEE");
}