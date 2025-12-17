/**
 * BTCPayServer Webhook Handler
 * 
 * POST /api/webhook/btcpay
 * Receives payment notifications from BTCPayServer
 */

import { getBTCPayClient } from '@/lib/btcpay-client';
import { createLicense } from '@/lib/license-generator';
import { sendLicenseEmail, sendPaymentConfirmationEmail } from '@/lib/email-service';

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('btcpay-sig') || '';
    
    // Verify webhook signature
    const btcpay = getBTCPayClient();
    const isValid = btcpay.verifyWebhookSignature(
      body,
      signature,
      process.env.BTCPAY_WEBHOOK_SECRET || ''
    );
    
    if (!isValid) {
      console.error('Invalid webhook signature');
      return new Response('Unauthorized', { status: 401 });
    }
    
    // Parse webhook event
    const event = JSON.parse(body);
    console.log('BTCPay webhook event:', event.type, event.invoiceId);
    
    // Handle invoice settled (payment confirmed)
    if (event.type === 'InvoiceSettled' || event.type === 'InvoiceProcessing') {
      const invoiceId = event.invoiceId;
      
      // Fetch full invoice details
      const invoice = await btcpay.getInvoice(invoiceId);
      
      if (invoice.status === 'Settled' || invoice.status === 'Processing') {
        const { userId, email, plan } = invoice.metadata;
        
        console.log(`Payment confirmed for user ${userId}, plan: ${plan}`);
        
        try {
          // Get payment method details (BTC on-chain or Lightning)
          const paymentMethods = await btcpay.getPaymentMethods(invoiceId);
          const btcPayment = paymentMethods.find((pm: any) => 
            pm.cryptoCode === 'BTC' && pm.paymentMethodPaid > 0
          );
          
          const cryptoAmount = btcPayment?.paymentMethodPaid || invoice.amount;
          const cryptoCurrency = btcPayment?.cryptoCode || 'BTC';
          
          // Create license
          const license = await createLicense({
            userId,
            email,
            plan,
            paymentId: invoiceId,
            amount: parseFloat(invoice.amount),
            currency: invoice.currency,
            cryptoAmount: cryptoAmount.toString(),
            cryptoCurrency,
          });
          
          console.log(`License created: ${license.licenseKey}`);
          
          // Send payment confirmation
          await sendPaymentConfirmationEmail(
            email,
            invoice.amount,
            invoice.currency,
            invoiceId
          );
          
          // Send license key email
          await sendLicenseEmail({
            to: email,
            licenseKey: license.licenseKey,
            plan,
            expiryDate: license.expiresAt,
          });
          
          console.log(`License email sent to ${email}`);
          
        } catch (error) {
          console.error('Failed to process payment:', error);
          // Log error but return 200 to BTCPay (prevent retry storm)
        }
      }
    }
    
    // Handle invoice expired
    if (event.type === 'InvoiceExpired') {
      console.log(`Invoice expired: ${event.invoiceId}`);
      // Optionally notify user that payment window expired
    }
    
    // Handle invoice invalid (underpaid)
    if (event.type === 'InvoiceInvalid') {
      console.log(`Invoice invalid: ${event.invoiceId}`);
      // Optionally handle underpayment
    }
    
    return new Response('OK', { status: 200 });
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response('Error', { status: 500 });
  }
}
