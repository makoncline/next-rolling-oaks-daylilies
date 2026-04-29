import { PrismaClient } from "./generated/sqlite-client";
import { createClient } from "@libsql/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";

declare global {
  var prisma: PrismaClient | undefined;
}

const createPrismaClient = () => {
  if (!process.env.TURSO_DATABASE_URL) {
    throw new Error("TURSO_DATABASE_URL is required to query the database.");
  }

  const libsql = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_DATABASE_AUTH_TOKEN || "",
  });

  // @ts-ignore - Type mismatch between @libsql/client versions
  const adapter = new PrismaLibSQL(libsql);

  // @ts-ignore - The adapter option is provided by the previewFeatures
  return new PrismaClient({ adapter });
};

const getPrismaClient = () => {
  if (!global.prisma) {
    global.prisma = createPrismaClient();
  }

  return global.prisma;
};

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const client = getPrismaClient();
    const value = Reflect.get(client, property);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
