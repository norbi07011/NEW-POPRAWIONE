# 🌐 Deploy Web App - Cloudflare Pages
# Usage: .\scripts\deploy-web.ps1

param(
    [string]$Message = "Deploy from PowerShell script"
)

Write-Host "🌐 MessuBouw - Web Deployment" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

# Check Git status
Write-Host "📝 Checking Git status..." -ForegroundColor Yellow
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "⚠️  Warning: You have uncommitted changes:" -ForegroundColor Yellow
    Write-Host $gitStatus -ForegroundColor Gray
    Write-Host ""
    $continue = Read-Host "Continue anyway? (y/N)"
    if ($continue -ne "y") {
        Write-Host "❌ Deployment cancelled" -ForegroundColor Red
        exit 1
    }
}
Write-Host "✅ Git status OK" -ForegroundColor Green
Write-Host ""

# Build React app
Write-Host "⚛️  Building React app for production..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build complete" -ForegroundColor Green
Write-Host ""

# Check dist folder
$distSize = (Get-ChildItem "dist" -Recurse | Measure-Object -Property Length -Sum).Sum
$distSizeMB = [math]::Round($distSize / 1MB, 2)
Write-Host "📦 Build size: $distSizeMB MB" -ForegroundColor Cyan
Write-Host ""

# Git commit and push (triggers Cloudflare auto-deploy)
Write-Host "🚀 Deploying to Cloudflare Pages..." -ForegroundColor Yellow
Write-Host "   Commit message: $Message" -ForegroundColor Gray

git add dist/
git commit -m "$Message" --allow-empty
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Git commit failed!" -ForegroundColor Red
    exit 1
}

git push
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Git push failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Pushed to GitHub" -ForegroundColor Green
Write-Host ""

# Success
Write-Host "🎉 DEPLOYMENT INITIATED!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Monitor deployment:" -ForegroundColor Cyan
Write-Host "   Cloudflare Dashboard → Pages → MessuBouw" -ForegroundColor Gray
Write-Host "   Status: Building → Deploying → Success" -ForegroundColor Gray
Write-Host ""
Write-Host "⏱️  Expected time: 2-5 minutes" -ForegroundColor Yellow
Write-Host ""
Write-Host "🌐 Production URL:" -ForegroundColor Cyan
Write-Host "   https://your-domain.pages.dev" -ForegroundColor White
Write-Host "   (lub twoja custom domain)" -ForegroundColor Gray
Write-Host ""
Write-Host "💡 Rollback (jeśli coś poszło nie tak):" -ForegroundColor Yellow
Write-Host "   Cloudflare Dashboard → Deployments → Previous deployment → Rollback" -ForegroundColor Gray
Write-Host ""
