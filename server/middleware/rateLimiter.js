const { rateLimit } = require('express-rate-limit');

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Too many messages were sent. Please wait a little and try again.' },
});

module.exports = { contactLimiter };
