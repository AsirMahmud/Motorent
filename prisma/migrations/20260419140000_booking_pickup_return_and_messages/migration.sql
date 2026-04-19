-- Booking fields referenced by API (pickup/return/settlement/tracking)
ALTER TABLE "Booking" ADD COLUMN "pickedUpAt" TIMESTAMP(3),
ADD COLUMN "returnedAt" TIMESTAMP(3),
ADD COLUMN "returnCondition" TEXT,
ADD COLUMN "returnNotes" TEXT,
ADD COLUMN "lateFee" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "damageFee" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "finalAmount" INTEGER,
ADD COLUMN "paymentReceivedAt" TIMESTAMP(3),
ADD COLUMN "renterLat" DOUBLE PRECISION,
ADD COLUMN "renterLng" DOUBLE PRECISION,
ADD COLUMN "renterLocUpdatedAt" TIMESTAMP(3);

-- Per-booking chat (GET/POST /api/chat)
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Message_bookingId_idx" ON "Message"("bookingId");

ALTER TABLE "Message" ADD CONSTRAINT "Message_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Direct inbox (GET/POST /api/direct-messages)
CREATE TABLE "DirectMessage" (
    "id" TEXT NOT NULL,
    "fromId" TEXT NOT NULL,
    "toId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DirectMessage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "DirectMessage_fromId_toId_idx" ON "DirectMessage"("fromId", "toId");
CREATE INDEX "DirectMessage_toId_read_idx" ON "DirectMessage"("toId", "read");

ALTER TABLE "DirectMessage" ADD CONSTRAINT "DirectMessage_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DirectMessage" ADD CONSTRAINT "DirectMessage_toId_fkey" FOREIGN KEY ("toId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
