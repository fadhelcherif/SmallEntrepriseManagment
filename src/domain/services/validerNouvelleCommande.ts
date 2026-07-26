import type { NouvelleCommande } from "../entities/Commande";

export class CommandeInvalideError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CommandeInvalideError";
  }
}

export function validerNouvelleCommande(commande: NouvelleCommande): void {
  if (!commande.fournisseurId || commande.fournisseurId.trim().length === 0) {
    throw new CommandeInvalideError("Le fournisseur est obligatoire.");
  }

  if (!commande.lignes || commande.lignes.length === 0) {
    throw new CommandeInvalideError("La commande doit contenir au moins une ligne.");
  }

  for (const ligne of commande.lignes) {
    if (!ligne.produitId || ligne.produitId.trim().length === 0) {
      throw new CommandeInvalideError("Chaque ligne doit contenir un produit.");
    }

    if (ligne.quantite <= 0) {
      throw new CommandeInvalideError("Chaque quantité de ligne doit être supérieure à 0.");
    }
  }
}