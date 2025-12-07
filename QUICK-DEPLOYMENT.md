# 🚀 QUICK DEPLOYMENT GUIDE

## ⚡ 1-CLICK DEPLOYMENTS

### 📱 Android APK (Production)

```powershell
# Build signed APK ready dla distribution:
.\scripts\build-android.ps1
```

**Output:** `public\MessuBouw-v1.0-SIGNED.apk` (3.5 MB)

**Zawiera:**
- ✅ ProGuard obfuscation
- ✅ Keystore signature (27 lat ważności)
- ✅ Device ID license protection
- ✅ Minified resources (-60% size)

---

### 🌐 Web App (Cloudflare Pages)

```powershell
# Deploy do Cloudflare Pages:
.\scripts\deploy-web.ps1
```

**Output:** Live na https://your-domain.pages.dev

**Features:**
- ⚡ Edge deployment (global CDN)
- 🔒 Automatic HTTPS
- 🚀 Instant rollback
- 📊 Analytics included

---

### 🍎 iOS Build (wymaga Mac!)

```bash
# Na Macu:
./scripts/build-ios.sh
```

**Output:** IPA ready dla App Store submission

**Zawiera:**
- ✅ Apple certificate signing
- ✅ Provisioning profile
- ✅ Bitcode enabled
- ✅ Upload symbols

---

## 🛠️ SETUP (jednorazowo)

### 1. Install Dependencies

```powershell
# Node.js packages:
npm install

# Android setup (jeśli jeszcze nie):
npx cap sync android
```

### 2. Configure Secrets

```powershell
# Skopiuj example:
Copy-Item .env.example .env

# Edytuj .env - dodaj klucze:
# - Firebase API Key
# - Supabase URL & Key
# - Google Maps API Key
```

### 3. Test Locally

```powershell
# Web dev server:
npm run dev
# → http://localhost:5000

# Android w emulatorze:
npx cap open android
# → Kliknij Run w Android Studio
```

---

## 📦 PRODUCTION CHECKLIST

### Przed każdym release:

```powershell
# 1. Increment version:
# package.json: "version": "1.1.0"
# android/app/build.gradle: versionCode 2, versionName "1.1.0"

# 2. Test build:
npm run build
# → Check dist/ folder

# 3. Test errors:
# npm run dev → Open DevTools → No console errors

# 4. Git commit:
git add .
git commit -m "chore: Bump version to 1.1.0"
git push

# 5. Build production:
.\scripts\build-android.ps1
# → Testuj APK na fizycznym telefonie!

# 6. Deploy:
# - Android: Upload APK do Play Store
# - Web: git push → auto-deploy via Cloudflare
# - iOS: Archive w Xcode → Upload do App Store Connect
```

---

## 🔧 TROUBLESHOOTING

### Build fails?

```powershell
# Clean cache:
Remove-Item -Recurse -Force node_modules, dist, android/app/build
npm install
npm run build
npx cap sync android
```

### APK not signing?

```powershell
# Verify keystore exists:
Test-Path android\app\messubouw-release.keystore
# Should return: True

# Re-generate jeśli zgubiony (USE SAME PASSWORDS!):
cd android/app
keytool -genkey -v -keystore messubouw-release.keystore -alias messubouw -keyalg RSA -keysize 2048 -validity 10000
```

### License activation fails?

```
1. Check internet connection (first activation needs network)
2. Verify test key: MESSUBOUW-FREE-2025-TEST1 (case-sensitive!)
3. Check Device ID binding - 1 key = 1 device only
4. Logs: Chrome DevTools → Console → Look for "🔍 LICENSE:" logs
```

---

## 📊 MONITORING

### Check App Health:

```
Web:
  Console Ninja → Real-time logs
  Browser DevTools → Network tab (API calls)

Android:
  adb logcat | grep MessuBouw
  Play Console → Vitals (crashes, ANRs)

iOS:
  Xcode → Window → Devices → Console
  App Store Connect → Analytics
```

### Key Metrics:

```
Daily Active Users (DAU)
Invoices Created per User
License Conversion Rate (FREE → PAID)
Crash-free Rate (target: >99.5%)
Average Rating (target: >4.5 ⭐)
```

---

## 🚀 QUICK COMMANDS

```powershell
# Development:
npm run dev                    # Start dev server
npm run build                  # Build web app
npx cap sync                   # Sync to mobile platforms

# Android:
.\scripts\build-android.ps1    # Build signed APK
npx cap open android           # Open Android Studio
npx cap run android            # Run on connected device

# iOS (Mac only):
npx cap open ios               # Open Xcode
npx cap run ios                # Run on simulator

# Testing:
npm run lint                   # ESLint check
npm run optimize               # Vite optimization

# Git:
git status                     # Check changes
git add .                      # Stage all
git commit -m "message"        # Commit
git push                       # Push to GitHub

# Deployment:
.\scripts\deploy-web.ps1       # Deploy web app
.\scripts\create-release.ps1   # Create GitHub release
```

---

## 📁 PROJECT STRUCTURE

```
messu-bouw-restored/
├── 📱 android/               # Android native project
│   └── app/
│       ├── build.gradle      # Build config + signing
│       └── messubouw-release.keystore  # BACKUP THIS!
│
├── 🍎 ios/                   # iOS native project (wymaga Mac)
│   └── App/
│       └── App.xcworkspace   # Open w Xcode
│
├── 🌐 src/                   # React app source
│   ├── components/           # UI components
│   ├── pages/                # Route pages
│   ├── services/             # Business logic
│   │   ├── LicenseManager.ts         # Desktop licenses
│   │   └── MobileLicenseManager.ts   # Mobile licenses (Device ID)
│   └── lib/
│       └── pdf-generator.ts  # Invoice PDF creation
│
├── 📦 public/                # Static assets
│   └── MessuBouw-v1.0-SIGNED.apk  # Production APK
│
├── 📝 scripts/               # Deployment scripts
│   ├── build-android.ps1     # Build signed APK
│   ├── deploy-web.ps1        # Deploy to Cloudflare
│   └── create-release.ps1    # GitHub release
│
├── 📄 Dokumentacja/
│   ├── INSTALACJA-ANDROID-APK.md      # Android testing guide
│   ├── BUILD-IOS-INSTRUKCJE.md        # iOS build guide
│   ├── GOOGLE-PLAY-STORE-GUIDE.md     # Play Store submission
│   └── QUICK-DEPLOYMENT.md            # Ten plik!
│
└── 🔧 Config files:
    ├── capacitor.config.ts   # Capacitor mobile config
    ├── vite.config.ts        # Vite build config
    ├── package.json          # Dependencies + scripts
    └── .env                  # API keys (NIE commituj!)
```

---

## 🔑 CREDENTIALS BACKUP

**⚠️ WAŻNE - Zapisz bezpiecznie:**

```
Android Keystore:
  File: android/app/messubouw-release.keystore
  Store Password: MessuBouw2025!
  Key Alias: messubouw
  Key Password: MessuBouw2025!
  
  GDY ZGUBISZ → NIE MOŻESZ UPDATEOWAĆ APP W PLAY STORE!
  Backup: Google Drive + Pendrive + Email

Firebase:
  Project: messu-bouw-faktur
  Email: [twój-email]
  Password: [zachowaj w password managerze]

Supabase:
  Project: ayinverqjntywglsdlzo
  API Key: [w .env file]
  URL: https://ayinverqjntywglsdlzo.supabase.co

Google Play Console:
  Email: [twój-email]
  Password: [zachowaj bezpiecznie]
  2FA: Enable! (zwiększa security)

Apple Developer:
  Email: [twój Apple ID]
  Password: [zachowaj bezpiecznie]
  2FA: Required (Apple enforces this)
```

---

## 📞 SUPPORT

**Pytania? Problemy?**

- 📧 Email: support@messubouw.com
- 🐛 GitHub Issues: https://github.com/norbi07011/NEW-POPRAWIONE/issues
- 📖 Docs: Zobacz pliki w folderze `Dokumentacja/`

**Emergency Rollback:**

```powershell
# Web (Cloudflare):
Cloudflare Dashboard → Rollback to previous deployment (1 click)

# Android (Play Store):
Play Console → Release Management → Rollback to version X

# Lokalny revert:
git log --oneline           # Find commit hash
git revert [hash]           # Revert changes
git push                    # Deploy reverted version
```

---

**Wersja:** 1.0  
**Ostatnia aktualizacja:** 7 grudnia 2025  
**Status:** Production-ready ✅
