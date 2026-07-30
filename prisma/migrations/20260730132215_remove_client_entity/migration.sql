/*
  Warnings:

  - You are about to drop the column `clientId` on the `commandes` table. All the data in the column will be lost.
  - You are about to drop the `clients` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "clients" DROP CONSTRAINT "clients_entrepriseId_fkey";

-- DropForeignKey
ALTER TABLE "commandes" DROP CONSTRAINT "commandes_clientId_fkey";

-- DropIndex
DROP INDEX "commandes_clientId_idx";

-- AlterTable
ALTER TABLE "commandes" DROP COLUMN "clientId";

-- DropTable
DROP TABLE "clients";
