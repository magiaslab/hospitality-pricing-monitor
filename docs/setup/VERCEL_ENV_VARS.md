# 🌐 Variabili d'Ambiente Vercel

## 🚨 Configurazione Urgente

Per far funzionare l'applicazione su Vercel, configura queste variabili d'ambiente:

### 1. Database (CRITICO)
```
DATABASE_URL
postgresql://neondb_owner:npg_Rq8t9WhlUdeL@ep-dark-bonus-agfaks8w.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### 2. NextAuth (CRITICO)
```
NEXTAUTH_URL
https://hospitality-pricing-monitor.vercel.app

NEXTAUTH_SECRET
your-super-secret-nextauth-secret-key-change-this-in-production-2024
```

### 3. n8n Integration (PER WORKFLOW)
```
N8N_API_KEY
pricecip_api_secret_2024

N8N_WEBHOOK_SECRET
pricecip_webhook_secret_2024

N8N_BASE_URL
https://n8n.magiaslab.com
```

### 4. OAuth (Opzionali)
```
GOOGLE_CLIENT_ID
(lascia vuoto per ora)

GOOGLE_CLIENT_SECRET
(lascia vuoto per ora)
```

### 5. Email & Notifications (Opzionali)
```
RESEND_API_KEY
(lascia vuoto per ora)

SLACK_WEBHOOK_URL
(lascia vuoto per ora)
```

## 🚀 Procedura su Vercel

1. **Vai su**: https://vercel.com/dashboard
2. **Seleziona**: il tuo progetto (hospitality-pricing-monitor)
3. **Vai in**: Settings → Environment Variables
4. **Aggiungi** una per una le variabili sopra
5. **Redeploy**: Settings → Deployments → Redeploy latest

## ⚡ Dopo la Configurazione

Una volta configurate le variabili:

1. **Testa l'endpoint**:
   ```bash
   curl -H "Authorization: Bearer pricecip_api_secret_2024" \
        https://hospitality-pricing-monitor.vercel.app/api/health
   ```

2. **Testa le proprietà attive**:
   ```bash
   curl -H "Authorization: Bearer pricecip_api_secret_2024" \
        https://hospitality-pricing-monitor.vercel.app/api/scraping/active-properties
   ```

3. **Aggiorna il workflow n8n** con:
   ```
   https://hospitality-pricing-monitor.vercel.app
   ```

## 🔄 Per Aggiornare il Workflow n8n

Cambia temporaneamente gli URL nei nodi:

**Da**:
```
https://pricecip.it/api/scraping/active-properties
```

**A**:
```
https://hospitality-pricing-monitor.vercel.app/api/scraping/active-properties
```

## 📋 Checklist Post-Configurazione

- [ ] Variabili d'ambiente configurate su Vercel
- [ ] Redeploy effettuato
- [ ] Endpoint /api/health risponde 200
- [ ] Endpoint /api/scraping/active-properties risponde con dati
- [ ] Workflow n8n aggiornato con dominio Vercel
- [ ] Test del workflow completato con successo

## 🔄 Quando il DNS sarà Propagato

Una volta che pricecip.it sarà attivo:

1. **Aggiorna NEXTAUTH_URL** su Vercel:
   ```
   NEXTAUTH_URL=https://pricecip.it
   ```

2. **Aggiorna gli URL nel workflow n8n** tornando a:
   ```
   https://pricecip.it/api/...
   ```

3. **Redeploy** su Vercel per applicare le modifiche
