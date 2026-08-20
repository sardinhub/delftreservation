import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  try {
    const dbUrl = process.env.DATABASE_URL;

    if (!dbUrl) {
      console.error("DATABASE_URL is not set");
      throw new Error("DATABASE_URL environment variable is not configured");
    }

    // Turso remote URL (libsql://...) or local file (file:...)
    if (dbUrl.startsWith("libsql://") || dbUrl.startsWith("https://")) {
      const authToken = process.env.TURSO_AUTH_TOKEN || "";
      const adapter = new PrismaLibSql({
        url: dbUrl,
        authToken,
      });
      return new PrismaClient({ adapter });
    }

    // Local SQLite fallback (file:./dev.db)
    const adapter = new PrismaLibSql({
      url: dbUrl,
    });
    return new PrismaClient({ adapter });
  } catch (error) {
    console.error("Failed to create Prisma client:", error);
    throw error;
  }
}

// In production, always create a fresh client (serverless functions).
// In development, reuse the same client across hot reloads.
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
