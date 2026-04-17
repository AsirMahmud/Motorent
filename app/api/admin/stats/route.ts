import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { db } from "@/lib/server/db";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [
    totalOwners,
    totalRenters,
    totalAdmins,
    pendingOwnerVerifications,
    pendingRenterVerifications,
    pendingVehicles,
    totalVehicles,
    approvedVehicles,
    rejectedVehicles,
    totalBookings,
    activeBookings,
    completedBookings,
  ] = await Promise.all([
    db.user.count({ where: { role: "OWNER" } }),
    db.user.count({ where: { role: "GENERAL" } }),
    db.user.count({ where: { role: "ADMIN" } }),
    db.user.count({ where: { role: "OWNER", verificationStatus: "PENDING" } }),
    db.user.count({ where: { role: "GENERAL", verificationStatus: "PENDING" } }),
    db.vehicle.count({ where: { status: "PENDING" } }),
    db.vehicle.count(),
    db.vehicle.count({ where: { status: "APPROVED" } }),
    db.vehicle.count({ where: { status: "REJECTED" } }),
    db.booking.count(),
    db.booking.count({ where: { status: "ACCEPTED" } }),
    db.booking.count({ where: { status: "COMPLETED" } }),
  ]);

  const totalPlatformUsers = totalOwners + totalRenters;

  return NextResponse.json({
    totalPlatformUsers,
    owners: totalOwners,
    hosts: totalRenters,
    renters: totalRenters,
    admins: totalAdmins,
    pendingOwnerVerifications,
    pendingRenterVerifications,
    pendingVehicles,
    totalVehicles,
    approvedVehicles,
    rejectedVehicles,
    totalBookings,
    activeBookings,
    completedBookings,
  });
}
