/**
 * Create Payment Endpoint
 * 
 * POST /api/create-payment
 * Creates BTCPayServer invoice and returns checkout link
 */

import { getBTCPayClient } from '@/lib/btcpay-client';

interface RequestBody {
  plan: 'starter' | 'pro';
  userId: string;
  email: string;
}

export async function POST(request: Request) {
  try {
    const body: RequestBody = await request.json();
    const { plan, userId, email } = body;
    
    // Validate input
    if (!plan || !userId || !email) {
      return Response.json({
        success: false,
        error: 'Missing required fields: plan, userId, email',
      }, { status: 400 });
    }
    
    // Pricing
    const prices: Record<string, number> = {
      starter: 9.99,
      pro: 29.99,
    };
    
    const amount = prices[plan];
    if (!amount) {
      return Response.json({
        success: false,
        error: 'Invalid plan',
      }, { status: 400 });
    }
    
    // Create BTCPay invoice
    const btcpay = getBTCPayClient();
    const orderId = `${userId}-${plan}-${Date.now()}`;
    
    console.log(`Creating payment for user ${userId}, plan: ${plan}, amount: ${amount} EUR`);
    
    const invoice = await btcpay.createInvoice({
      amount,
      currency: 'EUR',
      orderId,
      metadata: {
        userId,
        email,
        plan,
      },
      redirectUrl: `${process.env.APP_URL}/payment-success`,
      notificationUrl: `${process.env.APP_URL}/api/webhook/btcpay`,
    });
    
    console.log(`BTCPay invoice created: ${invoice.id}`);
    
    return Response.json({
      success: true,
      invoiceId: invoice.id,
      checkoutUrl: invoice.checkoutLink,
      amount: invoice.amount,
      currency: invoice.currency,
      expiresAt: new Date(invoice.expirationTime * 1000).toISOString(),
    });
    
  } catch (error: any) {
    console.error('Payment creation error:', error);
    return Response.json({
      success: false,
      error: error.message || 'Failed to create payment',
    }, { status: 500 });
  }
}
