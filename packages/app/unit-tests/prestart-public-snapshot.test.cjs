const assert = require("node:assert/strict");
const { execFile } = require("node:child_process");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { promisify } = require("node:util");
const test = require("node:test");

const execFileAsync = promisify(execFile);

test("startup accepts a current schema 4 snapshot", async (t) => {
  const snapshotDir = await fs.mkdtemp(
    path.join(os.tmpdir(), "rolling-oaks-prestart-snapshot-")
  );
  t.after(() => fs.rm(snapshotDir, { recursive: true, force: true }));

  const generatedAt = new Date().toISOString();
  const version = "current-schema";
  const snapshotName = `public-snapshot.${version}.json`;
  const snapshot = {
    schemaVersion: 4,
    version,
    generatedAt,
  };
  const manifest = {
    ...snapshot,
    path: snapshotName,
  };

  await Promise.all([
    fs.writeFile(
      path.join(snapshotDir, snapshotName),
      JSON.stringify(snapshot),
      "utf8"
    ),
    fs.writeFile(
      path.join(snapshotDir, "manifest.json"),
      JSON.stringify(manifest),
      "utf8"
    ),
  ]);

  const scriptPath = path.join(
    __dirname,
    "../scripts/prestart-public-snapshot.cjs"
  );
  const { stdout } = await execFileAsync(
    process.execPath,
    [scriptPath, "bootstrap"],
    {
      env: {
        ...process.env,
        PUBLIC_SNAPSHOT_DIR: snapshotDir,
      },
    }
  );

  assert.match(stdout, /"event":"public_snapshot_existing_loaded"/);
  assert.doesNotMatch(stdout, /"event":"public_snapshot_missing"/);
});
