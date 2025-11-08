# Skrypt do utworzenia skrotu MESSU BOUW na pulpicie
# Uruchom w PowerShell: .\create-desktop-shortcut.ps1

$DesktopPath = [Environment]::GetFolderPath("Desktop")
$ShortcutPath = Join-Path $DesktopPath "MESSU BOUW - Localhost.url"

# Utworz plik .url (skrot internetowy)
$UrlContent = @"
[InternetShortcut]
URL=http://localhost:5000
IconIndex=0
IconFile=C:\Windows\System32\SHELL32.dll
"@

# Zapisz plik
$UrlContent | Out-File -FilePath $ShortcutPath -Encoding ASCII

Write-Host "Skrot utworzony pomyslnie!" -ForegroundColor Green
Write-Host "Lokalizacja: $ShortcutPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "Kliknij dwukrotnie skrot 'MESSU BOUW - Localhost' na pulpicie" -ForegroundColor Yellow
Write-Host "aby otworzyc aplikacje w przegladarce!" -ForegroundColor Yellow
Write-Host ""
Write-Host "WAZNE: Przed kliknieciem skrotu upewnij sie, ze serwer jest uruchomiony!" -ForegroundColor Red
Write-Host "Uruchom serwer komenda: npm run dev" -ForegroundColor Red
