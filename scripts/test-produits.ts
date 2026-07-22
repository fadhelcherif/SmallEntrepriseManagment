import { randomUUID } from "node:crypto";

import { creerProduit } from "../src/application/produits/creerProduit";
import { listerProduits } from "../src/application/produits/listerProduits";
import type { NouveauProduit } from "../src/domain/entities/Produit";
import { PrismaProduitRepository } from "../src/infrastructure/repositories/PrismaProduitRepository";

async function main(): Promise<void> {
  const entrepriseId = process.argv[2] ?? process.env.ENTREPRISE_ID;

  if (!entrepriseId) {
    console.error("Usage: ENTREPRISE_ID=<uuid> npx tsx scripts/test-produits.ts\n   ou: npx tsx scripts/test-produits.ts <uuid>");
    process.exit(1);
  }

  const repository = new PrismaProduitRepository();
  const suffixe = randomUUID().slice(0, 8);
  const nouveauProduit: NouveauProduit = {
    nom: `Produit test ${suffixe}`,
    prixUnitaire: 19.9,
    quantiteStock: 7,
    seuilAlerte: 2,
    description: "Produit créé par le script jetable",
  };

  console.log("Création du produit...");
  const produitCree = await creerProduit(repository, nouveauProduit, entrepriseId);
  console.log("Produit créé:", produitCree);

  console.log("Lecture des produits de l'entreprise...");
  const produits = await listerProduits(repository, entrepriseId);
  const produitRelu = produits.find((produit) => produit.id === produitCree.id);

  if (!produitRelu) {
    console.error("Le produit créé n'a pas été retrouvé via listerProduits.");
    process.exit(1);
  }

  console.log("Produit relu via listerProduits:", produitRelu);
  console.log("Confirmation: le produit a bien été créé puis relu depuis la base locale.");
}

main().catch((error) => {
  console.error("Erreur pendant le test Produit:", error);
  process.exit(1);
});
