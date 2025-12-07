# 📱 Instalacja MessuBouw na Android - Instrukcja

## 🎯 SZYBKI START (4 kroki)

### 1️⃣ Pobierz APK
- **Plik:** `MessuBouw-v1.0-SIGNED.apk` (3.5 MB)
- **Lokalizacja:** `public\MessuBouw-v1.0-SIGNED.apk`

**Metody transferu:**
```powershell
# Email (najłatwiej):
# Wyślij plik na swój email, otwórz na telefonie

# WhatsApp/Telegram:
# Wyślij jako dokument (nie jako zdjęcie!)

# USB Cable:
# Podłącz telefon → Kopiuj do Downloads/
```

### 2️⃣ Włącz "Nieznane źródła"
```
Android 8+ (Oreo i nowsze):
  Ustawienia → Aplikacje → Dostęp specjalny
  → Instalacja nieznanych aplikacji
  → Chrome/Gmail/Pliki → Zezwól

Android 7 i starsze:
  Ustawienia → Bezpieczeństwo
  → Nieznane źródła → ✅ Włącz
```

### 3️⃣ Zainstaluj APK
1. Otwórz **Pliki** / **Downloads** na telefonie
2. Znajdź `MessuBouw-v1.0-SIGNED.apk`
3. Kliknij → **Instaluj**
4. Jeśli pytanie o "Play Protect" → **Zainstaluj mimo to**

### 4️⃣ Aktywuj Licencję
Po pierwszym uruchomieniu:

```
Ekran aktywacji:
┌─────────────────────────────────┐
│  Aktywuj Licencję               │
│                                 │
│  [MESSUBOUW-FREE-2025-TEST1   ] │
│                                 │
│  [ Aktywuj Licencję ]           │
│  [ Wypróbuj wersję DEMO ]       │
└─────────────────────────────────┘
```

**Test Keys:**
- `MESSUBOUW-FREE-2025-TEST1` → 5 faktur
- `MESSUBOUW-STARTER-2025-TEST2` → ∞ faktur, 3 firmy
- `MESSUBOUW-PRO-2025-TEST3` → Wszystko unlimited

---

## 🧪 TESTY DO WYKONANIA

### ✅ Test 1: Instalacja i Aktywacja
- [ ] APK zainstalował się bez błędów
- [ ] Ikona "MessuBouw" widoczna na ekranie głównym
- [ ] Uruchomienie pokazuje ekran aktywacji
- [ ] Wpisanie test key aktywuje app
- [ ] Pokazuje się główny dashboard

### ✅ Test 2: Tworzenie Faktury
- [ ] Kliknij "+ Nowa Faktura"
- [ ] Formularz się otwiera
- [ ] Dodaj klienta (z KVK i BTW)
- [ ] Dodaj pozycje
- [ ] Zapisz fakturę
- [ ] Faktura widoczna na liście

### ✅ Test 3: KVK na Fakturze (CRITICAL!)
- [ ] Otwórz zapisaną fakturę
- [ ] Wygeneruj PDF
- [ ] Sprawdź czy widać:
  - ✅ Twoje KVK (firma wystawiająca)
  - ✅ KVK klienta (sekcja "Nabywca")
  - ✅ BTW klienta

### ✅ Test 4: Limity Licencji
**Dla FREE (5 faktur):**
- [ ] Utwórz 5 faktur
- [ ] Spróbuj utworzyć 6-tą
- [ ] Powinien pokazać komunikat o limicie

**Dla STARTER (∞ faktur, 3 firmy):**
- [ ] Przejdź do ustawień
- [ ] Dodaj 3 firmy
- [ ] Spróbuj dodać 4-tą
- [ ] Powinien zablokować

### ✅ Test 5: Device ID Binding
**⚠️ Test anty-kradzieżowy:**
- [ ] Zapisz Device ID z ekranu aktywacji (pierwsze 8 znaków)
- [ ] Zainstaluj app na DRUGIM telefonie
- [ ] Spróbuj wpisać TEN SAM test key
- [ ] Powinien odmówić aktywacji (key bound to innego device!)

### ✅ Test 6: Offline Mode
- [ ] Włącz tryb samolotowy
- [ ] Otwórz app
- [ ] Sprawdź czy działa (localStorage)
- [ ] Utwórz fakturę offline
- [ ] Wyłącz tryb samolotowy
- [ ] Sprawdź czy faktura się zsynchronizowała

---

## 🐛 TROUBLESHOOTING

### Problem: "Aplikacja nie jest zainstalowana"
**Rozwiązanie:**
```
1. Usuń starą wersję (jeśli była)
2. Wyczyść cache: Ustawienia → Pamięć → Wyczyść pamięć podręczną
3. Restart telefonu
4. Spróbuj ponownie
```

### Problem: "Play Protect blokuje instalację"
**Rozwiązanie:**
```
To NORMALNE dla APK spoza Play Store.
Kliknij: "Więcej informacji" → "Zainstaluj mimo to"

Lub wyłącz Play Protect:
  Play Store → Menu → Play Protect → ⚙️ → Wyłącz
```

### Problem: "Parsowanie pakietu nie powiodło się"
**Przyczyny:**
- Uszkodzony plik → Pobierz ponownie
- Niewspierana wersja Android → Wymaga Android 7.0+
- Niekompatybilna architektura → APK jest universal (arm64-v8a + armeabi-v7a)

### Problem: Licencja się nie aktywuje
**Check:**
```
1. Internet połączony? (pierwsze uruchomienie wymaga sieci)
2. Test key poprawnie wpisany? (case-sensitive!)
3. Device ID już użyty? (1 key = 1 telefon!)
```

### Problem: Aplikacja crashuje
**Debug:**
```
1. Podłącz telefon przez USB
2. Włącz "Opcje deweloperskie"
3. Uruchom: adb logcat | grep MessuBouw
4. Prześlij logi (error stack trace)
```

---

## 📊 RÓŻNICE: APK vs Web App

| Feature | Web App | Android APK |
|---------|---------|-------------|
| Instalacja | Instant | ~30 sekund |
| Offline | ❌ Wymaga netu | ✅ Działa offline |
| Push notifications | ❌ Nie | ✅ Można dodać |
| Device ID | ❌ Nie | ✅ Hardware binding |
| Szybkość | Zależy od WiFi | ⚡ Natywna |
| Updates | Auto | Manual (APK) |
| Licencje | ❌ Łatwe do obejścia | ✅ Device-locked |

---

## 🔐 PRODUCTION LICENSE KEYS

### Jak stworzyć prawdziwy klucz dla klienta:

**1. Format:**
```
MESSUBOUW-[PLAN]-[ROK]-[UNIQUE_ID]

Przykłady:
  MESSUBOUW-PRO-2025-JAN123
  MESSUBOUW-STARTER-2026-FIRMA456
  MESSUBOUW-FREE-2025-TRIAL789
```

**2. Dodaj w kodzie:**
```typescript
// src/services/MobileLicenseManager.ts

private async validateLicenseKey(key: string): Promise<boolean> {
  // ... existing test keys ...
  
  // Production keys:
  const productionKeys = [
    'MESSUBOUW-PRO-2025-JAN123',      // Klient Jan (PRO do 31.12.2025)
    'MESSUBOUW-STARTER-2026-FIRMA456', // Firma X (STARTER cały 2026)
    // ... dodaj więcej ...
  ];
  
  if (productionKeys.includes(key)) {
    return true;
  }
  
  return false;
}
```

**3. Przypisz plan:**
```typescript
const getPlanFromKey = (key: string): LicensePlan => {
  if (key.includes('-PRO-')) return 'pro';
  if (key.includes('-STARTER-')) return 'starter';
  return 'free';
};
```

**4. Opcjonalnie: Expiry Date**
```typescript
const getExpiryFromKey = (key: string): Date | null => {
  const match = key.match(/(\d{4})/); // Extract year
  if (match) {
    const year = parseInt(match[1]);
    return new Date(year, 11, 31); // Dec 31 of that year
  }
  return null;
};
```

---

## 💰 MONETYZACJA

### Opcja 1: Direct Sales (obecny system)
```
1. Klient kupuje (email/PayPal/Przelewy24)
2. Wysyłasz license key
3. Klient aktywuje w app
4. Device ID binding chroni przed shareowaniem
```

**Pros:** 100% profitu, kontrola cen  
**Cons:** Manual handling, brak auto-renewals

### Opcja 2: Google Play In-App Purchases
```typescript
// npm install @capacitor-community/in-app-purchases

import { InAppPurchases } from '@capacitor-community/in-app-purchases';

// Setup products:
const products = [
  { id: 'messubouw_starter_monthly', price: '9.99 PLN' },
  { id: 'messubouw_pro_yearly', price: '99.99 PLN' },
];

// Purchase flow:
const buyStarter = async () => {
  const result = await InAppPurchases.purchase({
    productId: 'messubouw_starter_monthly'
  });
  
  if (result.success) {
    // Activate STARTER plan
    await activatePlan('starter');
  }
};
```

**Pros:** Auto-renewals, Play Store trust  
**Cons:** 15-30% commission dla Google

### Opcja 3: Subscription Backend
```
架构:
  App → Twój Backend (Node.js/PHP) → Stripe/PayPal
  
Backend validuje key:
  POST /api/validate-license
  { "key": "MESSUBOUW-PRO-...", "deviceId": "abc123..." }
  
  Response:
  { "valid": true, "plan": "pro", "expires": "2025-12-31" }
```

**Pros:** Pełna kontrola, subscription model  
**Cons:** Wymaga backend + hosting

---

## 🚀 DYSTRYBUCJA

### Metoda 1: Email/WhatsApp (teraz)
```
Wyślij:
  - APK file (3.5 MB)
  - License key
  - Link do instrukcji (ten dokument)
```

### Metoda 2: Website Download
```html
<!-- Landing page: -->
<a href="/downloads/MessuBouw-v1.0-SIGNED.apk" download>
  📥 Pobierz na Android (3.5 MB)
</a>

<!-- Po płatności: pokazuje license key -->
<div class="license-key">
  Twój klucz licencji: <code>MESSUBOUW-PRO-2025-XYZ</code>
</div>
```

### Metoda 3: Google Play Store (najlepsze)
**Kroki:**
1. Rejestracja: https://play.google.com/console (25 USD one-time)
2. Stwórz app listing:
   - Tytuł: "MessuBouw - Faktury dla ZZP"
   - Opis: 4000 znaków (zalety, features)
   - Screenshots: 2-8 images (phone + tablet)
   - Icon: 512x512 PNG
3. Upload APK (ten sam plik!)
4. Content rating questionnaire
5. Privacy policy URL (wymagane!)
6. Submit for review (2-7 dni)

---

## 📸 SCREENSHOTS DO PLAY STORE

**Wymagane rozmiary:**
```
Phone screenshots (minimum 2):
  - 1080x1920 (16:9)
  - 1440x2560 (16:9)

Tablet screenshots (opcjonalne):
  - 1920x1080 (landscape)

Feature graphic (1024x500):
  - Header image w Play Store
```

**Content:**
1. Dashboard z fakturami
2. Formularz tworzenia faktury
3. Preview PDF faktury
4. Lista klientów
5. Panel statystyk (jeśli masz)

---

## 🔄 UPDATE SYSTEM

### Manual Updates (teraz)
```
1. Build nowy APK z wyższym versionCode
2. Wyślij klientom
3. Instrukcja: "Odinstaluj starą → Zainstaluj nową"
```

### Auto-Update Notification
```typescript
// src/services/UpdateChecker.ts

const checkForUpdates = async () => {
  const response = await fetch('https://twoj-serwer.com/api/version');
  const { latestVersion, downloadUrl } = await response.json();
  
  const currentVersion = '1.0.0'; // z package.json
  
  if (latestVersion > currentVersion) {
    showUpdateDialog({
      message: `Nowa wersja ${latestVersion} dostępna!`,
      downloadUrl
    });
  }
};
```

### Play Store Auto-Updates
```
Gdy publikujesz w Play Store:
  - Users dostają auto-update (jeśli włączyli)
  - Nie tracą danych (SharedPreferences + SQLite persist)
  - Nie muszą re-aktywować licencji
```

---

## 📝 NOTATKI TECHNICZNE

### Zawartość APK:
```
📦 MessuBouw-v1.0-SIGNED.apk (3.5 MB)
├── 🔐 ProGuard obfuscated code
├── 📱 Capacitor runtime
├── 🌐 React app (dist/)
├── 🔑 messubouw keystore signature
├── 🛡️ Device ID binding
└── 💾 Offline storage (SQLite + SharedPreferences)
```

### Security Features:
- ✅ RSA 2048-bit signing
- ✅ SHA384withRSA signature
- ✅ ProGuard code obfuscation (5 passes)
- ✅ Minified resources (-60% size)
- ✅ No debug logs in production
- ✅ Device ID hardware binding
- ✅ License expiry validation

### Compatibility:
- Minimum SDK: Android 7.0 (API 24)
- Target SDK: Android 14 (API 34)
- Architectures: arm64-v8a, armeabi-v7a, x86, x86_64
- Screen sizes: Phone, Tablet, Foldables

---

## ❓ FAQ

**Q: Czy mogę użyć tego samego klucza na 2 telefonach?**  
A: ❌ NIE. Każdy klucz jest bound do Device ID pierwszego telefonu.

**Q: Co się stanie gdy zmienię telefon?**  
A: Musisz dostać nowy license key. Device ID się zmienia przy zmianie hardware.

**Q: Czy APK działa na tabletach?**  
A: ✅ TAK. APK jest universal - działa na phone + tablet + foldables.

**Q: Czy mogę zainstalować na emulatorze Android?**  
A: ✅ TAK, ale Device ID będzie inny niż na fizycznym telefonie.

**Q: Jak długo ważny jest test key?**  
A: Obecnie: unlimited. Możesz dodać expiry date w kodzie.

**Q: Czy APK zbiera dane użytkowników?**  
A: NIE. Wszystko offline. Jedyny request: Firebase Auth (login).

**Q: Jak usunąć app?**  
A: Normalnie: Przytrzymaj ikonę → Odinstaluj. Lub: Ustawienia → Aplikacje → MessuBouw → Odinstaluj.

---

## 📞 SUPPORT

**Jeśli coś nie działa:**

1. **Check podstawy:**
   - Android 7.0+ ?
   - Internet connected? (przy pierwszej aktywacji)
   - Test key poprawnie wpisany?

2. **Collect logs:**
   ```bash
   adb logcat > messubouw.log
   ```

3. **Contact:**
   - Email: [twój-email]
   - GitHub Issues: https://github.com/norbi07011/NEW-POPRAWIONE/issues

---

**Wersja dokumentacji:** 1.0  
**Data:** 7 grudnia 2025  
**APK:** MessuBouw-v1.0-SIGNED.apk (3,667,101 bytes)
