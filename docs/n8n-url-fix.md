# 🔧 Fix URL Redirect in n8n Workflow

## Problema Identificato
Il tuo workflow n8n riceve un redirect 307 verso `https://www.pricecip.it/` invece di chiamare localhost.

## ✅ Soluzioni

### 1. **Aggiorna URL nei Nodi n8n**

Nel tuo workflow "Hospitality Price Scraper":

#### 🔹 Nodo "Get Active Properties"
```
VECCHIO: https://qualsiasi-url-esterno/api/scraping/active-properties
NUOVO:   http://localhost:3000/api/scraping/active-properties
```

#### 🔹 Nodo "Send to Dashboard"
```
VECCHIO: https://qualsiasi-url-esterno/api/webhook/n8n
NUOVO:   http://localhost:3000/api/webhook/n8n
```

### 2. **Configurazione Headers (Corrette)**

✅ **Per `/api/scraping/active-properties`:**
```
Header Name: X-N8N-API-KEY
Header Value: {{ $env.N8N_API_KEY }}
```

❌ **Per `/api/webhook/n8n` - C'è un problema:**
Il webhook richiede anche un webhook secret. Aggiungi al tuo `.env`:
```bash
N8N_WEBHOOK_SECRET=your-webhook-secret-here
```

E nei headers n8n:
```
Authorization: Bearer {{ $env.N8N_API_KEY }}
x-webhook-secret: {{ $env.N8N_WEBHOOK_SECRET }}
```

### 3. **Test Locale Funzionante**

I test locali mostrano:
- ✅ `/api/scraping/active-properties` → 200 OK, 3 properties trovate
- ⚠️ `/api/webhook/n8n` → 401 (manca webhook secret)

### 4. **Configurazione Corretta per n8n**

Aggiorna il tuo file `.env.local`:
```bash
# Database
DATABASE_URL="your-database-url"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"

# n8n Integration
N8N_BASE_URL="https://n8n.magiaslab.com"
N8N_API_KEY="eyJhbGci..." # La tua API key esistente
N8N_WEBHOOK_SECRET="my-secure-webhook-secret-2024"
N8N_WORKFLOW_ID="WJoTcDFEIg5CEpRA"
```

### 5. **Per Deployment Production**

Quando deployerai su Vercel, cambia:
```
http://localhost:3000 → https://your-app.vercel.app
```

## 🧪 Test del Fix

Dopo aver aggiornato:
1. Riavvia il server dashboard: `npm run dev`
2. Testa dal workflow n8n con "Execute Workflow"
3. Dovresti vedere nei log: "✅ 200 OK" invece di "307 redirect"

## 📋 Checklist

- [ ] URL aggiornati a `http://localhost:3000`
- [ ] Header `X-N8N-API-KEY` configurato
- [ ] `N8N_WEBHOOK_SECRET` aggiunto al `.env`
- [ ] Header `x-webhook-secret` aggiunto al webhook
- [ ] Test workflow eseguito con successo