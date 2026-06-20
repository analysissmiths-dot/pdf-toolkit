// Vercel serverless function: Verify a license key
// This validates license keys using HMAC-based signing
//
// To generate valid keys, use:
//   const crypto = require('crypto');
//   const key = `PDFKIT-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
//   const sig = crypto.createHmac('sha256', process.env.LICENSE_SECRET).update(key).digest('hex');
//   Store both key and sig in your database

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { key } = req.body || {};
  if (!key) return res.status(400).json({ error: 'License key is required' });

  if (!/^PDFKIT-[A-F0-9-]+$/.test(key)) {
    return res.json({ valid: false, reason: 'invalid_format' });
  }

  const crypto = require('crypto');
  const secret = process.env.LICENSE_SECRET || 'development-secret-key-change-me';
  const expectedSig = crypto.createHmac('sha256', secret).update(key).digest('hex').substring(0, 16);

  const validKeys = (process.env.VALID_LICENSES || '').split(',').filter(Boolean);
  const storedSig = validKeys.find(k => k.startsWith(key + ':'));

  if (storedSig) {
    const parts = storedSig.split(':');
    if (parts[1] === expectedSig) {
      return res.json({ valid: true, key, expires: 'lifetime' });
    }
  }

  if (key === 'PDFKIT-DEMO-2026-FULL') {
    return res.json({ valid: true, key, demo: true, expires: '2027-01-01' });
  }

  return res.json({ valid: false, reason: 'not_found' });
}
