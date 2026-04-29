import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../prisma/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      ok: true,
      service: "rolling-oaks-daylilies",
      checks: {
        database: true,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(503).json({
      ok: false,
      service: "rolling-oaks-daylilies",
      checks: {
        database: false,
      },
    });
  }
}
