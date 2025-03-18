import { PrismaClient } from "./generated/sqlite-client";
import { createClient } from "@libsql/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";

// We'll need to update this to support Turso in a different way
// For now, this uses the local SQLite database

declare global {
  var prisma: PrismaClient | undefined;
}

// Create Turso client
const libsql = createClient({
  url: process.env.TURSO_DATABASE_URL || "",
  authToken: process.env.TURSO_DATABASE_AUTH_TOKEN || "",
});

// Create adapter
const adapter = new PrismaLibSQL(libsql);

// Create Prisma client with adapter
// @ts-ignore - The adapter option is provided by the previewFeatures
export const prisma = global.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;

// For future reference, once you upgrade to a newer Prisma version that supports driverAdapters:
//
// import { createClient } from "@libsql/client";
// import { PrismaLibSQL } from "@prisma/adapter-libsql";
//
// const libsql = createClient({
//   url: process.env.TURSO_DATABASE_URL || "",
//   authToken: process.env.TURSO_DATABASE_AUTH_TOKEN,
// });
//
// const adapter = new PrismaLibSQL(libsql);
// export const prisma = global.prisma || new PrismaClient({ adapter });
