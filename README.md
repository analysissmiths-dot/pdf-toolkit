# PDFKit — Privacy-First PDF Toolkit

> **All PDF processing happens in your browser. Files never leave your computer.**
> One-time payment, lifetime access, free updates.

## Live Demo

[pdf-toolkit-yang15.vercel.app](https://pdf-toolkit-yang15.vercel.app)

## Features

| Tool | Free Tier | Pro Tier |
|------|-----------|----------|
| Merge PDF | Up to 2 files | Unlimited |
| Split PDF | Up to 10 pages | Unlimited |
| Compress PDF | Locked | ✓ |
| Reorder Pages | Locked | ✓ |

**Price:** $19 one-time payment, lifetime access.

## Tech Stack

- Pure HTML/CSS/JS — no build tools needed
- [pdf-lib](https://pdf-lib.org/) — all PDF operations in-browser
- [LemonSqueezy](https://lemonsqueezy.com) — payment processing
- Hosted on Vercel (free tier)

## Quick Start (Local Development)

```bash
# Serve locally
cd pdf-toolkit
python3 -m http.server 8080
# Open http://localhost:8080
```

## Deployment

### Option A: Deploy to Vercel (Recommended)

1. Push to GitHub:
   ```bash
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```
2. Import your repo at [vercel.com/new](https://vercel.com/new)
3. Set environment variables in Vercel dashboard:
   - `LICENSE_SECRET` — Your HMAC signing secret
   - `VALID_LICENSES` — Comma-separated `KEY:SIGNATURE` pairs
4. Deploy — done!

### Option B: Deploy via Drag & Drop

1. Go to [vercel.com/new](https://vercel.com/new)
2. Select "Deploy without Git"
3. Drag the `pdf-toolkit` folder
4. Done!

## Setting Up Payments (LemonSqueezy)

### Step 1: Create a LemonSqueezy Account

1. Sign up at [lemonsqueezy.com](https://lemonsqueezy.com)
2. Create a store
3. Create a product:
   - Name: "PDFKit Pro"
   - Price: $19 (one-time)
   - No variants needed

### Step 2: Get Your Checkout URL

1. In LemonSqueezy dashboard → Products → Your product
2. Go to "Checkout" tab
3. Copy the "Buy Now" URL
4. Replace the URL in `js/payment.js`:
   ```js
   CHECKOUT_URL: 'https://your-store.lemonsqueezy.com/checkout/buy/...'
   ```

### Step 3: Set Up Webhook (for automatic license delivery)

1. Deploy the API endpoints first
2. In LemonSqueezy → Settings → Webhooks:
   - URL: `https://your-domain.vercel.app/api/lemon-squeezy-webhook`
   - Events: Select "order_created"
   - Secret: Set a secure random string
3. Set `LEMON_SQUEEZY_WEBHOOK_SECRET` in Vercel env vars

### Step 4: Add License Key to Customer

On successful purchase:
1. The webhook generates a license key
2. In production: email it to the customer automatically
3. Add the key to `VALID_LICENSES` env var: `KEY:SIGNATURE`

## API Endpoints

### `POST /api/verify-license`

Validate a license key.

**Request:**
```json
{ "key": "PDFKIT-XXXX-XXXX-XXXX-XXXX" }
```

**Response:**
```json
{ "valid": true, "key": "PDFKIT-...", "expires": "lifetime" }
```

### `POST /api/lemon-squeezy-webhook`

Receives LemonSqueezy purchase webhooks. Generates license keys for paid orders.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `LICENSE_SECRET` | HMAC secret for signing license keys |
| `VALID_LICENSES` | Comma-separated `KEY:SIGNATURE` pairs |
| `LEMON_SQUEEZY_WEBHOOK_SECRET` | Webhook signature verification |

## License

MIT
