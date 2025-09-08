# 🔑 Credenziali n8n - Setup Rapido

## ✅ Credenziali da Configurare

### 1. PriceCip API Credential

**Tipo**: HTTP Header Auth  
**Nome**: `PriceCip API`

```
Header Name: Authorization
Header Value: Bearer pricecip_api_secret_2024
```

## 🔧 Configurazione Step-by-Step

### Passo 1: Crea Credenziale in n8n

1. **Vai in n8n**: Settings → Credentials
2. **Clicca**: "Add Credential"
3. **Seleziona**: "HTTP Header Auth"
4. **Compila**:
   - **Name**: `PriceCip API`
   - **Header Name**: `Authorization`
   - **Header Value**: `Bearer pricecip_api_secret_2024`
5. **Salva** la credenziale

### Passo 2: URLs Pre-Configurate

Le URLs sono già configurate nel workflow:
```
✅ https://pricecip.it/api/scraping/active-properties
✅ https://pricecip.it/api/properties/{id}/competitors  
✅ https://pricecip.it/api/scraping/webhook/save-price
```

Non è necessario modificare nulla!

### Passo 3: Assegna Credenziali ai Nodi

I seguenti nodi richiedono la credenziale `PriceCip API`:

1. **"Get Active Properties"** (node-002)
2. **"Get Property Competitors"** (node-004)
3. **"Save to PriceCip DB"** (node-011)

Per ogni nodo:
1. Clicca sul nodo
2. **Authentication** → **Predefined Credential Type**
3. **Credential Type** → **HTTP Header Auth**
4. **Credential** → **PriceCip API**

## 🌐 Variabili d'Ambiente PriceCip

Assicurati che siano configurate:

```env
N8N_API_KEY="pricecip_api_secret_2024"
N8N_WEBHOOK_SECRET="pricecip_webhook_secret_2024"
```

## ✅ Test Rapido

### Test Connessione API

```bash
curl -H "Authorization: Bearer pricecip_api_secret_2024" \
     https://pricecip.it/api/health
```

**Risposta attesa**:
```json
{
  "status": "healthy",
  "database": "connected"
}
```

### Test Endpoint Properties

```bash
curl -H "Authorization: Bearer pricecip_api_secret_2024" \
     https://pricecip.it/api/scraping/active-properties
```

## 🚨 Troubleshooting

### Errore 401 Unauthorized
- ✅ Verifica che la credenziale sia `Bearer pricecip_api_secret_2024`
- ✅ Controlla che `N8N_API_KEY` sia configurato in PriceCip
- ✅ Assicurati che l'header sia `Authorization: Bearer TOKEN`

### Errore Connection Timeout
- ✅ Verifica che l'URL PriceCip sia corretto
- ✅ Testa l'URL nel browser
- ✅ Controlla che l'app sia deployata e accessibile

---

📚 **Per la guida completa**: [N8N_INTEGRATION.md](../guides/N8N_INTEGRATION.md)
