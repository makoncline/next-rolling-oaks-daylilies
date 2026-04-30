const fs = require("fs/promises");
const http = require("http");
const path = require("path");

const service = "rolling-oaks-daylilies";
const component = "public-snapshot";
const schemaVersion = 1;
const refreshToken =
  process.env.PUBLIC_SNAPSHOT_REFRESH_TOKEN || "container-startup";

process.env.PUBLIC_SNAPSHOT_REFRESH_TOKEN = refreshToken;

function logPublicSnapshot(event, payload = {}) {
  console.log(
    JSON.stringify({
      event,
      service,
      component,
      timestamp: new Date().toISOString(),
      ...payload,
    })
  );
}

function getSnapshotDir() {
  return (
    process.env.PUBLIC_SNAPSHOT_DIR || path.join(process.cwd(), ".public-data")
  );
}

function getManifestPath() {
  return path.join(getSnapshotDir(), "manifest.json");
}

async function getExistingSnapshotManifest() {
  const manifestPath = getManifestPath();
  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));

  if (
    manifest.schemaVersion !== schemaVersion ||
    typeof manifest.version !== "string" ||
    typeof manifest.generatedAt !== "string" ||
    typeof manifest.path !== "string" ||
    Number.isNaN(new Date(manifest.generatedAt).getTime())
  ) {
    throw new Error("Public snapshot manifest is invalid.");
  }

  const snapshotPath = path.isAbsolute(manifest.path)
    ? manifest.path
    : path.join(getSnapshotDir(), manifest.path);

  const snapshot = JSON.parse(await fs.readFile(snapshotPath, "utf8"));

  if (
    snapshot.schemaVersion !== schemaVersion ||
    snapshot.version !== manifest.version ||
    snapshot.generatedAt !== manifest.generatedAt ||
    Number.isNaN(new Date(snapshot.generatedAt).getTime())
  ) {
    throw new Error("Public snapshot file is invalid.");
  }

  return {
    ...manifest,
    path: snapshotPath,
  };
}

async function hasExistingSnapshot() {
  try {
    const manifest = await getExistingSnapshotManifest();
    logPublicSnapshot("public_snapshot_existing_loaded", {
      version: manifest.version,
      generatedAt: manifest.generatedAt,
      manifestPath: getManifestPath(),
      path: manifest.path,
    });
    return true;
  } catch (error) {
    logPublicSnapshot("public_snapshot_missing", {
      manifestPath: getManifestPath(),
      reason: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

async function refreshPublicSnapshot() {
  let statusCode = 200;
  let body;

  const req = {
    method: "GET",
    query: {
      token: refreshToken,
    },
  };

  const res = {
    setHeader() {},
    status(code) {
      statusCode = code;
      return this;
    },
    json(value) {
      body = value;
      return this;
    },
  };

  const refreshRoute = "../.next/server/pages/api/public-snapshot/refresh.js";
  const { default: handler } = await require(refreshRoute);
  await handler(req, res);

  if (statusCode >= 400) {
    throw new Error(
      `Public snapshot refresh failed with status ${statusCode}: ${JSON.stringify(
        body
      )}`
    );
  }

  return body;
}

function waitForServer() {
  const port = Number(process.env.PORT || 3000);
  const hostname = "127.0.0.1";
  const deadline = Date.now() + 60000;

  return new Promise((resolve, reject) => {
    const check = () => {
      const req = http.get(
        {
          hostname,
          port,
          path: "/api/health",
          timeout: 2000,
        },
        (res) => {
          res.resume();
          resolve();
        }
      );

      req.on("timeout", () => {
        req.destroy();
      });

      req.on("error", () => {
        if (Date.now() >= deadline) {
          reject(new Error("Timed out waiting for Next server to listen."));
          return;
        }

        setTimeout(check, 1000);
      });
    };

    check();
  });
}

async function bootstrap() {
  if (await hasExistingSnapshot()) {
    return;
  }

  await refreshPublicSnapshot();
}

async function backgroundRefresh() {
  await waitForServer();
  logPublicSnapshot("public_snapshot_background_refresh_started");
  await refreshPublicSnapshot();
}

const mode = process.argv[2] || "bootstrap";
const task = mode === "background" ? backgroundRefresh : bootstrap;

task().catch((error) => {
  logPublicSnapshot("public_snapshot_build_failed", {
    mode,
    error: error instanceof Error ? error.message : String(error),
  });

  if (mode === "bootstrap") {
    process.exit(1);
  }
});
