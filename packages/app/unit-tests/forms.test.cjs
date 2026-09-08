const assert = require("node:assert/strict");
const { test, beforeEach } = require("node:test");
const { createJiti } = require("jiti");
const nodemailer = require("nodemailer");

const handler = createJiti(__filename)("../pages/api/forms.ts").default;
const payload = {
  "form-name": "cart",
  name: "Test Customer",
  email: "customer@example.test",
  message: "Please check availability.",
  cartText: "(2) x Test Daylily @ $20.00/each",
};
let sent;
let logs;
let smtpError;

beforeEach((t) => {
  const originalEnv = { ...process.env };
  t.after(() => {
    process.env = originalEnv;
  });
  Object.assign(process.env, {
    SMTP_USER: "sender@example.test",
    SMTP_PASS: "test-password",
    CONTACT_TO_EMAIL: "owner@example.test",
    CONTACT_BCC_EMAIL: "",
  });
  sent = [];
  logs = [];
  smtpError = null;
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
  await handler({ method: "POST", body }, response);
  return response;
}

test("cart and contact submissions reach SMTP without a timestamp or after three hours", async () => {
  for (const formName of ["cart", "contact"]) {
    for (const timestamp of [undefined, String(Date.now() - 3 * 60 * 60 * 1000)]) {
      const body = { ...payload, "form-name": formName };
      if (timestamp !== undefined) body["form-started-at"] = timestamp;
      const response = await submit(body);
      assert.equal(response.statusCode, 200);
      assert.deepEqual(response.body, { ok: true });
      const mail = sent.at(-1);
      assert.equal(mail.replyTo, payload.email);
      assert.match(mail.text, /Test Daylily/);
      assert.match(mail.text, /Please check availability/);
    }
  }
  assert.equal(sent.length, 4);
  assert.equal(
    logs.filter((entry) => entry.event === "form_email_send_succeeded").length,
    4
  );
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
