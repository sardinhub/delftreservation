import { createClient, type Client } from "@libsql/client";

const globalForPrisma = globalThis as unknown as {
  db: Client | undefined;
};

function createDb(): Client {
  const dbUrl = process.env.DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!dbUrl || !authToken) {
    throw new Error("DATABASE_URL and TURSO_AUTH_TOKEN must be set");
  }

  return createClient({ url: dbUrl, authToken });
}

function getDb(): Client {
  if (process.env.NODE_ENV !== "production") {
    if (!globalForPrisma.db) {
      globalForPrisma.db = createDb();
    }
    return globalForPrisma.db;
  }
  if (!globalForPrisma.db) {
    globalForPrisma.db = createDb();
  }
  return globalForPrisma.db;
}

export const db = new Proxy({} as Client, {
  get(_target, prop) {
    const client = getDb();
    const value = Reflect.get(client, prop, client);
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});
