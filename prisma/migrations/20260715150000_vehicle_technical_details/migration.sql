-- Add optional technical specification fields for vehicle listings.
ALTER TABLE "Vehicle"
  ADD COLUMN "motor" TEXT,
  ADD COLUMN "range" TEXT,
  ADD COLUMN "battery" TEXT,
  ADD COLUMN "tireSize" TEXT,
  ADD COLUMN "topSpeed" TEXT,
  ADD COLUMN "chargeTime" TEXT;
