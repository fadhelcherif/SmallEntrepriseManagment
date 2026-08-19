-- CreateTable
CREATE TABLE "tokens_confirmation_commande" (
    "id" TEXT NOT NULL,
    "commandeId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "dateExpiration" TIMESTAMP(3) NOT NULL,
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tokens_confirmation_commande_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tokens_confirmation_commande_token_key" ON "tokens_confirmation_commande"("token");

-- CreateIndex
CREATE INDEX "tokens_confirmation_commande_commandeId_idx" ON "tokens_confirmation_commande"("commandeId");

-- AddForeignKey
ALTER TABLE "tokens_confirmation_commande" ADD CONSTRAINT "tokens_confirmation_commande_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "commandes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
