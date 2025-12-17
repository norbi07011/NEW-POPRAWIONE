# 💰 Crypto Payment Integration Guide

## 🎯 OVERVIEW

MessuBouw now accepts:
- 💳 iDEAL (Netherlands)
- 💳 Credit/Debit Cards (Global)
- 💳 SEPA Transfer (EU)
- 💳 BLIK (Poland - via NOWPayments)

**→ Auto-converts to BTC/ETH/USDT**
**→ Directly to your crypto wallet** 🎉

---

## 🏗️ ARCHITECTURE

```
User clicks "Buy PRO"
    ↓
Payment Gateway (Coinbase Commerce / NOWPayments)
    ↓
User pays with iDEAL/Card/BLIK (EUR/PLN)
    ↓
Auto-converts to cryptocurrency
    ↓
BTC/ETH/USDT sent to YOUR wallet
    ↓
Webhook notification
    ↓
Generate License Key
    ↓
Email key to user
    ↓
User activates in app ✅
```

---

## 🚀 OPTION 1: COINBASE COMMERCE (RECOMMENDED)

### Why Coinbase Commerce?
- ✅ 1% fee (lowest in market)
- ✅ iDEAL + Cards supported
- ✅ Auto-converts EUR → BTC/ETH/USDT
- ✅ Direct payout to wallet
- ✅ 5 min setup
- ✅ No KYC for merchants
- ✅ Works in 100+ countries

### Setup Steps:

**1. Create Account:**
```
https://commerce.coinbase.com/signup

- Sign up with email
- Verify email
- No ID required! (merchant account)
```

**2. Get API Key:**
```
Dashboard → Settings → API Keys → Create new key

Copy:
- API Key: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
- Webhook Secret: whsec_xxxxxxxxxxxxxxxxxxxx
```

**3. Add Wallet Address:**
```
Settings → Crypto Addresses

Add your BTC wallet:
- bc1qxxxxxxxxxxxxxxxxxxxxxxxxxxxxx (SegWit)
- Or ETH: 0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
- Or USDT: 0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

Payments auto-forward to this wallet!
```

**4. Install Package:**
```bash
npm install coinbase-commerce-node
npm install @types/node
```

---

## 📦 IMPLEMENTATION

### Backend API (Cloudflare Worker / Vercel)

Create: `api/create-payment.ts`

```typescript
import { Charge } from 'coinbase-commerce-node';

// Initialize
Charge.setApiKey(process.env.COINBASE_COMMERCE_API_KEY);

export async function POST(request: Request) {
  try {
    const { plan, userId, email } = await request.json();
    
    // Pricing
    const prices: Record<string, string> = {
      starter: '9.99',
      pro: '29.99',
      pro_yearly: '299.99'
    };
    
    // Create charge
    const charge = await Charge.create({
      name: `MessuBouw ${plan.toUpperCase()} License`,
      description: `${plan === 'pro' ? 'PRO' : 'STARTER'} plan - Unlimited invoices, professional features`,
      pricing_type: 'fixed_price',
      local_price: {
        amount: prices[plan],
        currency: 'EUR'
      },
      metadata: {
        user_id: userId,
        plan: plan,
        email: email,
        app: 'messubouw'
      },
      redirect_url: 'https://messubouw.com/payment-success',
      cancel_url: 'https://messubouw.com/pricing'
    });
    
    return Response.json({
      success: true,
      payment_url: charge.hosted_url,
      charge_id: charge.id
    });
    
  } catch (error) {
    console.error('Payment creation error:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
```

### Webhook Handler

Create: `api/webhook/coinbase.ts`

```typescript
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';
import { sendLicenseEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    // Get raw body
    const body = await request.text();
    const signature = request.headers.get('X-CC-Webhook-Signature');
    
    // Verify signature
    const webhookSecret = process.env.COINBASE_WEBHOOK_SECRET;
    const computedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');
    
    if (computedSignature !== signature) {
      console.error('Invalid webhook signature');
      return new Response('Unauthorized', { status: 401 });
    }
    
    // Parse event
    const event = JSON.parse(body);
    console.log('Webhook event:', event.type);
    
    // Handle charge confirmed
    if (event.type === 'charge:confirmed') {
      const charge = event.data;
      const { user_id, plan, email } = charge.metadata;
      
      console.log(`Payment confirmed for user ${user_id}, plan: ${plan}`);
      
      // Generate license key
      const licenseKey = generateLicenseKey(plan);
      
      // Calculate expiry
      const expiryDate = plan.includes('yearly') 
        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);  // 1 month
      
      // Save to database
      await supabase.from('licenses').insert({
        user_id: user_id,
        license_key: licenseKey,
        plan: plan.replace('_yearly', ''),
        status: 'active',
        payment_method: 'crypto',
        payment_id: charge.id,
        amount: charge.pricing.local.amount,
        currency: charge.pricing.local.currency,
        crypto_amount: charge.payments[0]?.value?.crypto?.amount,
        crypto_currency: charge.payments[0]?.value?.crypto?.currency,
        expires_at: expiryDate,
        created_at: new Date()
      });
      
      // Send email with license key
      await sendLicenseEmail({
        to: email,
        licenseKey: licenseKey,
        plan: plan,
        expiryDate: expiryDate
      });
      
      console.log(`License ${licenseKey} generated and sent to ${email}`);
    }
    
    // Handle charge failed
    if (event.type === 'charge:failed') {
      const charge = event.data;
      console.error(`Payment failed for charge ${charge.id}`);
      
      // Notify user
      // await sendPaymentFailedEmail(charge.metadata.email);
    }
    
    return new Response('OK', { status: 200 });
    
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('Error', { status: 500 });
  }
}

// License key generator
function generateLicenseKey(plan: string): string {
  const prefix = 'MESSUBOUW';
  const planCode = plan.toUpperCase().replace('_', '-');
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  return `${prefix}-${planCode}-${year}-${random}`;
}
```

### Frontend Payment Button

Add to: `src/pages/Pricing.tsx`

```typescript
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export default function Pricing() {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  
  const handlePurchase = async (plan: 'starter' | 'pro' | 'pro_yearly') => {
    if (!user) {
      // Redirect to login
      window.location.href = '/login?redirect=/pricing';
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          userId: user.id,
          email: user.email
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Redirect to Coinbase Commerce payment page
        window.location.href = data.payment_url;
      } else {
        alert('Payment initialization failed. Please try again.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="pricing-page">
      <h1>Choose Your Plan</h1>
      
      <div className="pricing-cards">
        {/* FREE Plan */}
        <div className="card">
          <h3>FREE</h3>
          <p className="price">€0</p>
          <ul>
            <li>5 invoices</li>
            <li>1 company</li>
            <li>Basic templates</li>
          </ul>
          <Button disabled>Current Plan</Button>
        </div>
        
        {/* STARTER Plan */}
        <div className="card">
          <h3>STARTER</h3>
          <p className="price">€9.99<span>/month</span></p>
          <ul>
            <li>Unlimited invoices</li>
            <li>3 companies</li>
            <li>All templates</li>
            <li>PDF export</li>
          </ul>
          <Button 
            onClick={() => handlePurchase('starter')}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Pay with iDEAL/Card'}
          </Button>
          <p className="crypto-note">→ Auto-converts to BTC</p>
        </div>
        
        {/* PRO Plan */}
        <div className="card featured">
          <div className="badge">BEST VALUE</div>
          <h3>PRO</h3>
          <p className="price">€29.99<span>/month</span></p>
          <ul>
            <li>Everything in STARTER</li>
            <li>Unlimited companies</li>
            <li>Cloud backup</li>
            <li>Priority support</li>
            <li>Advanced reports</li>
          </ul>
          <Button 
            onClick={() => handlePurchase('pro')}
            disabled={loading}
            variant="primary"
          >
            {loading ? 'Processing...' : 'Pay with iDEAL/Card'}
          </Button>
          <p className="crypto-note">→ Auto-converts to BTC</p>
        </div>
        
        {/* PRO YEARLY */}
        <div className="card">
          <div className="badge">SAVE 17%</div>
          <h3>PRO YEARLY</h3>
          <p className="price">€299.99<span>/year</span></p>
          <p className="savings">Save €59.89/year!</p>
          <ul>
            <li>All PRO features</li>
            <li>12 months for price of 10</li>
            <li>Lock in price for 1 year</li>
          </ul>
          <Button 
            onClick={() => handlePurchase('pro_yearly')}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Pay with iDEAL/Card'}
          </Button>
          <p className="crypto-note">→ Auto-converts to BTC</p>
        </div>
      </div>
      
      <div className="payment-methods">
        <p>Accepted payment methods:</p>
        <div className="methods">
          <span>💳 iDEAL</span>
          <span>💳 Visa/Mastercard</span>
          <span>💳 SEPA Transfer</span>
          <span>₿ Bitcoin</span>
          <span>Ξ Ethereum</span>
        </div>
        <p className="note">
          All payments automatically convert to cryptocurrency and sent directly to our wallet.
          No middleman, no chargebacks. Secure and private.
        </p>
      </div>
    </div>
  );
}
```

---

## 🇵🇱 OPTION 2: NOWPAYMENTS (FOR BLIK SUPPORT)

### Why NOWPayments?
- ✅ BLIK support (Poland) 🇵🇱
- ✅ 150+ cryptocurrencies
- ✅ 0.5% fee
- ✅ iDEAL + Cards + BLIK
- ✅ Instant conversion

### Setup:

```bash
npm install @nowpayments/nowpayments-api-js
```

```typescript
// api/create-payment-nowpayments.ts
import NOWPayments from '@nowpayments/nowpayments-api-js';

const np = new NOWPayments(process.env.NOWPAYMENTS_API_KEY);

export async function POST(request: Request) {
  const { plan, userId, email } = await request.json();
  
  const prices = {
    starter: 39.99, // PLN
    pro: 119.99
  };
  
  const payment = await np.createPayment({
    price_amount: prices[plan],
    price_currency: 'pln',
    pay_currency: 'btc', // or 'usdttrc20', 'eth', 'ltc'
    order_id: `${userId}-${Date.now()}`,
    order_description: `MessuBouw ${plan.toUpperCase()} License`,
    ipn_callback_url: 'https://messubouw.com/api/webhook/nowpayments',
    success_url: 'https://messubouw.com/payment-success',
    cancel_url: 'https://messubouw.com/pricing',
    
    // BLIK support!
    payment_method: 'blik', // User enters 6-digit BLIK code
    
    // Metadata
    metadata: {
      user_id: userId,
      email,
      plan
    }
  });
  
  return Response.json({
    success: true,
    payment_url: payment.invoice_url,
    payment_id: payment.payment_id
  });
}
```

---

## 📧 EMAIL TEMPLATES

Create: `src/lib/email.ts`

```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export async function sendLicenseEmail({
  to,
  licenseKey,
  plan,
  expiryDate
}: {
  to: string;
  licenseKey: string;
  plan: string;
  expiryDate: Date;
}) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .license-key { 
          font-size: 24px; 
          font-weight: bold; 
          background: #fff; 
          padding: 15px; 
          border: 2px solid #4CAF50; 
          text-align: center;
          margin: 20px 0;
          letter-spacing: 2px;
        }
        .button { 
          display: inline-block; 
          background: #4CAF50; 
          color: white; 
          padding: 12px 30px; 
          text-decoration: none; 
          border-radius: 5px; 
          margin: 20px 0;
        }
        .footer { text-align: center; color: #666; padding: 20px; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome to MessuBouw ${plan.toUpperCase()}!</h1>
        </div>
        
        <div class="content">
          <h2>Dziękujemy za zakup!</h2>
          <p>Your payment has been confirmed and your license is now active.</p>
          
          <h3>Your License Key:</h3>
          <div class="license-key">${licenseKey}</div>
          
          <h3>Plan Details:</h3>
          <ul>
            <li><strong>Plan:</strong> ${plan.toUpperCase()}</li>
            <li><strong>Status:</strong> Active ✅</li>
            <li><strong>Expires:</strong> ${expiryDate.toLocaleDateString()}</li>
          </ul>
          
          <h3>How to Activate:</h3>
          <ol>
            <li>Open MessuBouw app</li>
            <li>Go to Settings → License</li>
            <li>Enter your license key</li>
            <li>Click "Activate"</li>
          </ol>
          
          <center>
            <a href="https://messubouw.com/activate" class="button">Activate Now</a>
          </center>
          
          <h3>What's Included:</h3>
          <ul>
            ${plan === 'pro' ? `
              <li>✅ Unlimited invoices</li>
              <li>✅ Unlimited companies</li>
              <li>✅ Cloud backup</li>
              <li>✅ Priority support</li>
              <li>✅ Advanced reports</li>
            ` : `
              <li>✅ Unlimited invoices</li>
              <li>✅ Up to 3 companies</li>
              <li>✅ All templates</li>
              <li>✅ PDF export</li>
            `}
          </ul>
          
          <p>Need help? Contact us at <a href="mailto:support@messubouw.com">support@messubouw.com</a></p>
        </div>
        
        <div class="footer">
          <p>MessuBouw - Professional Invoice Management</p>
          <p>This license key is unique to you. Do not share it with others.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  await transporter.sendMail({
    from: '"MessuBouw" <noreply@messubouw.com>',
    to,
    subject: `Your MessuBouw ${plan.toUpperCase()} License Key 🎉`,
    html
  });
}
```

---

## 🔐 ENVIRONMENT VARIABLES

Create: `.env.production`

```bash
# Coinbase Commerce
COINBASE_COMMERCE_API_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
COINBASE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxx

# NOWPayments (optional - for BLIK)
NOWPAYMENTS_API_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
NOWPAYMENTS_IPN_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Email (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@messubouw.com
SMTP_PASS=your_app_password

# Supabase
SUPABASE_URL=https://ayinverqjntywglsdlzo.supabase.co
SUPABASE_ANON_KEY=your_anon_key
```

---

## 🗄️ DATABASE SCHEMA

Add to Supabase:

```sql
-- Licenses table
CREATE TABLE licenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  license_key VARCHAR(50) UNIQUE NOT NULL,
  plan VARCHAR(20) NOT NULL, -- 'starter' or 'pro'
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'expired', 'cancelled'
  
  payment_method VARCHAR(20) NOT NULL, -- 'crypto'
  payment_id VARCHAR(100), -- Coinbase charge ID
  amount DECIMAL(10,2),
  currency VARCHAR(3), -- EUR, PLN
  crypto_amount DECIMAL(20,8),
  crypto_currency VARCHAR(10), -- BTC, ETH, USDT
  
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_licenses_user_id ON licenses(user_id);
CREATE INDEX idx_licenses_key ON licenses(license_key);
CREATE INDEX idx_licenses_status ON licenses(status);

-- RLS Policies
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own licenses"
  ON licenses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert licenses"
  ON licenses FOR INSERT
  WITH CHECK (true); -- Webhook creates licenses
```

---

## 🧪 TESTING

### Test Mode:

```typescript
// Use Coinbase Commerce sandbox
Charge.setApiKey('your_sandbox_api_key');

// Test cards:
// Visa: 4242 4242 4242 4242
// Expire: Any future date
// CVV: Any 3 digits
```

### Test Webhook Locally:

```bash
# Install ngrok
npm install -g ngrok

# Expose local server
ngrok http 3000

# Set webhook URL in Coinbase:
# https://xxxx-xx-xx-xx-xx.ngrok.io/api/webhook/coinbase
```

---

## 📊 DASHBOARD

Monitor payments in:
- **Coinbase Commerce:** https://commerce.coinbase.com/dashboard
- **Transaction history**
- **Payout schedule** (daily automatic)
- **Crypto balance**

---

## 💡 TIPS

**1. Lower Fees:**
- Use Lightning Network (instant BTC, 0.1% fee)
- BTCPayServer (0% fee, self-hosted)

**2. Multiple Crypto:**
```typescript
// Let user choose BTC, ETH, or USDT
pricing_type: 'no_price' // User picks crypto at checkout
```

**3. Subscription Auto-Renewal:**
```typescript
// Save card/crypto address for monthly charges
// Implement in v2.0
```

**4. Refunds:**
```typescript
// Coinbase Commerce: Manual refunds
// Send crypto back to user's address
```

---

## 🚀 DEPLOYMENT

### Cloudflare Workers (Recommended):

```bash
# Install Wrangler
npm install -g wrangler

# Login
wrangler login

# Deploy
wrangler deploy api/create-payment.ts
wrangler deploy api/webhook/coinbase.ts

# Set secrets
wrangler secret put COINBASE_COMMERCE_API_KEY
wrangler secret put COINBASE_WEBHOOK_SECRET
```

### Vercel:

```bash
# Deploy
vercel deploy

# Add env vars in Vercel dashboard
```

---

## ✅ CHECKLIST

Before going live:

- [ ] Coinbase Commerce account created
- [ ] API key generated
- [ ] Wallet address added (BTC/ETH/USDT)
- [ ] Webhook endpoint deployed
- [ ] Webhook URL set in Coinbase dashboard
- [ ] Email SMTP configured
- [ ] Database table created
- [ ] Frontend payment buttons added
- [ ] Test payment in sandbox mode
- [ ] Verify license email delivery
- [ ] Switch to production API key
- [ ] Test with real €1 payment
- [ ] Monitor first real payment

---

**Ready to deploy! Need help with specific step?** 🚀
