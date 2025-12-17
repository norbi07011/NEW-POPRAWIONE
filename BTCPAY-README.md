# 💰 BTCPayServer - 0% PROWIZJI!

## 🚀 SZYBKI START

### 1. Instalacja pakietów

```bash
npm install
```

### 2. Konfiguracja

Skopiuj plik `.env.btcpay` i wypełnij wartości:

```bash
# BTCPayServer (otrzymasz po deploymencie)
BTCPAY_URL=https://pay.messubouw.com
BTCPAY_STORE_ID=xxxxx
BTCPAY_API_KEY=xxxxx
BTCPAY_WEBHOOK_SECRET=xxxxx

# Email (Resend.com - FREE)
RESEND_API_KEY=re_xxxxx

# Supabase (już masz)
SUPABASE_URL=https://ayinverqjntywglsdlzo.supabase.co
SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_KEY=xxxxx
```

### 3. Deploy BTCPayServer

**OPCJA A: Szybki deploy (30 min)**

```bash
# 1. Kup VPS (€5/miesiąc):
#    - DigitalOcean: https://digitalocean.com
#    - Wybierz: Ubuntu 22.04, 2GB RAM
#    - Region: Amsterdam

# 2. SSH do VPS:
ssh root@[IP_ADRES_VPS]

# 3. Uruchom installer:
curl -fsSL https://raw.githubusercontent.com/norbi07011/NEW-POPRAWIONE/main/btcpayserver-setup.sh | sudo bash

# 4. Czekaj 10-15 minut na instalację

# 5. Otwórz w przeglądarce:
# https://pay.messubouw.com
```

**OPCJA B: Pełny przewodnik**

Przeczytaj: `BTCPAY-DEPLOYMENT-GUIDE.md` (szczegółowe instrukcje)

### 4. Konfiguracja BTCPayServer

```bash
# 1. Zarejestruj konto admin
# 2. Utwórz store "MessuBouw"
# 3. Dodaj wallet BTC (xpub key)
# 4. Wygeneruj API key
# 5. Ustaw webhook URL
```

### 5. Uruchom migrację bazy danych

```bash
# W Supabase SQL Editor:
# Wykonaj plik: database-migrations/licenses-table.sql
```

### 6. Deploy API endpoints

**Vercel (najprostsze):**

```bash
npm install -g vercel
vercel deploy --prod

# Dodaj env variables w Vercel dashboard:
# Settings → Environment Variables
# (skopiuj wszystko z .env.btcpay)
```

**Railway:**

```bash
npm install -g @railway/cli
railway up
```

### 7. Test payment

```bash
# 1. Uruchom lokalnie:
npm run dev

# 2. Otwórz:
http://localhost:5173/pricing

# 3. Kliknij "Pay with Bitcoin"
# 4. Zapłać testową kwotą (€1)
# 5. Sprawdź email - powinieneś otrzymać license key
```

---

## 📁 STRUKTURA PLIKÓW

```
src/
├── api/
│   ├── create-payment.ts        # Tworzy invoice w BTCPay
│   └── webhook/
│       └── btcpay.ts            # Odbiera webhook po płatności
├── lib/
│   ├── btcpay-client.ts         # Klient API BTCPayServer
│   ├── license-generator.ts     # Generuje license keys
│   └── email-service.ts         # Wysyła emaile (Resend)
└── pages/
    └── Pricing.tsx              # Strona z planami i payment buttons

database-migrations/
└── licenses-table.sql           # Schema dla tabel licenses

docker-compose.btcpay.yml        # BTCPayServer stack (Bitcoin + LND)
btcpayserver-setup.sh            # Automatyczna instalacja na VPS
.env.btcpay                      # Konfiguracja (wypełnij to!)
```

---

## 💸 KOSZTY

### VPS Hosting: €5-10/miesiąc
- DigitalOcean: $6/mo
- Hetzner: €4.50/mo  
- Railway: $5/mo

### Email: FREE
- Resend.com: 3000 emails/miesiąc za darmo

### Transaction Fees: 0% ✅
- BTCPayServer = self-hosted = zero prowizji!

**Total: €5-10/miesiąc (bez prowizji od transakcji!)**

---

## 🎯 FLOW PŁATNOŚCI

```
User klika "Pay with Bitcoin"
    ↓
API tworzy BTCPay invoice
    ↓
User przekierowywany na pay.messubouw.com
    ↓
User skanuje QR code (BTC lub Lightning)
    ↓
Płaci z wallet (BlueWallet, Muun, Phoenix, etc.)
    ↓
BTCPayServer potwierdza płatność
    ↓
Webhook wywołuje /api/webhook/btcpay
    ↓
Generuje license key w bazie (Supabase)
    ↓
Wysyła email z kluczem (Resend)
    ↓
User otrzymuje klucz w emailu
    ↓
User aktywuje w app → GOTOWE! ✅
```

---

## 🧪 TESTOWANIE

### Test lokalne:

```bash
# 1. Uruchom dev server:
npm run dev

# 2. Test API endpoint:
curl -X POST http://localhost:5173/api/create-payment \
  -H "Content-Type: application/json" \
  -d '{
    "plan": "starter",
    "userId": "test-user-123",
    "email": "test@example.com"
  }'

# Powinno zwrócić:
# {"success": true, "checkoutUrl": "https://pay.messubouw.com/i/xxxxx"}
```

### Test webhook:

```bash
# Symuluj webhook od BTCPayServer:
curl -X POST http://localhost:5173/api/webhook/btcpay \
  -H "Content-Type: application/json" \
  -H "btcpay-sig: sha256=test" \
  -d '{
    "type": "InvoiceSettled",
    "invoiceId": "test123",
    "data": {
      "metadata": {
        "userId": "test-user",
        "email": "test@example.com",
        "plan": "starter"
      }
    }
  }'
```

---

## 📊 MONITORING

### BTCPayServer Dashboard:
- Invoices: https://pay.messubouw.com/invoices
- Wallet: Store Settings → Wallets → Bitcoin
- Analytics: Dashboard → Analytics

### Email Logs (Resend):
- https://resend.com/emails
- Check delivery status, open rates

### Database (Supabase):
```sql
-- Recent sales:
SELECT * FROM recent_sales LIMIT 10;

-- Revenue by plan:
SELECT * FROM revenue_by_plan;
```

---

## 🆘 POMOC

### BTCPayServer nie działa?
- Sprawdź logi: `docker logs btcpayserver_1 -f`
- Restart: `docker restart btcpayserver_1`

### Webhook nie fire'uje?
- Sprawdź URL webhook w BTCPay (Store Settings → Webhooks)
- Test ręcznie: Invoices → [invoice] → Delivery → Redeliver

### Email nie wysyła?
- Sprawdź API key Resend
- Sprawdź logs w Resend dashboard

### Potrzebujesz pomocy?
- Dokumentacja: `BTCPAY-DEPLOYMENT-GUIDE.md`
- BTCPayServer docs: https://docs.btcpayserver.org
- Email: support@messubouw.com

---

## ✅ CHECKLIST PRZED PRODUCTION

- [ ] VPS utworzony i skonfigurowany
- [ ] BTCPayServer zainstalowany i działa
- [ ] Wallet BTC podłączony
- [ ] Lightning Network włączony (opcjonalne)
- [ ] API key wygenerowany
- [ ] Webhook skonfigurowany
- [ ] Email service (Resend) skonfigurowany
- [ ] Database migration wykonana
- [ ] API endpoints deployed (Vercel/Railway)
- [ ] Test payment wykonany (€1)
- [ ] License key otrzymany w emailu
- [ ] Firewall VPS skonfigurowany
- [ ] SSL/HTTPS włączony
- [ ] Backup strategy ustalona

---

## 🎉 GOTOWE!

Masz teraz **0% prowizji** system płatności crypto! 

**Co teraz?**
1. Uruchom `npm run dev`
2. Idź do `/pricing`
3. Zobacz piękną stronę z planami
4. Zrób testową płatność
5. Ciesz się 100% przychodów! 🚀

**Pytania?** Przeczytaj `BTCPAY-DEPLOYMENT-GUIDE.md`
