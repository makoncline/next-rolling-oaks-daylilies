import { createHash } from "node:crypto";
import { execFileSync, spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as pause } from "node:timers/promises";
import { createRequire } from "node:module";
import { isDeepStrictEqual } from "node:util";
import { gunzipSync } from "node:zlib";
import os from "node:os";

const require = createRequire(import.meta.url);
const app = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const root = path.resolve(app, "../..");
const output = path.join(root, "artifacts/visual");
const runtime = path.join(output, ".runtime");
const routeFile = path.join(app, "scripts/visual-routes.json");
const json = async (file) => JSON.parse(await fs.readFile(file, "utf8"));
const writeJson = (file, data) => fs.writeFile(file, JSON.stringify(data, null, 2) + "\n");
const exists = async (file) => fs.access(file).then(() => true, () => false);
export const hash = (value) => createHash("sha256").update(value).digest("hex");
export const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export function captureEntries(manifest, snapshot) {
  const routes = [...manifest.routes];
  if (manifest.includeAllCatalogs) {
    for (const slug of Object.keys(snapshot.catalogsBySlug)) {
      routes.push({ id: `catalog-${slug.replace(/[^a-z0-9-]/g, "-")}`, label: `Catalog · ${slug}`, url: `/catalog/${encodeURIComponent(slug)}`, ready: "main h1" });
    }
  }
  const entries = routes.flatMap((route) => (route.viewports || Object.keys(manifest.viewports)).map((viewport) => ({ ...route, viewport, size: manifest.viewports[viewport], key: `${route.id}--${viewport}` })));
  const keys = new Set();
  for (const entry of entries) {
    if (!/^[a-z0-9-]+$/.test(entry.key) || keys.has(entry.key)) throw new Error(`Invalid or duplicate capture ID: ${entry.key}`);
    if (!entry.size || !entry.ready || !entry.url.startsWith("/") || entry.url.startsWith("//")) throw new Error(`Invalid capture route: ${entry.key}`);
    keys.add(entry.key);
  }
  if (!entries.length) throw new Error("Capture manifest is empty");
  return entries;
}

export function sameCapturePlan(before, after) {
  const plan = ({ routes, ...settings }) => ({
    ...settings,
    routes: routes.map(({ ready, ...route }) => {
      if (typeof ready !== "string" || !ready.trim()) throw new Error("Missing readiness selector");
      return route;
    }),
  });
  return isDeepStrictEqual(plan(before), plan(after));
}

export function provenanceDifferences(start, current) {
  const before = { ...start.environment, runnerNode: start.runnerNode };
  const after = { ...current.environment, runnerNode: current.runnerNode };
  return [...new Set([...Object.keys(before), ...Object.keys(after)])].sort()
    .filter((key) => !isDeepStrictEqual(before[key], after[key]))
    .map((field) => ({ field, start: before[field] ?? "not recorded", current: after[field] ?? "not recorded" }));
}

async function verifyCaptureInputs(previous, manifestBytes, fixture) {
  if (previous.fixtureHash !== hash(fixture)) throw new Error("Fixture differs from Start; use Start's original public fixture, not live data.");
  const originalRoutes = await fs.readFile(path.join(output, "start/routes.json"));
  if (hash(originalRoutes) !== previous.manifestHash) throw new Error("Start route manifest was modified");
  if (!sameCapturePlan(JSON.parse(originalRoutes), JSON.parse(manifestBytes))) throw new Error("Routes, states or capture settings differ from Start; this would be an incomplete comparison.");
  return previous.manifestHash === hash(manifestBytes) ? [] : ["Readiness selectors changed; routes, states, viewports and all other capture settings match Start."];
}

export async function assertNewBaseline(directory) {
  if (await exists(path.join(directory, "start"))) throw new Error("Start already exists. It is immutable; use visual:current instead.");
}

export async function verifyBaseline(directory) {
  const baseline = path.join(directory, "start");
  const metadata = await json(path.join(baseline, "metadata.json"));
  const fixture = await fs.readFile(path.join(baseline, "fixture.json"));
  if (hash(fixture) !== metadata.fixtureHash) throw new Error("Start fixture was modified");
  const routes = await fs.readFile(path.join(baseline, "routes.json"));
  if (hash(routes) !== metadata.manifestHash) throw new Error("Start route manifest was modified");
  const expected = captureEntries(JSON.parse(routes), JSON.parse(fixture)).map((entry) => entry.key).sort();
  if (!isDeepStrictEqual(expected, metadata.captures.map((entry) => entry.key).sort())) throw new Error("Start capture set is incomplete or has duplicate entries");
  for (const capture of metadata.captures) {
    if (!/^[a-z0-9-]+$/.test(capture.key) || hash(await fs.readFile(path.join(baseline, `${capture.key}.png`))) !== capture.hash) throw new Error(`Start screenshot was modified: ${capture.key}`);
  }
  return hash(await fs.readFile(path.join(baseline, "metadata.json")));
}

export async function publishCurrent(directory, staged) {
  const current = path.join(directory, "current");
  const backup = path.join(directory, ".previous-current");
  if (await exists(backup)) throw new Error("Interrupted publication found; inspect .previous-current before retrying.");
  const hadCurrent = await exists(current);
  if (hadCurrent) await fs.rename(current, backup);
  try {
    await fs.rename(staged, current);
  } catch (error) {
    if (hadCurrent) await fs.rename(backup, current);
    throw error;
  }
  if (hadCurrent) await fs.rm(backup, { recursive: true });
}

async function sourceIdentity() {
  const git = (...args) => execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
  const names = git("ls-files", "--cached", "--others", "--exclude-standard").split("\n").filter(Boolean);
  const digest = createHash("sha256");
  for (const name of [...new Set(names)].sort()) {
    digest.update(name);
    digest.update(await fs.readFile(path.join(root, name)).catch(() => Buffer.from("<deleted>")));
  }
  return { commit: git("rev-parse", "HEAD"), branch: git("branch", "--show-current"), dirty: git("status", "--short"), filesHash: digest.digest("hex") };
}

async function bundledFixture() {
  const directory = path.join(app, "scripts/fixtures");
  const provenance = await json(path.join(directory, "public-catalog.json"));
  const fixture = gunzipSync(await fs.readFile(path.join(directory, "public-catalog.json.gz")));
  if (hash(fixture) !== provenance.sha256) throw new Error("Bundled public catalog fixture checksum failed");
  const snapshot = JSON.parse(fixture);
  if (snapshot.schemaVersion !== 4 || snapshot.version !== provenance.snapshotVersion || !isDeepStrictEqual(snapshot.counts, provenance.counts)) throw new Error("Bundled public catalog fixture does not match its provenance");
  return { fixture, fixtureSource: { path: "packages/app/scripts/fixtures/public-catalog.json.gz", ...provenance } };
}

async function setup() {
  const { fixtureSource } = await bundledFixture();
  console.log(`Verified bundled public fixture ${fixtureSource.snapshotVersion} (${fixtureSource.sha256}). No database credentials required.`);
  execFileSync(process.execPath, [require.resolve("@playwright/test/cli"), "install", "chromium"], { cwd: app, stdio: "inherit" });
  console.log("Ready. Run npm run visual:serve, then visual:start (new baseline only) or visual:current in another terminal.");
}

async function serve() {
  if (await exists(path.join(runtime, "server.json"))) {
    const previous = await json(path.join(runtime, "server.json"));
    const running = (() => { try { process.kill(previous.pid, 0); return true; } catch { return false; } })();
    if (running) throw new Error(`Visual server PID ${previous.pid} is still running on port ${previous.port}; stop it before restarting.`);
  }
  let loaded;
  if (await exists(path.join(output, "start"))) {
    await verifyBaseline(output);
    loaded = { fixture: await fs.readFile(path.join(output, "start/fixture.json")), fixtureSource: { path: "artifacts/visual/start/fixture.json", description: "Immutable Start public catalog fixture" } };
  } else {
    loaded = await bundledFixture();
  }
  const { fixture, fixtureSource } = loaded;
  const snapshot = JSON.parse(fixture);
  await fs.mkdir(runtime, { recursive: true });
  // Preserve every fixture byte. Use the app's existing retry-backoff mechanism
  // ONLY inside this isolated cache to prevent background data refreshes.
  const snapshotPath = path.join(runtime, `public-snapshot.${snapshot.version}.json`);
  await fs.writeFile(snapshotPath, fixture);
  await writeJson(path.join(runtime, "manifest.json"), { schemaVersion: snapshot.schemaVersion, version: snapshot.version, path: snapshotPath, generatedAt: snapshot.generatedAt, counts: snapshot.counts });
  await writeJson(path.join(runtime, "refresh-state.json"), { consecutiveFailures: 1, lastFailureAt: new Date().toISOString(), lastError: "Visual capture fixture intentionally pinned; not a production failure", nextAttemptAt: "9999-01-01T00:00:00.000Z" });
  const port = Number(process.env.PORT || 3210);
  if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error("PORT must be an unprivileged valid port");
  // Empty values prevent Next's .env loader from importing live DB or mail credentials.
  const env = { ...process.env, PUBLIC_SNAPSHOT_DIR: runtime, NEXT_PUBLIC_TURNSTILE_SITE_KEY: "1x00000000000000000000AA", TURSO_DATABASE_URL: "", TURSO_DATABASE_AUTH_TOKEN: "", SMTP_USER: "", SMTP_PASS: "" };
  execFileSync(process.execPath, [require.resolve("prisma/build/index.js"), "generate", "--schema=prisma/schema.sqlite.prisma"], { cwd: app, env, stdio: "inherit" });
  // VISUAL_SERVER=production captures the standalone build: no dev-only image
  // reveal or development UI. Same pinned fixture and empty credentials.
  const mode = process.env.VISUAL_SERVER === "production" ? "production" : "development";
  let child;
  if (mode === "production") {
    const prodEnv = { ...env, NODE_ENV: "production" };
    execFileSync(process.execPath, [require.resolve("next/dist/bin/next"), "build"], { cwd: app, env: prodEnv, stdio: "inherit" });
    const standalone = path.join(app, ".next/standalone/packages/app");
    await fs.cp(path.join(app, ".next/static"), path.join(standalone, ".next/static"), { recursive: true, force: true });
    await fs.cp(path.join(app, "public"), path.join(standalone, "public"), { recursive: true, force: true });
    child = spawn(process.execPath, [path.join(standalone, "server.js")], { cwd: standalone, env: { ...prodEnv, PORT: String(port), HOSTNAME: "127.0.0.1" }, stdio: "inherit" });
  } else {
    child = spawn(process.execPath, [require.resolve("next/dist/bin/next"), "dev", "--hostname", "127.0.0.1", "--port", String(port)], { cwd: app, env, stdio: "inherit" });
  }
  await writeJson(path.join(runtime, "server.json"), { root, port, pid: child.pid, mode, node: process.version, fixtureHash: hash(fixture), snapshotVersion: snapshot.version, fixtureSource });
  for (const signal of ["SIGTERM", "SIGINT"]) process.on(signal, () => child.kill(signal));
  child.on("exit", (code) => { process.exitCode = code ?? 1; });
  console.log(`Visual fixture ${snapshot.version}; local server http://127.0.0.1:${port}`);
}

async function verifyServer(server) {
  if (server.root !== root) throw new Error("Visual server belongs to a different checkout");
  process.kill(server.pid, 0);
  const baseURL = `http://127.0.0.1:${server.port}`;
  if (process.env.TEST_BASE_URL && new URL(process.env.TEST_BASE_URL).origin !== baseURL) throw new Error("TEST_BASE_URL does not match visual:serve");
  const response = await fetch(`${baseURL}/api/health`, { signal: AbortSignal.timeout(120000) });
  const health = await response.json();
  // DB availability isn't a screenshot requirement; the pinned public data is.
  if (health.service !== "rolling-oaks-daylilies" || health.publicSnapshot?.version !== server.snapshotVersion || health.publicSnapshot.refreshing) throw new Error("Server is not rendering the expected pinned public snapshot");
  const manifest = await json(path.join(runtime, "manifest.json"));
  if (hash(await fs.readFile(manifest.path)) !== server.fixtureHash) throw new Error("Snapshot fixture changed");
  return baseURL;
}

async function settle(page) {
  await page.locator("main").waitFor();
  await page.waitForFunction(() => Boolean(window.__NEXT_DATA__) && document.querySelector("main"));
  await page.evaluate(() => document.fonts.ready);
  // Trigger lazy images across the whole page, not just those in the viewport.
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += window.innerHeight) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 60));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForFunction(() => Array.from(document.images).every((image) => image.complete), null, { timeout: 60000 });
  await page.waitForFunction(() => !document.querySelector("[data-ui=spinner]"), null, { timeout: 30000 });
  await page.waitForFunction(() => !document.querySelector('[data-ui="notifications"]')?.textContent?.trim());
  await pause(700); // CSS image reveal, not network readiness.
  await page.evaluate(() => { window.scrollTo(0, 0); if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); });
}

async function prepareState(page, entry) {
  if (entry.state === "cart") await page.getByText("A Legacy of Joy", { exact: true }).filter({ visible: true }).waitFor();
  if (entry.state === "filters") {
    await page.getByRole("button", { name: "Filters", exact: true }).click();
    await page.locator("#rebloom:checked").waitFor();
  }
  if (entry.state === "empty-results") {
    await page.getByText("0 results", { exact: true }).waitFor();
    if (await page.locator("main article").count()) throw new Error("Expected no search results");
  }
  if (entry.state === "page-2") {
    const link = page.locator('a[rel="next"]').first();
    const href = await link.getAttribute("href");
    if (!href || new URL(href, page.url()).searchParams.get("page") !== "2") throw new Error("Pagination did not produce page 2");
    await link.click();
    await page.waitForURL((url) => url.searchParams.get("page") === "2");
    await page.locator('input[name="page"]').first().waitFor();
  }
  if (entry.state === "gallery") await page.getByRole("button", { name: /Show .* Photo 2/ }).click();
  if (entry.state === "menu") {
    await page.getByRole("button", { name: "Toggle navigation" }).click();
    await page.locator('button[aria-label="Toggle navigation"][aria-expanded="true"]').waitFor();
  }
}

function provenanceHtml(start, current) {
  const differences = provenanceDifferences(start, current);
  const fields = (capture) => ({
    createdAt: capture.createdAt,
    commit: capture.source.commit,
    branch: capture.source.branch,
    sourceFilesHash: capture.source.filesHash,
    fixtureHash: capture.fixtureHash,
    snapshotVersion: capture.snapshotVersion,
    snapshotGeneratedAt: capture.snapshotGeneratedAt,
    manifestHash: capture.manifestHash,
    runnerNode: capture.runnerNode,
    ...capture.environment,
  });
  const before = fields(start);
  const after = fields(current);
  const rows = [...new Set([...Object.keys(before), ...Object.keys(after)])].map((key) => `<tr><th scope="row">${escapeHtml(key)}</th><td>${escapeHtml(before[key] ?? "not recorded")}</td><td>${escapeHtml(after[key] ?? "not recorded")}</td></tr>`).join("");
  const detail = (capture) => escapeHtml(JSON.stringify({ source: capture.source, fixtureSource: capture.fixtureSource ?? "Original Start fixture; hash recorded above", notes: capture.notes }, null, 2));
  return `<div class="provenance"><p><strong>Human visual review — not a controlled pixel-parity test.</strong> ${differences.length ? `Recorded conditions differ: ${escapeHtml(differences.map((item) => item.field).join(", "))}. Pixel differences may include environment or dependency effects, not just source edits.` : "Recorded conditions match; this is still a human review, not an automated parity assertion."} The public fixture and route/state coverage must match; broken pages, images or partial captures fail.</p><details><summary>Start / Current provenance, hashes and capture conditions</summary><div style="overflow:auto"><table><thead><tr><th>Field</th><th>Start</th><th>Current</th></tr></thead><tbody>${rows}</tbody></table></div><h4>Start source and notes</h4><pre>${detail(start)}</pre><h4>Current source and notes</h4><pre>${detail(current)}</pre></details></div>`;
}

export function sheetHtml(start, current) {
  const esc = escapeHtml;
  const cards = start.captures.map((capture) => {
    const latest = current.captures.find((item) => item.key === capture.key);
    const pair = (set, item) => `<div><p class="column-label">${set === "start" ? "Start" : "Current"}</p><a href="${esc(path.posix.join(set, `${capture.key}.png`))}"><img src="${esc(path.posix.join(set, `${capture.key}.png`))}" alt="${esc(`${set}: ${capture.label}, ${capture.viewport}`)}" loading="lazy"></a><p class="dimensions">${item.width} × ${item.height} · full-page PNG</p></div>`;
    return `<section class="capture" data-viewport="${esc(capture.viewport)}" data-search="${esc((capture.label + " " + capture.url).toLowerCase())}"><h3>${esc(capture.label)} <span>${esc(capture.viewport)}</span></h3><p class="route">${esc(capture.url)}</p><div class="pair">${pair("start", capture)}${pair("current", latest)}</div></section>`;
  }).join("\n");
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Rolling Oaks · Start / Current</title><style>
  :root{color-scheme:light dark;--foreground:light-dark(#18212a,#ece9e6);--muted-foreground:light-dark(#59636e,#aaabad);--card:light-dark(#f5f6f8,#222d38);--border:light-dark(#d8dce2,#48525e);--primary:light-dark(#1765b5,#8dbcf5);--radius:10px;--font-sans:system-ui,sans-serif}body{margin:0;color:var(--foreground);font-family:var(--font-sans)}*{box-sizing:border-box}p{line-height:1.5}a{color:var(--primary)}.intro{margin:0 0 18px}.intro h2{font-size:20px;margin:0 0 8px}.meta,.route,.dimensions{font-size:12px;color:var(--muted-foreground);overflow-wrap:anywhere}.controls{display:flex;gap:10px;flex-wrap:wrap;margin:12px 0}input,select{font:inherit;color:var(--foreground);background:var(--card);border:1px solid var(--border);border-radius:6px;padding:8px;max-width:100%}input{flex:1;min-width:160px}.capture{background:var(--card);border-radius:var(--radius);padding:16px;margin:0 0 16px;break-inside:avoid}.capture h3{font-size:15px;margin:0}.capture h3 span{font-weight:400;color:var(--muted-foreground)}.route{margin:5px 0}.pair{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px}.column-label{font-size:13px;font-weight:600;margin:8px 0}.pair a{display:block;height:var(--preview-height,1200px);min-height:1000px;max-height:1600px;overflow:auto;text-align:center}.pair img{width:100%;height:auto;display:block;margin:0}body[data-scale="actual"] .pair img{width:auto;max-width:none}.dimensions{font-size:11px;margin:6px 0 0}.capture[hidden]{display:none}summary{cursor:pointer}details{margin-top:12px}.provenance{font-size:13px}table{border-collapse:collapse;width:100%;font-size:12px}th,td{padding:6px;text-align:left;border-bottom:1px solid var(--border);overflow-wrap:anywhere;min-width:110px}pre{white-space:pre-wrap;overflow-wrap:anywhere;font-size:11px}
  </style></head><body><div class="intro"><p>Unchanged baseline on the left. Latest successful capture on the right. Each pair has a 1200px-tall viewing area by default. Scroll to inspect the full page; both sides scroll together. Use Actual size for native-resolution inspection, or select an image to open its original full-size PNG.</p><div class="meta">${start.captures.length} screens · desktop and mobile · full-page originals linked below</div>${provenanceHtml(start, current)}</div><div class="controls"><input id="search" aria-label="Filter screens" placeholder="Filter by page or URL"><select id="viewport" aria-label="Viewport"><option value="">Desktop and mobile</option><option value="desktop">Desktop</option><option value="mobile">Mobile</option></select><select id="preview-height" aria-label="Preview height"><option value="1000">1000px tall</option><option value="1200" selected>1200px tall</option><option value="1600">1600px tall</option></select><select id="scale" aria-label="Image scale"><option value="fit">Fit width</option><option value="actual">Actual size (100%)</option></select></div>${cards}<script>function filter(){const q=document.querySelector('#search').value.toLowerCase();const v=document.querySelector('#viewport').value;document.querySelectorAll('.capture').forEach(c=>c.hidden=(!c.dataset.search.includes(q)||(v&&c.dataset.viewport!==v)))}document.querySelector('#search').addEventListener('input',filter);document.querySelector('#viewport').addEventListener('change',filter);document.querySelector('#preview-height').addEventListener('change',e=>document.documentElement.style.setProperty('--preview-height',e.target.value+'px'));document.querySelector('#scale').addEventListener('change',e=>document.body.dataset.scale=e.target.value);document.querySelectorAll('.pair').forEach(pair=>{const panes=[...pair.querySelectorAll('a')];panes.forEach(pane=>pane.addEventListener('scroll',()=>{for(const other of panes)if(other!==pane&&other.scrollTop!==pane.scrollTop)other.scrollTop=pane.scrollTop;for(const other of panes)if(other!==pane&&other.scrollLeft!==pane.scrollLeft)other.scrollLeft=pane.scrollLeft}))});</script></body></html>`;
}

export async function writeContactSheetPng(start, current, directory, viewport) {
  const sharp = require("sharp");
  const width = 1440;
  const rowHeight = 300;
  const headerHeight = 150;
  const captures = start.captures.filter((capture) => !viewport || capture.viewport === viewport);
  const line = (text, y, size = 16) => `<text x="24" y="${y}" fill="#ece9e6" font-family="Arial,sans-serif" font-size="${size}">${escapeHtml(text)}</text>`;
  const conditions = (capture) => `Browser ${capture.environment.channel} ${capture.environment.browser} · Server Node ${capture.environment.serverNode} · Runner ${capture.runnerNode}`;
  const header = `<svg width="${width}" height="${headerHeight}" xmlns="http://www.w3.org/2000/svg">${line(`Start / Current · ${viewport || "desktop and mobile"} · top-of-page overview (full pages in HTML)`, 28, 21)}${line(`Start: ${conditions(start)}`, 56)}${line(`Current: ${conditions(current)}`, 81)}${line(`Human visual review only — no controlled pixel-parity claim. ${provenanceDifferences(start, current).length} recorded condition differences; see HTML provenance.`, 108)}${line(`Source: ${start.source.filesHash.slice(0, 16)} → ${current.source.filesHash.slice(0, 16)} · Public fixture: ${start.fixtureHash.slice(0, 16)}`, 134)}</svg>`;
  const layers = [{ input: Buffer.from(header), left: 0, top: 0 }];
  for (const [index, capture] of captures.entries()) {
    const y = headerHeight + index * rowHeight;
    const title = escapeHtml(`${capture.label} · ${capture.viewport}`);
    const svg = `<svg width="1440" height="300" xmlns="http://www.w3.org/2000/svg"><text x="24" y="25" fill="#ece9e6" font-family="Arial,sans-serif" font-size="20">${title}</text><text x="360" y="53" fill="#aaabad" text-anchor="middle" font-family="Arial,sans-serif" font-size="17">Start</text><text x="1080" y="53" fill="#aaabad" text-anchor="middle" font-family="Arial,sans-serif" font-size="17">Current</text><path d="M24 299H1416" stroke="#48525e"/></svg>`;
    layers.push({ input: Buffer.from(svg), left: 0, top: y });
    for (const [column, set] of ["start", "current"].entries()) {
      const image = await sharp(path.join(directory, set, `${capture.key}.png`)).resize({ width: 680, height: 230, fit: "cover", position: "top" }).png().toBuffer({ resolveWithObject: true });
      layers.push({ input: image.data, left: column * 720 + Math.floor((720 - image.info.width) / 2), top: y + 62 });
    }
  }
  await sharp({ create: { width, height: headerHeight + rowHeight * captures.length, channels: 4, background: "#222d38" } }).composite(layers).png().toFile(path.join(directory, `contact-sheet${viewport ? `-${viewport}` : ""}.png`));
}

// These are display derivatives, not another capture set. Keep the entire page
// and its aspect ratio; the HTML viewport handles scrolling, never a crop.
export async function writeContactSheetPreviews(start, current, directory) {
  const sharp = require("sharp");
  const destination = path.join(directory, "pair-previews");
  await fs.mkdir(destination, { recursive: true });
  for (const capture of start.captures) {
    if (!/^[a-z0-9-]+$/.test(capture.key) || !current.captures.some((item) => item.key === capture.key)) throw new Error(`Missing or invalid comparison: ${capture.key}`);
    const images = await Promise.all(["start", "current"].map((set) => sharp(path.join(directory, set, `${capture.key}.png`)).resize({ width: 360 }).png().toBuffer({ resolveWithObject: true })));
    const height = Math.max(...images.map((image) => image.info.height));
    await sharp({ create: { width: 720, height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
      .composite(images.map((image, index) => ({ input: image.data, left: index * 360, top: 0 })))
      .webp({ quality: 85 }).toFile(path.join(destination, `${capture.key}.webp`));
  }
}

export function inlineSheetHtml(start, current, directory) {
  const images = start.captures.map((capture) => `<img hidden loading="lazy" data-page="${escapeHtml(capture.key.replace(/--[^-]+$/, ""))}" data-viewport="${escapeHtml(capture.viewport)}" data-label="${escapeHtml(capture.label)}" alt="${escapeHtml(`${capture.label} · ${capture.viewport}`)}" src="${escapeHtml(path.join(directory, "pair-previews", `${capture.key}.webp`))}">`).join("\n");
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Rolling Oaks · Start / Current</title><style>
  *{box-sizing:border-box}body{margin:0;font-family:var(--font-sans);color:var(--foreground)}p{line-height:1.5}.controls{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:12px}select,button{font:inherit;padding:8px;color:var(--foreground);background:var(--card);border:1px solid var(--border);border-radius:var(--radius);max-width:100%}button{cursor:pointer}button[aria-pressed=true]{border-color:var(--primary);background:var(--accent);color:var(--accent-foreground)}button:disabled{opacity:.45;cursor:default}select:focus-visible,button:focus-visible,.pane:focus-visible{outline:2px solid var(--ring);outline-offset:2px}#screen{width:100%}#count{margin-left:auto;font-size:13px}.labels{display:grid;grid-template-columns:1fr 1fr;gap:12px;font-weight:600;font-size:13px;margin:12px 0 8px}.pane{height:var(--preview-height,1200px);min-height:1000px;max-height:1600px;overflow:auto}.pane img{display:block;width:100%;height:auto}.pane img[hidden]{display:none}.hint{font-size:13px;color:var(--muted-foreground)}
  .provenance{font-size:13px;margin-bottom:16px}table{border-collapse:collapse;font-size:12px;width:100%}th,td{text-align:left;padding:6px;overflow-wrap:anywhere;border-bottom:1px solid var(--border)}pre{font-size:11px;white-space:pre-wrap;overflow-wrap:anywhere}
  </style></head><body>${provenanceHtml(start, current)}<div class="controls" role="group" aria-label="Viewport"><button type="button" data-viewport="mobile" aria-pressed="true">Mobile · 390px</button><button type="button" data-viewport="desktop" aria-pressed="false">Desktop · 1440px</button></div><div class="controls"><label for="screen">Page or state</label><select id="screen"></select><button id="previous" type="button">Previous</button><button id="next" type="button">Next</button><span id="count" aria-live="polite"></span><select id="height" aria-label="Preview height"><option value="1000">1000px tall</option><option value="1200" selected>1200px tall</option><option value="1600">1600px tall</option></select></div><p class="hint">${start.captures.length} full-page comparisons. Scroll inside the image to see the rest of the page. Start is on the left; Current is on the right.</p><div class="labels"><span>Start · original</span><span>Current · latest capture</span></div><div class="pane" tabindex="0" aria-label="Side-by-side full-page comparison">${images}</div><script>
  const images=[...document.querySelectorAll('.pane img')],screen=document.querySelector('#screen'),pane=document.querySelector('.pane'),buttons=[...document.querySelectorAll('button[data-viewport]')];let viewport='mobile',available=[];
  function show(){const selected=available.find(img=>img.dataset.page===screen.value);images.forEach(img=>img.hidden=img!==selected);pane.scrollTop=0;const index=available.indexOf(selected);document.querySelector('#count').textContent=(index+1)+' / '+available.length+' '+viewport+' views';document.querySelector('#previous').disabled=index<=0;document.querySelector('#next').disabled=index>=available.length-1;}
  function changeViewport(value){const page=screen.value;viewport=value;available=images.filter(img=>img.dataset.viewport===viewport);screen.replaceChildren(...available.map(img=>new Option(img.dataset.label,img.dataset.page)));if(available.some(img=>img.dataset.page===page))screen.value=page;buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.viewport===viewport)));show();}
  buttons.forEach(button=>button.onclick=()=>changeViewport(button.dataset.viewport));screen.onchange=show;document.querySelector('#previous').onclick=()=>{screen.selectedIndex--;show()};document.querySelector('#next').onclick=()=>{screen.selectedIndex++;show()};document.querySelector('#height').onchange=e=>document.documentElement.style.setProperty('--preview-height',e.target.value+'px');changeViewport(viewport);
  </script></body></html>`;
}

function includePixel(region, x, y) {
  region.changedPixels += 1;
  if (!region.bounds) region.bounds = { left: x, top: y, right: x, bottom: y };
  region.bounds.left = Math.min(region.bounds.left, x);
  region.bounds.top = Math.min(region.bounds.top, y);
  region.bounds.right = Math.max(region.bounds.right, x);
  region.bounds.bottom = Math.max(region.bounds.bottom, y);
}

export async function writeComparison(start, current, directory) {
  const sharp = require("sharp");
  const channelDeltaThreshold = 12;
  const bandHeight = 50;
  const comparisons = [];
  for (const capture of start.captures) {
    const latest = current.captures.find((item) => item.key === capture.key);
    if (!/^[a-z0-9-]+$/.test(capture.key) || !latest) throw new Error(`Missing or invalid comparison: ${capture.key}`);
    const images = await Promise.all(["start", "current"].map(async (set) => {
      const bytes = await fs.readFile(path.join(directory, set, `${capture.key}.png`));
      const digest = hash(bytes);
      const recorded = set === "start" ? capture : latest;
      if (digest !== recorded.hash) throw new Error(`Screenshot hash differs from metadata: ${set}/${capture.key}`);
      const { data, info } = await sharp(bytes).toColourspace("srgb").ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      return { data, width: info.width, height: info.height, hash: digest };
    }));
    const [before, after] = images;
    if (before.hash === after.hash) continue;
    const width = Math.max(before.width, after.width);
    const height = Math.max(before.height, after.height);
    const result = { key: capture.key, start: { width: before.width, height: before.height, hash: before.hash }, current: { width: after.width, height: after.height, hash: after.hash }, comparedPixels: 0, changedPixels: 0, exposedPixels: 0, bounds: null, bands: [] };
    for (let top = 0; top < height; top += bandHeight) {
      const band = { top, bottom: Math.min(top + bandHeight, height) - 1, changedPixels: 0, exposedPixels: 0, bounds: null };
      for (let y = top; y <= band.bottom; y += 1) {
        for (let x = 0; x < width; x += 1) {
          const inBefore = x < before.width && y < before.height;
          const inAfter = x < after.width && y < after.height;
          if (!inBefore && !inAfter) continue;
          result.comparedPixels += 1;
          const exposed = inBefore !== inAfter;
          const oldOffset = (y * before.width + x) * 4;
          const newOffset = (y * after.width + x) * 4;
          let changed = exposed;
          for (let channel = 0; !changed && channel < 4; channel += 1) {
            changed = Math.abs(before.data[oldOffset + channel] - after.data[newOffset + channel]) > channelDeltaThreshold;
          }
          if (!changed) continue;
          includePixel(result, x, y);
          includePixel(band, x, y);
          if (exposed) {
            result.exposedPixels += 1;
            band.exposedPixels += 1;
          }
        }
      }
      result.bands.push(band);
    }
    comparisons.push(result);
  }
  await writeJson(path.join(directory, "cleanup-comparison.json"), {
    generatedAt: new Date().toISOString(),
    start: { createdAt: start.createdAt, source: start.source },
    current: { createdAt: current.createdAt, source: current.source },
    purpose: "Descriptive pixel differences for human review; not an automated parity assertion or proof that source edits caused the differences.",
    environmentDifferences: provenanceDifferences(start, current),
    channelDeltaThreshold,
    rule: "A pixel changes when any sRGB RGBA channel delta is greater than the threshold, or the pixel exists in only one image. Bounds are inclusive, zero-based original-image coordinates. comparedPixels is the union of both image areas. All byte-nonidentical pairs are listed, including pairs below the threshold.",
    bandHeight,
    comparisons,
  });
}

export async function regenerateSheets(directory = output) {
  const start = await json(path.join(directory, "start/metadata.json"));
  const current = await json(path.join(directory, "current/metadata.json"));
  await verifyBaseline(directory);
  if (start.fixtureHash !== current.fixtureHash || !isDeepStrictEqual(start.captures.map((capture) => capture.key).sort(), current.captures.map((capture) => capture.key).sort())) throw new Error("Current fixture or complete capture set does not match Start");
  const currentRoutes = await fs.readFile(path.join(directory, "current/routes.json"));
  if (hash(currentRoutes) !== current.manifestHash || !sameCapturePlan(await json(path.join(directory, "start/routes.json")), JSON.parse(currentRoutes))) throw new Error("Current capture manifest does not match Start's route/state coverage");
  await writeComparison(start, current, directory);
  await writeContactSheetPreviews(start, current, directory);
  await fs.writeFile(path.join(directory, "contact-sheet.html"), sheetHtml(start, current));
  await fs.writeFile(path.join(directory, "contact-sheet-inline.html"), inlineSheetHtml(start, current, directory));
  await writeContactSheetPng(start, current, directory);
  for (const viewport of ["desktop", "mobile"]) {
    const subset = { ...start, captures: start.captures.filter((capture) => capture.viewport === viewport) };
    await fs.writeFile(path.join(directory, `contact-sheet-${viewport}.html`), sheetHtml(subset, current));
    await writeContactSheetPng(start, current, directory, viewport);
  }
}

async function capture(mode) {
  await fs.mkdir(output, { recursive: true });
  const lock = await fs.open(path.join(output, ".capture-lock"), "wx").catch(() => { throw new Error("Another capture is running (or a stale .capture-lock needs inspection)"); });
  let browser;
  let ownsStaging = false;
  const staging = path.join(output, ".staging");
  try {
    if (mode === "start") await assertNewBaseline(output);
    else if (!(await exists(path.join(output, "start/metadata.json")))) throw new Error("Create Start first with visual:start");
    const server = await json(path.join(runtime, "server.json"));
    const baseURL = await verifyServer(server);
    const manifestBytes = await fs.readFile(routeFile);
    const fixtureManifest = await json(path.join(runtime, "manifest.json"));
    const fixture = await fs.readFile(fixtureManifest.path);
    const snapshot = JSON.parse(fixture);
    const manifest = JSON.parse(manifestBytes);
    const entries = captureEntries(manifest, snapshot);
    const { chromium } = require("@playwright/test");
    browser = await chromium.launch({ headless: true });
    const environment = { browser: browser.version(), channel: "playwright-chromium", node: server.node, serverNode: server.node, serverMode: server.mode || "development", playwright: require("@playwright/test/package.json").version, tailwind: require("tailwindcss/package.json").version, next: require("next/package.json").version, platform: `${process.platform}-${process.arch}`, osRelease: os.release(), locale: "en-US", timezoneId: "America/Chicago", colorScheme: "dark", reducedMotion: "reduce", deviceScaleFactor: 1, lockfileHash: hash(await fs.readFile(path.join(root, "package-lock.json"))) };
    const baselineHash = mode === "current" ? await verifyBaseline(output) : null;
    const previous = mode === "current" ? await json(path.join(output, "start/metadata.json")) : null;
    const inputNotes = previous ? await verifyCaptureInputs(previous, manifestBytes, fixture) : [];
    if (await exists(staging)) throw new Error("Stale .staging directory found; inspect it before retrying");
    await fs.mkdir(staging);
    ownsStaging = true;
    const metadata = { createdAt: new Date().toISOString(), runnerNode: process.version, source: await sourceIdentity(), environment, baseURL, fixtureHash: hash(fixture), fixtureSource: server.fixtureSource || { description: "Existing visual server did not record its fixture source; runtime fixture bytes verified against Start." }, manifestHash: hash(manifestBytes), snapshotVersion: snapshot.version, snapshotGeneratedAt: snapshot.generatedAt, notes: ["Human visual review only; no controlled pixel-parity claim. All recorded environment and lockfile differences are disclosed, not selectively allowed by package name.", "A public snapshot is intentionally pinned via the isolated cache's refresh-backoff file; no database is needed.", "Screenshot-only contexts use fixed viewports (not touch-device emulation), ignore synthetic resize subscriptions, freeze viewport-relative geometry and hide Next development UI. E2E uses ordinary desktop and touch-device contexts.", "Non-GET/HEAD requests are blocked; the external verification iframe is masked. No real forms are submitted.", ...inputNotes], captures: [] };
    metadata.provenance = { purpose: "Human visual review, not a controlled pixel-parity test", environmentDifferences: previous ? provenanceDifferences(previous, metadata) : [] };
    if (metadata.provenance.environmentDifferences.length) console.warn(`Capture conditions differ from Start: ${metadata.provenance.environmentDifferences.map((item) => item.field).join(", ")}. Both values will appear in metadata and contact sheets; pixel differences cannot be attributed solely to source changes.`);
    const sharp = require("sharp");
    for (const [index, entry] of entries.entries()) {
      console.log(`[${index + 1}/${entries.length}] ${entry.key} ${entry.url}`);
      const context = await browser.newContext({ viewport: entry.size, deviceScaleFactor: 1, locale: environment.locale, timezoneId: environment.timezoneId, colorScheme: environment.colorScheme, reducedMotion: environment.reducedMotion, serviceWorkers: "block" });
      try {
        await context.route("**/*", (route) => {
          const request = route.request();
          return ["GET", "HEAD"].includes(request.method()) ? route.continue() : route.abort("blockedbyclient");
        });
        await context.addInitScript((populated) => {
          // The capture context has one fixed viewport. Ignore synthetic resize
          // notifications caused by Chrome's full-page screenshot machinery.
          // Real interaction tests run in ordinary, unmodified browser contexts.
          const addListener = window.addEventListener.bind(window);
          window.addEventListener = (type, ...args) => {
            if (type !== "resize") return addListener(type, ...args);
          };
          localStorage.clear();
          if (populated) {
            localStorage.setItem("cartProducts", JSON.stringify({ "visual-legacy": { id: "visual-legacy", name: "A Legacy of Joy", price: 15 }, "visual-second": { id: "visual-second", name: "Rolling Oaks Seedling", price: 20 } }));
            localStorage.setItem("cartItems", JSON.stringify({ "visual-legacy": { productId: "visual-legacy", quantity: 2 }, "visual-second": { productId: "visual-second", quantity: 1 } }));
          }
        }, entry.state === "cart");
        const page = await context.newPage();
        page.setDefaultTimeout(60000);
        const errors = [];
        page.on("pageerror", (error) => errors.push(error.message));
        page.on("console", (message) => {
          if (message.type() === "error" && !message.text().includes("Failed to load resource:") && !message.text().includes("Cloudflare Turnstile")) errors.push(message.text());
        });
        const catalogResponses = [];
        page.on("response", (response) => { if (response.url().includes("/api/catalog/")) catalogResponses.push(response); });
        const response = await page.goto(baseURL + entry.url, { waitUntil: "domcontentloaded", timeout: 120000 });
        if (response?.status() !== (entry.status || 200)) throw new Error(`Unexpected HTTP ${response?.status()}`);
        await page.locator(entry.ready).first().waitFor();
        if (entry.url.startsWith("/catalog/")) {
          if (!catalogResponses.some((r) => r.ok())) await page.waitForResponse((r) => r.url().includes("/api/catalog/") && r.ok());
          await page.waitForFunction(() => !document.querySelector("[data-ui=spinner]"));
        }
        await prepareState(page, entry);
        await settle(page);
        const broken = await page.locator("img").evaluateAll((images) => images.filter((img) => !img.naturalWidth).map((img) => ({ alt: img.alt, src: img.currentSrc })));
        if (broken.length) throw new Error(`Broken images: ${JSON.stringify(broken)}`);
        if (errors.length) throw new Error(`Browser errors: ${errors.join("; ")}`);
        if (catalogResponses.some((r) => !r.ok())) throw new Error("Catalog API failed");
        const file = path.join(staging, `${entry.key}.png`);
        // Freeze only viewport-relative geometry at its actual on-screen values
        // so full-page emulation cannot enlarge the menu or filter panel.
        await page.evaluate(() => {
          document.body.style.minHeight = getComputedStyle(document.body).minHeight;
          document.querySelectorAll(".h-screen").forEach((element) => { element.style.height = getComputedStyle(element).height; });
          document.querySelectorAll("[data-ui=filter-panel]").forEach((element) => { element.style.maxHeight = getComputedStyle(element).maxHeight; });
        });
        await page.screenshot({ path: file, fullPage: true, animations: "disabled", caret: "hide", mask: [page.locator('iframe[src*="challenges.cloudflare.com"]')], maskColor: "#28323e", style: "nextjs-portal { visibility: hidden !important; }" });
        if (entry.state === "menu" && await page.locator('[aria-label="Toggle navigation"]').getAttribute("aria-expanded") !== "true") throw new Error("Mobile navigation closed during capture");
        const { width, height } = await sharp(file).metadata();
        await sharp(file).resize({ width: 320, height: 600, fit: "inside", withoutEnlargement: true }).png().toFile(path.join(staging, `${entry.key}.thumb.png`));
        metadata.captures.push({ key: entry.key, label: entry.label, url: new URL(page.url()).pathname + new URL(page.url()).search, viewport: entry.viewport, width, height, hash: hash(await fs.readFile(file)) });
      } finally { await context.close(); }
    }
    await verifyServer(server);
    if (baselineHash && await verifyBaseline(output) !== baselineHash) throw new Error("Start metadata changed during capture");
    if (JSON.stringify(await sourceIdentity()) !== JSON.stringify(metadata.source)) throw new Error("Source changed during capture; retry with a stable tree");
    await writeJson(path.join(staging, "metadata.json"), metadata);
    await fs.writeFile(path.join(staging, "routes.json"), manifestBytes);
    if (mode === "start") {
      await fs.writeFile(path.join(staging, "fixture.json"), fixture);
      await assertNewBaseline(output);
      await fs.rename(staging, path.join(output, "start"));
      await fs.cp(path.join(output, "start"), path.join(output, "current"), { recursive: true, errorOnExist: true, force: false });
      await fs.unlink(path.join(output, "current/fixture.json"));
    } else { await publishCurrent(output, staging); }
    await regenerateSheets(output);
    console.log(`Captured ${entries.length} screens. ${path.join(output, "contact-sheet.html")}`);
  } catch (error) {
    if (ownsStaging) await fs.rm(staging, { recursive: true, force: true });
    throw error;
  } finally {
    if (browser) await browser.close();
    await lock.close();
    await fs.unlink(path.join(output, ".capture-lock"));
  }
}

const usage = `Usage: node packages/app/scripts/visual-capture.mjs setup|serve|start|current|sheet
  setup    Verify bundled public fixture and install Playwright Chromium (npm ci first).
  serve    Start an isolated dev server with Start's fixture, or the bundled fixture.
           VISUAL_SERVER=production builds and serves the standalone production app instead.
  start    Capture a NEW immutable Start and initial Current; refuses an existing Start.
  current  Capture against Start's exact fixture and route/state coverage, then build sheets.
  sheet    Rebuild HTML, desktop/mobile PNG overviews and full-page pairs; no server needed.
  --help   Show this usage (also accepted after any command).

Fresh checkout (project Node version from package.json; no .env or Turso credentials needed):
  npm ci
  npm run visual:setup
  npm run visual:serve                         # keep running; PORT defaults to 3210
  npm run visual:start                         # another terminal; only when Start is absent
  TEST_BASE_URL=http://127.0.0.1:3210 npm run test:e2e --workspace @packages/app
  npm run visual:current                       # after edits settle
  npm run visual:sheet                         # presentation-only regeneration

Artifacts: artifacts/visual/{start,current}, contact-sheet{,-desktop,-mobile}.html/.png,
contact-sheet-inline.html, pair-previews/*.webp and cleanup-comparison.json.
HTML links to full-page originals; PNG sheets are explicitly top-of-page overviews.
Images/fonts may still need public internet access. Capture blocks non-GET/HEAD requests.
Start is never overwritten. Existing Start artifacts must be supplied to compare to an older
baseline; the bundled fixture alone cannot recreate historical screenshots or source.
Browser, server/runner Node, OS, dependencies, lockfile and source hashes are disclosed.
Condition differences are allowed for HUMAN review, never claimed as controlled pixel parity.
TEST_BASE_URL must match visual:serve for captures; E2E uses it without launching port 3000.
`;

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h") || !args.length) {
    console.log(usage);
  } else {
    const mode = args[0];
    const action = mode === "setup" ? setup : mode === "serve" ? serve : mode === "sheet" ? () => regenerateSheets().then(() => console.log(`Rebuilt contact sheets from existing captures. ${path.join(output, "contact-sheet.html")}`)) : ["start", "current"].includes(mode) ? () => capture(mode) : null;
    if (!action || args.length !== 1) { console.error(usage); process.exitCode = 1; }
    else action().catch((error) => { console.error(error); process.exitCode = 1; });
  }
}
