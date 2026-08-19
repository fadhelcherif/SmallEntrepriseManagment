import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const entrepriseId = "16f92815-3d8a-4ca4-b1f6-4141811682ae";
const utilisateurId = "de89a73c-f26f-4995-8e7a-39b8b09d46db";
const fournisseurId = "5f89d0a1-b7e4-4767-a5db-a7844d0a41c9"; // Fadhel, contact=fadhelcherif4@gmail.com
const produitId = "05c220e2-16b4-44dc-b5fd-5c6af2a0e444"; // Veste en Jean, prixAchat=22

const { creerCommandeFournisseur } = await import("./src/application/commandes/creerCommandeFournisseur.ts");
const { PrismaCommandeRepository } = await import("./src/infrastructure/repositories/PrismaCommandeRepository.ts");
const { PrismaProduitRepository } = await import("./src/infrastructure/repositories/PrismaProduitRepository.ts");
const { PrismaFournisseurRepository } = await import("./src/infrastructure/repositories/PrismaFournisseurRepository.ts");
const { PrismaEntrepriseRepository } = await import("./src/infrastructure/repositories/PrismaEntrepriseRepository.ts");
const { PrismaTokenConfirmationCommandeRepository } = await import("./src/infrastructure/repositories/PrismaTokenConfirmationCommandeRepository.ts");
const { EnvoyeurEmailGmail } = await import("./src/infrastructure/email/EnvoyeurEmailGmail.ts");

const commande = await creerCommandeFournisseur(
  new PrismaCommandeRepository(),
  new PrismaProduitRepository(),
  new PrismaFournisseurRepository(),
  new PrismaEntrepriseRepository(),
  new PrismaTokenConfirmationCommandeRepository(),
  new EnvoyeurEmailGmail(),
  entrepriseId,
  utilisateurId,
  { type: "ACHAT_FOURNISSEUR", fournisseurId, lignes: [{ produitId, quantite: 3 }] },
  "http://localhost:3000",
);

console.log("Commande creee:", commande.id);

const token = await prisma.tokenConfirmationCommande.findFirst({ where: { commandeId: commande.id } });
console.log("Token cree:", token ? token.token : "AUCUN (probleme)");

await prisma.$disconnect();

if (token) {
  console.log(`URL a tester: http://localhost:3000/commande-fournisseur/${token.token}`);
}
