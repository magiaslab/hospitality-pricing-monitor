# 📝 Changelog

Tutte le modifiche importanti al progetto PriceCip sono documentate in questo file.

## [0.1.0] - 2025-09-08

### ✅ Setup Iniziale Completato

#### 🗄️ Database
- **Configurato Neon PostgreSQL** come database principale
- **Progetto**: `pricecip` (ID: `autumn-tree-00835888`)
- **Regione**: aws-eu-central-1
- **Branch**: production (default) e development
- **Schema**: 11+ tabelle con Prisma ORM
- **Dati di esempio**: 3 utenti, 1 property, 21 record prezzi

#### 🔧 Tooling
- **Neon CLI** installato e configurato
- **Script automatici** per setup e test
- **Package.json** aggiornato con comandi utili:
  - `npm run db:test` - Test connessione
  - `npm run db:studio` - Database browser
  - `npm run neon:setup` - Setup automatico
  - `npm run neon:info` - Info progetti

#### 📚 Documentazione
- **Documentazione completa** organizzata in `/docs/`
- **Guide setup** dettagliate per Neon DB
- **README aggiornati** con quick start
- **Struttura organizzata**:
  - `/docs/setup/` - Configurazione e setup
  - `/docs/guides/` - Guide pratiche
  - `/docs/README.md` - Indice principale

#### 🚀 Tecnologie Aggiornate
- **Next.js**: 15.5.2 (con Turbopack)
- **React**: 19.1.0
- **Prisma**: 6.15.0
- **Neon**: PostgreSQL serverless

#### 🎯 Utenti di Test
- **Super Admin**: admin@pricecip.com / admin123
- **Owner**: owner@pricecip.com / owner123
- **Viewer**: viewer@pricecip.com / viewer123

### 🔧 Configurazioni

#### Environment Variables
```env
DATABASE_URL="postgresql://neondb_owner:...@ep-dark-bonus-agfaks8w.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
NEON_PROJECT_ID="autumn-tree-00835888"
```

#### Files Creati/Modificati
- `docs/` - Nuova cartella documentazione
- `scripts/setup-neon.js` - Script setup automatico
- `scripts/test-database.js` - Script test connessione
- `.env.local` - Configurazione locale
- `.neonrc` - Configurazione Neon
- `package.json` - Script aggiornati

### 🎉 Stato Progetto
- ✅ **Database**: Configurato e funzionante
- ✅ **Schema**: Applicato con successo
- ✅ **Dati**: Popolato con esempi
- ✅ **Applicazione**: Testata e funzionante
- ✅ **Documentazione**: Completa e organizzata

---

## Formato

Questo changelog segue il formato [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

### Tipi di Modifiche
- **Added** - Nuove funzionalità
- **Changed** - Modifiche a funzionalità esistenti
- **Deprecated** - Funzionalità che saranno rimosse
- **Removed** - Funzionalità rimosse
- **Fixed** - Bug fix
- **Security** - Correzioni di sicurezza
