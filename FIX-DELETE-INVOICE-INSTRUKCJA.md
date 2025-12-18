# 🔧 INSTRUKCJA NAPRAWY: Usuwanie Faktur - Fix RLS

## 🎯 ZNALEZIONY PROBLEM

**DIAGNOZA**: Faktury nie mogą być usuwane z powodu **konfliktu typów w politykach RLS Supabase**.

### Co jest nie tak?

1. **Kolumna `user_id`** w tabelach (invoices, clients, products, etc.) jest typu **TEXT**
2. **Funkcja Supabase `auth.uid()`** zwraca wartość typu **UUID**
3. **RLS Policy** sprawdza: `auth.uid()::text = user_id` 
4. PostgreSQL **NIE może porównać UUID z TEXT** (nawet z kastowaniem)
5. **Rezultat**: DELETE zawsze zwraca 0 wierszy (RLS blokuje operację)

### Dlaczego inne operacje działają?

- **SELECT** działa bo nie wymaga strict match (postgres jest bardziej tolerancyjny)
- **INSERT** działa bo aplikacja wysyła user_id jako string i pasuje do kolumny TEXT
- **UPDATE** działa z tego samego powodu
- **DELETE** WYMAGA dokładnego match w RLS policy i tam jest problem!

---

## ✅ ROZWIĄZANIE (3 KROKI)

### KROK 1: Uruchom migrację SQL w Supabase

1. Zaloguj się do **Supabase Dashboard**: https://supabase.com/
2. Otwórz swój projekt: **messu-bouw-management**
3. Przejdź do **SQL Editor** (ikona z lewej strony)
4. Kliknij **New Query**
5. Skopiuj **CAŁY** plik: `database-migrations/fix-user-id-type-and-rls.sql`
6. Wklej do SQL Editor
7. Kliknij **RUN** (Ctrl+Enter)

### Co robi ta migracja?

```sql
-- 1. Wyłącza RLS na czas migracji
-- 2. Usuwa stare nieprawidłowe polityki
-- 3. ZMIENIA TYP user_id z TEXT → UUID (konwertuje istniejące dane)
-- 4. Tworzy nowe poprawne polityki (UUID = UUID, bez kastowania)
-- 5. Włącza RLS ponownie
```

**⚠️ WAŻNE**: Ta migracja **NIE STRACI DANYCH**. Konwertuje istniejące TEXT UUID → UUID.

---

### KROK 2: Sprawdź czy migracja się udała

Uruchom to w **SQL Editor** (Supabase Dashboard):

```sql
-- Sprawdź typ kolumny user_id
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND column_name = 'user_id';

-- Powinno pokazać: data_type = 'uuid' (NIE 'text')
```

Następnie sprawdź polityki:

```sql
-- Sprawdź polityki dla invoices
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'invoices';

-- Powinno pokazać 4 polityki: SELECT, INSERT, UPDATE, DELETE
-- W kolumnie 'qual' powinno być: (auth.uid() = user_id) BEZ ::text
```

---

### KROK 3: Przetestuj usuwanie faktury w aplikacji

1. Uruchom aplikację: `npm run dev`
2. Zaloguj się do systemu
3. Przejdź do listy faktur (Invoices)
4. Kliknij **DELETE** (🗑️) przy dowolnej fakturze
5. Potwierdź usunięcie

**Oczekiwany rezultat**:
- ✅ Toast: "Invoice deleted successfully"
- ✅ Faktura znika z listy
- ✅ Console: `🗑️ DELETE INVOICE - RESULT { success: true, deletedCount: 1 }`

---

## 🐛 DEBUGGING (jeśli nadal nie działa)

### 1. Sprawdź Console Ninja w VS Code

```bash
# W terminalu VS Code:
console-ninja_runtimeLogsAndErrors
```

Szukaj błędów typu:
- `permission denied for table invoices`
- `new row violates row-level security policy`

### 2. Sprawdź logi w przeglądarce (F12)

Otwórz **DevTools → Console** i szukaj:

```
🗑️ DELETE INVOICE - START
🔐 Auth session:
🗑️ DELETE INVOICE - RESULT
```

Jeśli widzisz `deletedCount: 0` ale `success: true` = **RLS nadal blokuje**!

### 3. Sprawdź czy user jest zalogowany

```javascript
// W konsoli przeglądarki (F12):
const { data } = await supabase.auth.getSession();
console.log('User ID:', data.session?.user?.id);
```

Skopiuj ten UUID i uruchom w Supabase SQL Editor:

```sql
-- Zastąp 'SKOPIOWANY_UUID' rzeczywistym UUID
SELECT * FROM invoices WHERE user_id = 'SKOPIOWANY_UUID'::uuid;

-- Jeśli to NIE zwraca faktur - migracja nie została wykonana poprawnie!
```

### 4. Test RLS policy ręcznie

W **Supabase SQL Editor** ustaw user context i spróbuj usunąć:

```sql
-- Ustaw user (zastąp swoim UUID)
SET request.jwt.claims = '{"sub":"TWOJ_USER_UUID"}';

-- Spróbuj usunąć fakturę
DELETE FROM invoices WHERE id = 'JAKAS_FAKTURA_UUID';

-- Sprawdź ile wierszy zostało usuniętych
-- Powinno pokazać: DELETE 1 (jeśli polityka działa)
```

---

## 📊 WERYFIKACJA KOŃCOWA

### Checklist po naprawie:

- [ ] **Migracja wykonana** - typ user_id = UUID
- [ ] **Polityki poprawione** - auth.uid() = user_id (bez ::text)
- [ ] **RLS włączone** - wszystkie tabele mają ENABLE ROW LEVEL SECURITY
- [ ] **Usuwanie działa** - faktury mogą być usuwane z UI
- [ ] **Console pokazuje success** - deletedCount: 1
- [ ] **Dane bezpieczne** - inne operacje (SELECT, INSERT, UPDATE) nadal działają

---

## 🚨 JEŚLI NADAL NIE DZIAŁA

### Plan B: Tymczasowe wyłączenie RLS (tylko do testów!)

⚠️ **NIE UŻYWAJ NA PRODUKCJI** - to wyłącza security!

```sql
-- TYLKO DO TESTÓW!
ALTER TABLE invoices DISABLE ROW LEVEL SECURITY;

-- Spróbuj usunąć fakturę w aplikacji
-- Jeśli teraz działa = problem był DEFINITYWNIE w RLS

-- WŁĄCZ Z POWROTEM:
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
```

Jeśli to zadziałało - wróć do KROK 1 i upewnij się, że migracja została wykonana DOKŁADNIE.

---

## 📝 TECHNICAL DETAILS (dla AI/debugowania)

### Root Cause Analysis:

**File**: `src/services/SupabaseService.ts:157-187`

```typescript
static async deleteInvoice(userId: string, id: string): Promise<boolean> {
  // userId tutaj to string (UUID jako tekst)
  // ale auth.uid() w RLS to native UUID type
  // PostgreSQL WYMAGA exact type match dla DELETE
  
  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id)
    .eq('user_id', userId); // ← Tu jest problem!
    
  // RLS policy sprawdza: auth.uid() = user_id
  // ale user_id jest TEXT, a auth.uid() jest UUID
  // W DELETE, PostgreSQL jest STRICT o typy
}
```

**Schema before fix**:
```sql
CREATE TABLE invoices (
  user_id TEXT NOT NULL  -- ❌ Problem: TEXT zamiast UUID
);

CREATE POLICY "Users can delete own invoices" ON invoices
  FOR DELETE USING (auth.uid()::text = user_id); -- ❌ Type mismatch
```

**Schema after fix**:
```sql
CREATE TABLE invoices (
  user_id UUID NOT NULL  -- ✅ UUID matches auth.uid()
);

CREATE POLICY "Users can delete own invoices" ON invoices
  FOR DELETE USING (auth.uid() = user_id); -- ✅ Clean UUID comparison
```

---

## 📚 References

- [Supabase RLS Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Type Casting](https://www.postgresql.org/docs/current/sql-expressions.html#SQL-SYNTAX-TYPE-CASTS)
- [UUID vs TEXT Performance](https://stackoverflow.com/questions/11094080/postgresql-uuid-vs-text)

