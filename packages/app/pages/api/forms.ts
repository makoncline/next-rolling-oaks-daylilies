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

const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL || "kaymcline@gmail.com";
const CONTACT_BCC_EMAIL = process.env.CONTACT_BCC_EMAIL || "";

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

const getMailer = () => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error("SMTP_USER and SMTP_PASS are required to send mail.");
  }

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
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
    await getMailer().sendMail({
      from: process.env.SMTP_USER,
      to: getEmailList(CONTACT_TO_EMAIL),
      bcc: getEmailList(CONTACT_BCC_EMAIL),
      replyTo: payload.email,
      subject: getSubject(payload),
      text: getBodyText(payload),
    });

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not send message" });
  }
}
