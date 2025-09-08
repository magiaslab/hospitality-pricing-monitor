#!/usr/bin/env node

/**
 * Script per automatizzare il setup di Neon DB
 * Uso: node scripts/setup-neon.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise(resolve => rl.question(question, resolve));
}

function execCommand(command, description) {
  console.log(`\n🔄 ${description}...`);
  try {
    const result = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    console.log(`✅ ${description} completato`);
    return result;
  } catch (error) {
    console.error(`❌ Errore in ${description}:`, error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Setup automatico Neon DB per PriceCip\n');

  try {
    // 1. Verifica autenticazione Neon
    console.log('1️⃣ Verifica autenticazione Neon...');
    try {
      execSync('neonctl projects list', { stdio: 'pipe' });
      console.log('✅ Autenticazione Neon OK');
    } catch (error) {
      console.log('❌ Non sei autenticato con Neon');
      console.log('Esegui: neonctl auth');
      process.exit(1);
    }

    // 2. Chiedi dettagli del progetto
    const projectName = await ask('Nome del progetto Neon (default: pricecip): ') || 'pricecip';
    const region = await ask('Regione AWS (default: eu-central-1): ') || 'eu-central-1';

    // 3. Crea progetto Neon
    console.log(`\n2️⃣ Creazione progetto Neon "${projectName}"...`);
    const createResult = execCommand(
      `neonctl projects create --name ${projectName} --region aws-${region}`,
      'Creazione progetto Neon'
    );

    // Estrai l'ID del progetto dal risultato
    const projectIdMatch = createResult.match(/Project ID: ([a-z0-9-]+)/);
    if (!projectIdMatch) {
      throw new Error('Impossibile ottenere l\'ID del progetto');
    }
    const projectId = projectIdMatch[1];
    console.log(`📝 ID Progetto: ${projectId}`);

    // 4. Ottieni stringa di connessione
    console.log('\n3️⃣ Ottenimento stringa di connessione...');
    const connectionString = execCommand(
      `neonctl connection-string --project-id ${projectId} --branch main --role-name neondb_owner`,
      'Ottenimento stringa di connessione'
    ).trim();

    console.log(`🔗 Database URL: ${connectionString}`);

    // 5. Crea/aggiorna file .env.local
    console.log('\n4️⃣ Configurazione variabili d\'ambiente...');
    const envLocalPath = path.join(process.cwd(), '.env.local');
    const envPath = path.join(process.cwd(), '.env');

    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    // Sostituisci o aggiungi DATABASE_URL
    if (envContent.includes('DATABASE_URL=')) {
      envContent = envContent.replace(/DATABASE_URL=.*/g, `DATABASE_URL="${connectionString}"`);
    } else {
      envContent = `DATABASE_URL="${connectionString}"\n` + envContent;
    }

    fs.writeFileSync(envLocalPath, envContent);
    console.log('✅ File .env.local creato/aggiornato');

    // 6. Genera client Prisma
    console.log('\n5️⃣ Generazione client Prisma...');
    execCommand('npx prisma generate', 'Generazione client Prisma');

    // 7. Applica migrazioni
    console.log('\n6️⃣ Applicazione migrazioni database...');
    execCommand('npx prisma db push', 'Push schema al database');

    // 8. Verifica connessione
    console.log('\n7️⃣ Verifica connessione...');
    const testScript = `
      const { PrismaClient } = require('./src/generated/prisma');
      const prisma = new PrismaClient();
      prisma.$connect()
        .then(() => console.log('✅ Connessione riuscita!'))
        .catch(err => { console.error('❌ Errore connessione:', err.message); process.exit(1); })
        .finally(() => prisma.$disconnect());
    `;

    fs.writeFileSync('test-connection.js', testScript);
    execCommand('node test-connection.js', 'Test connessione database');
    fs.unlinkSync('test-connection.js');

    // 9. Seed del database (opzionale)
    const shouldSeed = await ask('\nVuoi eseguire il seed del database? (y/N): ');
    if (shouldSeed.toLowerCase() === 'y' || shouldSeed.toLowerCase() === 'yes') {
      console.log('\n8️⃣ Seed database...');
      if (fs.existsSync('seed.js')) {
        execCommand('node seed.js', 'Seed database');
      } else {
        console.log('⚠️ File seed.js non trovato, saltando...');
      }
    }

    console.log('\n🎉 Setup Neon DB completato con successo!');
    console.log(`\n📋 Riepilogo:`);
    console.log(`   • Progetto: ${projectName} (ID: ${projectId})`);
    console.log(`   • Regione: aws-${region}`);
    console.log(`   • Database URL configurato in .env.local`);
    console.log(`   • Schema Prisma sincronizzato`);
    console.log(`\n🔧 Comandi utili:`);
    console.log(`   • npx prisma studio (apri database browser)`);
    console.log(`   • neonctl projects get ${projectId} (info progetto)`);
    console.log(`   • neonctl branches list --project-id ${projectId} (lista branch)`);

  } catch (error) {
    console.error('\n❌ Errore durante il setup:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Gestione interruzioni
process.on('SIGINT', () => {
  console.log('\n\n👋 Setup interrotto dall\'utente');
  rl.close();
  process.exit(0);
});

main().catch(console.error);
