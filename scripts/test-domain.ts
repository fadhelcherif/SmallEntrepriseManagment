import {
  ProduitInvalideError,
  validerProduit as validerNouveauProduit,
} from "../src/domain/services/validerProduit";

function testerValidation(nom: string, produit: unknown): void {
  try {
    validerNouveauProduit(produit as never);
    console.log(`[OK] ${nom}`);
  } catch (error) {
    if (error instanceof ProduitInvalideError) {
      console.log(`[REJETÉ] ${nom} -> ${error.message}`);
      return;
    }

    throw error;
  }
}

console.log("Test du domaine Produit");

testerValidation("prix à 0", {
  nom: "Produit invalide prix",
  prixUnitaire: 0,
  seuilAlerte: 2,
});

testerValidation("nom vide", {
  nom: "   ",
  prixUnitaire: 10,
  seuilAlerte: 2,
});

testerValidation("produit valide", {
  nom: "Café",
  prixUnitaire: 12.5,
  quantiteStock: 10,
  seuilAlerte: 3,
  description: "Pack de 1 kg",
});
