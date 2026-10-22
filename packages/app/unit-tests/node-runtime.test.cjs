const assert = require("node:assert/strict");
const { once } = require("node:events");
const { createServer } = require("node:http");
const { test } = require("node:test");
const { brotliCompressSync } = require("node:zlib");

test(
  "patched Node runtime decodes Brotli HTTP responses",
  { timeout: 5000 },
  async (t) => {
    const [major, minor, patch] = process.versions.node.split(".").map(Number);
    assert.ok(
      major === 22 && (minor > 23 || (minor === 23 && patch >= 4)),
      `Node ${process.versions.node} does not meet the patched 22.23.4 runtime floor`,
    );

    const text = "Brotli response decoding works.";
    const compressed = brotliCompressSync(Buffer.from(text));
    const server = createServer((request, response) => {
      response.writeHead(200, { "Content-Encoding": "br" });
      response.end(
        request.url === "/invalid"
          ? Buffer.from([0xff, 0xff, 0xff])
          : compressed,
      );
    });
    t.after(
      () =>
        new Promise((resolve, reject) => {
          server.closeAllConnections();
          server.close((error) => (error ? reject(error) : resolve()));
        }),
    );
    server.listen(0, "127.0.0.1");
    await once(server, "listening");
    const url = `http://127.0.0.1:${server.address().port}`;

    assert.equal(await (await fetch(url)).text(), text);
    await assert.rejects(async () => (await fetch(`${url}/invalid`)).text());
  },
);
