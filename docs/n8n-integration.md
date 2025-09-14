# 🔗 Integrazione n8n Server

## Server n8n: `n8n.magiaslab.com`

### 📋 Setup Configurazione

1. **Aggiorna variabili d'ambiente** (`.env.local`)
```bash
N8N_BASE_URL=https://n8n.magiaslab.com
N8N_API_KEY=your-api-key-here
N8N_WEBHOOK_SECRET=your-webhook-secret
```

2. **CLI n8n per gestione workflow**
```bash
# Installa CLI
npm install -g n8n

# Configura endpoint
export N8N_API_BASE_URL=https://n8n.magiaslab.com/api/v1
export N8N_API_KEY=your-api-key

# Lista workflow attivi
n8n workflow:list

# Esporta workflow specifico
n8n workflow:export --id=1 --output=./workflow-hotel-scraping.json

# Importa workflow
n8n workflow:import --file=./workflow-hotel-scraping.json
```

### 🔄 Workflow Raccomandati

#### 1. **Hotel Price Scraper** (Base)
- **Trigger**: Schedule (ogni 2 ore)
- **Input**: Property ID, Competitor URLs
- **Process**: Web scraping Booking.com/Expedia
- **Output**: POST a `/api/webhook/n8n`

#### 2. **Manual Trigger Scraper**
- **Trigger**: Webhook da dashboard
- **Process**: Scraping immediato singolo competitor
- **Output**: Risultati real-time

### 🛠️ Configurazione Workflow

```json
{
  "name": "Hotel Price Monitor",
  "nodes": [
    {
      "parameters": {
        "triggerTimes": {
          "item": [
            {
              "mode": "everyHour",
              "value": 2
            }
          ]
        }
      },
      "name": "Schedule Trigger",
      "type": "n8n-nodes-base.scheduleTrigger"
    },
    {
      "parameters": {
        "url": "https://pricecip.vercel.app/api/scraping/active-properties",
        "authentication": "headerAuth",
        "headerAuth": {
          "name": "Authorization",
          "value": "Bearer {{ $env.N8N_API_KEY }}"
        }
      },
      "name": "Get Active Properties",
      "type": "n8n-nodes-base.httpRequest"
    },
    {
      "parameters": {
        "batchSize": 1,
        "options": {}
      },
      "name": "Split Properties",
      "type": "n8n-nodes-base.splitInBatches"
    },
    {
      "parameters": {
        "url": "{{ $json.competitors[0].baseUrl }}",
        "options": {
          "timeout": 30000
        }
      },
      "name": "Scrape Competitor",
      "type": "n8n-nodes-base.httpRequest"
    },
    {
      "parameters": {
        "functionCode": "// Parse HTML e estrai prezzi\nconst cheerio = require('cheerio');\nconst $ = cheerio.load(items[0].json.data);\n\n// Logica parsing specifica per ogni OTA\nconst prices = [];\n\n$('.price-selector').each((i, el) => {\n  const price = $(el).text().replace(/[^0-9.,]/g, '');\n  const dateAttr = $(el).closest('.room-offer').attr('data-date');\n  \n  if (price && dateAttr) {\n    prices.push({\n      targetDate: dateAttr,\n      price: parseFloat(price.replace(',', '.')),\n      currency: 'EUR',\n      available: true\n    });\n  }\n});\n\nreturn [{ json: { prices } }];"
      },
      "name": "Parse Prices",
      "type": "n8n-nodes-base.function"
    },
    {
      "parameters": {
        "url": "https://pricecip.vercel.app/api/webhook/n8n",
        "method": "POST",
        "authentication": "headerAuth",
        "headerAuth": {
          "name": "Authorization",
          "value": "Bearer {{ $env.N8N_API_KEY }}"
        },
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "propertyId",
              "value": "{{ $json.property.id }}"
            },
            {
              "name": "competitorId",
              "value": "{{ $json.competitor.id }}"
            },
            {
              "name": "roomTypeId",
              "value": "{{ $json.roomType.id }}"
            },
            {
              "name": "prices",
              "value": "{{ $json.prices }}"
            }
          ]
        }
      },
      "name": "Send to Dashboard",
      "type": "n8n-nodes-base.httpRequest"
    }
  ],
  "connections": {
    "Schedule Trigger": {
      "main": [
        [
          {
            "node": "Get Active Properties",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

### 🎯 Selettori CSS per OTA

#### Booking.com
```css
/* Prezzo camera */
.prco-valign-middle-helper .bui-price-display__value

/* Data disponibilità */
.c-availability-calendar__date

/* Tipologia camera */
.hprt-roomtype-title

/* Disponibilità */
.hprt-availability
```

#### Expedia
```css
/* Prezzo */
.uitk-text-price

/* Camera */
.uitk-heading

/* Date */
.uitk-date-picker-input
```

### 📊 Monitoraggio & Debug

1. **Execution Logs**
```bash
# Lista esecuzioni recenti
n8n execution:list --limit=10

# Dettagli esecuzione
n8n execution:show --id=execution-id
```

2. **Webhook Testing**
```bash
# Test manuale webhook
curl -X POST https://pricecip.vercel.app/api/webhook/n8n \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "propertyId": "property-id",
    "competitorId": "competitor-id",
    "roomTypeId": "room-type-id",
    "prices": [
      {
        "targetDate": "2024-01-15T00:00:00.000Z",
        "price": 120.50,
        "currency": "EUR",
        "available": true
      }
    ],
    "source": "manual-test"
  }'
```

### 🚨 Error Handling

1. **Retry Logic**: 3 tentativi con backoff
2. **Rate Limiting**: Max 1 req/sec per evitare ban
3. **User-Agent Rotation**: Headers variabili
4. **Proxy Support**: Se necessario per IP blocking

### 🔐 Security Best Practices

1. **API Keys**: Usa variabili d'ambiente
2. **Webhook Secrets**: Valida origin
3. **Rate Limiting**: Implementa sul dashboard
4. **CORS**: Configura domini consentiti

### 📈 Scaling

- **Multi-workflow**: Uno per ogni tipologia OTA
- **Queue System**: Per gestire picchi di carico
- **Caching**: Redis per dati frequenti
- **Monitoring**: Telegram/Slack notifications