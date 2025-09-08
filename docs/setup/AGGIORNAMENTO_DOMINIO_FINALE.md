# 🌐 Aggiornamento Dominio Finale - pricecip.it

## ✅ DNS Propagato!

Il dominio `https://pricecip.it` è ora attivo e funzionante!

## 🔄 Aggiornamenti Necessari

### 1. Variabili d'Ambiente Vercel

Aggiorna su **Vercel Dashboard** → **Settings** → **Environment Variables**:

```env
NEXTAUTH_URL=https://pricecip.it
```

**IMPORTANTE**: Dopo aver aggiornato, fai **Redeploy** del progetto.

### 2. Workflow n8n

Aggiorna tutti gli URL nel tuo workflow n8n:

**Da**:
```
https://hospitality-pricing-monitor.vercel.app/api/scraping/active-properties
https://hospitality-pricing-monitor.vercel.app/api/properties/{{ $json.id }}/competitors
https://hospitality-pricing-monitor.vercel.app/api/scraping/webhook/save-price
```

**A**:
```
https://pricecip.it/api/scraping/active-properties
https://pricecip.it/api/properties/{{ $json.id }}/competitors
https://pricecip.it/api/scraping/webhook/save-price
```

### 3. Test degli Endpoint

Una volta aggiornato `NEXTAUTH_URL` su Vercel, testa:

```bash
# Test health
curl -H "Authorization: Bearer pricecip_api_secret_2024" \
     https://pricecip.it/api/health

# Test proprietà attive
curl -H "Authorization: Bearer pricecip_api_secret_2024" \
     https://pricecip.it/api/scraping/active-properties
```

## 🎯 Procedura Completa

### Passo 1: Aggiorna Vercel
1. **Vai su**: https://vercel.com/dashboard
2. **Seleziona**: il tuo progetto
3. **Settings** → **Environment Variables**
4. **Trova** `NEXTAUTH_URL` e **cambia** in `https://pricecip.it`
5. **Redeploy** il progetto

### Passo 2: Aggiorna n8n
1. **Apri** il tuo workflow n8n
2. **Per ogni nodo** HTTP Request che chiama PriceCip:
   - **"Get Active Properties"**
   - **"Get Property Competitors"**
   - **"Save to PriceCip DB"**
3. **Cambia** l'URL da `hospitality-pricing-monitor.vercel.app` a `pricecip.it`
4. **Salva** ogni nodo

### Passo 3: Test Completo
1. **Testa login** su https://pricecip.it
2. **Testa workflow n8n** con i nuovi URL
3. **Verifica** che i dati vengano salvati correttamente

## 📋 Checklist Post-Aggiornamento

- [ ] `NEXTAUTH_URL` aggiornata su Vercel
- [ ] Redeploy completato su Vercel
- [ ] Login funzionante su https://pricecip.it
- [ ] URL workflow n8n aggiornati
- [ ] Test workflow n8n completato con successo
- [ ] Endpoint API rispondono correttamente

## 🎉 Risultato Finale

Una volta completati tutti gli aggiornamenti:

- ✅ **Dominio finale**: https://pricecip.it
- ✅ **Login funzionante** con le tue credenziali
- ✅ **Workflow n8n** collegato al dominio finale
- ✅ **API endpoint** accessibili e funzionanti
- ✅ **Database Neon** collegato e popolato

---

🚀 **Il progetto PriceCip è ora completamente operativo su https://pricecip.it!**
