import type { Alerte, NouvelleAlerte } from "../entities/Alerte";

export interface AlerteRepository {
  creer(donnees: NouvelleAlerte): Promise<Alerte>;
  listerNonLuesParEntreprise(entrepriseId: string): Promise<Alerte[]>;
  marquerCommeLue(id: string): Promise<Alerte>;
}