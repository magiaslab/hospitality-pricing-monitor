# 🏨 Hospitality Pricing Monitor

Piattaforma SaaS completa per il monitoraggio automatico dei prezzi competitor nel settore hospitality. Sistema multi-tenant con ruoli granulari, dashboard interattive e integrazione n8n per web scraping.

## 🚀 Features

- **Multi-tenant** con ruoli (Super Admin, Admin, Owner, Viewer)
- **Dashboard interattive** con grafici e analytics
- **Form wizard** multi-step per configurazione strutture
- **Web scraping automatico** via integrazione n8n
- **Sistema permessi** granulari per property
- **Autenticazione** NextAuth (credenziali + Google OAuth)
- **Database** PostgreSQL/SQLite con Prisma ORM
- **UI moderna** con shadcn/ui e Tailwind CSS

## 🛠️ Tech Stack

- **Frontend**: Next.js 15.5.2 (App Router) + React 19 + TypeScript
- **Database**: Neon PostgreSQL + Prisma ORM  
- **UI**: Tailwind CSS v4 + shadcn/ui (tema rosso)
- **Auth**: NextAuth.js multi-ruolo
- **Charts**: Recharts per visualizzazioni
- **Deployment**: Vercel + Neon PostgreSQL

## 📦 Setup Locale

### ✅ Database Configurato!
Il progetto è già configurato con **Neon PostgreSQL** e pronto all'uso.

### Quick Start
```bash
# 1. Clone e installa dipendenze
git clone <repo-url>
cd pricecip
npm install

# 2. Testa la connessione database
npm run db:test

# 3. Avvia sviluppo
npm run dev
```

### 📚 Documentazione Completa
Per setup avanzato, troubleshooting e guide dettagliate:
**[📖 Vai alla Documentazione](./docs/README.md)**

### Configurazione Database
- **✅ Neon PostgreSQL** configurato e funzionante
- **✅ Schema applicato** (11+ tabelle)
- **✅ Dati di esempio** già inseriti
- **✅ Branch** production e development

### Comandi Utili
```bash
npm run db:test          # Testa connessione
npm run db:studio        # Database browser
npm run neon:info        # Info progetti Neon
```

## 🔐 Credenziali di Test

Dopo il seeding, puoi utilizzare:

- **Super Admin**: `admin@pricecip.com` / `admin123`
- **Owner**: `owner@pricecip.com` / `owner123`  
- **Viewer**: `viewer@pricecip.com` / `viewer123`

## 🌐 Deploy Vercel

1. **Push su GitHub**:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Deploy su Vercel**:
   - Connetti repository GitHub
   - Configura variabili d'ambiente
   - Deploy automatico

3. **Variabili d'ambiente Vercel**:
```bash
DATABASE_URL=          # Vercel Postgres URL
NEXTAUTH_URL=          # https://your-app.vercel.app
NEXTAUTH_SECRET=       # Random string 32+ chars
GOOGLE_CLIENT_ID=      # OAuth (opzionale)
GOOGLE_CLIENT_SECRET=  # OAuth (opzionale)
N8N_BASE_URL=          # n8n instance URL
N8N_API_KEY=           # n8n API key
```

## 🔗 Integrazione n8n

### Webhook Endpoint
- **URL**: `https://your-app.vercel.app/api/webhook/n8n`
- **Method**: POST
- **Headers**: `Content-Type: application/json`
- **Auth**: `x-webhook-secret` (opzionale)

### Payload Example
```json
{
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
  "source": "n8n-workflow-id",
  "metadata": { "scraped_at": "2024-01-10T10:00:00Z" }
}
```

## 📜 Scripts

- `npm run dev` - Server di sviluppo
- `npm run build` - Build produzione
- `npm run start` - Server produzione  
- `npm run lint` - ESLint

## 📁 Struttura Progetto

```
pricecip/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (dashboard)/        # Dashboard routes
│   │   ├── api/               # API routes
│   │   └── auth/              # Auth pages
│   ├── components/            # React components
│   │   ├── forms/             # Form components
│   │   ├── layout/            # Layout components
│   │   └── ui/                # shadcn/ui components
│   ├── lib/                   # Utilities
│   └── types/                 # TypeScript definitions
├── prisma/                    # Database schema
└── public/                    # Static assets
```

## 🤝 Contributing

1. Fork il repository
2. Crea feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

Questo progetto è sotto licenza MIT. Vedi il file `LICENSE` per dettagli.
