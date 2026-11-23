const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const clean = (value) => typeof value === 'string' ? value.trim() : '';

function validateContact(body) {
  const values = {
    name: clean(body?.name), email: clean(body?.email),
    subject: clean(body?.subject), message: clean(body?.message),
    website: clean(body?.website),
  };
  if (values.website) return { ok: true, spam: true };
  if (!values.name || !values.email || !values.subject || !values.message) {
    return { ok: false, message: 'Please complete all required fields.' };
  }
  if (values.name.length > 80 || values.email.length > 254 || values.subject.length > 120 || values.message.length > 5000) {
    return { ok: false, message: 'One or more fields exceed the allowed length.' };
  }
  if (!EMAIL_RE.test(values.email) || /[\r\n]/.test(values.email)) {
    return { ok: false, message: 'Please enter a valid email address.' };
  }
  if (/[\r\n]/.test(values.subject)) return { ok: false, message: 'Please enter a valid subject.' };
  return { ok: true, values };
}

module.exports = { validateContact };
