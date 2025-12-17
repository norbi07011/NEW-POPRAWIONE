/**
 * BTCPayServer Client
 * 
 * Integrates with self-hosted BTCPayServer for 0% fee crypto payments.
 * Supports Bitcoin (on-chain + Lightning Network).
 */

interface BTCPayConfig {
  url: string;
  storeId: string;
  apiKey: string;
}

interface CreateInvoiceParams {
  amount: number;
  currency: string;
  orderId: string;
  metadata: {
    userId: string;
    email: string;
    plan: string;
  };
  redirectUrl?: string;
  notificationUrl?: string;
}

interface BTCPayInvoice {
  id: string;
  checkoutLink: string;
  status: string;
  amount: string;
  currency: string;
  createdTime: number;
  expirationTime: number;
  metadata: Record<string, any>;
}

export class BTCPayClient {
  private config: BTCPayConfig;

  constructor(config: BTCPayConfig) {
    this.config = config;
  }

  /**
   * Create a new payment invoice
   */
  async createInvoice(params: CreateInvoiceParams): Promise<BTCPayInvoice> {
    const response = await fetch(
      `${this.config.url}/api/v1/stores/${this.config.storeId}/invoices`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `token ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          amount: params.amount.toString(),
          currency: params.currency,
          checkout: {
            redirectURL: params.redirectUrl || `${process.env.APP_URL}/payment-success`,
            redirectAutomatically: true,
            defaultLanguage: 'en',
            paymentMethods: ['BTC', 'BTC-LightningNetwork'],
          },
          metadata: {
            orderId: params.orderId,
            buyerEmail: params.metadata.email,
            ...params.metadata,
          },
          additionalSearchTerms: [params.orderId],
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`BTCPay API Error: ${error}`);
    }

    const data = await response.json();
    
    return {
      id: data.id,
      checkoutLink: data.checkoutLink,
      status: data.status,
      amount: data.amount,
      currency: data.currency,
      createdTime: data.createdTime,
      expirationTime: data.expirationTime,
      metadata: data.metadata,
    };
  }

  /**
   * Get invoice details
   */
  async getInvoice(invoiceId: string): Promise<BTCPayInvoice> {
    const response = await fetch(
      `${this.config.url}/api/v1/stores/${this.config.storeId}/invoices/${invoiceId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `token ${this.config.apiKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch invoice: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    return signature === `sha256=${expectedSignature}`;
  }

  /**
   * Get payment methods (BTC on-chain + Lightning)
   */
  async getPaymentMethods(invoiceId: string) {
    const response = await fetch(
      `${this.config.url}/api/v1/stores/${this.config.storeId}/invoices/${invoiceId}/payment-methods`,
      {
        method: 'GET',
        headers: {
          'Authorization': `token ${this.config.apiKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch payment methods: ${response.statusText}`);
    }

    return await response.json();
  }
}

// Singleton instance
let btcpayClient: BTCPayClient | null = null;

export function getBTCPayClient(): BTCPayClient {
  if (!btcpayClient) {
    const config = {
      url: process.env.BTCPAY_URL || '',
      storeId: process.env.BTCPAY_STORE_ID || '',
      apiKey: process.env.BTCPAY_API_KEY || '',
    };

    if (!config.url || !config.storeId || !config.apiKey) {
      throw new Error('BTCPayServer configuration missing. Check .env.btcpay file.');
    }

    btcpayClient = new BTCPayClient(config);
  }

  return btcpayClient;
}

// Export types
export type { BTCPayConfig, CreateInvoiceParams, BTCPayInvoice };
