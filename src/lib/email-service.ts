/**
 * Email Service
 * 
 * Sends license keys to users after successful payment.
 * Uses Resend.com (FREE 3000 emails/month).
 */

interface SendLicenseEmailParams {
  to: string;
  licenseKey: string;
  plan: string;
  expiryDate: Date;
}

/**
 * Send license key email via Resend.com
 */
export async function sendLicenseEmail(params: SendLicenseEmailParams): Promise<void> {
  const { to, licenseKey, plan, expiryDate } = params;
  
  const html = generateLicenseEmailHTML(licenseKey, plan, expiryDate);
  
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'MessuBouw <noreply@messubouw.com>',
      to: [to],
      subject: `🎉 Your MessuBouw ${plan.toUpperCase()} License Key`,
      html: html,
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    console.error('Email send failed:', error);
    throw new Error(`Failed to send email: ${error}`);
  }
  
  const data = await response.json();
  console.log('License email sent:', data.id);
}

/**
 * Generate HTML email template
 */
function generateLicenseEmailHTML(
  licenseKey: string,
  plan: string,
  expiryDate: Date
): string {
  const planFeatures = plan === 'pro' 
    ? `
      <li>✅ Unlimited invoices</li>
      <li>✅ Unlimited companies</li>
      <li>✅ Cloud backup & sync</li>
      <li>✅ Priority support</li>
      <li>✅ Advanced reports</li>
      <li>✅ Custom templates</li>
    `
    : `
      <li>✅ Unlimited invoices</li>
      <li>✅ Up to 3 companies</li>
      <li>✅ All templates</li>
      <li>✅ PDF export</li>
      <li>✅ Email support</li>
    `;
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your MessuBouw License</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 40px 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
        }
        .content {
          padding: 40px 30px;
        }
        .license-box {
          background: #f8f9fa;
          border: 2px solid #667eea;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          margin: 30px 0;
        }
        .license-key {
          font-size: 24px;
          font-weight: bold;
          font-family: 'Courier New', monospace;
          color: #667eea;
          letter-spacing: 2px;
          word-break: break-all;
        }
        .button {
          display: inline-block;
          background: #667eea;
          color: white;
          padding: 14px 32px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          margin: 20px 0;
        }
        .features {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .features ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .features li {
          padding: 8px 0;
          font-size: 15px;
        }
        .steps {
          background: #fff9e6;
          border-left: 4px solid #ffc107;
          padding: 20px;
          margin: 20px 0;
        }
        .steps ol {
          margin: 10px 0;
          padding-left: 20px;
        }
        .steps li {
          padding: 5px 0;
        }
        .footer {
          background: #f8f9fa;
          padding: 30px;
          text-align: center;
          color: #666;
          font-size: 14px;
        }
        .footer a {
          color: #667eea;
          text-decoration: none;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #eee;
        }
        .info-label {
          font-weight: 600;
          color: #666;
        }
        .info-value {
          color: #333;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Witamy w MessuBouw ${plan.toUpperCase()}!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Twoja płatność została potwierdzona</p>
        </div>
        
        <div class="content">
          <h2 style="color: #333; margin-top: 0;">Dziękujemy za zakup!</h2>
          <p>Twoja licencja jest teraz aktywna. Poniżej znajdziesz klucz licencyjny oraz instrukcje aktywacji.</p>
          
          <div class="license-box">
            <p style="margin: 0 0 10px 0; color: #666; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Twój klucz licencyjny</p>
            <div class="license-key">${licenseKey}</div>
          </div>
          
          <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <div class="info-row">
              <span class="info-label">Plan:</span>
              <span class="info-value">${plan.toUpperCase()}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Status:</span>
              <span class="info-value" style="color: #28a745;">✅ Active</span>
            </div>
            <div class="info-row" style="border-bottom: none;">
              <span class="info-label">Wygasa:</span>
              <span class="info-value">${expiryDate.toLocaleDateString('pl-PL', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
          </div>
          
          <div class="steps">
            <h3 style="margin: 0 0 15px 0; color: #333;">📱 Jak aktywować licencję?</h3>
            <ol>
              <li>Otwórz aplikację <strong>MessuBouw</strong> na swoim telefonie</li>
              <li>Przejdź do <strong>Settings → License</strong></li>
              <li>Wpisz klucz licencyjny (możesz skopiować z tego emaila)</li>
              <li>Kliknij <strong>"Aktywuj"</strong></li>
              <li>Gotowe! Ciesz się wszystkimi funkcjami 🎉</li>
            </ol>
          </div>
          
          <div class="features">
            <h3 style="margin: 0 0 15px 0; color: #333;">🚀 Co zyskujesz w planie ${plan.toUpperCase()}?</h3>
            <ul>
              ${planFeatures}
            </ul>
          </div>
          
          <center>
            <a href="https://messubouw.com/activate?key=${encodeURIComponent(licenseKey)}" class="button">
              Aktywuj teraz →
            </a>
          </center>
          
          <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #eee;">
            <h3 style="color: #333;">💬 Potrzebujesz pomocy?</h3>
            <p>Jeśli masz pytania lub problemy z aktywacją, napisz do nas:</p>
            <p>
              📧 Email: <a href="mailto:info.messubouw@gmail.com" style="color: #667eea; text-decoration: none;">info.messubouw@gmail.com</a><br>
              ⏱️ Odpowiadamy w ciągu 24 godzin
            </p>
          </div>
        </div>
        
        <div class="footer">
          <p style="margin: 0 0 10px 0;"><strong>MessuBouw</strong> - Professional Invoice Management</p>
          <p style="margin: 0 0 20px 0; color: #999; font-size: 13px;">
            Ten klucz licencyjny jest przypisany do Twojego konta.<br>
            Nie udostępniaj go nikomu.
          </p>
          <p style="margin: 0;">
            <a href="https://messubouw.com">messubouw.com</a> |
            <a href="https://messubouw.com/help">Pomoc</a> |
            <a href="https://messubouw.com/contact">Kontakt</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Send payment confirmation email
 */
export async function sendPaymentConfirmationEmail(
  to: string,
  amount: string,
  currency: string,
  invoiceId: string
): Promise<void> {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'MessuBouw <noreply@messubouw.com>',
      to: [to],
      subject: '✅ Payment Confirmed - MessuBouw',
      html: `
        <h2>Payment Confirmed!</h2>
        <p>We received your payment of <strong>${amount} ${currency}</strong>.</p>
        <p>Your license key will arrive in a separate email within 2 minutes.</p>
        <p>Invoice ID: ${invoiceId}</p>
        <p>Thank you for choosing MessuBouw!</p>
      `,
    }),
  });
  
  if (!response.ok) {
    console.error('Payment confirmation email failed');
  }
}
