const assert = require("node:assert/strict");
const { test, beforeEach } = require("node:test");
const { createJiti } = require("jiti");
const nodemailer = require("nodemailer");

const handler = createJiti(__filename)("../pages/api/forms.ts").default;
const payload = {
  "form-name": "cart",
  "cf-turnstile-response": "cart-token",
  name: "Test Customer",
  email: "customer@example.test",
  message: "Please check availability.",
  cartText: "(2) x Test Daylily @ $20.00/each",
};
let sent;
let logs;
let smtpError;
let verificationResult;
let verificationError;
let verificationStatus;
let verificationCalls;

beforeEach((t) => {
  const originalEnv = { ...process.env };
  t.after(() => {
    process.env = originalEnv;
  });
  Object.assign(process.env, {
    TURNSTILE_SECRET_KEY: "test-secret",
    SMTP_USER: "sender@example.test",
    SMTP_PASS: "test-password",
    CONTACT_TO_EMAIL: "owner@example.test",
    CONTACT_BCC_EMAIL: "",
  });
  sent = [];
  logs = [];
  smtpError = null;
  verificationResult = null;
  verificationError = null;
  verificationStatus = 200;
  verificationCalls = [];
  t.mock.method(globalThis, "fetch", async (url, options) => {
    const body = JSON.parse(options.body);
    verificationCalls.push(body);
    assert.equal(url, "https://challenges.cloudflare.com/turnstile/v0/siteverify");
    assert.equal(options.method, "POST");
    assert.equal(body.secret, "test-secret");
    assert.ok(options.signal instanceof AbortSignal);
    if (verificationError) throw verificationError;
    return Response.json(verificationResult ?? {
      success: true,
      hostname: "rollingoaksdaylilies.com",
      action: body.response.split("-")[0],
    }, { status: verificationStatus });
  });
  t.mock.method(nodemailer, "createTransport", () => ({
    async sendMail(mail) {
      if (smtpError) throw smtpError;
      sent.push(mail);
    },
  }));
  for (const level of ["info", "warn", "error"]) {
    t.mock.method(console, level, (entry) => logs.push(JSON.parse(entry)));
  }
});

async function submit(body) {
  const response = {
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(value) {
      this.body = value;
    },
  };
  await handler({ method: "POST", headers: { host: "rollingoaksdaylilies.com" }, body }, response);
  return response;
}

test("verified cart and contact submissions reach SMTP with the customer details", async () => {
  for (const formName of ["cart", "contact"]) {
    const token = `${formName}-token`;
    const response = await submit({
      ...payload,
      "form-name": formName,
      "cf-turnstile-response": token,
    });
    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.body, { ok: true });
    assert.equal(verificationCalls.at(-1).response, token);
    const mail = sent.at(-1);
    assert.equal(mail.replyTo, payload.email);
    assert.match(mail.text, /Test Daylily/);
    assert.match(mail.text, /Please check availability/);
    assert.ok(!mail.text.includes(token));
  }
  assert.equal(sent.length, 2);
  assert.equal(verificationCalls.length, 2);
  assert.ok(!JSON.stringify(logs).includes(payload.email));
  assert.ok(!JSON.stringify(logs).includes(payload.name));
});

test("honeypots and multiple links still block email; one link is allowed", async () => {
  for (const formName of ["cart", "contact"]) {
    for (const field of ["bot-field", "website", "company"]) {
      await submit({ ...payload, "form-name": formName, [field]: "spam" });
      assert.equal(logs.at(-1).reason, "honeypot_filled");
    }
    await submit({
      ...payload,
      "form-name": formName,
      message: "https://example.test www.example.test",
    });
    assert.equal(logs.at(-1).reason, "too_many_links");
  }
  assert.equal(sent.length, 0);
  const response = await submit({ ...payload, message: "https://example.test" });
  assert.equal(response.statusCode, 200);
  assert.equal(sent.length, 1);
});

test("SMTP failures return an API error without logging personal data", async () => {
  smtpError = Object.assign(
    new Error(`Rejected ${payload.email}: ${payload.message}`),
    {
      name: payload.name,
      command: `RCPT TO:<${payload.email}>`,
      code: payload.email,
      responseCode: 550,
    }
  );
  const response = await submit(payload);
  assert.equal(response.statusCode, 500);
  assert.deepEqual(response.body, { error: "Could not send message" });
  assert.equal(sent.length, 0);
  assert.equal(logs.at(-1).event, "form_email_send_failed");
  assert.equal(logs.at(-1).smtpResponseCode, 550);
  const output = JSON.stringify(logs);
  for (const value of [payload.name, payload.email, payload.message, payload.cartText]) {
    assert.ok(!output.includes(value));
  }
});

test("both forms reject missing, forged, expired, and incorrectly scoped tokens", async () => {
  for (const formName of ["contact", "cart"]) {
    const body = { ...payload, "form-name": formName };
    const callsBefore = verificationCalls.length;
    for (const token of [undefined, "", "x".repeat(2049)]) {
      const response = await submit({ ...body, "cf-turnstile-response": token });
      assert.equal(response.statusCode, 403);
    }
    assert.equal(verificationCalls.length, callsBefore);
    for (const result of [
      { success: false, "error-codes": ["invalid-input-response"] },
      { success: false, "error-codes": ["timeout-or-duplicate"] },
      { success: true, hostname: "other.example", action: formName },
      { success: true, hostname: "rollingoaksdaylilies.com", action: "other" },
    ]) {
      verificationResult = result;
      const response = await submit(body);
      assert.equal(response.statusCode, 403);
      assert.match(response.body.error, /verification/);
    }
  }
  assert.equal(sent.length, 0);
});

test("a used token is verified again and cannot send a second email", async () => {
  assert.equal((await submit(payload)).statusCode, 200);
  verificationResult = { success: false, "error-codes": ["timeout-or-duplicate"] };
  assert.equal((await submit(payload)).statusCode, 403);
  assert.equal(verificationCalls.length, 2);
  assert.equal(sent.length, 1);
});

test("configuration and verification service failures never send email", async () => {
  delete process.env.TURNSTILE_SECRET_KEY;
  assert.equal((await submit(payload)).statusCode, 503);
  assert.equal(verificationCalls.length, 0);
  process.env.TURNSTILE_SECRET_KEY = "test-secret";

  verificationStatus = 500;
  assert.equal((await submit(payload)).statusCode, 503);
  verificationStatus = 200;
  verificationResult = { unexpected: "response" };
  assert.equal((await submit(payload)).statusCode, 503);
  for (const error of [new Error("network failed"), new DOMException("timed out", "TimeoutError")]) {
    verificationError = error;
    assert.equal((await submit(payload)).statusCode, 503);
  }
  assert.equal(sent.length, 0);
  const output = JSON.stringify(logs);
  for (const value of ["test-secret", payload["cf-turnstile-response"], payload.email, payload.message]) {
    assert.ok(!output.includes(value));
  }
});
