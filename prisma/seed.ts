import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { resolve } from "path";
import bcrypt from "bcryptjs";

function createPrismaClient() {
  const dbUrl = process.env.DATABASE_URL;

  if (dbUrl && dbUrl.startsWith("libsql://")) {
    const authToken = process.env.TURSO_AUTH_TOKEN || "";
    const adapter = new PrismaLibSql({ url: dbUrl, authToken });
    return new PrismaClient({ adapter });
  }

  const dbPath = resolve("dev.db");
  const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
  return new PrismaClient({ adapter });
}

const prisma = createPrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await prisma.payment.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.room.deleteMany();
  await prisma.admin.deleteMany();

  // Create 4 apartment rooms
  const rooms = await Promise.all([
    prisma.room.create({
      data: {
        name: "Room 101",
        description:
          "Kamar premium dengan pemandangan langsung ke laut CPI Makassar. Dilengkapi queen bed, AC, WiFi, dan kamar mandi pribadi.",
        price: 500000,
        floor: 1,
        status: "available",
        image: "/rooms/room-101.jpg",
      },
    }),
    prisma.room.create({
      data: {
        name: "Room 102",
        description:
          "Kamar nyaman di lantai 1 dengan dekorasi modern. Queen bed, AC, WiFi, dan kamar mandi pribadi. Cocok untuk pasangan.",
        price: 500000,
        floor: 1,
        status: "available",
        image: "/rooms/room-102.jpg",
      },
    }),
    prisma.room.create({
      data: {
        name: "Room 201",
        description:
          "Kamar mewah di lantai 2 dengan view kolam renang. King bed, Smart TV, AC, WiFi, dan balkon pribadi.",
        price: 650000,
        floor: 2,
        status: "available",
        image: "/rooms/room-201.jpg",
      },
    }),
    prisma.room.create({
      data: {
        name: "Room 202",
        description:
          "Suite eksklusif di lantai 2. King bed, ruang tamu kecil, Smart TV, AC, WiFi, dan balkon dengan sunset view.",
        price: 750000,
        floor: 2,
        status: "available",
        image: "/rooms/room-202.jpg",
      },
    }),
  ]);

  console.log(
    "✅ Created 4 rooms:",
    rooms.map((r) => r.name).join(", ")
  );

  // Create admin user (password: admin123)
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.admin.create({
    data: {
      username: "admin",
      password: hashedPassword,
      name: "Delft Admin",
      role: "superadmin",
    },
  });

  console.log("✅ Created admin user:", admin.username);
  console.log("🎉 Seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
