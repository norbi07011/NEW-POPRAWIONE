/**
 * 🔐 MESSU BOUW - License Manager
 * Zarządzanie licencjami i limitami wersji FREE
 */

export type LicensePlan = 'free' | 'starter' | 'pro';

export interface LicenseInfo {
  plan: LicensePlan;
  key?: string;
  expiresAt?: string;
  maxInvoices: number;
  maxCompanies: number;
  features: {
    pdfExport: boolean;
    cloudBackup: boolean;
    multiDevice: boolean;
    prioritySupport: boolean;
    mobileApps: boolean;
  };
}

const PLAN_LIMITS: Record<LicensePlan, LicenseInfo> = {
  free: {
    plan: 'free',
    maxInvoices: 5,
    maxCompanies: 1,
    features: {
      pdfExport: false,
      cloudBackup: false,
      multiDevice: false,
      prioritySupport: false,
      mobileApps: false,
    }
  },
  starter: {
    plan: 'starter',
    maxInvoices: Infinity,
    maxCompanies: 3,
    features: {
      pdfExport: true,
      cloudBackup: false,
      multiDevice: false,
      prioritySupport: false,
      mobileApps: true,
    }
  },
  pro: {
    plan: 'pro',
    maxInvoices: Infinity,
    maxCompanies: Infinity,
    features: {
      pdfExport: true,
      cloudBackup: true,
      multiDevice: true,
      prioritySupport: true,
      mobileApps: true,
    }
  }
};

class LicenseManagerService {
  private static instance: LicenseManagerService;
  private licenseKey: string | null = null;
  private currentPlan: LicensePlan = 'free';
  private lastVerified: Date | null = null;

  private constructor() {
    this.loadLicense();
  }

  static getInstance(): LicenseManagerService {
    if (!LicenseManagerService.instance) {
      LicenseManagerService.instance = new LicenseManagerService();
    }
    return LicenseManagerService.instance;
  }

  /**
   * Załaduj licencję z localStorage
   */
  private loadLicense(): void {
    try {
      const savedLicense = localStorage.getItem('messu_license');
      if (savedLicense) {
        const data = JSON.parse(savedLicense);
        this.licenseKey = data.key;
        this.currentPlan = data.plan || 'free';
        this.lastVerified = data.lastVerified ? new Date(data.lastVerified) : null;
      }
    } catch (error) {
      console.error('Błąd ładowania licencji:', error);
      this.currentPlan = 'free';
    }
  }

  /**
   * Zapisz licencję do localStorage
   */
  private saveLicense(): void {
    try {
      localStorage.setItem('messu_license', JSON.stringify({
        key: this.licenseKey,
        plan: this.currentPlan,
        lastVerified: this.lastVerified?.toISOString()
      }));
    } catch (error) {
      console.error('Błąd zapisywania licencji:', error);
    }
  }

  /**
   * Aktywuj klucz licencyjny
   */
  async activateLicense(key: string): Promise<{ success: boolean; message: string; plan?: LicensePlan }> {
    try {
      // W przyszłości - weryfikacja na serwerze
      // const response = await fetch('https://api.messubouw.com/verify-license', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ 
      //     key, 
      //     deviceId: this.getDeviceId(),
      //     appVersion: '1.0.0'
      //   })
      // });

      // Na razie - prosta weryfikacja offline
      const plan = this.parseKey(key);
      
      if (!plan) {
        return {
          success: false,
          message: 'Nieprawidłowy klucz licencyjny'
        };
      }

      this.licenseKey = key;
      this.currentPlan = plan;
      this.lastVerified = new Date();
      this.saveLicense();

      return {
        success: true,
        message: `Licencja ${plan.toUpperCase()} aktywowana!`,
        plan
      };
    } catch (error) {
      console.error('Błąd aktywacji licencji:', error);
      return {
        success: false,
        message: 'Błąd aktywacji licencji'
      };
    }
  }

  /**
   * Parsuj klucz licencyjny (prosta walidacja)
   */
  private parseKey(key: string): LicensePlan | null {
    const normalized = key.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    if (normalized.startsWith('MESSUBOUWSTARTER')) {
      return 'starter';
    } else if (normalized.startsWith('MESSUBOUWPRO')) {
      return 'pro';
    }
    
    return null;
  }

  /**
   * Pobierz aktualny plan
   */
  getCurrentPlan(): LicensePlan {
    return this.currentPlan;
  }

  /**
   * Pobierz informacje o licencji
   */
  getLicenseInfo(): LicenseInfo {
    return {
      ...PLAN_LIMITS[this.currentPlan],
      key: this.licenseKey || undefined,
      expiresAt: this.currentPlan === 'pro' ? undefined : undefined // W przyszłości - data wygaśnięcia
    };
  }

  /**
   * Sprawdź czy można utworzyć fakturę
   */
  canCreateInvoice(currentInvoiceCount: number): { allowed: boolean; message?: string } {
    const limit = PLAN_LIMITS[this.currentPlan].maxInvoices;
    
    if (currentInvoiceCount >= limit) {
      return {
        allowed: false,
        message: `Osiągnięto limit faktur (${limit}) w wersji FREE. Przejdź na plan STARTER lub PRO.`
      };
    }

    return { allowed: true };
  }

  /**
   * Sprawdź czy można utworzyć firmę
   */
  canCreateCompany(currentCompanyCount: number): { allowed: boolean; message?: string } {
    const limit = PLAN_LIMITS[this.currentPlan].maxCompanies;
    
    if (currentCompanyCount >= limit) {
      return {
        allowed: false,
        message: `Osiągnięto limit firm (${limit}) w planie ${this.currentPlan.toUpperCase()}. Przejdź na plan PRO.`
      };
    }

    return { allowed: true };
  }

  /**
   * Sprawdź dostęp do funkcji
   */
  hasFeature(feature: keyof LicenseInfo['features']): boolean {
    return PLAN_LIMITS[this.currentPlan].features[feature];
  }

  /**
   * Pobierz unikalny ID urządzenia
   */
  private getDeviceId(): string {
    let deviceId = localStorage.getItem('messu_device_id');
    
    if (!deviceId) {
      // Generuj unikalny ID na podstawie parametrów przeglądarki/urządzenia
      const hwid = [
        navigator.hardwareConcurrency || 0,
        screen.width,
        screen.height,
        navigator.language,
        new Date().getTimezoneOffset()
      ].join('-');
      
      deviceId = btoa(hwid).substring(0, 16);
      localStorage.setItem('messu_device_id', deviceId);
    }
    
    return deviceId;
  }

  /**
   * Resetuj do wersji FREE (np. przy wylogowaniu)
   */
  resetToFree(): void {
    this.licenseKey = null;
    this.currentPlan = 'free';
    this.lastVerified = null;
    localStorage.removeItem('messu_license');
  }

  /**
   * Pobierz ceny planów
   */
  getPricing() {
    return {
      starter: {
        price: 49,
        currency: 'EUR',
        period: 'one-time',
        description: 'Unlimited faktury, 3 firmy, PDF export'
      },
      pro: {
        price: 9.99,
        currency: 'EUR',
        period: 'monthly',
        description: 'Wszystko unlimited + Cloud backup + Multi-device'
      }
    };
  }
}

export const LicenseManager = LicenseManagerService.getInstance();
