import nodemailer from "nodemailer";

let transporter;

function getTransporter() {
  if (!process.env.SMTP_HOST) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
        : undefined,
    });
  }
  return transporter;
}

// Sends an OTP email. If SMTP is not configured (local/dev), the OTP is logged
// to the server console instead so the flow can still be tested end-to-end.
export async function sendOtpEmail(toEmail, otp, { purpose } = {}) {
  const subject =
    purpose === "partner_register" ? "Your Strivio Partner verification code" : "Your Strivio login code";
  const text = `Your Strivio verification code is ${otp}. It expires in 10 minutes. If you did not request this, you can ignore this email.`;
  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2 style="color:#0B1F33">Strivio</h2>
      <p>Your verification code is:</p>
      <p style="font-size:32px;font-weight:800;letter-spacing:6px;color:#0B1F33">${otp}</p>
      <p style="color:#666">This code expires in 10 minutes.</p>
    </div>`;

  const mailTransporter = getTransporter();

  if (!mailTransporter) {
    console.log(`[strivio][dev-otp] purpose=${purpose} email=${toEmail} otp=${otp}`);
    return { delivered: false, devMode: true };
  }

  await mailTransporter.sendMail({
    from: process.env.SMTP_FROM || "Strivio <no-reply@strivio.local>",
    to: toEmail,
    subject,
    text,
    html,
  });

  return { delivered: true, devMode: false };
}
