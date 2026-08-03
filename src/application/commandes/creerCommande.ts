import type { CommandeRepository } from "../../domain/repositories/CommandeRepository";
import type { ProduitRepository } from "../../domain/repositories/ProduitRepository";
import type { NouvelleCommande, Commande, LigneCommandeAEnregistrer } from "../../domain/entities/Commande";
import { validerNouvelleCommande } from "../../domain/services/validerNouvelleCommande";
import { appliquerMouvementStock, StockInsuffisantError } from "../../domain/services/appliquerMouvementStock";

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

  const lignesAvecPrix: LigneCommandeAEnregistrer[] = [];

  for (const ligne of donnees.lignes) {
    const produit = await produitRepository.trouverParId(ligne.produitId);

    if (!produit) {
      throw new ProduitInexistantDansCommandeError();
    }

    if (donnees.type === "VENTE_CLIENT") {
      try {
        appliquerMouvementStock(produit.quantiteStock, { produitId: produit.id, type: "SORTIE", quantite: ligne.quantite });
      } catch (error) {
        if (error instanceof StockInsuffisantError) {
          throw new StockInsuffisantError(
            `Stock insuffisant pour « ${produit.nom} » (stock actuel : ${produit.quantiteStock}, quantité demandée : ${ligne.quantite}).`,
          );
        }

        throw error;
      }
    }

    const prixParDefaut = donnees.type === "ACHAT_FOURNISSEUR" ? produit.prixAchat : produit.prixVente;
    const prixApplique = ligne.prixApplique !== undefined && ligne.prixApplique > 0 ? ligne.prixApplique : prixParDefaut;

    lignesAvecPrix.push({
      produitId: ligne.produitId,
      quantite: ligne.quantite,
      prixApplique,
    });
  }

  if (donnees.type === "ACHAT_FOURNISSEUR") {
    return commandeRepository.creer(
      {
        type: "ACHAT_FOURNISSEUR",
        fournisseurId: donnees.fournisseurId,
        utilisateurId,
        lignes: lignesAvecPrix,
      },
      entrepriseId,
    );
  }

  return commandeRepository.creer(
    {
      type: "VENTE_CLIENT",
      utilisateurId,
      lignes: lignesAvecPrix,
    },
    entrepriseId,
  );
}
