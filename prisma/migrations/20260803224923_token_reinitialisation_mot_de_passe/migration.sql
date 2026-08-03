-- CreateTable
CREATE TABLE "tokens_reinitialisation_mot_de_passe" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "dateExpiration" TIMESTAMP(3) NOT NULL,
    "utilise" BOOLEAN NOT NULL DEFAULT false,
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tokens_reinitialisation_mot_de_passe_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tokens_reinitialisation_mot_de_passe_token_key" ON "tokens_reinitialisation_mot_de_passe"("token");

-- CreateIndex
CREATE INDEX "tokens_reinitialisation_mot_de_passe_utilisateurId_idx" ON "tokens_reinitialisation_mot_de_passe"("utilisateurId");

-- AddForeignKey
ALTER TABLE "tokens_reinitialisation_mot_de_passe" ADD CONSTRAINT "tokens_reinitialisation_mot_de_passe_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
