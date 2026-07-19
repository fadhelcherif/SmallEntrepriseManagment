-- CreateEnum
CREATE TYPE "RoleUtilisateur" AS ENUM ('ADMINISTRATEUR', 'EMPLOYE');

-- CreateEnum
CREATE TYPE "TypeCommande" AS ENUM ('ACHAT_FOURNISSEUR', 'VENTE_CLIENT');

-- CreateEnum
CREATE TYPE "StatutCommande" AS ENUM ('BROUILLON', 'VALIDEE', 'RECUE', 'ANNULEE');

-- CreateEnum
CREATE TYPE "TypeMouvement" AS ENUM ('ENTREE', 'SORTIE', 'AJUSTEMENT');

-- CreateTable
CREATE TABLE "entreprises" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "adresse" TEXT NOT NULL,
    "devise" TEXT NOT NULL,
    "typeMetier" TEXT NOT NULL,
    "categorie" TEXT,
    "logo" TEXT,
    "couleurPrimaire" TEXT,
    "couleurSecondaire" TEXT,
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "entreprises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "utilisateurs" (
    "id" TEXT NOT NULL,
    "entrepriseId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "motDePasseHash" TEXT NOT NULL,
    "role" "RoleUtilisateur" NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "utilisateurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journal_actions" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "dateAction" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "details" TEXT,

    CONSTRAINT "journal_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fournisseurs" (
    "id" TEXT NOT NULL,
    "entrepriseId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "contact" TEXT,
    "adresse" TEXT,
    "delaiLivraisonJours" INTEGER,

    CONSTRAINT "fournisseurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produits" (
    "id" TEXT NOT NULL,
    "entrepriseId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "prixUnitaire" DECIMAL(12,2) NOT NULL,
    "quantiteStock" INTEGER NOT NULL DEFAULT 0,
    "seuilAlerte" INTEGER NOT NULL DEFAULT 0,
    "dateExpiration" TIMESTAMP(3),

    CONSTRAINT "produits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commandes" (
    "id" TEXT NOT NULL,
    "entrepriseId" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "fournisseurId" TEXT,
    "type" "TypeCommande" NOT NULL,
    "statut" "StatutCommande" NOT NULL DEFAULT 'BROUILLON',
    "dateCommande" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commandes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lignes_commande" (
    "id" TEXT NOT NULL,
    "commandeId" TEXT NOT NULL,
    "produitId" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL,
    "prixApplique" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "lignes_commande_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mouvements_stock" (
    "id" TEXT NOT NULL,
    "produitId" TEXT NOT NULL,
    "utilisateurId" TEXT,
    "type" "TypeMouvement" NOT NULL,
    "quantite" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "motif" TEXT,

    CONSTRAINT "mouvements_stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alertes" (
    "id" TEXT NOT NULL,
    "produitId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "dateGeneration" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lue" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "alertes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "charges" (
    "id" TEXT NOT NULL,
    "entrepriseId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "montant" DECIMAL(12,2) NOT NULL,
    "dateEcheance" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "charges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attributs_personnalises" (
    "id" TEXT NOT NULL,
    "entrepriseId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "typeChamp" TEXT NOT NULL,
    "entiteCible" TEXT NOT NULL,
    "obligatoire" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "attributs_personnalises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "valeurs_attributs" (
    "id" TEXT NOT NULL,
    "attributId" TEXT NOT NULL,
    "produitId" TEXT NOT NULL,
    "valeur" TEXT NOT NULL,

    CONSTRAINT "valeurs_attributs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "previsions_ia" (
    "id" TEXT NOT NULL,
    "produitId" TEXT NOT NULL,
    "dateGeneration" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "periode" TEXT NOT NULL,
    "quantitePrevue" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "previsions_ia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommandations_reappro" (
    "id" TEXT NOT NULL,
    "produitId" TEXT NOT NULL,
    "previsionId" TEXT,
    "dateGeneration" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "quantiteSuggeree" INTEGER NOT NULL,

    CONSTRAINT "recommandations_reappro_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_email_key" ON "utilisateurs"("email");

-- CreateIndex
CREATE INDEX "utilisateurs_entrepriseId_idx" ON "utilisateurs"("entrepriseId");

-- CreateIndex
CREATE INDEX "journal_actions_utilisateurId_idx" ON "journal_actions"("utilisateurId");

-- CreateIndex
CREATE INDEX "fournisseurs_entrepriseId_idx" ON "fournisseurs"("entrepriseId");

-- CreateIndex
CREATE INDEX "produits_entrepriseId_idx" ON "produits"("entrepriseId");

-- CreateIndex
CREATE INDEX "commandes_entrepriseId_idx" ON "commandes"("entrepriseId");

-- CreateIndex
CREATE INDEX "commandes_fournisseurId_idx" ON "commandes"("fournisseurId");

-- CreateIndex
CREATE INDEX "lignes_commande_commandeId_idx" ON "lignes_commande"("commandeId");

-- CreateIndex
CREATE INDEX "lignes_commande_produitId_idx" ON "lignes_commande"("produitId");

-- CreateIndex
CREATE INDEX "mouvements_stock_produitId_idx" ON "mouvements_stock"("produitId");

-- CreateIndex
CREATE INDEX "alertes_produitId_idx" ON "alertes"("produitId");

-- CreateIndex
CREATE INDEX "charges_entrepriseId_idx" ON "charges"("entrepriseId");

-- CreateIndex
CREATE INDEX "attributs_personnalises_entrepriseId_idx" ON "attributs_personnalises"("entrepriseId");

-- CreateIndex
CREATE INDEX "valeurs_attributs_attributId_idx" ON "valeurs_attributs"("attributId");

-- CreateIndex
CREATE INDEX "valeurs_attributs_produitId_idx" ON "valeurs_attributs"("produitId");

-- CreateIndex
CREATE INDEX "previsions_ia_produitId_idx" ON "previsions_ia"("produitId");

-- CreateIndex
CREATE INDEX "recommandations_reappro_produitId_idx" ON "recommandations_reappro"("produitId");

-- AddForeignKey
ALTER TABLE "utilisateurs" ADD CONSTRAINT "utilisateurs_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "entreprises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_actions" ADD CONSTRAINT "journal_actions_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fournisseurs" ADD CONSTRAINT "fournisseurs_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "entreprises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produits" ADD CONSTRAINT "produits_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "entreprises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commandes" ADD CONSTRAINT "commandes_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "entreprises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commandes" ADD CONSTRAINT "commandes_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commandes" ADD CONSTRAINT "commandes_fournisseurId_fkey" FOREIGN KEY ("fournisseurId") REFERENCES "fournisseurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lignes_commande" ADD CONSTRAINT "lignes_commande_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "commandes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lignes_commande" ADD CONSTRAINT "lignes_commande_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "produits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mouvements_stock" ADD CONSTRAINT "mouvements_stock_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "produits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mouvements_stock" ADD CONSTRAINT "mouvements_stock_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertes" ADD CONSTRAINT "alertes_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "produits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "charges" ADD CONSTRAINT "charges_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "entreprises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attributs_personnalises" ADD CONSTRAINT "attributs_personnalises_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "entreprises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "valeurs_attributs" ADD CONSTRAINT "valeurs_attributs_attributId_fkey" FOREIGN KEY ("attributId") REFERENCES "attributs_personnalises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "valeurs_attributs" ADD CONSTRAINT "valeurs_attributs_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "produits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "previsions_ia" ADD CONSTRAINT "previsions_ia_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "produits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommandations_reappro" ADD CONSTRAINT "recommandations_reappro_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "produits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommandations_reappro" ADD CONSTRAINT "recommandations_reappro_previsionId_fkey" FOREIGN KEY ("previsionId") REFERENCES "previsions_ia"("id") ON DELETE SET NULL ON UPDATE CASCADE;
