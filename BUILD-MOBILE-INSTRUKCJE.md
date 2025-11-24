# 📱 MESSU BOUW - Build APK/AAB dla Android

## 🔐 Zabezpieczenia Zaimplementowane

### 1. Device ID Binding
- Każda licencja jest przypisana do unikalnego ID urządzenia
- Nie można skopiować aplikacji na inne urządzenie bez nowej licencji
- Plugin `@capacitor/device` pobiera UUID urządzenia

### 2. License Manager System
**Plik:** `src/services/MobileLicenseManager.ts`

**Funkcje:**
- `checkLicense()` - Sprawdza czy licencja jest aktywna
- `activateLicense(key)` - Aktywuje licencję z kluczem
- `validateLicenseKey(key)` - Walidacja klucza (połączenie z API)
- `revokeLicense()` - Usuwa licencję (kradzież wykryta)

**Limity planów:**
```typescript
FREE:    5 faktur,   1 firma
STARTER: 100 faktur, 3 firmy
PRO:     ∞ faktur,   ∞ firm
```

### 3. ProGuard Code Obfuscation
**Plik:** `android/app/proguard-rules.pro`

**Zabezpieczenia:**
- Obfuskacja nazw klas i metod
- Usunięcie logów z produkcji
- Ochrona licencji przed reverse engineering
- Minimalizacja rozmiaru APK

**Plik:** `android/app/build.gradle`
```gradle
release {
    minifyEnabled true           // Włącz minifikację
    shrinkResources true         // Usuń nieużywane zasoby
    proguardFiles ...            // Użyj ProGuard
    debuggable false            // Wyłącz debugging
}
```

### 4. Ekran Aktywacji
**Plik:** `src/components/MobileLicenseActivation.tsx`

**Wyświetla się gdy:**
- Aplikacja uruchomiona po raz pierwszy
- Licencja wygasła
- Wykryto kradzież (device ID mismatch)

**Testowe klucze:**
```
MESSUBOUW-FREE-2025-TEST1
MESSUBOUW-STARTER-2025-TEST2
MESSUBOUW-PRO-2025-TEST3
```

---

## 🚀 Jak Zbudować APK

### Opcja 1: Android Studio (Zalecane)

1. **Otwórz projekt Android:**
   ```bash
   cd android
   # Otwórz folder 'android' w Android Studio
   ```

2. **W Android Studio:**
   - Wybierz: `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
   - Lub dla Google Play: `Build Bundle(s) / APK(s)` → `Build Bundle (AAB)`

3. **Lokalizacja APK:**
   ```
   android/app/build/outputs/apk/release/app-release.apk
   ```

### Opcja 2: Gradle Command Line

1. **Debug APK (szybkie testowanie):**
   ```bash
   cd android
   .\gradlew assembleDebug
   ```
   Output: `android/app/build/outputs/apk/debug/app-debug.apk`

2. **Release APK (produkcja, z ProGuard):**
   ```bash
   cd android
   .\gradlew assembleRelease
   ```
   Output: `android/app/build/outputs/apk/release/app-release-unsigned.apk`

3. **Release AAB (Google Play Store):**
   ```bash
   cd android
   .\gradlew bundleRelease
   ```
   Output: `android/app/build/outputs/bundle/release/app-release.aab`

---

## 🔑 Signing APK (Podpisywanie)

### Krok 1: Utwórz Keystore

```bash
keytool -genkey -v -keystore messubouw-release.keystore -alias messubouw -keyalg RSA -keysize 2048 -validity 10000
```

**Zapisz:**
- Password: `[TWÓJ_PASSWORD]`
- Alias: `messubouw`
- Plik: `android/app/messubouw-release.keystore`

### Krok 2: Zaktualizuj build.gradle

**Plik:** `android/app/build.gradle`

```gradle
android {
    signingConfigs {
        release {
            storeFile file('messubouw-release.keystore')
            storePassword 'YOUR_PASSWORD'
            keyAlias 'messubouw'
            keyPassword 'YOUR_PASSWORD'
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### Krok 3: Build Signed APK

```bash
cd android
.\gradlew assembleRelease
```

Output: `android/app/build/outputs/apk/release/app-release.apk` (SIGNED)

---

## 📱 iOS Build (Apple App Store)

### Wymagania:
- Mac z Xcode 14+
- Apple Developer Account ($99/rok)
- Certyfikat podpisywania

### Krok 1: Sync iOS

```bash
npx cap sync ios
```

### Krok 2: Otwórz Xcode

```bash
npx cap open ios
```

### Krok 3: Konfiguracja

1. Wybierz target: `App`
2. Signing & Capabilities:
   - Team: `[Twój Apple Developer Team]`
   - Bundle ID: `com.messubouw.faktur`
3. Build Settings:
   - Code Signing Identity: `iOS Distribution`

### Krok 4: Archive & Upload

1. Product → Archive
2. Distribute App → App Store Connect
3. Upload do TestFlight/App Store

---

## 🧪 Testowanie Licencji

### Test 1: Pierwsze Uruchomienie
1. Zainstaluj APK na urządzeniu
2. Otwórz aplikację - powinien pokazać się ekran aktywacji
3. Wpisz: `MESSUBOUW-FREE-2025-TEST1`
4. Kliknij "Aktywuj Licencję"
5. Aplikacja powinna się odblokować

### Test 2: Kopiowanie na Inne Urządzenie
1. Zainstaluj ten sam APK na drugim urządzeniu
2. Spróbuj użyć tej samej licencji
3. Licencja powinna być odrzucona (device ID mismatch)

### Test 3: Limity Faktur
1. Aktywuj FREE plan (5 faktur)
2. Dodaj 5 faktur
3. Spróbuj dodać 6-tą - powinien pokazać się komunikat o limicie
4. Aktywuj PRO plan - limity znikają

---

## 📦 Dystrybucja

### Google Play Store
1. Utwórz konto Google Play Console ($25 jednorazowo)
2. Utwórz nową aplikację
3. Upload AAB: `android/app/build/outputs/bundle/release/app-release.aab`
4. Wypełnij Store Listing (nazwa, opis, screenshoty)
5. Opublikuj

### Bezpośrednia Dystrybucja (APK)
1. Hostuj APK na Twoim serwerze
2. Użytkownicy muszą włączyć "Nieznane źródła" w ustawieniach
3. Download i instalacja APK
4. Aktywacja licencji przy pierwszym uruchomieniu

---

## 🔒 Dodatkowe Zabezpieczenia (Opcjonalne)

### 1. API Validation
Dodaj do `MobileLicenseManager.ts`:

```typescript
private async validateLicenseKey(key: string): Promise<boolean> {
  const response = await fetch('https://your-api.com/validate-license', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      key, 
      deviceId: this.deviceId,
      appVersion: '1.0.0'
    })
  });
  
  const data = await response.json();
  return data.valid;
}
```

### 2. Root Detection
Dodaj plugin do wykrywania zrootowanych urządzeń:

```bash
npm install cordova-plugin-root-detection
npx cap sync android
```

### 3. SSL Pinning
Zabezpiecz połączenia API przed man-in-the-middle:

```bash
npm install @ionic-native/http
npx cap sync android
```

---

## 🆘 Troubleshooting

### "Gradle sync failed"
```bash
cd android
.\gradlew clean
.\gradlew build
```

### "minifyEnabled error"
- Sprawdź `proguard-rules.pro`
- Upewnij się że wszystkie biblioteki mają prawidłowe reguły

### "Signing error"
- Sprawdź ścieżkę do keystore
- Sprawdź hasło i alias

### "License not working"
- Sprawdź logi: `adb logcat | grep Capacitor`
- Sprawdź czy plugin Device jest zainstalowany
- Sprawdź Preferences storage

---

## 📞 Kontakt

**Pytania o licencjonowanie:**
support@messubouw.com

**Problemy techniczne:**
tech@messubouw.com

---

✅ **Gotowe!** Aplikacja jest zabezpieczona i gotowa do publikacji.
