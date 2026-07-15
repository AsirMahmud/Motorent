-- Repair databases where the technical-details migration was marked applied
-- before the physical columns existed.
ALTER TABLE "Vehicle"
  ADD COLUMN IF NOT EXISTS "motor" TEXT,
  ADD COLUMN IF NOT EXISTS "range" TEXT,
  ADD COLUMN IF NOT EXISTS "battery" TEXT,
  ADD COLUMN IF NOT EXISTS "tireSize" TEXT,
  ADD COLUMN IF NOT EXISTS "topSpeed" TEXT,
  ADD COLUMN IF NOT EXISTS "chargeTime" TEXT;
