import { createClient } from "@libsql/client";
import "dotenv/config";

const client = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function main() {
  try {
    await client.execute("ALTER TABLE Reservation ADD COLUMN dpAmount INTEGER DEFAULT 0");
    console.log("✅ dpAmount column added");
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("already exists")) {
      console.log("ℹ️ dpAmount column already exists");
    } else {
      console.error("Error:", msg);
    }
  }

  const result = await client.execute("PRAGMA table_info(Reservation)");
  console.log("Columns:", result.rows.map((r) => r.name).join(", "));
}

main();
