import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";

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

const getErrorDetails = (error: unknown): LogFields => {
  if (!(error instanceof Error)) return { errorType: typeof error };

  const details: LogFields = {
    errorName: error.name,
    errorMessage: error.message,
  };

  const maybeSmtpError = error as Error & {
    code?: string;
    command?: string;
    responseCode?: number;
  };

  if (maybeSmtpError.code) details.errorCode = maybeSmtpError.code;
  if (maybeSmtpError.command) details.smtpCommand = maybeSmtpError.command;
  if (maybeSmtpError.responseCode) {
    details.smtpResponseCode = maybeSmtpError.responseCode;
  }

  return details;
};

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (getString(getBody(req)["bot-field"])) {
    res.status(200).json({ ok: true });
    return;
  }

  const payload = parsePayload(req);
  if (!payload) {
    res.status(400).json({ error: "Invalid form submission" });
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
    logFormEvent("error", "form_email_send_failed", {
      formName: payload.formName,
      ...getSmtpConfig(),
      ...getErrorDetails(error),
    });
    res.status(500).json({ error: "Could not send message" });
  }
}
