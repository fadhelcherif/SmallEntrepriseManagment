import type { AttributPersonnalise } from "../../domain/entities/AttributPersonnalise";
import type { ValeurAttribut } from "../../domain/entities/ValeurAttribut";

/** Regroupe une liste plate de ValeurAttribut en Map<produitId, Map<attributId, valeur>>. */
export function grouperValeursParProduit(valeurs: ValeurAttribut[]): Map<string, Map<string, string>> {
  const valeursParProduit = new Map<string, Map<string, string>>();

  for (const valeur of valeurs) {
    const valeursDuProduit = valeursParProduit.get(valeur.produitId) ?? new Map<string, string>();
    valeursDuProduit.set(valeur.attributId, valeur.valeur);
    valeursParProduit.set(valeur.produitId, valeursDuProduit);
  }

  return valeursParProduit;
}

/** Formate les valeurs d'attributs d'un produit en une courte chaine lisible, ex: "Taille : M, Couleur : Bleu". */
export function formaterAttributsProduit(
  attributs: AttributPersonnalise[],
  valeursDuProduit: Map<string, string> | undefined,
): string {
  if (!valeursDuProduit || valeursDuProduit.size === 0) {
    return "";
  }

  const parties: string[] = [];

  for (const attribut of attributs) {
    const valeur = valeursDuProduit.get(attribut.id);

    if (valeur === undefined) {
      continue;
    }

    parties.push(attribut.typeChamp === "case_a_cocher" ? `${attribut.nom} : ${valeur === "true" ? "Oui" : "Non"}` : `${attribut.nom} : ${valeur}`);
  }

  return parties.join(", ");
}
