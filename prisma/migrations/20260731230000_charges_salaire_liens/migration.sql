-- AlterTable
ALTER TABLE "charges" ADD COLUMN     "fournisseurId" TEXT,
ADD COLUMN     "recurrente" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "utilisateurId" TEXT;

-- AlterTable
ALTER TABLE "utilisateurs" ADD COLUMN     "salaire" DECIMAL(12,2);

-- CreateIndex
CREATE INDEX "charges_utilisateurId_idx" ON "charges"("utilisateurId");

-- CreateIndex
CREATE INDEX "charges_fournisseurId_idx" ON "charges"("fournisseurId");

-- AddForeignKey
ALTER TABLE "charges" ADD CONSTRAINT "charges_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "charges" ADD CONSTRAINT "charges_fournisseurId_fkey" FOREIGN KEY ("fournisseurId") REFERENCES "fournisseurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
