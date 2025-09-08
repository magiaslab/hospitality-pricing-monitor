# Guida Setup Neon DB per PriceCip

## 1. Autenticazione Neon

Prima di tutto, devi autenticarti con Neon. Esegui questo comando e segui le istruzioni:

```bash
neonctl auth
```

Questo aprirà il browser per l'autenticazione. Una volta completata, avrai accesso alla CLI.

## 2. Creazione del Progetto Neon

Crea un nuovo progetto Neon:

```bash
# Crea un nuovo progetto
neonctl projects create --name pricecip --region aws-eu-central-1

# Lista i progetti per vedere quello creato
neonctl projects list
```

## 3. Ottenere la Stringa di Connessione

Una volta creato il progetto, ottieni la stringa di connessione:

```bash
# Lista i database del progetto (sostituisci PROJECT_ID con l'ID del tuo progetto)
neonctl connection-string --project-id autumn-tree-00835888 --branch main --role-name neondb_owner

# Oppure usa questo comando per ottenere tutti i dettagli
neonctl projects get autumn-tree-00835888
```

## 4. Configurazione delle Variabili d'Ambiente

Copia la stringa di connessione e aggiornala nel file `.env`:

```bash
# Crea il file .env.local per l'ambiente di produzione
cp .env .env.local
```

Poi modifica `.env.local` con:

```env
# Database Neon
DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@YOUR_HOST/neondb?sslmode=require"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-nextauth-secret-key-change-this-in-production"

# n8n integration
N8N_BASE_URL=""
N8N_API_KEY="pricecip_api_secret_2024"
N8N_WEBHOOK_SECRET="pricecip_webhook_secret_2024"

# OAuth Providers (opzionali)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Email & Notifications (opzionali)
RESEND_API_KEY=""
SLACK_WEBHOOK_URL=""
```

## 5. Migrazione del Database

Una volta configurata la DATABASE_URL, esegui le migrazioni:

```bash
# Genera il client Prisma
npx prisma generate

# Applica le migrazioni al database Neon
npx prisma db push

# Oppure usa migrate deploy per produzione
npx prisma migrate deploy

# Verifica che tutto sia andato a buon fine
npx prisma db seed
```

## 6. Verifica della Connessione

Testa la connessione:

```bash
# Apri Prisma Studio per verificare i dati
npx prisma studio

# Oppure esegui una query di test
node -e "
const { PrismaClient } = require('./src/generated/prisma');
const prisma = new PrismaClient();
prisma.\$connect().then(() => {
  console.log('✅ Connessione a Neon riuscita!');
  return prisma.user.count();
}).then(count => {
  console.log(\`👥 Utenti nel database: \${count}\`);
}).catch(console.error).finally(() => prisma.\$disconnect());
"
```

## 7. Script Utili per la Gestione

Aggiungi questi script al `package.json`:

```json
{
  "scripts": {
    "db:migrate": "prisma migrate deploy",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:seed": "node seed.js",
    "db:studio": "prisma studio",
    "db:reset": "prisma migrate reset --force",
    "neon:info": "neonctl projects list",
    "neon:branches": "neonctl branches list",
    "neon:create-branch": "neonctl branches create --name"
  }
}
```

## 8. Gestione dei Branch Neon (Opzionale)

Neon supporta i branch del database per sviluppo:

```bash
# Crea un branch per sviluppo
neonctl branches create --name development

# Ottieni la stringa di connessione per il branch
neonctl connection-string --branch development

# Lista tutti i branch
neonctl branches list
```

## 9. Backup e Monitoring

Neon gestisce automaticamente i backup, ma puoi monitorare:

```bash
# Mostra informazioni sul progetto
neonctl projects get YOUR_PROJECT_ID

# Mostra le metriche
neonctl projects get YOUR_PROJECT_ID --output json
```

## 10. Troubleshooting

Se hai problemi di connessione:

1. Verifica che la DATABASE_URL sia corretta
2. Controlla che SSL sia abilitato (`sslmode=require`)
3. Verifica i firewall e le whitelist IP
4. Testa la connessione diretta:

```bash
# Test connessione diretta
psql "postgresql://neondb_owner:PASSWORD@HOST/neondb?sslmode=require"
```

## Note Importanti

- Neon è compatibile con PostgreSQL, quindi il tuo schema Prisma funzionerà perfettamente
- I dati vengono automaticamente replicati e backup
- Neon scala automaticamente in base al carico
- Supporta connessioni serverless ottimizzate per Next.js
