import { PrismaClient } from "./generated/sqlite-client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

declare global {
  var prisma: PrismaClient | undefined;
}

const createPrismaClient = () => {
  if (!process.env.TURSO_DATABASE_URL) {
    throw new Error("TURSO_DATABASE_URL is required to query the database.");
  }

  const adapter = new PrismaLibSql({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_DATABASE_AUTH_TOKEN || "",
  });

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
