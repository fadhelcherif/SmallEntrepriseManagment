import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const entrepriseId = "16f92815-3d8a-4ca4-b1f6-4141811682ae";

const fournisseurs = await prisma.fournisseur.findMany({ where: { entrepriseId } });
console.log("Fournisseurs:");
for (const f of fournisseurs) {
  console.log(`  ${f.id} | ${f.nom} | contact=${f.contact ?? "(vide)"}`);
}

const produits = await prisma.produit.findMany({ where: { entrepriseId }, take: 2 });
console.log("Produits (2 premiers):");
for (const p of produits) {
  console.log(`  ${p.id} | ${p.nom} | prixAchat=${p.prixAchat}`);
}

await prisma.$disconnect();
