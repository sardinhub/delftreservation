import "dotenv/config";
import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";

const TURSO_URL = process.env.DATABASE_URL!;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN!;

if (!TURSO_URL || !TURSO_TOKEN) {
  console.error("❌ DATABASE_URL and TURSO_AUTH_TOKEN must be set in .env");
  process.exit(1);
}

const client = createClient({
  url: TURSO_URL,
  authToken: TURSO_TOKEN,
});

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS "Room" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "image" TEXT,
    "floor" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'available',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS "Reservation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "guestName" TEXT NOT NULL,
    "guestNik" TEXT NOT NULL,
    "guestPhone" TEXT NOT NULL,
    "guestEmail" TEXT,
    "checkIn" DATETIME NOT NULL,
    "checkOut" DATETIME NOT NULL,
    "totalNights" INTEGER NOT NULL,
    "totalPrice" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending_approval',
    "accessCode" TEXT,
    "invoiceNumber" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "roomId" TEXT NOT NULL,
    CONSTRAINT "Reservation_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "amount" INTEGER NOT NULL,
    "proofImage" TEXT NOT NULL,
    "bankName" TEXT,
    "accountName" TEXT,
    "transferDate" DATETIME,
    "verifiedByAdmin" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "reservationId" TEXT NOT NULL,
    CONSTRAINT "Payment_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Admin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "Payment_reservationId_key" ON "Payment"("reservationId");
CREATE UNIQUE INDEX IF NOT EXISTS "Admin_username_key" ON "Admin"("username");
`;

function generateId(): string {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).substring(2, 15)
  );
}

async function main() {
  console.log("🚀 Pushing schema to Turso...");

  // Execute each statement separately (Turso doesn't support multiple statements in one call)
  const statements = SCHEMA_SQL.split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const stmt of statements) {
    try {
      await client.execute(stmt);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      // Ignore "table already exists" errors
      if (!msg.includes("already exists")) {
        console.error("Error executing:", msg);
      }
    }
  }

  console.log("✅ Schema pushed to Turso");

  // Seed data
  console.log("🌱 Seeding data...");

  // Clear existing data
  await client.execute("DELETE FROM Payment");
  await client.execute("DELETE FROM Reservation");
  await client.execute("DELETE FROM Room");
  await client.execute("DELETE FROM Admin");

  const rooms = [
    { id: generateId(), name: "Room 101", description: "Kamar premium dengan pemandangan langsung ke laut CPI Makassar. Dilengkapi queen bed, AC, WiFi, dan kamar mandi pribadi.", price: 500000, floor: 1, status: "available", image: "/rooms/room-101.jpg" },
    { id: generateId(), name: "Room 102", description: "Kamar nyaman di lantai 1 dengan dekorasi modern. Queen bed, AC, WiFi, dan kamar mandi pribadi. Cocok untuk pasangan.", price: 500000, floor: 1, status: "available", image: "/rooms/room-102.jpg" },
    { id: generateId(), name: "Room 201", description: "Kamar mewah di lantai 2 dengan view kolam renang. King bed, Smart TV, AC, WiFi, dan balkon pribadi.", price: 650000, floor: 2, status: "available", image: "/rooms/room-201.jpg" },
    { id: generateId(), name: "Room 202", description: "Suite eksklusif di lantai 2. King bed, ruang tamu kecil, Smart TV, AC, WiFi, dan balkon dengan sunset view.", price: 750000, floor: 2, status: "available", image: "/rooms/room-202.jpg" },
  ];

  for (const room of rooms) {
    await client.execute({
      sql: `INSERT INTO Room (id, name, description, price, floor, status, image, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      args: [room.id, room.name, room.description, room.price, room.floor, room.status, room.image],
    });
  }
  console.log("✅ Created 4 rooms");

  // Create admin (password: admin123)
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const adminId = generateId();
  await client.execute({
    sql: `INSERT INTO Admin (id, username, password, name, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    args: [adminId, "admin", hashedPassword, "Delft Admin", "superadmin"],
  });
  console.log("✅ Created admin user (admin/admin123)");
  console.log("🎉 Turso database ready!");
}

main().catch((e) => {
  console.error("❌ Failed:", e);
  process.exit(1);
});
