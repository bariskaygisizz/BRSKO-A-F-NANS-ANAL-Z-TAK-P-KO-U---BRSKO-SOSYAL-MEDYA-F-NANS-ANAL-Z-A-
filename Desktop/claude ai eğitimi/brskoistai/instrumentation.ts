export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { prisma } = await import("@/lib/db");
    // Auto-create tables for /tmp SQLite on cold start
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT,
        "email" TEXT NOT NULL UNIQUE,
        "emailVerified" DATETIME,
        "image" TEXT,
        "password" TEXT,
        "plan" TEXT NOT NULL DEFAULT 'free',
        "credits" INTEGER NOT NULL DEFAULT 999,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `).catch(() => {});
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Account" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "provider" TEXT NOT NULL,
        "providerAccountId" TEXT NOT NULL,
        "refresh_token" TEXT,
        "access_token" TEXT,
        "expires_at" INTEGER,
        "token_type" TEXT,
        "scope" TEXT,
        "id_token" TEXT,
        "session_state" TEXT,
        UNIQUE("provider","providerAccountId"),
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
      )
    `).catch(() => {});
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Session" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "sessionToken" TEXT NOT NULL UNIQUE,
        "userId" TEXT NOT NULL,
        "expires" DATETIME NOT NULL,
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
      )
    `).catch(() => {});
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "VerificationToken" (
        "identifier" TEXT NOT NULL,
        "token" TEXT NOT NULL UNIQUE,
        "expires" DATETIME NOT NULL,
        UNIQUE("identifier","token")
      )
    `).catch(() => {});
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Video" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "prompt" TEXT NOT NULL,
        "imageUrl" TEXT,
        "videoUrl" TEXT,
        "status" TEXT NOT NULL DEFAULT 'pending',
        "platform" TEXT NOT NULL DEFAULT 'all',
        "falJobId" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
      )
    `).catch(() => {});
  }
}
