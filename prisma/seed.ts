import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@motorent.com";
  const adminPassword = "Admin@123";
  const passwordHash = await bcrypt.hash(adminPassword, 12);
  const demoPasswordHash = await bcrypt.hash("Demo@123", 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      role: "ADMIN",
      verificationStatus: "APPROVED",
    },
    create: {
      fullName: "System Admin",
      email: adminEmail,
      phone: "+8801800000000",
      passwordHash,
      role: "ADMIN",
      verificationStatus: "APPROVED",
    },
  });

  const owner = await prisma.user.upsert({
    where: { email: "owner@motorent.com" },
    update: {
      fullName: "MotoRent Demo Owner",
      phone: "+8801700000001",
      passwordHash: demoPasswordHash,
      role: "OWNER",
      verificationStatus: "APPROVED",
    },
    create: {
      id: "demo-owner",
      fullName: "MotoRent Demo Owner",
      email: "owner@motorent.com",
      phone: "+8801700000001",
      passwordHash: demoPasswordHash,
      role: "OWNER",
      verificationStatus: "APPROVED",
      nidOrPassportUrl: "/placeholder.jpg",
      drivingLicenseUrl: "/placeholder.jpg",
      ownershipPaperUrl: "/placeholder.jpg",
      passportPhotoUrl: "/placeholder-user.jpg",
    },
  });

  await prisma.user.upsert({
    where: { email: "renter@motorent.com" },
    update: {
      fullName: "MotoRent Demo Renter",
      phone: "+8801700000002",
      passwordHash: demoPasswordHash,
      role: "GENERAL",
      verificationStatus: "APPROVED",
    },
    create: {
      id: "demo-renter",
      fullName: "MotoRent Demo Renter",
      email: "renter@motorent.com",
      phone: "+8801700000002",
      passwordHash: demoPasswordHash,
      role: "GENERAL",
      verificationStatus: "APPROVED",
      nidOrPassportUrl: "/placeholder.jpg",
      drivingLicenseUrl: "/placeholder.jpg",
    },
  });

  const demoVehicles = [
    {
      id: "demo-bike-yamaha-r15",
      category: "BIKE" as const,
      brand: "Yamaha",
      model: "R15 V4",
      year: 2024,
      registrationNumber: "DHAKA-METRO-LA-12-3456",
      location: "Banani, Dhaka",
      latitude: 23.7937,
      longitude: 90.4066,
      seats: 2,
      fuelType: "gasoline",
      transmission: "manual",
      description: "A responsive sports bike for city rides and weekend trips.",
      features: ["Dual ABS", "LED lights", "Digital console"],
      dailyRate: 1500,
      priceHourly: 220,
      priceWeekly: 9000,
      vehiclePhotoUrl: "/hero-bike.png",
    },
    {
      id: "demo-car-toyota-premio",
      category: "CAR" as const,
      brand: "Toyota",
      model: "Premio",
      year: 2022,
      registrationNumber: "DHAKA-METRO-GA-21-9876",
      location: "Gulshan, Dhaka",
      latitude: 23.7925,
      longitude: 90.4078,
      seats: 5,
      fuelType: "gasoline",
      transmission: "automatic",
      description: "A comfortable automatic sedan for family and business travel.",
      features: ["AC", "Rear camera", "Bluetooth"],
      dailyRate: 4200,
      priceHourly: 600,
      priceWeekly: 25000,
      vehiclePhotoUrl: "/category-car.png",
    },
    {
      id: "demo-bike-honda-activa",
      category: "BIKE" as const,
      brand: "Honda",
      model: "Activa 6G",
      year: 2023,
      registrationNumber: "DHAKA-METRO-HA-45-6789",
      location: "Dhanmondi, Dhaka",
      latitude: 23.7461,
      longitude: 90.3742,
      seats: 2,
      fuelType: "gasoline",
      transmission: "automatic",
      description: "An easy, fuel-efficient scooter for everyday city movement.",
      features: ["Easy ride", "Fuel saver", "Storage"],
      dailyRate: 950,
      priceHourly: 120,
      priceWeekly: 5700,
      vehiclePhotoUrl: "/hero-bike.png",
    },
    {
      id: "demo-car-toyota-harrier",
      category: "CAR" as const,
      brand: "Toyota",
      model: "Harrier",
      year: 2023,
      registrationNumber: "DHAKA-METRO-TA-18-5432",
      location: "Uttara, Dhaka",
      latitude: 23.8759,
      longitude: 90.3795,
      seats: 5,
      fuelType: "hybrid",
      transmission: "automatic",
      description: "A premium hybrid SUV with space for comfortable long trips.",
      features: ["Hybrid", "AC", "Premium interior"],
      dailyRate: 6500,
      priceHourly: 900,
      priceWeekly: 39000,
      vehiclePhotoUrl: "/category-car.png",
    },
  ];

  for (const vehicle of demoVehicles) {
    await prisma.vehicle.upsert({
      where: { id: vehicle.id },
      update: {
        ...vehicle,
        ownerId: owner.id,
        ownershipPaperUrl: "/placeholder.jpg",
        insurancePaperUrl: "/placeholder.jpg",
        status: "APPROVED",
      },
      create: {
        ...vehicle,
        ownerId: owner.id,
        ownershipPaperUrl: "/placeholder.jpg",
        insurancePaperUrl: "/placeholder.jpg",
        status: "APPROVED",
      },
    });
  }

  console.log("Seed complete");
  console.log(`Admin login: ${adminEmail} / ${adminPassword}`);
  console.log("Owner login: owner@motorent.com / Demo@123");
  console.log("Renter login: renter@motorent.com / Demo@123");
  console.log(`Seeded ${demoVehicles.length} approved demo vehicles for ${owner.fullName}`);
  void admin;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
