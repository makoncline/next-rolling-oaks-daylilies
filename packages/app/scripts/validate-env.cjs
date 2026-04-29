const { createJiti } = require("jiti");
const { loadEnvConfig } = require("@next/env");

const jiti = createJiti(__filename);

async function main() {
  loadEnvConfig(process.cwd());
  await jiti.import("../env.ts");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
