# 📱 Build Android APK - Production Script
# Usage: .\scripts\build-android.ps1

Write-Host "🚀 MessuBouw - Android Production Build" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Write-Host "🔍 Checking prerequisites..." -ForegroundColor Yellow

if (-not (Test-Path "android\app\build.gradle")) {
    Write-Host "❌ Error: Android project not found!" -ForegroundColor Red
    Write-Host "   Run: npx cap add android" -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path "android\app\messubouw-release.keystore")) {
    Write-Host "❌ Error: Keystore not found!" -ForegroundColor Red
    Write-Host "   Expected: android\app\messubouw-release.keystore" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Prerequisites OK" -ForegroundColor Green
Write-Host ""

# Clean old builds
Write-Host "🧹 Cleaning old builds..." -ForegroundColor Yellow
if (Test-Path "android\app\build\outputs\apk\release") {
    Remove-Item "android\app\build\outputs\apk\release\*" -Recurse -Force -ErrorAction SilentlyContinue
}
Write-Host "✅ Cleaned" -ForegroundColor Green
Write-Host ""

# Build React app
Write-Host "⚛️  Building React app..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ React build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ React app built" -ForegroundColor Green
Write-Host ""

# Sync Capacitor
Write-Host "🔄 Syncing Capacitor..." -ForegroundColor Yellow
npx cap sync android
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Capacitor sync failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Capacitor synced" -ForegroundColor Green
Write-Host ""

# Build APK
Write-Host "📦 Building signed APK..." -ForegroundColor Yellow
Write-Host "   This may take 2-5 minutes..." -ForegroundColor Gray
Push-Location android
.\gradlew assembleRelease --no-daemon
$buildResult = $LASTEXITCODE
Pop-Location

if ($buildResult -ne 0) {
    Write-Host "❌ APK build failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Troubleshooting:" -ForegroundColor Yellow
    Write-Host "   1. Check android\app\build.gradle syntax" -ForegroundColor Gray
    Write-Host "   2. Verify keystore password in build.gradle" -ForegroundColor Gray
    Write-Host "   3. Run: cd android; .\gradlew clean" -ForegroundColor Gray
    exit 1
}

Write-Host "✅ APK built successfully!" -ForegroundColor Green
Write-Host ""

# Verify APK
$apkPath = "android\app\build\outputs\apk\release\app-release.apk"
if (-not (Test-Path $apkPath)) {
    Write-Host "❌ APK not found at expected location!" -ForegroundColor Red
    exit 1
}

$apk = Get-Item $apkPath
$sizeInMB = [math]::Round($apk.Length / 1MB, 2)

Write-Host "📱 APK Details:" -ForegroundColor Cyan
Write-Host "   Name: $($apk.Name)" -ForegroundColor White
Write-Host "   Size: $sizeInMB MB" -ForegroundColor White
Write-Host "   Path: $($apk.FullName)" -ForegroundColor White
Write-Host "   Date: $($apk.LastWriteTime.ToString('yyyy-MM-dd HH:mm:ss'))" -ForegroundColor White
Write-Host ""

# Copy to public folder
Write-Host "📂 Copying to public folder..." -ForegroundColor Yellow
$publicApk = "public\MessuBouw-v1.0-SIGNED.apk"
Copy-Item $apkPath $publicApk -Force
Write-Host "✅ Copied to: $publicApk" -ForegroundColor Green
Write-Host ""

# Verify signature
Write-Host "🔐 Verifying signature..." -ForegroundColor Yellow
$verifyOutput = jarsigner -verify $apkPath 2>&1 | Select-String "jar verified"
if ($verifyOutput) {
    Write-Host "✅ Signature valid!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Warning: Could not verify signature" -ForegroundColor Yellow
}
Write-Host ""

# Success summary
Write-Host "🎉 BUILD SUCCESSFUL!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Test APK na Androidzie:" -ForegroundColor White
Write-Host "      - Transfer $publicApk na telefon" -ForegroundColor Gray
Write-Host "      - Instaluj + test z license key" -ForegroundColor Gray
Write-Host ""
Write-Host "   2. Upload do Play Store:" -ForegroundColor White
Write-Host "      - Play Console → Production → Upload APK" -ForegroundColor Gray
Write-Host "      - Wypełnij release notes" -ForegroundColor Gray
Write-Host "      - Submit for review" -ForegroundColor Gray
Write-Host ""
Write-Host "   3. Direct distribution:" -ForegroundColor White
Write-Host "      - Email APK + license key klientom" -ForegroundColor Gray
Write-Host "      - Host na website + download link" -ForegroundColor Gray
Write-Host ""

Write-Host "📖 Documentation: INSTALACJA-ANDROID-APK.md" -ForegroundColor Cyan
Write-Host "📖 Play Store Guide: GOOGLE-PLAY-STORE-GUIDE.md" -ForegroundColor Cyan
Write-Host ""
