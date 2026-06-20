// WeChat Pay unified order API for mini program
// 
// Prerequisites:
//   1. WeChat merchant account (商户号)
//   2. Configured in WeChat Pay dashboard (支付目录, etc.)
//   3. API key and certs
//
// This endpoint creates a prepay_id for wx.requestPayment

const crypto = require('crypto');

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { openid } = req.body || {};
  if (!openid) return res.status(400).json({ error: 'openid required' });

  // In production, create WeChat Pay unified order here
  // This requires:
  //   - WeChat merchant ID (mchid)
  //   - API key
  //   - API v3 certificate
  
  // For development/demo, return a simulated response
  const now = Date.now();
  const orderId = `PDFKIT${now}`;

  return res.json({
    success: true,
    data: {
      // Simulated WeChat Pay parameters
      // In production, these come from WeChat Pay API
      appId: process.env.WECHAT_APPID || 'YOUR_APPID',
      timeStamp: String(Math.floor(now / 1000)),
      nonceStr: crypto.randomBytes(16).toString('hex'),
      package: 'prepay_id=wx' + now,
      signType: 'RSA',
      // paySign is computed by WeChat Pay API in production
      paySign: 'SIMULATED_SIGN_' + orderId,
      orderId
    },
    price: 19,
    currency: 'USD'
  });
}
