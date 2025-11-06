# 📤 Instrukcja Dodania APK do GitHub Releases

## Problem
Pliki APK są zbyt duże dla standardowego push do repozytorium (GitHub limit: 100MB).

## ✅ Rozwiązanie: GitHub Releases

GitHub Releases pozwala na przesyłanie plików do **2GB**.

---

## 🚀 Jak Dodać APK do Releases (Web Interface)

### Krok 1: Przejdź do Releases
1. Otwórz: https://github.com/messubouwbedrijf-coder/Bedrijf
2. Kliknij zakładkę **"Releases"** (po prawej stronie)
3. Kliknij **"Create a new release"**

### Krok 2: Utwórz Tag
- **Tag version:** `v1.0.1-fix` (lub `v1.0.0-kvk`)
- **Target:** `main` branch
- **Release title:** `v1.0.1 - Mobile Print Fix + PDF Export`

### Krok 3: Opis Release
Skopiuj poniższy opis:

```markdown
## 🎯 MESSU BOUW v1.0.1 FIX - Podgląd Wydruku Mobile

### ✨ Co nowego?
- ✅ **FIX:** Podgląd wydruku działa na telefonie
- ✅ **NOWA FUNKCJA:** Przycisk "Pobierz PDF"
- ✅ Integracja html2canvas + jsPDF
- ✅ Ulepszona funkcja drukowania dla Android WebView

### 📱 Dostępne APK:

#### 1. messu-bouw-godziny-fix.apk ⭐ REKOMENDOWANE
- **Rozmiar:** 280.88 MB
- **Zawiera:** Wszystkie funkcje + fix mobile + PDF export

#### 2. messu-bouw-kvk.apk
- **Rozmiar:** 142.67 MB  
- **Zawiera:** KVK API + podstawowe funkcje (bez PDF export)

### 📝 Instrukcje:
- **Mobile Print Fix:** Zobacz `FIX-GODZINY-PRACY-MOBILE.md`
- **KVK API:** Zobacz `KVK-API-INSTRUKCJA.md`
- **Build lokalnie:** Zobacz `APK-RELEASES.md`

### 🔧 Instalacja:
1. Pobierz APK na telefon Android
2. Włącz "Instalacja z nieznanych źródeł"
3. Zainstaluj aplikację
4. Gotowe!

---

**Full Changelog:** https://github.com/messubouwbedrijf-coder/Bedrijf/compare/...v1.0.1-fix
```

### Krok 4: Załącz APK
1. Przewiń do sekcji **"Attach binaries"**
2. Przeciągnij pliki:
   - `messu-bouw-godziny-fix.apk` (280.88 MB)
   - `messu-bouw-kvk.apk` (142.67 MB)
3. Poczekaj aż się wgrają (może potrwać kilka minut)

### Krok 5: Publikuj
- Zaznacz **"Set as the latest release"**
- Kliknij **"Publish release"**

---

## 🖥️ Jak Dodać przez GitHub CLI (opcjonalnie)

Jeśli masz zainstalowane GitHub CLI:

```bash
# 1. Zainstaluj gh (jeśli nie masz)
# https://cli.github.com/

# 2. Zaloguj się
gh auth login

# 3. Utwórz release z APK
gh release create v1.0.1-fix \
  --repo messubouwbedrijf-coder/Bedrijf \
  --title "v1.0.1 - Mobile Print Fix + PDF Export" \
  --notes "✅ FIX: Podgląd wydruku działa na telefonie
✅ NOWA FUNKCJA: Pobierz PDF
✅ Integracja html2canvas + jsPDF

Pobierz APK poniżej 👇" \
  public/messu-bouw-godziny-fix.apk \
  public/messu-bouw-kvk.apk
```

---

## 📥 Jak Pobrać APK (dla użytkowników)

Po opublikowaniu Release:

1. Przejdź do: https://github.com/messubouwbedrijf-coder/Bedrijf/releases
2. Znajdź najnowszy release (`v1.0.1-fix`)
3. Przewiń do sekcji **"Assets"**
4. Kliknij nazwę APK aby pobrać:
   - `messu-bouw-godziny-fix.apk` (280.88 MB)
   - `messu-bouw-kvk.apk` (142.67 MB)

---

## 📊 Lokalizacja Plików APK

### W Projekcie:
```
public/
├── messu-bouw-godziny-fix.apk  (280.88 MB) ⭐ NAJNOWSZY
├── messu-bouw-kvk.apk          (142.67 MB)
├── messu-bouw-premium-14.apk   (9.04 MB)   - stara wersja
└── pobierz-godziny-fix.html    - strona pobierania
```

### Build Output:
```
android/app/build/outputs/apk/debug/
└── app-debug.apk  (źródłowy APK przed skopiowaniem)
```

---

## ✅ Weryfikacja

Po opublikowaniu sprawdź:
- [ ] APK-i widoczne w Assets
- [ ] Rozmiary się zgadzają
- [ ] Link do pobrania działa
- [ ] APK instaluje się na Androidzie
- [ ] Aplikacja uruchamia się poprawnie

---

## 🔗 Przydatne Linki

- **Repository:** https://github.com/messubouwbedrijf-coder/Bedrijf
- **Releases:** https://github.com/messubouwbedrijf-coder/Bedrijf/releases
- **Issue #1:** https://github.com/messubouwbedrijf-coder/Bedrijf/issues/1
- **GitHub Docs:** https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository

---

**Autor:** MESSU BOUW Development Team  
**Data:** 6 listopada 2025
