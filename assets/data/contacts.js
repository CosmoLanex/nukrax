// ═══════════════════════════════════════════════════════════════════════
// NUKRAX — assets/data/contacts.js
// THE single source of truth for every contact address on the site.
// Nothing else should hardcode an "@nukrax.com" address directly — import
// from here so a future address change happens in exactly one place.
// Same centralization pattern as assets/data/pricing.js and
// assets/address.js.
// ═══════════════════════════════════════════════════════════════════════

export const CONTACTS = Object.freeze({
  support: {
    email: 'support@nukrax.com',
    label: 'Support',
    use: 'Product issues, account/login problems, EA troubleshooting, dashboard bugs — general "something\u2019s not working".',
  },
  contact: {
    email: 'contact@nukrax.com',
    label: 'General Inquiries',
    use: 'Questions before signing up, press, media, anything that isn\u2019t a problem.',
  },
  billing: {
    email: 'billing@nukrax.com',
    label: 'Billing',
    use: 'License Key issues, payment failures, refund requests, marketplace order disputes.',
  },
  partners: {
    email: 'partners@nukrax.com',
    label: 'Partnerships',
    use: 'Affiliate/reseller inquiries, EA licensing partnerships, collaboration requests.',
  },
  security: {
    email: 'security@nukrax.com',
    label: 'Security',
    use: 'Vulnerability reports, account compromise reports, suspicious activity.',
  },
  feedback: {
    email: 'feedback@nukrax.com',
    label: 'Feedback',
    use: 'Feature requests, product suggestions, non-urgent input.',
  },
});

export const TELEGRAM_HANDLE = '@cosmolanex';
export const TELEGRAM_URL = 'https://t.me/cosmolanex';

/** @param {keyof CONTACTS} key */
export function getContact(key) {
  return CONTACTS[key] || CONTACTS.contact;
}

/** Builds a mailto: link with an optional pre-filled subject. */
export function mailtoLink(key, subject) {
  const { email } = getContact(key);
  return subject ? `mailto:${email}?subject=${encodeURIComponent(subject)}` : `mailto:${email}`;
}
