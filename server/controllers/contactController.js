const { validateContact } = require('../utils/validation');
const { sendContactEmail } = require('../config/mailer');

async function submitContact(req, res) {
  const result = validateContact(req.body);
  if (!result.ok) return res.status(400).json({ message: result.message });
  // Treat a filled honeypot like a successful submission without sending mail.
  if (result.spam) return res.status(200).json({ message: 'Message received.' });
  try {
    await sendContactEmail(result.values);
    return res.status(200).json({ message: 'Message sent.' });
  } catch (error) {
    console.error('Contact email delivery failed:', error.message);
    return res.status(503).json({ message: 'Email delivery is temporarily unavailable.' });
  }
}

module.exports = { submitContact };
