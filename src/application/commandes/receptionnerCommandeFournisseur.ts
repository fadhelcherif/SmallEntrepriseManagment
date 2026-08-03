import type { Commande } from "../../domain/entities/Commande";
import { TYPE_CHARGE_ACHAT_FOURNISSEUR } from "../../domain/entities/Charge";
import type { AlerteRepository } from "../../domain/repositories/AlerteRepository";
import type { ChargeRepository } from "../../domain/repositories/ChargeRepository";
import type { CommandeRepository } from "../../domain/repositories/CommandeRepository";
import type { MouvementStockRepository } from "../../domain/repositories/MouvementStockRepository";
import type { ProduitRepository } from "../../domain/repositories/ProduitRepository";
import { calculerMontantTotalCommande } from "../../domain/services/calculerMontantCommande";
import { receptionnerCommande } from "./receptionnerCommande";

/**
 * Une commande fournisseur receptionnee est deja, par definition, une charge :
 * on ne demande jamais a l'admin de la re-saisir a la main dans /charges.
 */
export async function receptionnerCommandeFournisseur(
  commandeRepository: CommandeRepository,
  mouvementRepository: MouvementStockRepository,
  alerteRepository: AlerteRepository,
  produitRepository: ProduitRepository,
  chargeRepository: ChargeRepository,
  commandeActuelle: Commande,
): Promise<Commande> {
  const commandeMiseAJour = await receptionnerCommande(
    commandeRepository,
    mouvementRepository,
    alerteRepository,
    produitRepository,
    commandeActuelle,
  );

  await chargeRepository.creer(
    {
      fournisseurId: commandeActuelle.fournisseurId,
      type: TYPE_CHARGE_ACHAT_FOURNISSEUR,
      montant: calculerMontantTotalCommande(commandeActuelle.lignes),
      dateEcheance: new Date(),
      recurrente: false,
    },
    commandeActuelle.entrepriseId,
  );

  return commandeMiseAJour;
}
