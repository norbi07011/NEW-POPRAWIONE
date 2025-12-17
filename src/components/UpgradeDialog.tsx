/**
 * 💎 MESSU BOUW - Upgrade Dialog
 * Dialog z planami i cenami
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Rocket, Gift, CreditCard, Key } from '@phosphor-icons/react';
import { LicenseManager } from '@/services/LicenseManager';
import { toast } from 'sonner';

interface UpgradeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: string;
}

export function UpgradeDialog({ isOpen, onClose, reason }: UpgradeDialogProps) {
  const { t } = useTranslation();
  const [showActivateForm, setShowActivateForm] = useState(false);
  const [licenseKey, setLicenseKey] = useState('');
  const [isActivating, setIsActivating] = useState(false);

  const handleActivate = async () => {
    if (!licenseKey.trim()) {
      toast.error('Wprowadź klucz licencyjny');
      return;
    }

    setIsActivating(true);
    
    try {
      const result = await LicenseManager.activateLicense(licenseKey);
      
      if (result.success) {
        toast.success(result.message);
        setLicenseKey('');
        setShowActivateForm(false);
        onClose();
        // Odśwież stronę aby załadować nowe uprawnienia
        window.location.reload();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(t('common.activationError'));
    } finally {
      setIsActivating(false);
    }
  };

  const handlePurchase = (plan: 'starter' | 'pro') => {
    // W przyszłości - integracja z Stripe/Mollie
    toast.info(`Przekierowanie do płatności za plan ${plan.toUpperCase()}...`, {
      description: 'Funkcja płatności będzie dostępna wkrótce'
    });
  };

  const pricing = LicenseManager.getPricing();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Crown className="w-7 h-7 text-yellow-500" weight="fill" />
            Upgrade do wersji Premium
          </DialogTitle>
          <DialogDescription>
            {reason || 'Odblokuj pełny potencjał MESSU BOUW'}
          </DialogDescription>
        </DialogHeader>

        {!showActivateForm ? (
          <div className="space-y-6">
            {/* Porównanie planów */}
            <div className="grid md:grid-cols-3 gap-4">
              {/* FREE */}
              <div className="border rounded-lg p-6 bg-gray-50 dark:bg-gray-900">
                <div className="text-center mb-4">
                  <Gift className="w-12 h-12 mx-auto mb-2 text-gray-500" />
                  <h3 className="text-xl font-bold">FREE</h3>
                  <p className="text-3xl font-bold mt-2">€0</p>
                  <p className="text-sm text-muted-foreground">Na zawsze</p>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" weight="bold" />
                    <span>5 faktur</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" weight="bold" />
                    <span>1 firma</span>
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <span className="w-4 h-4">×</span>
                    <span>PDF export</span>
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <span className="w-4 h-4">×</span>
                    <span>Cloud backup</span>
                  </li>
                </ul>
                <Badge className="w-full mt-4 justify-center" variant="secondary">
                  Aktualny plan
                </Badge>
              </div>

              {/* STARTER */}
              <div className="border-2 border-blue-500 rounded-lg p-6 relative bg-white dark:bg-gray-800">
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500">
                  Najpopularniejszy
                </Badge>
                <div className="text-center mb-4">
                  <Rocket className="w-12 h-12 mx-auto mb-2 text-blue-500" />
                  <h3 className="text-xl font-bold">STARTER</h3>
                  <p className="text-3xl font-bold mt-2">€{pricing.starter.price}</p>
                  <p className="text-sm text-muted-foreground">Jednorazowo</p>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" weight="bold" />
                    <span className="font-semibold">Unlimited faktury</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" weight="bold" />
                    <span>3 firmy</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" weight="bold" />
                    <span>PDF export</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" weight="bold" />
                    <span>Mobile apps</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" weight="bold" />
                    <span>Email support</span>
                  </li>
                </ul>
                <Button 
                  className="w-full mt-4" 
                  onClick={() => handlePurchase('starter')}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Kup teraz
                </Button>
              </div>

              {/* PRO */}
              <div className="border-2 border-purple-500 rounded-lg p-6 relative bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500">
                  Najlepsza wartość
                </Badge>
                <div className="text-center mb-4">
                  <Crown className="w-12 h-12 mx-auto mb-2 text-purple-500" weight="fill" />
                  <h3 className="text-xl font-bold">PRO</h3>
                  <p className="text-3xl font-bold mt-2">€{pricing.pro.price}</p>
                  <p className="text-sm text-muted-foreground">Miesięcznie</p>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" weight="bold" />
                    <span className="font-semibold">Wszystko unlimited</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" weight="bold" />
                    <span>Unlimited firmy</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" weight="bold" />
                    <span className="font-semibold">Cloud backup</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" weight="bold" />
                    <span className="font-semibold">Multi-device sync</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" weight="bold" />
                    <span>Priority support</span>
                  </li>
                </ul>
                <Button 
                  className="w-full mt-4 bg-purple-600 hover:bg-purple-700" 
                  onClick={() => handlePurchase('pro')}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Subskrybuj
                </Button>
              </div>
            </div>

            {/* Aktywacja klucza */}
            <div className="border-t pt-4">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowActivateForm(true)}
              >
                <Key className="w-4 h-4 mr-2" />
                Mam już klucz licencyjny
              </Button>
            </div>

            {/* Gwarancja */}
            <div className="text-center text-sm text-muted-foreground">
              <p>✅ 30 dni gwarancji zwrotu pieniędzy</p>
              <p>🔒 Bezpieczne płatności przez Stripe</p>
              <p>💬 Email support: info.messubouw@gmail.com</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="license-key">Klucz licencyjny</Label>
              <Input
                id="license-key"
                placeholder="MESSUBOUW-XXXX-XXXX-XXXX"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Wprowadź klucz otrzymany po zakupie
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowActivateForm(false)}
                className="flex-1"
              >
                Wróć
              </Button>
              <Button
                onClick={handleActivate}
                disabled={isActivating}
                className="flex-1"
              >
                {isActivating ? 'Aktywacja...' : 'Aktywuj licencję'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
