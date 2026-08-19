import type { Commande, StatutCommande, CommandeAEnregistrer } from "../entities/Commande";

export interface CommandeRepository {
  creer(donnees: CommandeAEnregistrer, entrepriseId: string): Promise<Commande>;
  listerParEntreprise(entrepriseId: string): Promise<Commande[]>;
  trouverParId(id: string): Promise<Commande | null>;
  changerStatut(id: string, nouveauStatut: StatutCommande): Promise<Commande>;
}