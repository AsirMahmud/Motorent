-- Align Postgres enum with prisma/schema.prisma (GENERAL, OWNER, ADMIN).
-- Run if you see: Value 'OWNER' not found in enum 'UserRole'

-- 1) Prefer renaming legacy RENTER → OWNER (keeps existing rows valid)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'UserRole' AND e.enumlabel = 'RENTER'
  ) THEN
    ALTER TYPE "UserRole" RENAME VALUE 'RENTER' TO 'OWNER';
  END IF;
END $$;

-- 2) If OWNER is still missing (e.g. odd DB state), add it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'UserRole' AND e.enumlabel = 'OWNER'
  ) THEN
    ALTER TYPE "UserRole" ADD VALUE 'OWNER';
  END IF;
END $$;
