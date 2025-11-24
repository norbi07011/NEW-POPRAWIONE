/**
 * 🔒 MESSU BOUW - Mobile License Security
 * System zabezpieczeń licencyjnych dla aplikacji mobilnej
 * Blokuje nieautoryzowane kopiowanie i kradzież aplikacji
 */

import { Device } from '@capacitor/device';
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

export interface MobileLicenseData {
  licenseKey: string;
  deviceId: string;
  deviceModel: string;
  activatedAt: string;
  expiresAt?: string;
  plan: 'free' | 'starter' | 'pro';
  isValid: boolean;
}

// 🔐 Klucze serwera (NIE POKAZUJ UŻYTKOWNIKOWI)
const SERVER_VALIDATION_KEY = 'MESSUBOUW-SERVER-SECRET-2025';
const ENCRYPTION_SALT = 'MESSUBOUW-MOBILE-ENCRYPT';

class MobileLicenseManagerService {
  private static instance: MobileLicenseManagerService;
  private deviceId: string | null = null;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): MobileLicenseManagerService {
    if (!MobileLicenseManagerService.instance) {
      MobileLicenseManagerService.instance = new MobileLicenseManagerService();
    }
    return MobileLicenseManagerService.instance;
  }

  /**
   * 📱 Sprawdź czy aplikacja działa na mobile
   */
  isMobilePlatform(): boolean {
    return Capacitor.isNativePlatform();
  }

  /**
   * 🔑 Inicjalizacja - pobierz Device ID
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const info = await Device.getId();
      this.deviceId = info.identifier;
      this.isInitialized = true;
      console.log('🔐 Mobile License Manager initialized for device:', this.deviceId?.substring(0, 8) + '...');
    } catch (error) {
      console.error('❌ Failed to initialize Mobile License Manager:', error);
      throw new Error('Device ID not available');
    }
  }

  /**
   * 🔍 Sprawdź czy licencja jest aktywna
   */
  async checkLicense(): Promise<MobileLicenseData | null> {
    if (!this.isMobilePlatform()) {
      return null; // Web/Desktop - nie wymaga licencji mobile
    }

    await this.initialize();

    try {
      const { value } = await Preferences.get({ key: 'mobile_license' });
      if (!value) {
        console.log('⚠️ No mobile license found');
        return null;
      }

      const licenseData: MobileLicenseData = JSON.parse(value);

      // Sprawdź czy licencja jest przypisana do TEGO urządzenia
      if (licenseData.deviceId !== this.deviceId) {
        console.error('🚫 License stolen! Device mismatch:', {
          stored: licenseData.deviceId?.substring(0, 8),
          current: this.deviceId?.substring(0, 8)
        });
        await this.revokeLicense();
        return null;
      }

      // Sprawdź czy licencja nie wygasła
      if (licenseData.expiresAt) {
        const expirationDate = new Date(licenseData.expiresAt);
        if (expirationDate < new Date()) {
          console.error('⏰ License expired:', licenseData.expiresAt);
          return { ...licenseData, isValid: false };
        }
      }

      console.log('✅ License valid:', licenseData.plan);
      return { ...licenseData, isValid: true };

    } catch (error) {
      console.error('❌ Error checking license:', error);
      return null;
    }
  }

  /**
   * 🔓 Aktywuj licencję z kluczem
   */
  async activateLicense(licenseKey: string): Promise<{ success: boolean; message: string; plan?: string }> {
    if (!this.isMobilePlatform()) {
      return { success: false, message: 'Only available on mobile devices' };
    }

    await this.initialize();

    // Walidacja klucza (format: MESSUBOUW-PLAN-YEAR-CODE)
    const keyPattern = /^MESSUBOUW-(FREE|STARTER|PRO)-\d{4}-[A-Z0-9]{4,8}$/;
    if (!keyPattern.test(licenseKey)) {
      return { success: false, message: 'Nieprawidłowy format klucza licencyjnego' };
    }

    // Sprawdź czy klucz jest prawidłowy (tutaj możesz dodać weryfikację z serwera)
    const isValidKey = await this.validateLicenseKey(licenseKey);
    if (!isValidKey) {
      return { success: false, message: 'Klucz licencyjny jest nieprawidłowy lub już wykorzystany' };
    }

    // Pobierz plan z klucza
    const planMatch = licenseKey.match(/MESSUBOUW-(FREE|STARTER|PRO)-/);
    const plan = planMatch ? planMatch[1].toLowerCase() : 'free';

    // Pobierz info o urządzeniu
    const deviceInfo = await Device.getInfo();

    // Zapisz licencję
    const licenseData: MobileLicenseData = {
      licenseKey,
      deviceId: this.deviceId!,
      deviceModel: `${deviceInfo.manufacturer} ${deviceInfo.model}`,
      activatedAt: new Date().toISOString(),
      expiresAt: plan === 'free' ? undefined : this.calculateExpiration(plan as any),
      plan: plan as any,
      isValid: true
    };

    await Preferences.set({
      key: 'mobile_license',
      value: JSON.stringify(licenseData)
    });

    console.log('✅ License activated:', plan);
    return { 
      success: true, 
      message: `Licencja ${plan.toUpperCase()} została aktywowana!`,
      plan 
    };
  }

  /**
   * 🗑️ Usuń licencję (revoke)
   */
  async revokeLicense(): Promise<void> {
    await Preferences.remove({ key: 'mobile_license' });
    console.log('🗑️ License revoked');
  }

  /**
   * 🔐 Walidacja klucza (możesz dodać weryfikację API)
   */
  private async validateLicenseKey(key: string): Promise<boolean> {
    // Tutaj możesz dodać weryfikację z Twoim serwerem API
    // Na razie sprawdzamy tylko format i kilka testowych kluczy
    
    const validTestKeys = [
      'MESSUBOUW-FREE-2025-TEST1',
      'MESSUBOUW-STARTER-2025-TEST2',
      'MESSUBOUW-PRO-2025-TEST3'
    ];

    // Sprawdź czy to testowy klucz
    if (validTestKeys.includes(key)) {
      return true;
    }

    // TODO: Dodaj tutaj wywołanie API do Twojego serwera
    // const response = await fetch('https://your-api.com/validate-license', {
    //   method: 'POST',
    //   body: JSON.stringify({ key, deviceId: this.deviceId })
    // });
    // return response.ok;

    return false; // Domyślnie odrzuć nieznane klucze
  }

  /**
   * 📅 Oblicz datę wygaśnięcia
   */
  private calculateExpiration(plan: 'starter' | 'pro'): string {
    const now = new Date();
    const months = plan === 'starter' ? 12 : 24; // Starter: 1 rok, Pro: 2 lata
    now.setMonth(now.getMonth() + months);
    return now.toISOString();
  }

  /**
   * 🎯 Sprawdź czy funkcja jest dostępna w planie
   */
  async canUseFeature(feature: string): Promise<boolean> {
    const license = await this.checkLicense();
    
    if (!license || !license.isValid) {
      return false; // Brak licencji = tylko podstawowe funkcje
    }

    // Definicje dostępu do funkcji
    const featureAccess: Record<string, string[]> = {
      'pdfExport': ['free', 'starter', 'pro'],
      'cloudBackup': ['starter', 'pro'],
      'multiDevice': ['pro'],
      'prioritySupport': ['pro'],
      'mobileApps': ['free', 'starter', 'pro']
    };

    const allowedPlans = featureAccess[feature] || [];
    return allowedPlans.includes(license.plan);
  }

  /**
   * 📊 Sprawdź limity
   */
  async checkLimits(): Promise<{ maxInvoices: number; maxCompanies: number }> {
    const license = await this.checkLicense();
    
    if (!license || !license.isValid) {
      return { maxInvoices: 5, maxCompanies: 1 }; // FREE plan limits
    }

    const limits: Record<string, { maxInvoices: number; maxCompanies: number }> = {
      free: { maxInvoices: 5, maxCompanies: 1 },
      starter: { maxInvoices: 100, maxCompanies: 3 },
      pro: { maxInvoices: Infinity, maxCompanies: Infinity }
    };

    return limits[license.plan] || limits.free;
  }
}

export const MobileLicenseManager = MobileLicenseManagerService.getInstance();
