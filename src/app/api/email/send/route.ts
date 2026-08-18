import { NextResponse } from "next/server";
import { Resend } from "resend";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, subject, html, text } = body;

    if (!to) {
      return NextResponse.json(
        { ok: false, error: 'Recipient email ("to") is required.' },
        { status: 400 },
      );
    }

    const emailSubject =
      subject || "NEPSE Portfolio Tracker - Price Alert Notification";
    const emailHtml =
      html ||
      `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #e5e7eb; rounded: 8px;">
        <h2 style="color: #16a34a; margin-bottom: 12px;">NEPSE Tracker Price Alert Service</h2>
        <p style="color: #374151; font-size: 16px;">This is a test notification email confirming that your email alert service is working properly!</p>
        <div style="background-color: #f3f4f6; padding: 12px; rounded: 6px; margin-top: 16px;">
          <p style="margin: 0; font-size: 14px; color: #4b5563;">Recipient: <strong>${to}</strong></p>
          <p style="margin: 4px 0 0 0; font-size: 14px; color: #4b5563;">Status: Active & Verified</p>
        </div>
      </div>`;
    const emailText =
      text ||
      `NEPSE Tracker Notification: Email service is working properly for ${to}!`;

    // 1. Check for Resend API Key
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      const resend = new Resend(resendApiKey);
      const data = await resend.emails.send({
        from: process.env.EMAIL_FROM || "NEPSE Tracker <nepse@sumit.info.np>",
        to: [to],
        subject: emailSubject,
        html: emailHtml,
        text: emailText,
      });

      return NextResponse.json({
        ok: true,
        provider: "Resend",
        data,
        message: `Email sent successfully via Resend to ${to}`,
      });
    }

    // 2. Check for SMTP credentials (Nodemailer)
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpHost && smtpUser && smtpPass) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Boolean(process.env.SMTP_SECURE === "true"),
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || `NEPSE Tracker <${smtpUser}>`,
        to,
        subject: emailSubject,
        html: emailHtml,
        text: emailText,
      });

      return NextResponse.json({
        ok: true,
        provider: "Nodemailer (SMTP)",
        messageId: info.messageId,
        message: `Email sent successfully via SMTP to ${to}`,
      });
    }

    // 3. Fallback: Ethereal Test Transporter (Nodemailer test service)
    const testAccount = await nodemailer.createTestAccount();
    const testTransporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const info = await testTransporter.sendMail({
      from: "NEPSE Tracker <alerts@nepsetracker.com>",
      to,
      subject: emailSubject,
      html: emailHtml,
      text: emailText,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);

    return NextResponse.json({
      ok: true,
      provider: "Nodemailer (Ethereal SMTP)",
      previewUrl,
      message: `Test email sent to ${to}.${previewUrl ? ` View test email online: ${previewUrl}` : ""}`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send email";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
