import type { Commande, NouvelleCommandeAchat } from "../../domain/entities/Commande";
import type { CommandeRepository } from "../../domain/repositories/CommandeRepository";
import type { EntrepriseRepository } from "../../domain/repositories/EntrepriseRepository";
import type { FournisseurRepository } from "../../domain/repositories/FournisseurRepository";
import type { ProduitRepository } from "../../domain/repositories/ProduitRepository";
import type { TokenConfirmationCommandeRepository } from "../../domain/repositories/TokenConfirmationCommandeRepository";
import type { EnvoyeurEmail } from "../../domain/services/EnvoyeurEmail";
import { genererToken } from "../../domain/services/genererTokenReinitialisation";
import { calculerExpirationTokenConfirmationCommande } from "../../domain/services/genererTokenConfirmationCommande";
import { creerCommande } from "./creerCommande";

/**
 * Une commande fournisseur qui vient d'etre creee declenche un email au fournisseur
 * (adresse = son champ contact) avec un lien public consultable sans compte, sur le
 * meme principe que le lien de reinitialisation de mot de passe (token aleatoire,
 * expiration en base) — sauf qu'il n'est pas a usage unique : le fournisseur peut le
 * consulter plusieurs fois jusqu'a expiration. Best-effort : l'envoi ne doit jamais
 * faire echouer la creation de la commande (contact absent, identifiants email non
 * configures, erreur reseau...).
 */
export async function creerCommandeFournisseur(
  commandeRepository: CommandeRepository,
  produitRepository: ProduitRepository,
  fournisseurRepository: FournisseurRepository,
  entrepriseRepository: EntrepriseRepository,
  tokenConfirmationRepository: TokenConfirmationCommandeRepository,
  envoyeurEmail: EnvoyeurEmail,
  entrepriseId: string,
  utilisateurId: string,
  donnees: NouvelleCommandeAchat,
  urlBase: string,
): Promise<Commande> {
  const commande = await creerCommande(commandeRepository, produitRepository, entrepriseId, utilisateurId, donnees);

  try {
    const fournisseur = await fournisseurRepository.trouverParId(donnees.fournisseurId);

    if (fournisseur?.contact) {
      const entreprise = await entrepriseRepository.trouverParId(entrepriseId);
      const nomEntreprise = entreprise?.nom ?? "Un client";

      const token = genererToken();
      const dateExpiration = calculerExpirationTokenConfirmationCommande(new Date());

      await tokenConfirmationRepository.creer({
        commandeId: commande.id,
        token,
        dateExpiration,
      });

      const lien = `${urlBase}/commande-fournisseur/${token}`;

      await envoyeurEmail.envoyer(
        fournisseur.contact,
        `Nouvelle commande — ${nomEntreprise}`,
        `Bonjour ${fournisseur.nom},\n\n` +
          `${nomEntreprise} vient de passer une nouvelle commande.\n` +
          `Consultez le détail de la commande ici (lien valable 30 jours) :\n${lien}\n\n` +
          "Merci de préparer cette commande.",
      );
    }
  } catch {
    // L'email de notification est une courtoisie, pas une condition de succes de la commande.
  }

  return commande;
}
