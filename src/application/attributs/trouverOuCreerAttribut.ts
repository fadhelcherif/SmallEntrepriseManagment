import type { AttributPersonnalise } from "../../domain/entities/AttributPersonnalise";
import type { AttributPersonnaliseRepository } from "../../domain/repositories/AttributPersonnaliseRepository";
import { validerAttributPersonnalise } from "../../domain/services/validerAttributPersonnalise";

/**
 * Un attribut est cree a la volee la premiere fois qu'un nom est saisi sur un
 * produit (pas d'ecran de configuration a part) ; les saisies suivantes du
 * meme nom (insensible a la casse) reutilisent le meme attribut plutot que
 * d'en creer un doublon, pour que la colonne du tableau produits reste unique.
 */
export async function trouverOuCreerAttribut(
  repository: AttributPersonnaliseRepository,
  entrepriseId: string,
  nom: string,
  entiteCible: string,
): Promise<AttributPersonnalise> {
  const nomNormalise = nom.trim();
  const existants = await repository.listerParEntreprise(entrepriseId, entiteCible);
  const existant = existants.find((attribut) => attribut.nom.toLowerCase() === nomNormalise.toLowerCase());

  if (existant) {
    return existant;
  }

  const donnees = {
    nom: nomNormalise,
    typeChamp: "texte" as const,
    entiteCible,
    obligatoire: false,
  };

  validerAttributPersonnalise(donnees);

  return repository.creer(donnees, entrepriseId);
}
