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
    totalHosts,
    totalAdmins,
    pendingOwnerVerifications,
    pendingVehicles,
    totalVehicles,
    approvedVehicles,
    rejectedVehicles,
  ] = await Promise.all([
    db.user.count({ where: { role: "OWNER" } }),
    db.user.count({ where: { role: "GENERAL" } }),
    db.user.count({ where: { role: "ADMIN" } }),
    db.user.count({
      where: { role: "OWNER", verificationStatus: "PENDING" },
    }),
    db.vehicle.count({ where: { status: "PENDING" } }),
    db.vehicle.count(),
    db.vehicle.count({ where: { status: "APPROVED" } }),
    db.vehicle.count({ where: { status: "REJECTED" } }),
  ]);

  const totalPlatformUsers = totalOwners + totalHosts;

  return NextResponse.json({
    totalPlatformUsers,
    owners: totalOwners,
    hosts: totalHosts,
    admins: totalAdmins,
    pendingOwnerVerifications,
    pendingVehicles,
    totalVehicles,
    approvedVehicles,
    rejectedVehicles,
  });
}
