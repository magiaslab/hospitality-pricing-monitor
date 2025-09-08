# 🔗 Integrazione n8n - Configurazione Completa

Guida per configurare l'integrazione n8n con PriceCip per il web scraping automatico dei prezzi competitor.

## 🎯 Panoramica

Il workflow n8n automatizza:
- **Recupero proprietà attive** dal database PriceCip
- **Scraping prezzi** da Booking.com, Airbnb, siti diretti
- **Salvataggio dati** nel database con sistema di alert
- **Gestione errori** e retry automatici

## 🔑 Credenziali Richieste

### 1. PriceCip API Credentials

Crea in n8n una credenziale **HTTP Header Auth** con nome `PriceCip API`:

```
Credential Name: PriceCip API
Type: HTTP Header Auth
Header Name: Authorization
Header Value: Bearer pricecip_api_secret_2024
```

### 2. Webhook Secret (Opzionale ma Raccomandato)

Per maggiore sicurezza, aggiungi anche:

```
Additional Headers:
- X-Webhook-Secret: pricecip_webhook_secret_2024
```

## 🛠️ Configurazione Workflow

### URLs da Aggiornare

Nel file `n8n.json`, gli URL sono già configurati con il dominio finale:

```json
// URLs configurati per il dominio finale
"url": "https://pricecip.it/api/scraping/active-properties"
"url": "https://pricecip.it/api/properties/{{ $json.id }}/competitors"
"url": "https://pricecip.it/api/scraping/webhook/save-price"
```

### Credenziali nel Workflow

I nodi che richiedono credenziali:

1. **"Get Active Properties"** (node-002)
2. **"Get Property Competitors"** (node-004)  
3. **"Save to PriceCip DB"** (node-011)

Tutti usano la credenziale `PriceCip API`.

## 📝 Configurazione Dettagliata

### Node: Get Active Properties

```json
{
  "credentials": {
    "httpHeaderAuth": {
      "id": "pricecip-api",
      "name": "PriceCip API"
    }
  },
  "parameters": {
    "url": "https://pricecip.it/api/scraping/active-properties",
    "sendHeaders": true,
    "headerParameters": {
      "parameters": [
        {
          "name": "X-N8N-Source",
          "value": "n8n.magiaslab.com"
        }
      ]
    }
  }
}
```

### Node: Get Property Competitors

```json
{
  "credentials": {
    "httpHeaderAuth": {
      "id": "pricecip-api", 
      "name": "PriceCip API"
    }
  },
  "parameters": {
    "url": "https://pricecip.it/api/properties/{{ $json.id }}/competitors"
  }
}
```

### Node: Save to PriceCip DB

```json
{
  "credentials": {
    "httpHeaderAuth": {
      "id": "pricecip-api",
      "name": "PriceCip API"
    }
  },
  "parameters": {
    "url": "https://pricecip.it/api/scraping/webhook/save-price",
    "sendHeaders": true,
    "headerParameters": {
      "parameters": [
        {
          "name": "X-Webhook-Secret",
          "value": "pricecip_webhook_secret_2024"
        },
        {
          "name": "X-N8N-Source", 
          "value": "n8n.magiaslab.com"
        },
        {
          "name": "X-N8N-Execution-ID",
          "value": "={{ $execution.id }}"
        }
      ]
    }
  }
}
```

## 🔧 Variabili d'Ambiente PriceCip

Assicurati che queste variabili siano configurate:

```env
# API Key per autenticazione n8n
N8N_API_KEY="pricecip_api_secret_2024"

# Webhook Secret per sicurezza aggiuntiva
N8N_WEBHOOK_SECRET="pricecip_webhook_secret_2024"

# URL base n8n (opzionale)
N8N_BASE_URL="https://n8n.magiaslab.com"
```

## 🚀 Procedura di Setup

### 1. Crea Credenziali in n8n

1. Vai in **Settings > Credentials**
2. Clicca **Add Credential**
3. Seleziona **HTTP Header Auth**
4. Configura:
   - **Name**: `PriceCip API`
   - **Header Name**: `Authorization`
   - **Header Value**: `Bearer pricecip_api_secret_2024`

### 2. Importa il Workflow

1. Copia il contenuto di `n8n.json`
2. In n8n: **Workflows > Import from JSON**
3. Incolla il JSON e clicca **Import**

### 3. URLs Pre-Configurate

Le URLs sono già configurate con il dominio finale:
- ✅ `https://pricecip.it` 
- ✅ Tutti gli endpoint sono pronti all'uso

### 4. Assegna Credenziali

Per ogni nodo HTTP Request che chiama PriceCip:
1. Clicca sul nodo
2. **Authentication** > **Predefined Credential Type**
3. **Credential Type** > **HTTP Header Auth**
4. **Credential** > **PriceCip API**

### 5. Testa il Workflow

1. Clicca **Execute Workflow**
2. Verifica che non ci siano errori di autenticazione
3. Controlla i log in PriceCip per confermare ricezione dati

## 🔍 Troubleshooting

### Errore 401 Unauthorized

```
Error: Unauthorized - Invalid API key
```

**Soluzione**:
- Verifica che la credenziale `PriceCip API` sia configurata correttamente
- Controlla che `N8N_API_KEY` sia impostato in PriceCip
- Assicurati che l'header sia `Authorization: Bearer TOKEN`

### Errore Webhook Secret

```
Error: Invalid webhook secret
```

**Soluzione**:
- Aggiungi header `X-Webhook-Secret: pricecip_webhook_secret_2024`
- Verifica che `N8N_WEBHOOK_SECRET` sia configurato in PriceCip

### Errore di Connessione

```
Error: ENOTFOUND or Connection timeout
```

**Soluzione**:
- Verifica che https://pricecip.it sia raggiungibile
- Controlla che l'app PriceCip sia deployata e funzionante
- Testa l'URL direttamente nel browser (DNS in propagazione)

## 📊 Monitoraggio

### Log delle Esecuzioni

n8n salva automaticamente:
- **Execution History**: Tutte le esecuzioni del workflow
- **Error Logs**: Dettagli degli errori
- **Performance**: Tempi di esecuzione

### Endpoint di Health Check

Testa la connettività:

```bash
curl -H "Authorization: Bearer pricecip_api_secret_2024" \
     https://pricecip.it/api/health
```

Risposta attesa:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2025-09-08T18:30:00.000Z"
}
```

## 🎛️ Configurazioni Avanzate

### Frequenza Scraping

Modifica il cron nel nodo **"Weekly Price Scraping"**:

```json
{
  "rule": {
    "interval": "weekly",
    "cronExpression": "0 6 * * 1"  // Lunedì alle 6:00
  }
}
```

Esempi:
- **Giornaliero**: `"0 6 * * *"` (ogni giorno alle 6:00)
- **Bi-settimanale**: `"0 6 * * 1,4"` (Lunedì e Giovedì)
- **Mensile**: `"0 6 1 * *"` (primo del mese)

### Anti-Bot Delay

Modifica il delay nel nodo **"Anti-Bot Delay"**:

```json
{
  "amount": "={{ Math.floor(Math.random() * 180) + 120 }}",
  "unit": "seconds"  // 2-5 minuti casuali
}
```

### User-Agent Rotation

Aggiungi rotazione User-Agent nel nodo **"Scrape Booking.com"**:

```javascript
const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"
];

const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];
```

---

🎉 **Setup completato!** Il tuo workflow n8n è ora configurato per integrare perfettamente con PriceCip.
