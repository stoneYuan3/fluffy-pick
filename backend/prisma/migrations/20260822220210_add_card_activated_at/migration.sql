-- DropIndex
DROP INDEX "cards_name_key";

-- AlterTable
ALTER TABLE "cards" ADD COLUMN     "activated_at" TIMESTAMP(3);
