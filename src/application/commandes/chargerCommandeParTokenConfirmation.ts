import type { Commande } from "../../domain/entities/Commande";
import type { CommandeRepository } from "../../domain/repositories/CommandeRepository";
import type { EntrepriseRepository } from "../../domain/repositories/EntrepriseRepository";
import type { FournisseurRepository } from "../../domain/repositories/FournisseurRepository";
import type { ProduitRepository } from "../../domain/repositories/ProduitRepository";
import type { TokenConfirmationCommandeRepository } from "../../domain/repositories/TokenConfirmationCommandeRepository";
import { tokenConfirmationCommandeEstValide } from "../../domain/services/genererTokenConfirmationCommande";
import { TokenConfirmationCommandeInvalideError } from "../../domain/services/errors";

export type CommandeConfirmationAffichage = {
  commande: Commande;
  nomEntreprise: string;
  nomFournisseur: string;
  nomsProduits: Map<string, string>;
};

export async function chargerCommandeParTokenConfirmation(
  tokenRepository: TokenConfirmationCommandeRepository,
  commandeRepository: CommandeRepository,
  entrepriseRepository: EntrepriseRepository,
  fournisseurRepository: FournisseurRepository,
  produitRepository: ProduitRepository,
  token: string,
): Promise<CommandeConfirmationAffichage> {
  const tokenTrouve = await tokenRepository.trouverParToken(token);

  if (!tokenTrouve || !tokenConfirmationCommandeEstValide(tokenTrouve, new Date())) {
    throw new TokenConfirmationCommandeInvalideError();
  }

  const commande = await commandeRepository.trouverParId(tokenTrouve.commandeId);

  if (!commande) {
    throw new TokenConfirmationCommandeInvalideError();
  }

  const [entreprise, fournisseur] = await Promise.all([
    entrepriseRepository.trouverParId(commande.entrepriseId),
    commande.fournisseurId ? fournisseurRepository.trouverParId(commande.fournisseurId) : Promise.resolve(null),
  ]);

  const nomsProduits = new Map<string, string>();
  for (const ligne of commande.lignes) {
    const produit = await produitRepository.trouverParId(ligne.produitId);
    nomsProduits.set(ligne.produitId, produit?.nom ?? ligne.produitId);
  }

  return {
    commande,
    nomEntreprise: entreprise?.nom ?? "Vantik",
    nomFournisseur: fournisseur?.nom ?? "",
    nomsProduits,
  };
}
