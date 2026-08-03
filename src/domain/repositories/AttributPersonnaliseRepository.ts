import type { AttributPersonnalise, NouvelAttributPersonnalise } from "../entities/AttributPersonnalise";

export interface AttributPersonnaliseRepository {
  creer(donnees: NouvelAttributPersonnalise, entrepriseId: string): Promise<AttributPersonnalise>;
  listerParEntreprise(entrepriseId: string, entiteCible?: string): Promise<AttributPersonnalise[]>;
  trouverParId(id: string): Promise<AttributPersonnalise | null>;
  supprimer(id: string): Promise<void>;
}
