-- Rename legacy enum value RENTER → OWNER (PostgreSQL 10+). Safe if RENTER is absent (no-op DO block).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'UserRole' AND e.enumlabel = 'RENTER'
  ) THEN
    ALTER TYPE "UserRole" RENAME VALUE 'RENTER' TO 'OWNER';
  END IF;
END $$;
