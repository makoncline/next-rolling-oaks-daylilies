const refreshToken = process.env.PUBLIC_SNAPSHOT_REFRESH_TOKEN || "prestart";

process.env.PUBLIC_SNAPSHOT_REFRESH_TOKEN = refreshToken;

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

(async () => {
  const { default: handler } = await require("../.next/server/pages/api/public-snapshot/refresh.js");
  await handler(req, res);

  if (statusCode >= 400) {
    throw new Error(
      `Public snapshot prestart failed with status ${statusCode}: ${JSON.stringify(
        body
      )}`
    );
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
