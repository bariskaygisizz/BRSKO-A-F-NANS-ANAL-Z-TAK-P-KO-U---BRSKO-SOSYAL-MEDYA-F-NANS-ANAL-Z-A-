import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  // Production: prefer Turso cloud, fallback to /tmp (ephemeral but works per Lambda)
  const url =
    process.env.TURSO_DATABASE_URL ||
    (process.env.NODE_ENV === "production"
      ? "file:/tmp/brskoistai.db"
      : `file:${path.resolve(process.cwd(), "dev.db")}`);

  const authToken = process.env.TURSO_AUTH_TOKEN;
  const adapter = new PrismaLibSql(authToken ? { url, authToken } : { url });
  return new PrismaClient({ adapter } as any);
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
