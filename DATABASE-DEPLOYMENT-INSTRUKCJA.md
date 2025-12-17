# 🗄️ INSTRUKCJA WDROŻENIA BAZY DANYCH

## ⚠️ WAŻNE - ZRÓB TO NAJPIERW!

Przed testowaniem systemu płatności i profili użytkownika, **musisz wdrożyć schemat bazy danych do Supabase**.

---

## 📋 KROK 1: Otwórz Supabase SQL Editor

1. Przejdź na: https://supabase.com/dashboard
2. Zaloguj się
3. Wybierz projekt: **ayinverqjntywglsdlzo**
4. Z lewego menu wybierz: **SQL Editor**
5. Kliknij: **+ New Query**

---

## 📋 KROK 2: Skopiuj i Wklej SQL

1. Otwórz plik: `database-migrations/profiles-and-auth.sql`
2. **Skopiuj CAŁĄ zawartość** (wszystkie 230+ linii)
3. Wklej do Supabase SQL Editor
4. Kliknij: **Run** (lub Ctrl+Enter)

### ✅ Co się stanie:
- Zostanie utworzona tabela `profiles` z kolumnami:
  - id (UUID, FK do auth.users)
  - email, full_name, company_name, phone
  - plan (free/starter/pro)
  - subscription_status (active/inactive/cancelled/expired)
  - license_key
  - invoices_created, invoices_limit, companies_limit
  
- Zostanie utworzona tabela `licenses` z kolumnami:
  - id (UUID)
  - user_id (FK do auth.users)
  - license_key (UNIQUE)
  - plan, status, device_id
  - payment_id, amount, crypto_amount, crypto_currency
  - expires_at

- Zostaną utworzone **RLS Policies** (bezpieczeństwo):
  - Użytkownicy widzą tylko swoje profile
  - Użytkownicy mogą edytować swoje profile
  - Użytkownicy widzą tylko swoje licencje
  - System może tworzyć nowe licencje

- Zostaną utworzone **Triggery**:
  - `on_auth_user_created` → Automatycznie tworzy profil po rejestracji
  - `update_profiles_updated_at` → Auto-timestamp przy edycji
  - `update_licenses_updated_at` → Auto-timestamp dla licencji

- Zostanie utworzona **Funkcja** `check_plan_limits()`:
  - FREE: 5 faktur limit, 1 firma
  - STARTER: unlimited faktury, 3 firmy
  - PRO: unlimited wszystko

---

## 📋 KROK 3: Weryfikacja

Po uruchomieniu SQL, sprawdź czy wszystko działa:

### Test 1: Sprawdź tabele
```sql
SELECT * FROM profiles;
SELECT * FROM licenses;
```
**Oczekiwany wynik:** 0 wierszy (tabele puste ale bez błędów)

### Test 2: Sprawdź RLS policies
```sql
SELECT * FROM pg_policies WHERE tablename IN ('profiles', 'licenses');
```
**Oczekiwany wynik:** Lista policies (Users can view own profile, etc.)

### Test 3: Sprawdź funkcję
```sql
SELECT check_plan_limits('00000000-0000-0000-0000-000000000000'::uuid, 'invoices');
```
**Oczekiwany wynik:** JSON z `{"allowed": true, "error": null, "current": 0, "limit": 5}`

---

## 📋 KROK 4: Test Integracji z Aplikacją

Teraz uruchom aplikację i przetestuj:

### Test 1: Rejestracja Użytkownika (CURRENTLY MANUAL)
Ponieważ nie mamy jeszcze strony Sign Up, musimy użyć Supabase Dashboard:

1. Przejdź do: **Authentication > Users**
2. Kliknij: **Add User**
3. Wypełnij:
   - Email: `test@messubouw.com`
   - Password: `testpass123`
   - Auto Confirm User: ✅ YES
4. Kliknij: **Create User**

### Test 2: Sprawdź Automatyczne Utworzenie Profilu
```sql
SELECT * FROM profiles WHERE email = 'test@messubouw.com';
```
**Oczekiwany wynik:** 1 wiersz z:
- id (UUID)
- email = `test@messubouw.com`
- full_name = NULL (możesz edytować w Profile page)
- plan = `free`
- subscription_status = `inactive`
- invoices_created = 0
- invoices_limit = 5

### Test 3: Uruchom Aplikację
```bash
npm run dev
```

### Test 4: Login (TEMPORARY - Mock Auth Active)
**UWAGA:** Obecnie useAuth zwraca prawdziwe dane z Supabase, ale nie ma jeszcze strony Login.

Dla testu, możesz tymczasowo edytować `src/hooks/useAuth.ts` i:
1. Zakomentować `loading: true` w useState
2. Ustawić mock user z ID z Supabase

**LUB** możemy utworzyć prostą stronę Login/Signup.

### Test 5: Edycja Profilu
1. Otwórz aplikację: http://localhost:5000
2. Kliknij: **👤 Profile** w menu
3. Wypełnij formularz:
   - Full Name: `Test User`
   - Company Name: `Test Company`
   - Phone: `+31 6 12345678`
4. Kliknij: **Save Changes**

### Test 6: Sprawdź Zapisane Dane
```sql
SELECT * FROM profiles WHERE email = 'test@messubouw.com';
```
**Oczekiwany wynik:** Dane zaktualizowane + `updated_at` timestamp zmieniony

### Test 7: Zmiana Hasła
1. Na stronie Profile scroll w dół do sekcji **Change Password**
2. Wypełnij:
   - Current Password: `testpass123`
   - New Password: `newpass456`
   - Confirm New Password: `newpass456`
3. Kliknij: **Change Password**

### Test 8: Test Nowego Hasła (gdy będzie Login page)
Wyloguj się i zaloguj z nowym hasłem.

---

## 📋 KROK 5: Test Płatności (Symulacja)

### Test 1: Kliknij "Pay with Bitcoin"
1. Przejdź na stronę: **💰 Pricing**
2. Wybierz plan: **STARTER** (€9.99)
3. Kliknij: **Get Started**

**Oczekiwany wynik:**
- Console log: `🔗 Payment creation started`
- Redirect do: `/api/create-payment` (jeszcze nie wdrożony - błąd 404)

### Test 2: Symuluj Webhook (Ręcznie)
Ponieważ BTCPayServer nie jest jeszcze wdrożony, możesz ręcznie utworzyć licencję:

```sql
INSERT INTO licenses (user_id, license_key, plan, status, payment_id, amount, currency, expires_at)
VALUES (
  '[WSTAW TUTAJ USER ID Z TABELI PROFILES]',
  'MESSUBOUW-STARTER-2025-TEST01',
  'starter',
  'active',
  'test-payment-manual',
  9.99,
  'EUR',
  NOW() + INTERVAL '30 days'
);

-- Zaktualizuj profil z nowym planem
UPDATE profiles
SET plan = 'starter',
    subscription_status = 'active',
    license_key = 'MESSUBOUW-STARTER-2025-TEST01',
    invoices_limit = 999999,
    companies_limit = 3
WHERE id = '[WSTAW TUTAJ USER ID]';
```

### Test 3: Odśwież Stronę Profile
Po wstawieniu licencji, odśwież stronę Profile. Powinieneś zobaczyć:
- Badge: **STARTER**
- Status: **ACTIVE**
- License Key: `MESSUBOUW-STARTER-2025-TEST01`
- Invoices: Unlimited (progress bar znika)

---

## 🎯 PODSUMOWANIE

### ✅ CO JEST GOTOWE:
1. ✅ Supabase client skonfigurowany
2. ✅ useAuth hook z prawdziwym Supabase auth
3. ✅ Profile page (edycja name, company, phone + zmiana hasła)
4. ✅ Pricing page z payment redirect (czeka na API)
5. ✅ Schemat bazy danych (profiles + licenses + RLS + triggers)
6. ✅ Email support zmieniony na: info.messubouw@gmail.com

### ⏳ CO WYMAGA WDROŻENIA:
1. **Wdrożenie SQL do Supabase** (instrukcja powyżej) ← **ZRÓB TO TERAZ!**
2. **Strona Login/Signup** (opcjonalnie - możemy utworzyć)
3. **Backend API Endpoints** (/api/create-payment, /api/webhook/btcpay)
4. **BTCPayServer VPS** (skrypt gotowy: btcpayserver-setup.sh)

### 🚀 NASTĘPNE KROKI:

**TERAZ (15 min):**
1. Wdróż SQL do Supabase (skopiuj profiles-and-auth.sql)
2. Utwórz test użytkownika w Supabase Dashboard
3. Uruchom `npm run dev`
4. Przetestuj stronę Profile

**DZISIAJ (1-2h):**
1. Utwórz strony Login/Signup (prosty formularz)
2. Test pełnego flow: Register → Login → Edit Profile → Change Password

**JUTRO (30-45 min):**
1. Wdróż BTCPayServer na VPS (uruchom btcpayserver-setup.sh)
2. Wdróż backend API endpoints (Vercel/Railway)
3. Test płatności: Kliknij button → BTCPay checkout → Webhook → Email

---

## 📧 WSPARCIE

Jeśli coś nie działa:
1. Sprawdź Console Ninja w przeglądarce (F12 → Console)
2. Sprawdź Supabase SQL Editor → Query History
3. Email: info.messubouw@gmail.com

---

**🎉 Sukces! Teraz masz pełny system zarządzania użytkownikami + płatności crypto!**
