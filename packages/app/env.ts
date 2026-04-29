import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  client: {
    NEXT_PUBLIC_S3_RESIZED_IMAGE_BUCKET: z
      .string()
      .trim()
      .min(1)
      .transform((value) =>
        value.replace(/^https?:\/\//, "").replace(/\/+$/, "")
      ),
  },
  runtimeEnv: {
    NEXT_PUBLIC_S3_RESIZED_IMAGE_BUCKET:
      process.env.NEXT_PUBLIC_S3_RESIZED_IMAGE_BUCKET,
  },
  emptyStringAsUndefined: true,
});
