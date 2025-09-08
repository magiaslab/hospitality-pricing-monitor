# 📚 Documentazione PriceCip

Benvenuto nella documentazione del progetto PriceCip! Qui trovi tutte le guide e le informazioni necessarie per configurare e utilizzare l'applicazione.

## 🗂️ Indice Documentazione

### 🚀 Setup e Configurazione

- **[setup/CONFIGURAZIONE_NEON.md](./setup/CONFIGURAZIONE_NEON.md)** - ✅ **Setup completato!** Configurazione attuale di Neon DB
- **[setup/neon-setup-guide.md](./setup/neon-setup-guide.md)** - Guida dettagliata per il setup di Neon DB
- **[setup/N8N_CREDENTIALS.md](./setup/N8N_CREDENTIALS.md)** - 🔑 **Setup rapido credenziali n8n**
- **[guides/NEON_SETUP.md](./guides/NEON_SETUP.md)** - Guida rapida con comandi e troubleshooting
- **[guides/N8N_INTEGRATION.md](./guides/N8N_INTEGRATION.md)** - 🔗 **Integrazione completa n8n**

### 📋 Informazioni Progetto

#### Database
- **Provider**: Neon PostgreSQL
- **Progetto**: `pricecip` (ID: `autumn-tree-00835888`)
- **Branch**: Production e Development
- **Schema**: Prisma con 11+ tabelle

#### Tecnologie
- **Frontend**: Next.js 15.5.2 + React 19
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Auth**: NextAuth.js
- **UI**: Radix UI + Tailwind CSS

## 🎯 Quick Start

1. **Clona il repository**
2. **Installa dipendenze**: `npm install`
3. **Configura database**: Già configurato con Neon!
4. **Avvia sviluppo**: `npm run dev`
5. **Testa**: `npm run db:test`

## 🔧 Comandi Utili

```bash
# Database
npm run db:test          # Testa connessione
npm run db:studio        # Database browser
npm run db:generate      # Rigenera client Prisma
npm run db:seed          # Popola con dati esempio

# Neon
npm run neon:info        # Info progetti
npm run neon:branches    # Lista branch
npm run neon:setup       # Setup automatico (se necessario)

# Sviluppo
npm run dev              # Avvia development server
npm run build            # Build per produzione
npm run start            # Avvia produzione
```

## 👥 Utenti di Test

| Ruolo | Email | Password | Descrizione |
|-------|-------|----------|-------------|
| Super Admin | admin@pricecip.com | admin123 | Accesso completo al sistema |
| Owner | owner@pricecip.com | owner123 | Gestione delle proprietà |
| Viewer | viewer@pricecip.com | viewer123 | Solo visualizzazione |

## 🏗️ Struttura Progetto

```
pricecip/
├── docs/                    # 📚 Documentazione
├── src/
│   ├── app/                # 🚀 Next.js App Router
│   ├── components/         # 🧩 Componenti React
│   ├── lib/               # 🔧 Utilities e configurazioni
│   └── types/             # 📝 Type definitions
├── prisma/                # 🗄️ Schema e migrazioni database
├── scripts/               # 🛠️ Script di utilità
└── public/                # 📁 Asset statici
```

## 🌟 Funzionalità Principali

- **Dashboard Multi-tenant**: Gestione multiple proprietà
- **Price Monitoring**: Monitoraggio prezzi competitor
- **User Management**: Sistema ruoli e permessi
- **API Integration**: Webhook per n8n
- **Real-time Updates**: Aggiornamenti in tempo reale
- **Responsive Design**: Ottimizzato per tutti i dispositivi

## 🔍 Troubleshooting

### Problemi Database
- Controlla connessione: `npm run db:test`
- Rigenera client: `npm run db:generate`
- Verifica variabili: controlla `.env`

### Problemi Neon
- Verifica autenticazione: `neonctl auth`
- Info progetto: `neonctl projects get autumn-tree-00835888`
- Lista branch: `neonctl branches list`

### Problemi App
- Pulisci cache: `rm -rf .next`
- Reinstalla dipendenze: `rm -rf node_modules && npm install`
- Verifica porte: assicurati che 3000 sia libera

## 📞 Supporto

- **Issues**: Apri un issue nel repository
- **Documentazione Neon**: [neon.tech/docs](https://neon.tech/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Prisma Docs**: [prisma.io/docs](https://prisma.io/docs)

---

📝 **Ultima modifica**: Settembre 2025  
🎯 **Versione**: 0.1.0  
✨ **Stato**: Database configurato e funzionante
