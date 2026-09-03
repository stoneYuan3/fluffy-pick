-- CreateEnum
CREATE TYPE "FoodStatus" AS ENUM ('normal', 'active');

-- CreateTable
CREATE TABLE "foods" (
    "id" SERIAL NOT NULL,
    "creator_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "photos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "FoodStatus" NOT NULL DEFAULT 'normal',
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_active_at" TIMESTAMP(3),
    "active_number" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "foods_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "foods" ADD CONSTRAINT "foods_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
