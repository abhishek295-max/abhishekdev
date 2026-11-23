const { validateContact } = require('../../server/utils/validation');
const { sendContactEmail } = require('../../server/config/mailer');

const hits = new Map();
const WINDOW_MS = 15 * 60 * 1000;
const LIMIT = 5;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: { Allow: 'POST' }, body: JSON.stringify({ message: 'Method not allowed.' }) };
  }

  const ip = event.headers['x-nf-client-connection-ip'] || event.headers['client-ip'] || 'unknown';
  const now = Date.now();
  const entry = hits.get(ip);
  if (entry && now - entry.start < WINDOW_MS && entry.count >= LIMIT) {
    return { statusCode: 429, body: JSON.stringify({ message: 'Too many messages were sent. Please wait a little and try again.' }) };
  }
  if (!entry || now - entry.start >= WINDOW_MS) hits.set(ip, { start: now, count: 1 });
  else entry.count += 1;

  let body;
  try {
    if (Buffer.byteLength(event.body || '', 'utf8') > 12 * 1024) throw new Error('too large');
    body = JSON.parse(event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body || '{}');
  } catch (_) {
    return { statusCode: 400, body: JSON.stringify({ message: 'Please submit valid contact details.' }) };
  }

  const result = validateContact(body);
  if (!result.ok) return { statusCode: 400, body: JSON.stringify({ message: result.message }) };
  if (result.spam) return { statusCode: 200, body: JSON.stringify({ message: 'Message received.' }) };

  try {
    await sendContactEmail(result.values);
    return { statusCode: 200, body: JSON.stringify({ message: 'Message sent.' }) };
  } catch (error) {
    console.error('Contact email delivery failed:', error.message);
    return { statusCode: 503, body: JSON.stringify({ message: 'Email delivery is temporarily unavailable.' }) };
  }
};
