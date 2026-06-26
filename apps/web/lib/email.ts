import nodemailer from "nodemailer";

import { env } from "./env";

let _transporter: nodemailer.Transporter | undefined;

function getTransporter() {
  if (_transporter) return _transporter;

  _transporter = nodemailer.createTransport({
    host: env.SMTP_HOST(),
    port: env.SMTP_PORT(),
    secure: env.SMTP_PORT() === 465,
    auth: {
      user: env.SMTP_USER(),
      pass: env.SMTP_PASS(),
    },
  });

  return _transporter;
}

export async function sendOtpEmail(to: string, otp: string) {
  await getTransporter().sendMail({
    from: env.SMTP_FROM(),
    to,
    subject: "Kode verifikasi RW 25 Cimahi",
    text: `Kode verifikasi email Anda: ${otp}\n\nKode ini berlaku selama 10 menit. Jangan bagikan kode ini kepada siapa pun.`,
    html: `
      <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 420px; margin: 0 auto;">
        <p style="font-size: 13px; font-weight: 600; color: #64748b; letter-spacing: -0.01em;">RW 25 Cimahi</p>
        <h1 style="font-size: 22px; font-weight: 700; color: #0f172a; margin: 12px 0;">Kode verifikasi email</h1>
        <p style="font-size: 14px; color: #475569; line-height: 1.6;">Gunakan kode di bawah untuk memverifikasi alamat email Anda. Kode berlaku 10 menit.</p>
        <div style="margin: 24px 0; padding: 16px 24px; background: #eff6ff; border-radius: 20px; text-align: center;">
          <span style="font-size: 32px; font-weight: 700; letter-spacing: 0.2em; color: #2563eb;">${otp}</span>
        </div>
        <p style="font-size: 12px; color: #94a3b8;">Jangan bagikan kode ini kepada siapa pun, termasuk pihak yang mengaku dari RW 25.</p>
      </div>
    `,
  });
}
