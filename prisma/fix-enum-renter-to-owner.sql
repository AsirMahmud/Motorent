-- Run this ONCE against your database *before* `prisma db push` if push fails with:
--   invalid input value for enum "UserRole_new": "RENTER"
--
-- It renames the enum label in place; all existing rows with role RENTER become OWNER.
-- Requires PostgreSQL 10+ (ALTER TYPE ... RENAME VALUE).
--
-- Example:
--   psql "$DATABASE_URL" -f prisma/fix-enum-renter-to-owner.sql
--   npx prisma db execute --file prisma/fix-enum-renter-to-owner.sql

ALTER TYPE "UserRole" RENAME VALUE 'RENTER' TO 'OWNER';
