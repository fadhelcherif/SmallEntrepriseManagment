-- Data already backfilled from "prixUnitaire" into "prixAchat" and "prixVente" before this migration.
ALTER TABLE "produits" ALTER COLUMN "prixAchat" SET NOT NULL;
ALTER TABLE "produits" ALTER COLUMN "prixVente" SET NOT NULL;
ALTER TABLE "produits" DROP COLUMN "prixUnitaire";
