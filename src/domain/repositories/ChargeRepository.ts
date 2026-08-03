import type { Charge, NouvelleCharge } from "../entities/Charge";

export interface ChargeRepository {
  creer(donnees: NouvelleCharge, entrepriseId: string): Promise<Charge>;
  listerParEntreprise(entrepriseId: string): Promise<Charge[]>;
  trouverParId(id: string): Promise<Charge | null>;
  supprimer(id: string): Promise<void>;
}
