import { createClient } from "@libsql/client";

const url = process.env.DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("DATABASE_URL and TURSO_AUTH_TOKEN required");
  process.exit(1);
}

const client = createClient({ url, authToken });

async function pushSchema() {
  console.log("Connecting to Turso...");

  // Add roomType column (idempotent)
  try {
    await client.execute({
      sql: 'ALTER TABLE Reservation ADD COLUMN roomType TEXT NOT NULL DEFAULT ""',
      args: [],
    });
    console.log("✅ Added roomType column");
  } catch (e: any) {
    if (e.message?.includes("already exists")) {
      console.log("ℹ️ roomType column already exists");
    } else {
      console.error("Error:", e.message);
    }
  }

  // Add roomNumber column (idempotent)
  try {
    await client.execute({
      sql: 'ALTER TABLE Reservation ADD COLUMN roomNumber TEXT NOT NULL DEFAULT ""',
      args: [],
    });
    console.log("✅ Added roomNumber column");
  } catch (e: any) {
    if (e.message?.includes("already exists")) {
      console.log("ℹ️ roomNumber column already exists");
    } else {
      console.error("Error:", e.message);
    }
  }

  console.log("\n✅ Schema update complete");

  // Verify
  const result = await client.execute("PRAGMA table_info(Reservation)");
  console.log("\nReservation columns:");
  for (const row of result.rows) {
    console.log(`  ${row.name} (${row.type})`);
  }
}

pushSchema().catch(console.error);
