import { createClient } from "@libsql/client";
import { customAlphabet } from "nanoid";
import bcrypt from "bcryptjs";

const generateId = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 25);

const url = process.env.DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("DATABASE_URL and TURSO_AUTH_TOKEN required");
  process.exit(1);
}

const client = createClient({ url, authToken });

async function seed() {
  console.log("🌱 Seeding database...");

  // Create rooms
  const rooms = [
    { id: generateId(), name: "Room 101", description: "Kamar nyaman di lantai 1. Queen bed, AC, WiFi, dan kamar mandi pribadi." },
    { id: generateId(), name: "Room 102", description: "Kamar di lantai 1 dengan dekorasi modern. Queen bed, AC, WiFi, dan kamar mandi pribadi." },
    { id: generateId(), name: "Room 201", description: "Kamar premium di lantai 2 dengan pemandangan kota. King bed, AC, WiFi, dan bathtub." },
    { id: generateId(), name: "Room 202", description: "Kamar executive di lantai 2. King bed, AC, WiFi, workspace, dan bathtub." },
  ];

  for (const room of rooms) {
    await client.execute({
      sql: "INSERT INTO Room (id, name, description) VALUES (?, ?, ?)",
      args: [room.id, room.name, room.description],
    });
    console.log(`  ✅ Room: ${room.name}`);
  }

  // Create admin
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const adminId = generateId();
  await client.execute({
    sql: "INSERT INTO Admin (id, username, password, name, role) VALUES (?, ?, ?, ?, ?)",
    args: [adminId, "admin", hashedPassword, "Administrator", "admin"],
  });
  console.log("  ✅ Admin: admin / admin123");

  console.log("\n🎉 Seed complete!");
}

seed().catch(console.error);
