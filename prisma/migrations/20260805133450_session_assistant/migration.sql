-- CreateEnum
CREATE TYPE "RoleMessageAssistant" AS ENUM ('UTILISATEUR', 'ASSISTANT');

-- CreateTable
CREATE TABLE "sessions_assistant" (
    "id" TEXT NOT NULL,
    "entrepriseId" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "derniereActivite" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_assistant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages_assistant" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "role" "RoleMessageAssistant" NOT NULL,
    "contenu" TEXT NOT NULL,
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_assistant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sessions_assistant_entrepriseId_utilisateurId_idx" ON "sessions_assistant"("entrepriseId", "utilisateurId");

-- CreateIndex
CREATE INDEX "messages_assistant_sessionId_idx" ON "messages_assistant"("sessionId");

-- AddForeignKey
ALTER TABLE "sessions_assistant" ADD CONSTRAINT "sessions_assistant_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "entreprises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions_assistant" ADD CONSTRAINT "sessions_assistant_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages_assistant" ADD CONSTRAINT "messages_assistant_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "sessions_assistant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
