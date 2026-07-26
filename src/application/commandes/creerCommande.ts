import type { CommandeRepository } from "../../domain/repositories/CommandeRepository";
import type { ProduitRepository } from "../../domain/repositories/ProduitRepository";
import type { NouvelleCommande, Commande } from "../../domain/entities/Commande";
import { validerNouvelleCommande } from "../../domain/services/validerNouvelleCommande";

export class ProduitInexistantDansCommandeError extends Error {
  constructor(message = "Un produit de la commande est introuvable.") {
    super(message);
    this.name = "ProduitInexistantDansCommandeError";
  }
}

export async function creerCommande(
  commandeRepository: CommandeRepository,
  produitRepository: ProduitRepository,
  entrepriseId: string,
  utilisateurId: string,
  donnees: NouvelleCommande,
): Promise<Commande> {
  validerNouvelleCommande(donnees);

  const lignesAvecPrix = [] as Array<{ produitId: string; quantite: number; prixApplique: number }>;

  for (const ligne of donnees.lignes) {
    const produit = await produitRepository.trouverParId(ligne.produitId);

    if (!produit) {
      throw new ProduitInexistantDansCommandeError();
    }

    lignesAvecPrix.push({
      produitId: ligne.produitId,
      quantite: ligne.quantite,
      prixApplique: produit.prixUnitaire,
    });
  }

  return commandeRepository.creer(
    {
      fournisseurId: donnees.fournisseurId,
      utilisateurId,
      lignes: lignesAvecPrix,
    },
    entrepriseId,
  );
}