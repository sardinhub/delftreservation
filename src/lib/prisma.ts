import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    throw new Error(
      "DATABASE_URL environment variable is not configured. " +
      "Please set it in your Vercel project settings."
    );
  }

  // Dynamically import adapter-libsql only when needed
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaLibSql } = require("@prisma/adapter-libsql");

  const adapter = new PrismaLibSql({
    url: dbUrl,
    authToken: process.env.TURSO_AUTH_TOKEN || "",
  });

  return new PrismaClient({ adapter });
}

function getPrisma(): PrismaClient {
  if (process.env.NODE_ENV !== "production") {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = createPrismaClient();
    }
    return globalForPrisma.prisma;
  }
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

// Lazy singleton — client is only created on first actual use, not at import time
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, _receiver) {
    const client = getPrisma();
    const value = Reflect.get(client, prop, client);
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});
