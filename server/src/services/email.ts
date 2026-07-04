import nodemailer from "nodemailer";
import { getEnv } from "../config/env.js";

export type SendMailArgs = {
  to: string;
  subject: string;
  html: string;
};

export async function sendMail({ to, subject, html }: SendMailArgs) {
  const env = getEnv();
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
    // eslint-disable-next-line no-console
    console.warn("[email] SMTP not configured. Skipping send.", {
      to,
      subject,
    });
    return;
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  try {
    await transporter.sendMail({
      from: SMTP_FROM,
      to,
      subject,
      html,
    });
    console.log("[email] Sent successfully to:", to);
  } catch (err) {
    console.error("[email] Failed to send (non-fatal):", err);
    // Don't crash the server — form will still submit successfully
  }
}
