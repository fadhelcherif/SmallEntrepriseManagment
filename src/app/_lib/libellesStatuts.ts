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
