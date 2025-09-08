# 🚀 Setup Neon DB per PriceCip

Questa guida ti aiuterà a configurare Neon DB come database esterno per il progetto PriceCip.

## 📋 Prerequisiti

- Node.js installato
- Account Neon (gratuito su [neon.tech](https://neon.tech))
- Progetto PriceCip clonato

## 🎯 Setup Rapido (Raccomandato)

### 1. Autenticazione Neon

```bash
# Autentica con Neon (aprirà il browser)
neonctl auth
```

### 2. Setup Automatico

```bash
# Esegui lo script automatico
npm run neon:setup
```

Lo script ti guiderà attraverso:
- Creazione del progetto Neon
- Configurazione delle variabili d'ambiente
- Applicazione delle migrazioni
- Test della connessione

### 3. Verifica Setup

```bash
# Testa la connessione
npm run db:test

# Apri il database browser
npm run db:studio
```

## 🔧 Setup Manuale

Se preferisci configurare manualmente:

### 1. Crea Progetto Neon

```bash
# Crea progetto
neonctl projects create --name pricecip --region aws-eu-central-1

# Lista progetti per ottenere l'ID
neonctl projects list
```

### 2. Ottieni Stringa di Connessione

```bash
# Sostituisci YOUR_PROJECT_ID con l'ID del tuo progetto
neonctl connection-string --project-id YOUR_PROJECT_ID --branch main --role-name neondb_owner
```

### 3. Configura Variabili d'Ambiente

Crea/modifica `.env.local`:

```bash
cp .env.example .env.local
```

Aggiorna `DATABASE_URL` in `.env.local`:

```env
DATABASE_URL="postgresql://neondb_owner:password@host/neondb?sslmode=require"
```

### 4. Applica Schema

```bash
# Genera client Prisma
npm run db:generate

# Applica schema al database
npm run db:push

# (Opzionale) Popola con dati di esempio
npm run db:seed
```

## 📚 Comandi Utili

### Database

```bash
# Generazione e migrazioni
npm run db:generate          # Genera client Prisma
npm run db:push              # Push schema (dev)
npm run db:migrate           # Applica migrazioni (prod)
npm run db:seed              # Popola database
npm run db:studio            # Apri database browser
npm run db:test              # Testa connessione

# Reset (ATTENZIONE: cancella tutti i dati)
npm run db:reset
```

### Neon

```bash
# Setup e informazioni
npm run neon:setup           # Setup automatico
npm run neon:info            # Lista progetti
npm run neon:branches        # Lista branch

# CLI diretta
neonctl projects list        # Lista progetti
neonctl branches list        # Lista branch
neonctl projects get PROJECT_ID  # Info progetto
```

## 🌟 Funzionalità Avanzate

### Branch del Database

Neon supporta branch del database per sviluppo:

```bash
# Crea branch per sviluppo
neonctl branches create --name development

# Ottieni stringa di connessione per il branch
neonctl connection-string --branch development

# Usa branch diversi per ambienti diversi
# .env.local (development)
DATABASE_URL="postgresql://...@...dev-branch..."

# .env.production (production)  
DATABASE_URL="postgresql://...@...main-branch..."
```

### Monitoraggio

```bash
# Informazioni progetto
neonctl projects get YOUR_PROJECT_ID

# Metriche in formato JSON
neonctl projects get YOUR_PROJECT_ID --output json
```

## 🔍 Troubleshooting

### Errore di Connessione

```bash
# Verifica autenticazione
neonctl auth

# Testa connessione diretta
psql "postgresql://neondb_owner:password@host/neondb?sslmode=require"

# Verifica configurazione
npm run db:test
```

### Errori di Schema

```bash
# Rigenera client
npm run db:generate

# Forza push dello schema
npm run db:push --force-reset
```

### Problemi SSL

Assicurati che `sslmode=require` sia presente nella `DATABASE_URL`:

```env
DATABASE_URL="postgresql://...?sslmode=require"
```

## 📁 File di Configurazione

- `.env.local` - Variabili d'ambiente (locale/produzione)
- `.env.example` - Template variabili d'ambiente
- `.neonrc` - Configurazione Neon (committabile)
- `neon-setup-guide.md` - Guida dettagliata
- `scripts/setup-neon.js` - Script setup automatico
- `scripts/test-database.js` - Script test connessione

## 🎯 Prossimi Passi

1. **Setup Completato?** ✅
   - Esegui `npm run db:test` per verificare

2. **Ambiente di Sviluppo**
   - Considera di usare branch separati per dev/prod
   - Configura CI/CD con variabili d'ambiente appropriate

3. **Monitoraggio**
   - Imposta alert per utilizzo database
   - Monitora performance query con Neon dashboard

4. **Backup**
   - Neon gestisce backup automatici
   - Considera export periodici per backup extra

## 📞 Supporto

- **Neon Docs**: [neon.tech/docs](https://neon.tech/docs)
- **Prisma Docs**: [prisma.io/docs](https://prisma.io/docs)
- **Issues**: Apri un issue nel repository

---

🎉 **Setup completato!** Il tuo database Neon è pronto per PriceCip.
