import type { TypeCommande } from "../entities/Commande";
import type { TypeMouvementStock } from "../entities/MouvementStock";

export function directionMouvementPourTypeCommande(type: TypeCommande): TypeMouvementStock {
  return type === "ACHAT_FOURNISSEUR" ? "ENTREE" : "SORTIE";
}
