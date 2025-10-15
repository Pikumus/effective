/*
  Warnings:

  - Made the column `role` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `status` on table `users` required. This step will fail if there are existing NULL values in that column.

*/

-- Update existing NULL values
UPDATE "users" SET "role" = 'user' WHERE "role" IS NULL;
UPDATE "users" SET "status" = true WHERE "status" IS NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "role" SET NOT NULL,
ALTER COLUMN "role" SET DEFAULT 'user',
ALTER COLUMN "status" SET NOT NULL,
ALTER COLUMN "status" SET DEFAULT true;
