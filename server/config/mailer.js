const nodemailer = require('nodemailer');

function createTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    throw new Error('SMTP configuration is incomplete');
  }
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: String(SMTP_SECURE).toLowerCase() === 'true',
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
  });
}

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]));

async function sendContactEmail({ name, email, subject, message }) {
  const owner = process.env.OWNER_EMAIL;
  if (!owner) throw new Error('OWNER_EMAIL is not configured');
  const timestamp = new Date().toISOString();
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message).replace(/\r?\n/g, '<br>');
  const transporter = createTransporter();
  await transporter.sendMail({
    from: { name: 'Portfolio Contact Form', address: process.env.SMTP_USER },
    to: owner,
    replyTo: { name, address: email },
    subject: `Portfolio contact: ${subject.replace(/[\r\n]+/g, ' ').slice(0, 120)}`,
    text: `New portfolio message\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\nSubmitted: ${timestamp}\n\n${message}`,
    html: `<!doctype html><html><body style="margin:0;background:#f3f5f9;font-family:Arial,sans-serif;color:#172033"><main style="max-width:640px;margin:24px auto;background:#fff;border:1px solid #e4e8ef;border-radius:16px;overflow:hidden"><header style="padding:24px 28px;background:#0b1530;color:white"><p style="margin:0 0 8px;color:#75d9f2;font-size:12px;letter-spacing:2px;text-transform:uppercase">Portfolio contact</p><h1 style="margin:0;font-size:22px">${safeSubject}</h1></header><section style="padding:24px 28px"><p><strong>From</strong><br>${safeName} &lt;${safeEmail}&gt;</p><div style="margin:24px 0;padding:18px;background:#f5f7fb;border-radius:10px;line-height:1.7;overflow-wrap:anywhere">${safeMessage}</div><p style="font-size:12px;color:#687386">Submitted ${escapeHtml(timestamp)}</p></section></main></body></html>`,
  });
}

module.exports = { sendContactEmail };
