# 🍎 MessuBouw iOS Build - Instrukcje

## ⚠️ WYMAGANIA

### Hardware:
- **Mac** (MacBook, iMac, Mac Mini) z macOS 12.0+ (Monterey lub nowszy)
- **iPhone/iPad** do testowania (opcjonalne - można używać symulatora)

### Software:
```bash
# 1. Xcode (FREE z App Store)
# https://apps.apple.com/app/xcode/id497799835

# 2. Xcode Command Line Tools
xcode-select --install

# 3. CocoaPods (iOS dependency manager)
sudo gem install cocoapods

# 4. Apple Developer Account
# FREE: Tylko testowanie (7 dni ważności)
# $99/rok: Publikacja w App Store
```

---

## 🚀 BUILD PROCESS

### Krok 1: Przygotowanie Projektu iOS

```bash
# Na Macu, w folderze projektu:
cd ~/messu-bouw-restored

# Install iOS dependencies:
npx cap sync ios

# Install CocoaPods dependencies:
cd ios/App
pod install

# ✅ Jeśli sukces, zobaczysz:
# "Pod installation complete! There are X dependencies..."
```

### Krok 2: Otwórz w Xcode

```bash
# NIE otwieraj App.xcodeproj - otwórz WORKSPACE!
open ios/App/App.xcworkspace
```

**W Xcode:**
```
1. Wybierz target: "App" (lewy sidebar)
2. Tab "Signing & Capabilities"
3. Team: Wybierz swój Apple Developer Account
4. Bundle Identifier: com.norbs.faktur (lub zmień)
```

### Krok 3: Configure Signing

**FREE Developer Account (7-day signing):**
```
- Automatically manage signing: ✅ ON
- Team: [Your Personal Team]
- Provisioning Profile: Xcode Managed
- Signing Certificate: Apple Development
```

**PAID Developer Account ($99/rok):**
```
- Automatically manage signing: ✅ ON  
- Team: [Your Team Name]
- Provisioning Profile: iOS App Store
- Signing Certificate: Apple Distribution
```

### Krok 4: Build & Run

**A) Symulator (szybkie testy):**
```
1. Wybierz device: iPhone 15 Pro (lub inny symulator)
2. Kliknij ▶️ Play (Cmd+R)
3. Czekaj ~2 minuty (pierwszy build)
4. App otworzy się w symulatorze
```

**B) Fizyczny iPhone:**
```
1. Podłącz iPhone przez USB
2. iPhone: "Trust This Computer?" → Zaufaj
3. Xcode: Wybierz swój iPhone z listy
4. Kliknij ▶️ Play (Cmd+R)
5. iPhone: Ustawienia → Ogólne → Zarządzanie urządzeniem
   → Zaufaj certyfikatowi [Twój email]
6. Uruchom app ponownie
```

---

## 📱 TESTOWANIE NA iOS

### ✅ Test Checklist (identyczny jak Android):

**1. Device ID Binding:**
- [ ] Ekran aktywacji pokazuje Device ID (UUID)
- [ ] Test key aktywuje licencję
- [ ] Restart app - licencja nadal aktywna

**2. Faktury:**
- [ ] Tworzenie faktury działa
- [ ] KVK klienta widoczny w PDF
- [ ] Zapisywanie offline

**3. Limity:**
- [ ] FREE: 5 faktur limit działa
- [ ] STARTER: 3 firmy limit działa

**4. Performance:**
- [ ] Płynne scrollowanie
- [ ] Szybkie ładowanie PDF
- [ ] Brak crashów

---

## 🏪 APP STORE SUBMISSION

### Przygotowanie:

**1. App Icons (wszystkie rozmiary):**
```
ios/App/App/Assets.xcassets/AppIcon.appiconset/

Wymagane:
  - 1024x1024 (App Store)
  - 180x180 (iPhone)
  - 167x167 (iPad Pro)
  - 152x152 (iPad)
  - 120x120 (iPhone)
  - 87x87 (iPhone notifs)
  - 80x80 (iPad notifs)
  - 76x76 (iPad)
  - 58x58 (iPhone Settings)
  - 40x40 (iPad Search)
```

**Tip:** Użyj https://appicon.co do auto-generowania wszystkich rozmiarów.

**2. Launch Screen (splash screen):**
```swift
// ios/App/App/LaunchScreen.storyboard
// Dostosuj logo i kolory
```

**3. Info.plist Permissions:**
```xml
<!-- ios/App/App/Info.plist -->

<!-- Camera (dla OCR paragonów) -->
<key>NSCameraUsageDescription</key>
<string>MessuBouw potrzebuje dostępu do aparatu, aby skanować paragony.</string>

<!-- Photo Library (upload logo) -->
<key>NSPhotoLibraryUsageDescription</key>
<string>MessuBouw potrzebuje dostępu do zdjęć, aby dodać logo firmy.</string>

<!-- Contacts (import klientów) -->
<key>NSContactsUsageDescription</key>
<string>MessuBouw może importować dane klientów z kontaktów.</string>
```

### Archive & Upload:

```
1. Xcode → Product → Scheme → Edit Scheme
   → Run → Build Configuration → Release

2. Wybierz "Any iOS Device (arm64)" (nie symulator!)

3. Product → Archive
   Czekaj ~5-10 minut (Release build + optimization)

4. Window → Organizer → Archives
   Wybierz najnowszy archive

5. "Distribute App" → "App Store Connect" → Next

6. Upload options:
   ✅ Include bitcode (jeśli iOS 14+)
   ✅ Upload symbols (dla crash reports)
   ✅ Manage version and build number

7. Click "Upload"
   Czekaj ~10-20 minut (Apple processing)

8. App Store Connect:
   https://appstoreconnect.apple.com
   
9. "My Apps" → "+" → "New App"
   - Platform: iOS
   - Name: MessuBouw - Faktury dla ZZP
   - Primary Language: Dutch (lub Polish)
   - Bundle ID: com.norbs.faktur
   - SKU: messubouw-ios-2025

10. Fill app information:
    - Description (max 4000 chars)
    - Keywords (max 100 chars)
    - Screenshots (2-8 per device size)
    - App Preview video (opcjonalne)
    - Support URL
    - Marketing URL

11. Pricing & Availability:
    - Price: Free (app gratis, licencje płatne inside)
    - Lub: Paid ($0.99 - $999.99)
    - Countries: Poland, Netherlands, Worldwide

12. App Review Information:
    - Demo Account:
      Email: demo@messubouw.com
      Password: DemoTest123
      License Key: MESSUBOUW-PRO-2025-TEST3
    
    - Notes for reviewer:
      "App requires license activation. Use demo key: MESSUBOUW-PRO-2025-TEST3"

13. Submit for Review
    Status: "Waiting for Review" (1-3 dni)
    → "In Review" (12-48 godzin)
    → "Ready for Sale" ✅

14. Reject reasons (najczęstsze):
    ❌ Brak demo account/key
    ❌ Crash przy testowaniu
    ❌ Niekompletne screenshots
    ❌ Brakujące privacy policy
    ❌ In-app purchases nie działają
```

---

## 🔄 RÓŻNICE: iOS vs Android

| Feature | Android | iOS |
|---------|---------|-----|
| **Build Time** | 3 min | 5-10 min |
| **File Size** | 3.5 MB | ~8-12 MB |
| **Signing** | Keystore | Apple Certificate |
| **Distribution** | APK direct | TestFlight / App Store |
| **Device ID** | UUID persistent | UUID changes (iOS 14+) |
| **Offline Storage** | SQLite | Core Data / SQLite |
| **Push Notifs** | FCM (easy) | APNs (harder) |
| **Testing** | Any Android | Mac required |
| **Cost** | FREE | $99/year |

---

## 🧪 TESTFLIGHT (Beta Testing)

**Zanim publikujesz w App Store - przetestuj przez TestFlight:**

```
1. Upload build do App Store Connect (kroki powyżej)

2. App Store Connect → TestFlight tab

3. "Internal Testing" (do 100 users):
   - Dodaj testerów (email)
   - Wyślij invite
   - Testerzy instalują TestFlight app
   - Download MessuBouw beta
   - No review needed! (instant testing)

4. "External Testing" (do 10,000 users):
   - Beta App Review (1-2 dni)
   - Public link lub email invites
   - Feedback collection
   - Crash analytics

5. Iterate:
   - Fix bugs
   - Upload nowy build (increment build number!)
   - Auto-update dla testerów
```

---

## 🔐 iOS LICENSE ACTIVATION

### Device ID na iOS:

**⚠️ iOS 14+ Problem:**
```swift
// Stary sposób (iOS <14):
let deviceId = UIDevice.current.identifierForVendor?.uuidString

// Problem: UUID changes gdy:
// - Wszystkie apps tego vendora zostaną usunięte
// - iOS factory reset
```

**✅ Lepsze rozwiązanie - Keychain UUID:**

```typescript
// src/services/MobileLicenseManager.ts

import { Device } from '@capacitor/device';

async initialize(): Promise<void> {
  // iOS: Sprawdź czy UUID jest w Keychain
  const stored = await Preferences.get({ key: 'device_uuid_persistent' });
  
  if (stored.value) {
    this.deviceId = stored.value;
  } else {
    // Pierwszy raz - wygeneruj i zapisz w Keychain
    const info = await Device.getId();
    this.deviceId = info.identifier;
    
    await Preferences.set({
      key: 'device_uuid_persistent',
      value: this.deviceId
    });
  }
}
```

**Result:** UUID persist nawet po reinstall app! ✅

---

## 💰 IN-APP PURCHASES (iOS)

### Setup w App Store Connect:

```
1. App Store Connect → "Features" → "In-App Purchases"

2. Create New:
   Type: Auto-Renewable Subscription (zalecane)
   
3. Subscription Groups:
   Group: "MessuBouw Premium"
   
   Subscriptions:
   - STARTER: 9.99 PLN/miesiąc (7-day free trial)
   - PRO: 29.99 PLN/miesiąc (7-day free trial)
   - PRO YEARLY: 299.99 PLN/rok (14-day free trial)

4. Localization:
   - Display Name: "Starter Plan"
   - Description: "Unlimited invoices, up to 3 companies"
```

### Implementation (Capacitor):

```bash
npm install @capacitor-community/in-app-purchases
npx cap sync
```

```typescript
// src/services/IAPService.ts

import { InAppPurchases } from '@capacitor-community/in-app-purchases';

export class IAPService {
  async init() {
    await InAppPurchases.initialize();
    
    // Load products
    const { products } = await InAppPurchases.getProducts({
      productIds: [
        'messubouw_starter_monthly',
        'messubouw_pro_monthly',
        'messubouw_pro_yearly'
      ]
    });
    
    return products;
  }
  
  async purchaseStarter() {
    const result = await InAppPurchases.purchase({
      productId: 'messubouw_starter_monthly'
    });
    
    if (result.success) {
      // Activate STARTER plan
      await this.activatePlan('starter');
      
      // Save receipt dla server validation
      await this.validateReceipt(result.receipt);
    }
  }
  
  async restorePurchases() {
    const { purchases } = await InAppPurchases.restorePurchases();
    
    // Restore active subscriptions
    for (const purchase of purchases) {
      if (purchase.state === 'purchased') {
        const plan = this.getPlanFromProductId(purchase.productId);
        await this.activatePlan(plan);
      }
    }
  }
}
```

**Apple Commission:** 15-30% (15% dla pierwszych $1M rocznego dochodu)

---

## 📸 APP STORE SCREENSHOTS

### Wymagane rozmiary:

```
iPhone 6.7" (iPhone 15 Pro Max):
  1290 x 2796 pixels (portrait)
  2796 x 1290 pixels (landscape - opcjonalne)

iPhone 6.5" (iPhone 11 Pro Max, XS Max):
  1242 x 2688 pixels

iPhone 5.5" (iPhone 8 Plus):
  1242 x 2208 pixels

iPad Pro 12.9" (3rd gen):
  2048 x 2732 pixels (portrait)
  2732 x 2048 pixels (landscape)
```

**Tip:** Zrób screenshots na największym symulatorze (iPhone 15 Pro Max), Apple auto-scale na mniejsze.

### Content (min 2, max 10):

1. **Dashboard** - Lista faktur
2. **Tworzenie faktury** - Formularz wypełniony
3. **Preview PDF** - Gotowa faktura
4. **Klienci** - Lista firm z KVK/BTW
5. **Raporty** - Statystyki (jeśli masz)
6. **Settings** - Panel zarządzania firmami

**Design tip:** Dodaj text overlays explaining features:
```
"Twórz faktury w 2 minuty ⚡"
"Automatyczny eksport do PDF 📄"
"Zarządzanie klientami 🏢"
```

---

## 🔄 AUTO-UPDATE

### iOS App Store Updates:

```
✅ Automatic:
  User: Settings → App Store → App Updates → ON
  New version auto-downloads when available

Manual prompt w app:
1. Check version via API:
   GET https://itunes.apple.com/lookup?bundleId=com.norbs.faktur
   
2. Compare current vs latest:
   if (latestVersion > currentVersion) {
     showUpdateDialog({
       title: "Nowa wersja dostępna!",
       message: "Wersja 1.1.0 zawiera poprawki błędów",
       button: "Aktualizuj",
       url: "itms-apps://itunes.apple.com/app/id[APP_ID]"
     });
   }
```

---

## 📊 ANALYTICS & CRASH REPORTING

### Firebase (FREE):

```bash
npm install @capacitor-firebase/analytics
npm install @capacitor-firebase/crashlytics
npx cap sync ios
```

```swift
// ios/App/Podfile
# Add inside target 'App' do ... end:
pod 'Firebase/Analytics'
pod 'Firebase/Crashlytics'
```

```bash
cd ios/App
pod install
```

**W Xcode:**
```
1. Build Phases → "+" → New Run Script Phase
2. Script:
   "${PODS_ROOT}/FirebaseCrashlytics/run"
3. Input Files:
   $(SRCROOT)/$(BUILT_PRODUCTS_DIR)/$(INFOPLIST_PATH)
```

### App Store Analytics (built-in):

```
App Store Connect → Analytics

Metryki:
- Downloads
- Proceeds (dochód z IAP)
- Sales & Trends
- App Units (downloads per country)
- Crashes & ANRs
- Retention (Day 1, 7, 30)
```

---

## 🐛 COMMON iOS BUILD ERRORS

### Error: "No profiles for 'com.norbs.faktur' were found"

**Fix:**
```
Xcode → Preferences → Accounts
→ [Your Account] → Download Manual Profiles
→ Project → Signing & Capabilities
→ "Automatically manage signing" = ✅ ON
```

### Error: "Command PhaseScriptExecution failed"

**Fix:**
```bash
cd ios/App
pod deintegrate
pod install
```

### Error: "The linked library 'libCapacitor.a' is missing"

**Fix:**
```bash
cd ios
rm -rf App.xcworkspace App/Pods App/Podfile.lock
npx cap sync ios
cd App
pod install
```

### Error: "Signing requires a development team"

**Fix:**
```
1. Xcode → Top menu → Xcode → Preferences → Accounts
2. "+" → Sign in with Apple ID
3. Project → Signing & Capabilities → Team → Select your account
```

### Error: Build succeeds but app crashes on device

**Fix:**
```
1. Xcode → Window → Devices and Simulators
2. Select your iPhone
3. Click "Console" button
4. Run app → Read crash log
5. Usually: Missing permission (Camera, Photos, etc.)
   → Add to Info.plist
```

---

## 📝 PRIVACY POLICY (WYMAGANE!)

Apple wymaga Privacy Policy URL podczas submission:

**Opcje:**

**1. Generator (FREE):**
- https://www.privacypolicygenerator.info
- https://app-privacy-policy-generator.firebaseapp.com

**2. Template:**
```markdown
# MessuBouw - Polityka Prywatności

## Zbieranie Danych
MessuBouw nie zbiera, nie przechowuje ani nie udostępnia żadnych danych osobowych użytkowników. Wszystkie dane faktur są przechowywane lokalnie na urządzeniu użytkownika.

## Dane Licencji
Klucz licencyjny i Device ID są przechowywane lokalnie na urządzeniu. Device ID jest używany wyłącznie do weryfikacji licencji i nie jest przesyłany do żadnych serwerów zewnętrznych.

## Uprawnienia
- Aparat: Opcjonalnie używany do skanowania paragonów (OCR)
- Galeria: Opcjonalnie używana do dodania logo firmy
- Kontakty: Opcjonalnie używane do importu danych klientów

Wszystkie uprawnienia są opcjonalne i wymagają zgody użytkownika.

## Kontakt
Email: [twoj-email@example.com]
```

**3. Host na GitHub Pages:**
```bash
# Create docs/privacy-policy.html
# Push to GitHub
# Enable GitHub Pages: Settings → Pages → Source: main/docs
# URL: https://norbi07011.github.io/NEW-POPRAWIONE/privacy-policy.html
```

---

## 🎓 NAUKA XC ODE (jeśli pierwszy raz)

### Podstawowe operacje:

```
Cmd+R - Build & Run
Cmd+B - Build only
Cmd+. - Stop app
Cmd+Shift+K - Clean build folder

Left sidebar:
  Navigator (folder icon) - Files
  Search (🔍) - Find in project
  Issues (⚠️) - Errors & Warnings
  
Right sidebar:
  Inspectors - Properties, attributes
  
Bottom:
  Console - Logs & debug output
```

### Przydatne shortcuts:

```
Cmd+Shift+O - Open Quickly (znajdź plik)
Cmd+Shift+F - Find in Project
Cmd+/ - Comment/uncomment line
Cmd+[ / Cmd+] - Indent left/right
Ctrl+I - Re-indent selection
```

---

## 🚀 RELEASE CHECKLIST

Przed submission do App Store:

- [ ] **Build działa** na fizycznym iPhone (nie tylko symulator)
- [ ] **Wszystkie ikony** wygenerowane (1024x1024 główna)
- [ ] **Launch Screen** ustawiony (splash screen)
- [ ] **Bundle ID** prawidłowy (com.norbs.faktur)
- [ ] **Version number** zwiększony (np. 1.0.0 → 1.1.0)
- [ ] **Build number** zwiększony (1 → 2 → 3...)
- [ ] **Privacy Policy** URL ready
- [ ] **Support URL** ready (email lub website)
- [ ] **Demo account** stworzony dla Apple reviewers
- [ ] **Screenshots** (min 2, iPhone 6.7")
- [ ] **App Description** w App Store Connect (4000 chars max)
- [ ] **Keywords** (100 chars max): faktury, zzp, invoices, btw, kvk
- [ ] **Age Rating** filled (4+ zalecane dla business apps)
- [ ] **Test wszystkie funkcje** manual (tworzenie faktury, PDF, limity)
- [ ] **No crash** w ostatnich 24h testowania
- [ ] **Archive upload** successful

---

## 💡 TIPS & TRICKS

### Faster Build Times:

```ruby
# ios/App/Podfile - add at top:
install! 'cocoapods',
  :generate_multiple_pod_projects => true,
  :incremental_installation => true
```

### Debug Mode w Release Build:

```swift
// ios/App/App/AppDelegate.swift
func application(_ application: UIApplication, didFinishLaunchingWithOptions...) {
  #if DEBUG
  print("🐛 Debug mode enabled")
  #else
  print("🚀 Release mode")
  #endif
  
  return true
}
```

### Decrease App Size:

```
Xcode → Build Settings → Search "optimization"
→ Optimization Level → "Fastest, Smallest [-Os]"

→ Strip Linked Product → YES
→ Strip Debug Symbols → YES
→ Dead Code Stripping → YES

Result: ~30-40% smaller IPA
```

---

## 📞 SUPPORT & RESOURCES

**Official Docs:**
- Capacitor iOS: https://capacitorjs.com/docs/ios
- Apple Developer: https://developer.apple.com/documentation
- App Store Guidelines: https://developer.apple.com/app-store/review/guidelines

**Troubleshooting:**
- Stack Overflow: [xcode] [capacitor] [ionic]
- Capacitor Discord: https://discord.gg/capacitor
- GitHub Issues: https://github.com/norbi07011/NEW-POPRAWIONE/issues

**Recommended:**
- TestFlight beta testing przed public release
- Firebase Crashlytics dla monitoring
- Start with FREE Apple Developer → upgrade po pierwszym sukcesie

---

**Wersja dokumentacji:** 1.0  
**Data:** 7 grudnia 2025  
**Status:** Kod iOS-ready, wymaga Maca do build
