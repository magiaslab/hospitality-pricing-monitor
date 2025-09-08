# 🌐 Configurazione Domini Finale

## ✅ Domini Identificati

- **n8n Server**: `https://n8n.magiaslab.com` ✅ (attivo)
- **PriceCip App**: `https://www.pricecip.it` ✅ (attivo, con redirect da pricecip.it)

## 🔄 Aggiornamenti Necessari

### 1. Vercel Environment Variables

Su **Vercel Dashboard** → **Settings** → **Environment Variables**:

```env
NEXTAUTH_URL=https://www.pricecip.it
DATABASE_URL=postgresql://neondb_owner:npg_Rq8t9WhlUdeL@ep-dark-bonus-agfaks8w.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
NEXTAUTH_SECRET=4pfRihvjPMgO9aiOz3j9k0QStljxjlDYGBNc2YzVFCY=
N8N_BASE_URL=https://n8n.magiaslab.com
N8N_API_KEY=pricecip_api_secret_2024
N8N_WEBHOOK_SECRET=pricecip_webhook_secret_2024
```

**IMPORTANTE**: Dopo l'aggiornamento, fai **Redeploy**.

### 2. n8n Workflow URLs

Su **https://n8n.magiaslab.com**, configura i nodi con questi URL:

#### A. "Get Active Properties"
```
URL: https://www.pricecip.it/api/scraping/active-properties
Method: GET
Authentication: PriceCip API
```

#### B. "Get Property Competitors"
```
URL: https://www.pricecip.it/api/properties/{{ $json.id }}/competitors
Method: GET
Authentication: PriceCip API
```

#### C. "Save to PriceCip DB"
```
URL: https://www.pricecip.it/api/scraping/webhook/save-price
Method: POST
Authentication: PriceCip API
Headers:
  Content-Type: application/json
  X-Webhook-Secret: pricecip_webhook_secret_2024
```

## 🧪 Test Post-Configurazione

### Test Login
1. Vai su: https://www.pricecip.it/auth/signin
2. Usa credenziali: `cipriani.alessandro@gmail.com` / `Martina.2013`
3. Verifica redirect alla dashboard

### Test API (dopo Vercel redeploy)
```bash
# Test health
curl -H "Authorization: Bearer pricecip_api_secret_2024" \
     https://www.pricecip.it/api/health

# Test active properties
curl -H "Authorization: Bearer pricecip_api_secret_2024" \
     https://www.pricecip.it/api/scraping/active-properties
```

### Test n8n Workflow
1. Su https://n8n.magiaslab.com
2. Apri il workflow PriceCip
3. Clicca "Execute Workflow"
4. Verifica che tutti i nodi completino con successo

## 📋 Checklist Finale

- [ ] **NEXTAUTH_URL** aggiornata a `https://www.pricecip.it` su Vercel
- [ ] **Redeploy** completato su Vercel
- [ ] **n8n URLs** aggiornati a `https://www.pricecip.it`
- [ ] **Credenziale n8n** "PriceCip API" configurata
- [ ] **Test login** funzionante
- [ ] **Test API** rispondono correttamente
- [ ] **Test workflow n8n** completato con successo

## 🎯 Configurazione Finale

### Flusso Completo
1. **n8n.magiaslab.com** → esegue workflow di scraping
2. **www.pricecip.it/api/** → riceve richieste da n8n
3. **Database Neon** → salva i dati elaborati
4. **www.pricecip.it/dashboard** → visualizza i risultati

### Credenziali n8n
```
Type: HTTP Header Auth
Name: PriceCip API
Header Name: Authorization
Header Value: Bearer pricecip_api_secret_2024
```

---

🚀 **Configurazione completa: n8n.magiaslab.com ↔ www.pricecip.it**
