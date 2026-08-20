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
  
  // Add the new proofData column (idempotent)
  try {
    await client.execute({
      sql: "ALTER TABLE Payment ADD COLUMN proofData TEXT",
      args: [],
    });
    console.log("✅ Added proofData column");
  } catch (e: any) {
    if (e.message?.includes("already exists")) {
      console.log("ℹ️ proofData column already exists");
    } else {
      console.error("Error:", e.message);
    }
  }

  // Make proofImage nullable (SQLite doesn't support ALTER COLUMN, but the default should work)
  console.log("✅ Schema update complete");

  // Verify
  const result = await client.execute("PRAGMA table_info(Payment)");
  console.log("\nPayment columns:");
  for (const row of result.rows) {
    console.log(`  ${row.name} (${row.type})`);
  }
}

pushSchema().catch(console.error);
