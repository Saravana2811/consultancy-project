import nodemailer from 'nodemailer';

let transporter = null;

async function getTransporter() {
  if (transporter) return transporter;

  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = Number(process.env.SMTP_PORT) || 587;
  const smtpUser = (process.env.SMTP_USER || '').trim();
  const smtpPass = (process.env.SMTP_PASS || '').trim();
  const looksLikePlaceholder =
    /your_email@gmail\.com/i.test(smtpUser) ||
    /your_app_specific_password|your_app_password_here/i.test(smtpPass);

  if (!smtpUser || !smtpPass || looksLikePlaceholder) {
    throw new Error('SMTP is not configured. Set valid SMTP_USER and SMTP_PASS in admin/backend/.env.');
  }

  const isGmail = smtpHost === 'smtp.gmail.com' || smtpUser.endsWith('@gmail.com');
  const secure = smtpPort === 465;

  const t = nodemailer.createTransport({
    ...(isGmail ? { service: 'gmail' } : { host: smtpHost, port: smtpPort }),
    secure,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  try {
    await t.verify();
    console.log('✅ Admin SMTP verified');
    transporter = t;
  } catch (err) {
    const reason = err?.message || 'Unknown SMTP verification error';
    throw new Error(`Admin SMTP verification failed: ${reason}`);
  }
  return t;
}

export async function sendOtpEmail(to, otp) {
  const t = await getTransporter();
  const from = process.env.FROM_EMAIL || process.env.SMTP_USER;

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#1a1728;color:#eae6ff;border-radius:16px;padding:36px;">
      <div style="text-align:center;margin-bottom:24px;">
        <div style="width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#7b5cf1,#9b7cf8);display:inline-flex;align-items:center;justify-content:center;font-size:28px;">🔑</div>
      </div>
      <h2 style="text-align:center;font-size:1.6rem;margin:0 0 8px;color:#fff;">Admin Password Reset</h2>
      <p style="text-align:center;color:#b7b2cc;margin-bottom:28px;">Your one-time password (OTP) is:</p>
      <div style="background:#2b2835;border-radius:12px;padding:20px;text-align:center;letter-spacing:12px;font-size:2.4rem;font-weight:800;color:#cbbafc;border:2px solid #7b5cf1;">
        ${otp}
      </div>
      <p style="text-align:center;color:#b7b2cc;margin-top:20px;font-size:0.9rem;">⏱ Expires in <strong>10 minutes</strong>. Do not share this OTP.</p>
    </div>
  `;

  try {
    await t.sendMail({ from, to, subject: 'Admin Portal - Password Reset OTP', html });
    console.log(`📧 Admin OTP sent to ${to}`);
  } catch (err) {
    const reason = err?.message || 'Unknown sendMail error';
    throw new Error(`Failed to send admin OTP email: ${reason}`);
  }
}
