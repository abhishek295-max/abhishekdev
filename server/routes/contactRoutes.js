const express = require('express');
const { contactLimiter } = require('../middleware/rateLimiter');
const { submitContact } = require('../controllers/contactController');

const router = express.Router();
router.post('/', contactLimiter, submitContact);
module.exports = router;
