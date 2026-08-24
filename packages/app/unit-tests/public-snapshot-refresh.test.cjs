const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { createJiti } = require("jiti");

const jiti = createJiti(__filename);
const publicSnapshot = jiti("../lib/publicSnapshot.ts");

const delay = (delayMs) =>
  new Promise((resolve) => setTimeout(resolve, delayMs));

const waitFor = async (predicate, message) => {
  const deadline = Date.now() + 1_000;
  while (Date.now() < deadline) {
    if (predicate()) {
      return;
    }

    await delay(5);
  }

  throw new Error(message);
};

const createSnapshot = ({ generatedAt, version }) => ({
  schemaVersion: 4,
  version,
  generatedAt,
  userId: "3",
  catalogsBySlug: {},
  cardsById: {},
  detailsBySlug: {},
  sitemapEntries: [],
  counts: {
    visibleListings: 0,
    forSaleVisibleListings: 0,
    catalogs: 0,
    visibleListingImages: 0,
  },
});

const setupTestSnapshotDir = async (t) => {
  const snapshotDir = await fs.mkdtemp(
    path.join(os.tmpdir(), "rolling-oaks-public-snapshot-")
  );
  const previousEnv = {
    PUBLIC_SNAPSHOT_DIR: process.env.PUBLIC_SNAPSHOT_DIR,
    PUBLIC_SNAPSHOT_BUILD_ATTEMPTS: process.env.PUBLIC_SNAPSHOT_BUILD_ATTEMPTS,
    PUBLIC_SNAPSHOT_RETRY_INITIAL_DELAY_MS:
      process.env.PUBLIC_SNAPSHOT_RETRY_INITIAL_DELAY_MS,
    PUBLIC_SNAPSHOT_RETRY_MAX_DELAY_MS:
      process.env.PUBLIC_SNAPSHOT_RETRY_MAX_DELAY_MS,
    PUBLIC_SNAPSHOT_BACKOFF_INITIAL_MS:
      process.env.PUBLIC_SNAPSHOT_BACKOFF_INITIAL_MS,
    PUBLIC_SNAPSHOT_BACKOFF_MAX_MS: process.env.PUBLIC_SNAPSHOT_BACKOFF_MAX_MS,
    PUBLIC_SNAPSHOT_BACKOFF_JITTER_RATIO:
      process.env.PUBLIC_SNAPSHOT_BACKOFF_JITTER_RATIO,
  };

  process.env.PUBLIC_SNAPSHOT_DIR = snapshotDir;
  process.env.PUBLIC_SNAPSHOT_BUILD_ATTEMPTS = "2";
  process.env.PUBLIC_SNAPSHOT_RETRY_INITIAL_DELAY_MS = "1";
  process.env.PUBLIC_SNAPSHOT_RETRY_MAX_DELAY_MS = "1";
  process.env.PUBLIC_SNAPSHOT_BACKOFF_INITIAL_MS = "60000";
  process.env.PUBLIC_SNAPSHOT_BACKOFF_MAX_MS = "60000";
  process.env.PUBLIC_SNAPSHOT_BACKOFF_JITTER_RATIO = "0";
  publicSnapshot.resetPublicSnapshotStateForTests();

  t.after(async () => {
    publicSnapshot.resetPublicSnapshotStateForTests();
    delete global.prisma;

    for (const [key, value] of Object.entries(previousEnv)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }

    await fs.rm(snapshotDir, { recursive: true, force: true });
  });

  return snapshotDir;
};

test("background refresh skips fresh snapshots and does not overlap a manual refresh", async (t) => {
  await setupTestSnapshotDir(t);

  let buildCalls = 0;
  global.prisma = {
    list: { findMany: async () => [] },
    listing: {
      findMany: async () => {
        buildCalls += 1;
        return [];
      },
    },
  };

  await publicSnapshot.writePublicSnapshot(
    createSnapshot({
      version: "fresh-seed",
      generatedAt: new Date().toISOString(),
    })
  );

  const freshResult = await publicSnapshot.refreshPublicSnapshotWithResult({
    trigger: "background",
    force: false,
  });

  assert.equal(freshResult.status, "skipped");
  assert.equal(freshResult.reason, "fresh_snapshot");
  assert.equal(buildCalls, 0);

  let releaseBuild;
  const buildGate = new Promise((resolve) => {
    releaseBuild = resolve;
  });
  global.prisma.listing.findMany = async () => {
    buildCalls += 1;
    await buildGate;
    return [];
  };

  await publicSnapshot.writePublicSnapshot(
    createSnapshot({
      version: "stale-seed",
      generatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    })
  );

  const backgroundRefresh =
    publicSnapshot.refreshPublicSnapshotWithResult({
      trigger: "background",
      force: false,
    });
  await waitFor(() => buildCalls === 1, "background build did not start");

  const manualResult = await publicSnapshot.refreshPublicSnapshotWithResult({
    trigger: "manual",
    force: true,
  });

  assert.equal(manualResult.status, "skipped");
  assert.equal(manualResult.reason, "already_refreshing");
  assert.equal(manualResult.snapshot.version, "stale-seed");
  assert.equal(buildCalls, 1);

  releaseBuild();
  const backgroundResult = await backgroundRefresh;
  assert.equal(backgroundResult.status, "built");
  assert.equal(backgroundResult.attempts, 1);
  assert.equal(buildCalls, 1);
});

test("fetch failures retry once, then activate backoff for later refresh paths", async (t) => {
  await setupTestSnapshotDir(t);

  let buildCalls = 0;
  const fetchError = new TypeError("fetch failed");
  fetchError.cause = {
    code: "ENOTFOUND",
    message: "getaddrinfo ENOTFOUND example.turso.io",
  };

  global.prisma = {
    list: { findMany: async () => [] },
    listing: {
      findMany: async () => {
        buildCalls += 1;
        throw fetchError;
      },
    },
  };

  await publicSnapshot.writePublicSnapshot(
    createSnapshot({
      version: "stale-seed",
      generatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    })
  );

  await assert.rejects(
    publicSnapshot.refreshPublicSnapshotWithResult({
      trigger: "manual",
      force: true,
    }),
    /fetch failed/
  );
  assert.equal(buildCalls, 2);

  const skippedResult = await publicSnapshot.refreshPublicSnapshotWithResult({
    trigger: "background",
    force: false,
  });

  assert.equal(skippedResult.status, "skipped");
  assert.equal(skippedResult.reason, "backoff_active");
  assert.equal(skippedResult.snapshot.version, "stale-seed");
  assert.equal(buildCalls, 2);
});

test("forced refresh rebuilds when the persisted manifest is corrupt", async (t) => {
  const snapshotDir = await setupTestSnapshotDir(t);

  let buildCalls = 0;
  global.prisma = {
    list: { findMany: async () => [] },
    listing: {
      findMany: async () => {
        buildCalls += 1;
        return [];
      },
    },
  };

  await fs.writeFile(path.join(snapshotDir, "manifest.json"), "{bad", "utf8");

  const result = await publicSnapshot.refreshPublicSnapshotWithResult({
    trigger: "manual",
    force: true,
  });

  assert.equal(result.status, "built");
  assert.equal(buildCalls, 1);

  const repairedSnapshot = await publicSnapshot.getExistingPublicSnapshot();
  assert.equal(repairedSnapshot.version, result.snapshot.version);
});

test("publishing a manifest retains 48 exact snapshot files and preserves unrelated files", async (t) => {
  const snapshotDir = await setupTestSnapshotDir(t);
  const rollbackVersions = Array.from({ length: 52 }, (_, index) =>
    index.toString(16).padStart(16, "0")
  );

  for (const [index, version] of rollbackVersions.entries()) {
    const snapshotPath = path.join(
      snapshotDir,
      `public-snapshot.${version}.json`
    );
    await fs.writeFile(snapshotPath, "rollback", "utf8");
    const modifiedAt = new Date(Date.UTC(2026, 0, 1, 0, 0, index));
    await fs.utimes(snapshotPath, modifiedAt, modifiedAt);
  }

  const unrelatedNames = [
    "public-snapshot.000000000000000g.json",
    "public-snapshot.000000000000000.json",
    "public-snapshot.00000000000000000.json",
    "public-snapshot.0000000000000000.json.bak",
    "public-snapshot.json",
  ];
  for (const name of unrelatedNames) {
    await fs.writeFile(path.join(snapshotDir, name), "unrelated", "utf8");
  }

  const activeVersion = "ffffffffffffffff";
  await publicSnapshot.writePublicSnapshot(
    createSnapshot({
      version: activeVersion,
      generatedAt: new Date().toISOString(),
    })
  );

  const entries = await fs.readdir(snapshotDir, { withFileTypes: true });
  const retainedSnapshotNames = entries
    .filter(
      (entry) =>
        entry.isFile() &&
        /^public-snapshot\.[a-f0-9]{16}\.json$/.test(entry.name)
    )
    .map((entry) => entry.name);

  assert.equal(retainedSnapshotNames.length, 48);
  assert.ok(
    retainedSnapshotNames.includes(
      `public-snapshot.${activeVersion}.json`
    )
  );

  for (const version of rollbackVersions.slice(0, 5)) {
    await assert.rejects(
      fs.stat(path.join(snapshotDir, `public-snapshot.${version}.json`)),
      { code: "ENOENT" }
    );
  }
  for (const version of rollbackVersions.slice(5)) {
    await fs.stat(
      path.join(snapshotDir, `public-snapshot.${version}.json`)
    );
  }
  for (const name of unrelatedNames) {
    await fs.stat(path.join(snapshotDir, name));
  }

  const manifest = JSON.parse(
    await fs.readFile(path.join(snapshotDir, "manifest.json"), "utf8")
  );
  assert.equal(manifest.version, activeVersion);
  await fs.stat(manifest.path);
});
