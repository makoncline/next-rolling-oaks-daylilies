import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";
import { z } from "zod";

type FormName = "contact" | "cart";

type FormPayload = {
  formName: FormName;
  name: string;
  email: string;
  message: string;
  cartText: string;
};

type LogFields = Record<string, boolean | number | string | null | undefined>;

type SmtpConfig = {
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
};

const BOT_TRAP_FIELDS = ["bot-field", "website", "company"];
const MAX_LINK_COUNT = 1;

const logFormEvent = (
  level: "info" | "warn" | "error",
  event: string,
  fields: LogFields = {}
) => {
  console[level](
    JSON.stringify({
      scope: "forms",
      event,
      ...fields,
    })
  );
};

const getString = (value: unknown) => {
  if (Array.isArray(value)) return String(value[0] || "").trim();
  return String(value || "").trim();
};

const getStrings = (value: unknown) =>
  (Array.isArray(value) ? value : [value])
    .map((item) => String(item || "").trim())
    .filter(Boolean);

const getBody = (req: NextApiRequest) =>
  typeof req.body === "object" && req.body !== null
    ? (req.body as Record<string, unknown>)
    : {};

const getFormName = (req: NextApiRequest): FormName | null => {
  const body = getBody(req);
  const formName = getString(body["form-name"] || body.formName);
  if (formName === "contact" || formName === "cart") return formName;
  return null;
};

const hasValidEmailShape = (email: string) => /\S+@\S+\.\S+/.test(email);

const getEmailList = (value: string) =>
  value
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);

const getSmtpConfig = (): SmtpConfig => {
  return {
    smtpHost: process.env.SMTP_HOST || "smtp.gmail.com",
    smtpPort: Number.parseInt(process.env.SMTP_PORT || "587", 10),
    smtpSecure: process.env.SMTP_SECURE === "true",
  };
};

const parsePayload = (req: NextApiRequest): FormPayload | null => {
  const formName = getFormName(req);
  if (!formName) return null;

  const body = getBody(req);
  const name = getString(body.name);
  const email = getString(body.email);
  const message = getString(body.message);
  const cartText = getString(body.cartText);

  if (!name || !email || !hasValidEmailShape(email)) return null;
  if (formName === "contact" && !message) return null;
  if (formName === "cart" && !cartText) return null;

  return { formName, name, email, message, cartText };
};

const countLinks = (value: string) =>
  (value.match(/\b(?:https?:\/\/|www\.)\S+/gi) || []).length;

const getBotBlock = (
  req: NextApiRequest,
  payload: FormPayload
): LogFields | null => {
  const body = getBody(req);

  const trapField = BOT_TRAP_FIELDS.find(
    (field) => getStrings(body[field]).length > 0
  );
  if (trapField) {
    return { reason: "honeypot_filled", trapField };
  }

  const linkCount = countLinks(`${payload.message}\n${payload.cartText}`);
  if (linkCount > MAX_LINK_COUNT) {
    return { reason: "too_many_links", linkCount };
  }

  return null;
};

const getMailer = (smtpConfig: SmtpConfig) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error("SMTP_USER and SMTP_PASS are required to send mail.");
  }

  return nodemailer.createTransport({
    host: smtpConfig.smtpHost,
    port: smtpConfig.smtpPort,
    secure: smtpConfig.smtpSecure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const getRecipients = () => {
  const recipients = getEmailList(process.env.CONTACT_TO_EMAIL || "");
  if (!recipients.length) {
    throw new Error("CONTACT_TO_EMAIL is required to send mail.");
  }
  return recipients;
};

const getBccRecipients = () => getEmailList(process.env.CONTACT_BCC_EMAIL || "");

const getSubject = ({ formName, name }: FormPayload) =>
  formName === "cart"
    ? `Rolling Oaks availability request from ${name}`
    : `Rolling Oaks contact form from ${name}`;

const getBodyText = ({ formName, name, email, message, cartText }: FormPayload) =>
  [
    `Form: ${formName}`,
    `Name: ${name}`,
    `Email: ${email}`,
    "",
    cartText,
    message ? `Message:\n${message}` : "",
  ]
    .filter(Boolean)
    .join("\n");

const verificationSchema = z.object({
  success: z.boolean(),
  hostname: z.string().optional(),
  action: z.string().optional(),
});

async function verifyTurnstile(
  token: unknown,
  action: FormName,
  host: string | undefined
) {
  if (typeof token !== "string" || !token.trim() || token.length > 2048 || !host) {
    return false;
  }

  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    throw new Error("TURNSTILE_SECRET_KEY is required to verify forms.");
  }

  const hostname = new URL(`https://${host}`).hostname;
  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, response: token }),
      signal: AbortSignal.timeout(10_000),
    }
  );
  if (!response.ok) {
    throw new Error("Turnstile verification is unavailable.");
  }

  const result = verificationSchema.parse(await response.json());
  return (
    result.success && result.hostname === hostname && result.action === action
  );
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const payload = parsePayload(req);
  if (!payload) {
    res.status(400).json({ error: "Invalid form submission" });
    return;
  }

  const botBlock = getBotBlock(req, payload);
  if (botBlock) {
    logFormEvent("warn", "form_bot_submission_blocked", {
      formName: payload.formName,
      ...botBlock,
    });
    res.status(200).json({ ok: true });
    return;
  }

  try {
    const verified = await verifyTurnstile(
      getBody(req)["cf-turnstile-response"],
      payload.formName,
      req.headers.host
    );
    if (!verified) {
      logFormEvent("warn", "form_verification_rejected", {
        formName: payload.formName,
      });
      res.status(403).json({ error: "Please complete verification and try again." });
      return;
    }
  } catch {
    logFormEvent("error", "form_verification_unavailable", {
      formName: payload.formName,
    });
    res.status(503).json({ error: "Could not verify your request. Please try again." });
    return;
  }

  try {
    const smtpConfig = getSmtpConfig();
    const recipients = getRecipients();
    const bccRecipients = getBccRecipients();

    logFormEvent("info", "form_submit_started", {
      formName: payload.formName,
      recipientCount: recipients.length,
      bccCount: bccRecipients.length,
      hasSmtpUser: Boolean(process.env.SMTP_USER),
      hasSmtpPass: Boolean(process.env.SMTP_PASS),
      ...smtpConfig,
    });

    await getMailer(smtpConfig).sendMail({
      from: process.env.SMTP_USER,
      to: recipients,
      bcc: bccRecipients,
      replyTo: payload.email,
      subject: getSubject(payload),
      text: getBodyText(payload),
    });

    logFormEvent("info", "form_email_send_succeeded", {
      formName: payload.formName,
      recipientCount: recipients.length,
      bccCount: bccRecipients.length,
      ...smtpConfig,
    });

    res.status(200).json({ ok: true });
  } catch (error) {
    const smtpResponseCode =
      error instanceof Error &&
      "responseCode" in error &&
      typeof error.responseCode === "number"
        ? error.responseCode
        : undefined;
    logFormEvent("error", "form_email_send_failed", {
      formName: payload.formName,
      ...getSmtpConfig(),
      smtpResponseCode,
    });
    res.status(500).json({ error: "Could not send message" });
  }
}
