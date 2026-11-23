const test = require('node:test');
const assert = require('node:assert/strict');
const { validateContact } = require('../utils/validation');
const contactFunction = require('../../netlify/functions/contact');

test('contact validation accepts a valid message and trims values', () => {
  const result = validateContact({ name: '  Abhishek ', email: ' hi@example.com ', subject: ' Hello ', message: ' Message ' });
  assert.equal(result.ok, true);
  assert.equal(result.values.name, 'Abhishek');
  assert.equal(result.values.email, 'hi@example.com');
});

test('contact validation rejects missing fields, invalid email, and overlong input', () => {
  assert.equal(validateContact({}).ok, false);
  assert.equal(validateContact({ name: 'A', email: 'bad', subject: 's', message: 'm' }).ok, false);
  assert.equal(validateContact({ name: 'A'.repeat(81), email: 'a@b.co', subject: 's', message: 'm' }).ok, false);
});

test('contact honeypot is accepted without calling the mail transport', async () => {
  const response = await contactFunction.handler({
    httpMethod: 'POST', headers: { 'x-nf-client-connection-ip': 'test-honeypot' },
    body: JSON.stringify({ name: 'Bot', email: 'bot@example.com', subject: 'spam', message: 'spam', website: 'filled' }),
  });
  assert.equal(response.statusCode, 200);
  assert.match(response.body, /Message received/);
});

test('contact function enforces method, JSON, and validation errors', async () => {
  const base = { headers: { 'x-nf-client-connection-ip': 'test-errors' } };
  assert.equal((await contactFunction.handler({ ...base, httpMethod: 'GET' })).statusCode, 405);
  assert.equal((await contactFunction.handler({ ...base, httpMethod: 'POST', body: '{' })).statusCode, 400);
  assert.equal((await contactFunction.handler({ ...base, httpMethod: 'POST', body: '{}' })).statusCode, 400);
});
