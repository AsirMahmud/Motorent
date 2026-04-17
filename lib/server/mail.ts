import nodemailer from "nodemailer";

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  const port = Number(process.env.SMTP_PORT ?? "587");
  return nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE === "true" || port === 465,
    auth: { user, pass },
  });
}

export async function sendMail(opts: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<{ sent: boolean; error?: string }> {
  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER;
  const transport = getTransporter();
  if (!transport || !from) {
    console.warn("[mail] SMTP not configured (SMTP_HOST, SMTP_USER, SMTP_PASS); skipping send.");
    return { sent: false };
  }
  try {
    await transport.sendMail({
      from,
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
      html: opts.html ?? opts.text.replace(/\n/g, "<br/>"),
    });
    return { sent: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("[mail] send failed:", message);
    return { sent: false, error: message };
  }
}
