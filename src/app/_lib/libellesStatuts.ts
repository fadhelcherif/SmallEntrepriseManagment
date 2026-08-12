import type { VarianteBadge } from "../_components/ui/Badge";

export const LIBELLE_STATUT_COMMANDE: Record<string, { label: string; variante: VarianteBadge }> = {
  BROUILLON: { label: "Brouillon", variante: "neutre" },
  VALIDEE: { label: "Validée", variante: "info" },
  RECUE: { label: "Reçue", variante: "succes" },
  ANNULEE: { label: "Annulée", variante: "danger" },
};

export const LIBELLE_TYPE_MOUVEMENT: Record<string, { label: string; variante: VarianteBadge }> = {
  ENTREE: { label: "Entrée", variante: "succes" },
  SORTIE: { label: "Sortie", variante: "avertissement" },
  AJUSTEMENT: { label: "Ajustement", variante: "info" },
};

export const LIBELLE_CONFIANCE_PREVISION: Record<string, { label: string; variante: VarianteBadge }> = {
  FIABLE: { label: "Fiable", variante: "succes" },
  MOYENNE: { label: "Moyenne", variante: "avertissement" },
  FAIBLE: { label: "Faible", variante: "danger" },
};

export const LIBELLE_RISQUE_PREVISION: Record<string, { label: string; variante: VarianteBadge }> = {
  AUCUN: { label: "Aucun risque détecté", variante: "succes" },
  SURVEILLER: { label: "À surveiller", variante: "avertissement" },
  RISQUE_PERTE: { label: "Risque de perte", variante: "danger" },
};

export const LIBELLE_MODELE_PREVISION: Record<string, string> = {
  REGRESSION_LINEAIRE: "Régression linéaire",
  HOLT: "Holt",
  HOLT_WINTERS: "Holt-Winters",
};
