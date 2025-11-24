# 🚀 SZYBKI START - Build APK Android

## ⚡ 3 Kroki do APK

### 1️⃣ Build aplikacji React
```bash
npm run build
```

### 2️⃣ Sync z Androidem
```bash
npx cap sync android
```

### 3️⃣ Otwórz Android Studio
```bash
cd android
# Otwórz folder 'android' w Android Studio
```

---

## 📱 W Android Studio:

1. **Poczekaj aż Gradle sync się skończy** (pasek u dołu)

2. **Build APK:**
   - Kliknij: `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
   - Poczekaj 2-5 minut...

3. **APK gotowy!**
   ```
   android/app/build/outputs/apk/debug/app-debug.apk
   ```

4. **Transferuj na telefon:**
   - Podłącz telefon USB
   - Skopiuj `app-debug.apk` na telefon
   - Włącz "Nieznane źródła" w ustawieniach
   - Zainstaluj APK

---

## 🔐 Aktywacja Licencji

Po pierwszym uruchomieniu aplikacji:

1. Ekran aktywacji się pokaże
2. Wpisz testowy klucz: **`MESSUBOUW-FREE-2025-TEST1`**
3. Kliknij "Aktywuj Licencję"
4. ✅ Aplikacja odblokowana!

**Inne testowe klucze:**
- `MESSUBOUW-STARTER-2025-TEST2` (100 faktur)
- `MESSUBOUW-PRO-2025-TEST3` (unlimited)

---

## 🆘 Problemy?

### "Gradle sync failed"
```bash
cd android
.\gradlew clean
.\gradlew build
```

### "Android SDK not found"
- Zainstaluj Android Studio
- Otwórz Android Studio → Settings → Android SDK
- Zainstaluj Android 13 (API 33)

### "APK nie instaluje się"
- Włącz "Instalacja z nieznanych źródeł"
- Ustawienia → Bezpieczeństwo → Nieznane źródła ✅

---

## 📖 Pełna Dokumentacja

Zobacz: **BUILD-MOBILE-INSTRUKCJE.md** dla:
- Signed APK (produkcja)
- Google Play Store upload
- iOS build instructions
- Security features explained
