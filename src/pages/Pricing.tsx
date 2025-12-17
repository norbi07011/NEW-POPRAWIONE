import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Zap, Crown, Shield } from 'lucide-react';

export default function Pricing() {
  const [loading, setLoading] = useState<string | null>(null);
  const { user } = useAuth();

  const handlePurchase = async (plan: 'starter' | 'pro') => {
    if (!user) {
      window.location.href = `/login?redirect=${encodeURIComponent('/pricing')}`;
      return;
    }

    setLoading(plan);

    try {
      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          userId: user.id,
          email: user.email,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to BTCPayServer checkout
        window.location.href = data.checkoutUrl;
      } else {
        alert(`Payment failed: ${data.error}`);
        setLoading(null);
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('An error occurred. Please try again.');
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
            Professional invoice management for your business
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Shield className="w-4 h-4" />
            <span>Pay with Bitcoin • 0% Fees • No Middleman</span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* FREE Plan */}
          <Card className="relative">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-gray-400" />
                FREE
              </CardTitle>
              <CardDescription>Perfect for trying out</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <span className="text-4xl font-bold">€0</span>
                <span className="text-gray-500 ml-2">forever</span>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-sm">5 invoices per month</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-sm">1 company</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-sm">Basic templates</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-sm">PDF export</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="outline" disabled>
                Current Plan
              </Button>
            </CardFooter>
          </Card>

          {/* STARTER Plan */}
          <Card className="relative border-2 border-blue-500">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
              POPULAR
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-500" />
                STARTER
              </CardTitle>
              <CardDescription>For growing businesses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <span className="text-4xl font-bold">€9.99</span>
                <span className="text-gray-500 ml-2">/ month</span>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-sm font-semibold">Unlimited invoices</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-sm">Up to 3 companies</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-sm">All templates</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-sm">PDF + Email export</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-sm">Priority email support</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => handlePurchase('starter')}
                disabled={loading !== null}
              >
                {loading === 'starter' ? 'Processing...' : 'Pay with Bitcoin'}
              </Button>
            </CardFooter>
          </Card>

          {/* PRO Plan */}
          <Card className="relative border-2 border-purple-500">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
              BEST VALUE
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-purple-500" />
                PRO
              </CardTitle>
              <CardDescription>For professionals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <span className="text-4xl font-bold">€29.99</span>
                <span className="text-gray-500 ml-2">/ month</span>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-sm font-semibold">Everything in STARTER</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-sm font-semibold">Unlimited companies</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-sm">Cloud backup & sync</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-sm">Advanced reports</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-sm">Custom templates</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-sm font-semibold">Priority 24/7 support</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                onClick={() => handlePurchase('pro')}
                disabled={loading !== null}
              >
                {loading === 'pro' ? 'Processing...' : 'Pay with Bitcoin'}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Payment Info */}
        <div className="max-w-3xl mx-auto">
          <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border-orange-200 dark:border-orange-800">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-orange-500" />
                Why Bitcoin Payments?
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  <span><strong>0% Fees</strong> - We don't pay credit card companies, you don't pay extra</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  <span><strong>Privacy</strong> - No credit card info stored, no data leaks</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  <span><strong>Fast</strong> - Lightning Network payments confirm in seconds</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  <span><strong>Global</strong> - Works anywhere, no currency conversion fees</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  <span><strong>No Chargebacks</strong> - Your license activates immediately</span>
                </li>
              </ul>
              <p className="mt-4 text-xs text-gray-600 dark:text-gray-400">
                Don't have Bitcoin? No problem! The payment page accepts on-chain BTC and Lightning Network.
                You can pay from any Bitcoin wallet.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mt-12">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">How do I pay with Bitcoin?</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                After clicking "Pay with Bitcoin", you'll be redirected to our payment page.
                Scan the QR code with your Bitcoin wallet app or copy the payment address.
                We support both on-chain and Lightning Network payments.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">How long until my license activates?</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Lightning payments: Instant (1-3 seconds)<br />
                On-chain payments: 10-30 minutes (after 1 confirmation)
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Can I upgrade later?</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Yes! You can upgrade from STARTER to PRO anytime.
                We'll prorate your current plan and apply the credit.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">What if I need a refund?</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                We offer a 14-day money-back guarantee.
                Email info.messubouw@gmail.com with your license key.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
