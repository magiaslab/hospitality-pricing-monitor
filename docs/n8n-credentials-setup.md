# 🔐 Setup Credenziali n8n per Hospitality Price Scraper

## Problema: Nodi HTTP Request richiedono credenziali

I nodi HTTP Request nel workflow "Hospitality Price Scraper" devono essere configurati con le credenziali corrette per accedere alle API della dashboard.

## 📋 Setup Passo-Passo

### 1. **Accedi al tuo n8n** (`https://n8n.magiaslab.com`)

### 2. **Crea Credenziale HTTP Header Auth**

1. Vai su **Settings** → **Credentials**
2. Clicca **"Add Credential"**
3. Seleziona **"HTTP Header Auth"**
4. Configurazione:
   ```
   Name: PriceCip-API-Key
   Header Name: X-N8N-API-KEY
   Header Value: [La tua API key dal file .env]
   ```
5. **Save**

### 3. **Crea Credenziale Authorization Bearer** (alternativa)

1. **Add Credential** → **"HTTP Header Auth"**
2. Configurazione:
   ```
   Name: PriceCip-Bearer-Token
   Header Name: Authorization
   Header Value: Bearer [La tua API key dal file .env]
   ```
3. **Save**

### 4. **Aggiorna Nodi nel Workflow**

Apri il workflow "Hospitality Price Scraper" e aggiorna questi nodi:

#### 🔹 **Nodo: "Get Active Properties"**
```json
{
  "parameters": {
    "url": "http://localhost:3000/api/scraping/active-properties",
    "authentication": "predefinedCredentialType",
    "nodeCredentialType": "httpHeaderAuth",
    "providedBy": "credentials"
  },
  "credentials": {
    "httpHeaderAuth": {
      "id": "[ID-della-credenziale-PriceCip-API-Key]",
      "name": "PriceCip-API-Key"
    }
  }
}
```

#### 🔹 **Nodo: "Send to Dashboard"**
```json
{
  "parameters": {
    "url": "http://localhost:3000/api/webhook/n8n",
    "method": "POST",
    "authentication": "predefinedCredentialType",
    "nodeCredentialType": "httpHeaderAuth",
    "providedBy": "credentials"
  },
  "credentials": {
    "httpHeaderAuth": {
      "id": "[ID-della-credenziale-PriceCip-Bearer-Token]",
      "name": "PriceCip-Bearer-Token"
    }
  }
}
```

### 5. **Workflow Semplificato (Pronto all'uso)**

Ecco una versione del workflow con credenziali inline più semplice:

```json
{
  "name": "Hospitality Price Scraper - Simple",
  "nodes": [
    {
      "parameters": {
        "triggerTimes": {
          "item": [{"mode": "everyHour", "value": 2}]
        }
      },
      "name": "Schedule Every 2h",
      "type": "n8n-nodes-base.scheduleTrigger",
      "position": [120, 300]
    },
    {
      "parameters": {
        "url": "http://localhost:3000/api/scraping/active-properties",
        "options": {"timeout": 30000},
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "X-N8N-API-KEY",
              "value": "={{ $env.N8N_API_KEY }}"
            }
          ]
        }
      },
      "name": "Get Active Properties",
      "type": "n8n-nodes-base.httpRequest",
      "position": [320, 300]
    },
    {
      "parameters": {
        "url": "http://localhost:3000/api/webhook/n8n",
        "method": "POST",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Authorization",
              "value": "Bearer {{ $env.N8N_API_KEY }}"
            },
            {
              "name": "Content-Type",
              "value": "application/json"
            }
          ]
        },
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "test",
              "value": "true"
            },
            {
              "name": "message",
              "value": "Test da workflow semplificato"
            }
          ]
        }
      },
      "name": "Test Webhook",
      "type": "n8n-nodes-base.httpRequest",
      "position": [520, 300]
    }
  ],
  "connections": {
    "Schedule Every 2h": {
      "main": [[{"node": "Get Active Properties", "type": "main", "index": 0}]]
    },
    "Get Active Properties": {
      "main": [[{"node": "Test Webhook", "type": "main", "index": 0}]]
    }
  }
}
```

## 🧪 **Test delle Credenziali**

### Test manuale dal browser:
```bash
# Test endpoint active-properties
curl -H "X-N8N-API-KEY: your-api-key" \
     http://localhost:3000/api/scraping/active-properties

# Test webhook
curl -X POST \
     -H "Authorization: Bearer your-api-key" \
     -H "Content-Type: application/json" \
     -d '{"test": true}' \
     http://localhost:3000/api/webhook/n8n
```

### Test da n8n:
1. Apri il workflow
2. Clicca su **"Execute Workflow"**
3. Controlla i log di ogni nodo

## 🔧 **Troubleshooting**

### ❌ **401 Unauthorized**
- Verifica che la API key nel file `.env` sia corretta
- Assicurati che l'header sia `X-N8N-API-KEY` e non `Authorization`

### ❌ **404 Not Found**
- Controlla che il server dashboard sia in esecuzione (`npm run dev`)
- Verifica l'URL: `http://localhost:3000` (non HTTPS)

### ❌ **Timeout**
- Il server dashboard potrebbe essere lento al primo avvio
- Aumenta timeout a 60000ms nei nodi HTTP

### ❌ **CORS Error**
- n8n e dashboard devono essere sulla stessa rete
- Se usi Docker, configura network correttamente

## 🚀 **Deployment Production**

Per production (Vercel), aggiorna gli URL:
```
http://localhost:3000  →  https://your-app.vercel.app
```

E assicurati che le variabili d'ambiente siano configurate sia su Vercel che su n8n.