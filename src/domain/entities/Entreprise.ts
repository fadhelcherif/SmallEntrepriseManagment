export type Entreprise = {
  id: string;
  nom: string;
  adresse: string;
  devise: string;
  typeMetier: string;
  categorie?: string | null;
  logo?: string | null;
  couleurPrimaire?: string | null;
  couleurSecondaire?: string | null;
};

export type NouvelleEntreprise = {
  nom: string;
  adresse: string;
  devise: string;
  typeMetier: string;
  categorie?: string | null;
  logo?: string | null;
  couleurPrimaire?: string | null;
  couleurSecondaire?: string | null;
};