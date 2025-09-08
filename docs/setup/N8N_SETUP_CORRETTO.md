# ✅ Setup n8n - Procedura Corretta

## 🚨 Problema Risolto

Il JSON originale conteneva riferimenti a credenziali inesistenti. Ho creato una versione pulita che funziona correttamente.

## 🎯 Procedura Corretta in 3 Passi

### Passo 1: Crea Credenziale in n8n

1. **Vai in n8n**: Settings → Credentials
2. **Clicca**: "Add Credential"
3. **Cerca e seleziona**: "HTTP Header Auth"
4. **Configura**:
   ```
   Name: PriceCip API
   Header Name: Authorization
   Header Value: Bearer pricecip_api_secret_2024
   ```
5. **Salva** la credenziale

### Passo 2: Importa Workflow Pulito

1. **Usa il file**: `n8n-workflow-clean.json` ⭐
2. **Copia tutto** il contenuto del file
3. **In n8n**: Workflows → Import from JSON
4. **Incolla** e clicca **Import**

### Passo 3: Assegna Credenziali

Dopo l'import vedrai **3 nodi con errore rosso**:

#### 🔴 "Get Active Properties"
1. Clicca sul nodo
2. Nel campo **"Credential"** seleziona **"PriceCip API"**
3. Salva

#### 🔴 "Get Property Competitors"  
1. Clicca sul nodo
2. Nel campo **"Credential"** seleziona **"PriceCip API"**
3. Salva

#### 🔴 "Save to PriceCip DB"
1. Clicca sul nodo
2. Nel campo **"Credential"** seleziona **"PriceCip API"**
3. Salva

## ✅ Verifica Setup

Tutti i nodi dovrebbero essere **verdi** senza errori.

### Test Rapido
1. **Clicca** su "Execute Workflow"
2. **Verifica** che non ci siano errori 401 Unauthorized
3. **Controlla** i log per confermare il funzionamento

## 📁 File da Usare

| File | Uso | Status |
|------|-----|--------|
| `n8n-workflow-clean.json` | ✅ **IMPORT** | Raccomandato |
| `n8n-workflow-updated.json` | ⚠️ **RIFERIMENTO** | Solo docs |

## 🔍 Troubleshooting

### Errore: "Credential not found"
- ✅ Verifica di aver creato la credenziale "PriceCip API"
- ✅ Controlla che il nome sia esatto
- ✅ Assicurati di aver selezionato "HTTP Header Auth"

### Errore: "401 Unauthorized"
- ✅ Verifica che l'Header Value sia `Bearer pricecip_api_secret_2024`
- ✅ Controlla che `N8N_API_KEY` sia configurato in PriceCip
- ✅ Testa l'endpoint manualmente con curl

### Nodi ancora rossi dopo assegnazione credenziali
- ✅ Salva ogni nodo dopo aver assegnato la credenziale
- ✅ Ricarica la pagina del workflow
- ✅ Verifica che la credenziale sia effettivamente salvata

## 🎉 Risultato Finale

Con questa procedura avrai:
- ✅ Workflow importato correttamente
- ✅ Credenziali assegnate ai 3 nodi necessari
- ✅ Tutti i nodi verdi senza errori
- ✅ URLs già configurate per pricecip.it
- ✅ Pronto per l'esecuzione automatica

---

📚 **Documentazione completa**: [N8N_INTEGRATION.md](../guides/N8N_INTEGRATION.md)
