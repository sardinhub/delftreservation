import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { resolve } from "path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const dbUrl = process.env.DATABASE_URL;

  // Turso remote URL (libsql://...) or local file (file:...)
  if (dbUrl && dbUrl.startsWith("libsql://")) {
    // Cloud Turso — needs auth token
    const authToken = process.env.TURSO_AUTH_TOKEN || "";
    const adapter = new PrismaLibSql({
      url: dbUrl,
      authToken,
    });
    return new PrismaClient({ adapter });
  }

  // Local SQLite fallback
  const dbPath = resolve("dev.db");
  const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
