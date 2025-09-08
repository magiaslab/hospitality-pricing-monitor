# 🔧 Configurazione n8n MagiasLab per PriceCip

## 🌐 Configurazione Server

**Server n8n**: `https://n8n.magiaslab.com`  
**Applicazione PriceCip**: `https://pricecip.it`

## 📋 Procedura Completa

### 1. Credenziali n8n (su https://n8n.magiaslab.com)

#### A. Crea Credenziale "HTTP Header Auth"
1. **Vai su**: https://n8n.magiaslab.com/credentials
2. **Clicca**: "Create New Credential"
3. **Seleziona**: "HTTP Header Auth"
4. **Configura**:
   ```
   Name: PriceCip API
   Header Name: Authorization
   Header Value: Bearer pricecip_api_secret_2024
   ```
5. **Salva** la credenziale

#### B. Crea Credenziale "Webhook" (opzionale)
1. **Seleziona**: "Webhook"
2. **Configura**:
   ```
   Name: PriceCip Webhook
   Secret: pricecip_webhook_secret_2024
   ```

### 2. Import Workflow

#### A. Scarica il Workflow Pulito
Usa il file: `docs/setup/n8n-workflow-clean.json`

#### B. Importa su n8n
1. **Vai su**: https://n8n.magiaslab.com/workflows
2. **Clicca**: "Import from File"
3. **Seleziona**: `n8n-workflow-clean.json`
4. **Conferma** l'importazione

### 3. Configura i Nodi

#### A. "Get Active Properties"
```
URL: https://pricecip.it/api/scraping/active-properties
Method: GET
Authentication: PriceCip API (seleziona dalla dropdown)
```

#### B. "Get Property Competitors"
```
URL: https://pricecip.it/api/properties/{{ $json.id }}/competitors
Method: GET
Authentication: PriceCip API (seleziona dalla dropdown)
```

#### C. "Save to PriceCip DB"
```
URL: https://pricecip.it/api/scraping/webhook/save-price
Method: POST
Authentication: PriceCip API (seleziona dalla dropdown)
Headers:
  Content-Type: application/json
  X-Webhook-Secret: pricecip_webhook_secret_2024
```

### 4. Test del Workflow

#### A. Test Manuale
1. **Attiva** il workflow
2. **Clicca** su "Execute Workflow"
3. **Verifica** che tutti i nodi si completino con successo

#### B. Test Endpoint PriceCip
```bash
# Test dal terminale
curl -H "Authorization: Bearer pricecip_api_secret_2024" \
     https://pricecip.it/api/scraping/active-properties
```

### 5. Scheduling (Opzionale)

#### A. Configura Trigger Cron
```
Cron Expression: 0 8,20 * * *  # Alle 8:00 e 20:00 ogni giorno
Timezone: Europe/Rome
```

#### B. Webhook Trigger (Alternativo)
```
Webhook URL: https://n8n.magiaslab.com/webhook/pricecip-scraping
Method: POST
```

## 🔍 Troubleshooting

### Errore: "Authentication failed"
- ✅ Verifica che la credenziale "PriceCip API" sia selezionata
- ✅ Controlla che il Bearer token sia: `pricecip_api_secret_2024`

### Errore: "URL not found"
- ✅ Verifica che gli URL usino `https://pricecip.it`
- ✅ Controlla che l'applicazione sia deployata su Vercel

### Errore: "Webhook secret mismatch"
- ✅ Verifica header: `X-Webhook-Secret: pricecip_webhook_secret_2024`
- ✅ Controlla che sia configurato su tutti i nodi POST

## 📊 Monitoraggio

### Log Workflow
- **Vai su**: https://n8n.magiaslab.com/executions
- **Filtra per**: nome workflow
- **Verifica**: esecuzioni recenti e errori

### Log PriceCip
- **Vai su**: https://vercel.com/dashboard (il tuo progetto)
- **Functions**: Visualizza log delle API calls
- **Real-time**: Monitora richieste in tempo reale

## 🎯 Configurazione Completa

### Variabili d'Ambiente Vercel
Assicurati che su Vercel siano configurate:

```env
DATABASE_URL=postgresql://neondb_owner:npg_Rq8t9WhlUdeL@ep-dark-bonus-agfaks8w.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
NEXTAUTH_URL=https://pricecip.it
NEXTAUTH_SECRET=4pfRihvjPMgO9aiOz3j9k0QStljxjlDYGBNc2YzVFCY=
N8N_BASE_URL=https://n8n.magiaslab.com
N8N_API_KEY=pricecip_api_secret_2024
N8N_WEBHOOK_SECRET=pricecip_webhook_secret_2024
```

## ✅ Checklist Finale

- [ ] Credenziale "PriceCip API" creata su n8n.magiaslab.com
- [ ] Workflow importato da `n8n-workflow-clean.json`
- [ ] Tutti i nodi configurati con credenziale corretta
- [ ] URL aggiornati a `https://pricecip.it`
- [ ] Test manuale workflow completato con successo
- [ ] Variabili d'ambiente aggiornate su Vercel
- [ ] Scheduling configurato (se desiderato)

## 🚀 Risultato

Una volta completata la configurazione:

- ✅ **n8n.magiaslab.com** → esegue il workflow di scraping
- ✅ **pricecip.it** → riceve e salva i dati nel database Neon
- ✅ **Automazione completa** → scraping automatico dei prezzi
- ✅ **Monitoraggio** → log e controllo esecuzioni

---

🎯 **L'integrazione n8n MagiasLab ↔ PriceCip è ora completa!**
