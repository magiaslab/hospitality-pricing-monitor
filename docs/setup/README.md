# 🚀 Setup e Configurazione

Questa cartella contiene tutti i file relativi alla configurazione del progetto PriceCip.

## 📋 File Disponibili

### ✅ Setup Completato

- **[CONFIGURAZIONE_NEON.md](./CONFIGURAZIONE_NEON.md)**
  - **Stato**: ✅ Setup completato
  - **Contenuto**: Configurazione attuale di Neon DB
  - **Dettagli**: Progetto `autumn-tree-00835888`, branch production/development
  - **Dati**: 3 utenti, 1 property, 21 record prezzi

### 📖 Guide Setup

- **[neon-setup-guide.md](./neon-setup-guide.md)**
  - **Contenuto**: Guida dettagliata passo-passo per Neon DB
  - **Include**: Comandi CLI, configurazione, troubleshooting
  - **Quando usare**: Per setup da zero o riconfigurazione

- **[N8N_CREDENTIALS.md](./N8N_CREDENTIALS.md)**
  - **Contenuto**: Setup rapido credenziali n8n
  - **Include**: Credenziali, test connessione, troubleshooting
  - **Quando usare**: Per configurare l'integrazione n8n

### 📁 File di Configurazione

- **[n8n-workflow-clean.json](./n8n-workflow-clean.json)** ⭐ **RACCOMANDATO**
  - **Contenuto**: Workflow n8n pulito per import corretto
  - **Include**: Tutti i nodi senza riferimenti credenziali
  - **Quando usare**: Per importare il workflow in n8n (SEMPRE)

- **[n8n-workflow-updated.json](./n8n-workflow-updated.json)** ⚠️ **SOLO RIFERIMENTO**
  - **Contenuto**: Workflow con credenziali per documentazione
  - **Include**: Esempio di configurazione completa
  - **Quando usare**: Solo come riferimento, NON per import

## 🎯 Quick Reference

### Informazioni Progetto Attuale
- **Progetto Neon**: `pricecip` (ID: `autumn-tree-00835888`)
- **Regione**: aws-eu-central-1
- **Branch**: production (attivo), development
- **Database**: PostgreSQL con schema completo

### Stringhe di Connessione
```bash
# Production (attuale)
postgresql://neondb_owner:npg_Rq8t9WhlUdeL@ep-dark-bonus-agfaks8w.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Development
postgresql://neondb_owner:npg_Rq8t9WhlUdeL@ep-odd-bird-ag7pixiq.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### Comandi Utili
```bash
# Test e verifica
npm run db:test          # Testa connessione
npm run db:studio        # Database browser

# Neon CLI
npm run neon:info        # Info progetti
npm run neon:branches    # Lista branch
neonctl projects get autumn-tree-00835888  # Info progetto
```

## 🔄 Prossimi Passi

Il setup è completato! Per utilizzare il progetto:

1. **Sviluppo**: `npm run dev`
2. **Test**: Usa gli utenti di esempio
3. **Modifica**: Consulta le guide per cambiamenti

---

⬅️ **[Torna alla documentazione principale](../README.md)**
