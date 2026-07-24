import type { Entreprise, NouvelleEntreprise } from "../entities/Entreprise";

export interface EntrepriseRepository {
  creer(donnees: NouvelleEntreprise): Promise<Entreprise>;
  trouverParId(id: string): Promise<Entreprise | null>;
}