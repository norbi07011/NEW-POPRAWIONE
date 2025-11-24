/**
 * 🔐 MESSU BOUW - Mobile License Activation Screen
 * Ekran aktywacji licencji dla urządzeń mobilnych
 */

import React, { useState, useEffect } from 'react';
import { MobileLicenseManager } from '@/services/MobileLicenseManager';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, CheckCircle, DeviceMobile } from '@phosphor-icons/react';
import { toast } from 'sonner';

interface MobileLicenseActivationProps {
  onActivated: () => void;
}

export function MobileLicenseActivation({ onActivated }: MobileLicenseActivationProps) {
  const [licenseKey, setLicenseKey] = useState('');
  const [isActivating, setIsActivating] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<string>('');

  useEffect(() => {
    loadDeviceInfo();
  }, []);

  const loadDeviceInfo = async () => {
    try {
      const info = await MobileLicenseManager['deviceId'];
      setDeviceInfo(info ? info.substring(0, 8) + '...' : 'Unknown');
    } catch (error) {
      console.error('Failed to load device info:', error);
    }
  };

  const handleActivate = async () => {
    if (!licenseKey.trim()) {
      toast.error('Wprowadź klucz licencyjny');
      return;
    }

    setIsActivating(true);

    try {
      const result = await MobileLicenseManager.activateLicense(licenseKey.trim());

      if (result.success) {
        toast.success(result.message);
        setTimeout(() => {
          onActivated();
        }, 1500);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Activation error:', error);
      toast.error('Błąd podczas aktywacji licencji');
    } finally {
      setIsActivating(false);
    }
  };

  const handleSkipDemo = () => {
    // Aktywuj darmowy klucz testowy
    setLicenseKey('MESSUBOUW-FREE-2025-TEST1');
    setTimeout(() => handleActivate(), 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-white" weight="bold" />
          </div>
          <CardTitle className="text-2xl font-bold">Aktywuj Licencję</CardTitle>
          <CardDescription>
            Wprowadź klucz licencyjny aby aktywować MESSU BOUW na tym urządzeniu
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Device ID Display */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <DeviceMobile className="w-4 h-4" />
              <span className="font-medium">ID Urządzenia</span>
            </div>
            <p className="text-xs text-gray-500 font-mono">{deviceInfo}</p>
          </div>

          {/* License Key Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Klucz Licencyjny
            </label>
            <Input
              type="text"
              placeholder="MESSUBOUW-PLAN-YYYY-XXXX"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
              className="font-mono text-sm"
              disabled={isActivating}
            />
            <p className="text-xs text-gray-500">
              Format: MESSUBOUW-STARTER-2025-ABC123
            </p>
          </div>

          {/* Plan Info */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs font-medium text-gray-600 mb-1">FREE</p>
              <p className="text-lg font-bold text-gray-800">5</p>
              <p className="text-xs text-gray-500">faktur</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs font-medium text-blue-600 mb-1">STARTER</p>
              <p className="text-lg font-bold text-blue-800">100</p>
              <p className="text-xs text-blue-500">faktur</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-xs font-medium text-purple-600 mb-1">PRO</p>
              <p className="text-lg font-bold text-purple-800">∞</p>
              <p className="text-xs text-purple-500">faktur</p>
            </div>
          </div>

          {/* Activate Button */}
          <Button
            onClick={handleActivate}
            disabled={isActivating || !licenseKey.trim()}
            className="w-full"
            size="lg"
          >
            {isActivating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Aktywacja...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2" weight="bold" />
                Aktywuj Licencję
              </>
            )}
          </Button>

          {/* Demo Mode Button */}
          <Button
            onClick={handleSkipDemo}
            variant="outline"
            disabled={isActivating}
            className="w-full"
          >
            Wypróbuj wersję DEMO (5 faktur)
          </Button>

          {/* Help Text */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Nie masz klucza licencyjnego?<br />
              <a href="https://messubouw.com/license" className="text-blue-600 hover:underline">
                Kup licencję
              </a> lub użyj wersji DEMO
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
