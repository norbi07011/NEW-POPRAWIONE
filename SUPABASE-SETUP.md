# 🚀 Supabase - Instrukcja Konfiguracji

## ✅ DLACZEGO SUPABASE?

**DARMOWY PLAN:**
- ✅ 500 MB bazy danych (vs Firebase 1GB ale z limitami)
- ✅ **UNLIMITED** odczyty/zapisy API (vs Firebase 50k/20k dziennie)
- ✅ 50,000 aktywnych użytkowników
- ✅ PostgreSQL (potężniejsza niż Firestore)
- ✅ Realtime subscriptions
- ✅ Authentication wbudowane
- ✅ Automatyczne API REST + GraphQL

**Firebase ma limity:**
- ❌ 50,000 odczytów dziennie
- ❌ 20,000 zapisów dziennie
- ❌ 10 GB transferu miesięcznie

## 📋 KROK 1: Utwórz konto Supabase

1. Idź na https://supabase.com/
2. Kliknij **"Start your project"**
3. Zaloguj się przez GitHub (zalecane) lub email
4. ✅ **To wszystko - masz darmowe konto!**

## 📊 KROK 2: Utwórz nowy projekt

1. Kliknij **"New Project"**
2. Wypełnij:
   - **Name**: `messu-bouw-management`
   - **Database Password**: `wygeneruj mocne hasło` (zapisz je!)
   - **Region**: `West EU (Frankfurt)` - najbliżej Holandii!
3. Kliknij **"Create new project"**
4. ⏳ Poczekaj ~2 minuty aż projekt się utworzy

## 🗄️ KROK 3: Utwórz tabele (SQL)

1. W lewym menu kliknij **"SQL Editor"**
2. Kliknij **"New query"**
3. Otwórz plik `supabase-schema.sql` w tym projekcie
4. **Skopiuj CAŁY** plik
5. Wklej do SQL Editor w Supabase
6. Kliknij **"Run"** (lub Ctrl+Enter)
7. ✅ Tabele utworzone!

## 🔑 KROK 4: Skopiuj klucze API

1. W lewym menu kliknij **"Project Settings"** (ikona koła zębatego)
2. Kliknij **"API"**
3. Znajdź sekcję **"Project URL"**:
   - Skopiuj URL (np. `https://xxxxx.supabase.co`)
4. Znajdź sekcję **"Project API keys"**:
   - Skopiuj **anon/public** key (długi ciąg znaków)

## ⚙️ KROK 5: Skonfiguruj w aplikacji

### Opcja A: Zmienne środowiskowe (ZALECANE)

Utwórz plik `.env` w głównym folderze projektu:

```env
VITE_SUPABASE_URL=https://twoj-projekt.supabase.co
VITE_SUPABASE_ANON_KEY=twój-klucz-anon
```

### Opcja B: Bezpośrednio w kodzie

Edytuj plik `src/config/supabase.ts`:

```typescript
const supabaseUrl = 'https://twoj-projekt.supabase.co';
const supabaseAnonKey = 'twój-klucz-anon';
```

## 🔐 KROK 6: Włącz Authentication

1. W lewym menu kliknij **"Authentication"**
2. Kliknij **"Providers"**
3. Włącz **"Email"** (już włączone domyślnie)
4. ✅ Gotowe!

## 🚀 KROK 7: Przetestuj

1. Zapisz wszystkie pliki
2. W terminalu uruchom:
```bash
npm run dev
```
3. Zaloguj się do aplikacji
4. Dodaj firmę - dane zapiszą się w Supabase!
5. ✅ **Działa!**

## 📊 KROK 8: Sprawdź dane (opcjonalne)

1. W Supabase Dashboard kliknij **"Table Editor"**
2. Zobacz swoje tabele: `companies`, `invoices`, `clients`, etc.
3. Możesz przeglądać i edytować dane ręcznie

## 🔄 Migracja z Firebase

Jeśli masz już dane w Firebase, możesz je wyeksportować:

1. Firebase Console → Firestore → Export
2. Przekonwertuj JSON na SQL
3. Importuj do Supabase przez SQL Editor

## ❓ Problemy?

### "Failed to connect to Supabase"
- Sprawdź czy URL i ANON KEY są poprawne
- Sprawdź czy projekt w Supabase jest aktywny

### "Row Level Security policy violation"
- Upewnij się że wykonałeś cały SQL z `supabase-schema.sql`
- RLS policies muszą być włączone

### "Authentication error"
- Sprawdź czy Email provider jest włączony w Supabase

## 📚 Dokumentacja

- Supabase Docs: https://supabase.com/docs
- PostgreSQL Tutorial: https://supabase.com/docs/guides/database

---

**✅ Po skonfigurowaniu - aplikacja będzie używać Supabase zamiast Firebase!**
