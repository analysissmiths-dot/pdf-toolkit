// LemonSqueezy webhook handler — processes purchase events
// When a customer buys, this generates a license key and stores it
//
// Setup:
// 1. Set LEMON_SQUEEZY_WEBHOOK_SECRET in Vercel env vars
// 2. Set LICENSE_SECRET for HMAC signing
// 3. Configure webhook URL in LemonSqueezy dashboard
//    URL: https://your-domain.vercel.app/api/lemon-squeezy-webhook

const crypto = require('crypto');

function generateLicenseKey() {
  const random = crypto.randomBytes(8).toString('hex').toUpperCase();
  return `PDFKIT-${random.substring(0,4)}-${random.substring(4,8)}-${random.substring(8,12)}-${random.substring(12,16)}`;
}

function signLicenseKey(key, secret) {
  return crypto.createHmac('sha256', secret).update(key).digest('hex').substring(0, 16);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
  const signature = req.headers['x-signature'];

  if (secret && signature) {
    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');
    if (signature !== expectedSig) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
  }

  const { meta, data } = req.body;

  if (data?.attributes?.status === 'paid' || data?.attributes?.status === 'completed') {
    const customerEmail = data.attributes.user_email || data.attributes.customer_email || 'unknown';
    const orderId = data.id;
    const productName = data.attributes.product_name || 'PDFKit';

    const licenseKey = generateLicenseKey();
    const licenseSecret = process.env.LICENSE_SECRET || 'development-secret-key-change-me';
    const signature = signLicenseKey(licenseKey, licenseSecret);

    console.log(`=== NEW LICENSE SOLD ===`);
    console.log(`Product: ${productName}`);
    console.log(`Order: ${orderId}`);
    console.log(`Customer: ${customerEmail}`);
    console.log(`License Key: ${licenseKey}`);
    console.log(`Signature: ${signature}`);
    console.log(`Store in VALID_LICENSES env: ${licenseKey}:${signature}`);

    // In production: save to database or email the key
    // For quick start: add to VALID_LICENSES env var via Vercel dashboard

    return res.status(200).json({
      received: true,
      license_key: licenseKey
    });
  }

  // Other events (order created, refunded, etc.)
  return res.status(200).json({ received: true });
}
