#!/usr/bin/env node

/**
 * Script per testare la connessione al database
 * Uso: node scripts/test-database.js
 */

const { PrismaClient } = require('../src/generated/prisma');

async function testDatabase() {
  const prisma = new PrismaClient();
  
  console.log('🔍 Test connessione database...\n');
  
  try {
    // Test connessione
    await prisma.$connect();
    console.log('✅ Connessione al database riuscita!');
    
    // Test query semplici
    console.log('\n📊 Statistiche database:');
    
    const userCount = await prisma.user.count();
    console.log(`   👥 Utenti: ${userCount}`);
    
    const propertyCount = await prisma.property.count();
    console.log(`   🏨 Proprietà: ${propertyCount}`);
    
    const competitorCount = await prisma.competitor.count();
    console.log(`   🏢 Competitor: ${competitorCount}`);
    
    const priceHistoryCount = await prisma.priceHistory.count();
    console.log(`   💰 Prezzi storici: ${priceHistoryCount}`);
    
    // Test delle tabelle principali
    console.log('\n🔍 Verifica struttura tabelle:');
    
    const tables = [
      'User', 'Property', 'RoomType', 'Competitor', 
      'CompetitorConfig', 'PriceHistory', 'PropertyAccess',
      'UserInvitation', 'AlertRule', 'Account', 'Session'
    ];
    
    const tableMap = {
      'User': 'user',
      'Property': 'property', 
      'RoomType': 'roomType',
      'Competitor': 'competitor',
      'CompetitorConfig': 'competitorConfig',
      'PriceHistory': 'priceHistory',
      'PropertyAccess': 'propertyAccess',
      'UserInvitation': 'userInvitation',
      'AlertRule': 'alertRule',
      'Account': 'account',
      'Session': 'session'
    };
    
    for (const table of tables) {
      try {
        const tableName = tableMap[table];
        const count = await prisma[tableName].count();
        console.log(`   ✅ ${table}: ${count} record`);
      } catch (error) {
        console.log(`   ❌ ${table}: Errore - ${error.message}`);
      }
    }
    
    // Test inserimento/eliminazione
    console.log('\n🧪 Test operazioni CRUD:');
    
    const testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        role: 'VIEWER'
      }
    });
    console.log('   ✅ Creazione utente test riuscita');
    
    await prisma.user.delete({
      where: { id: testUser.id }
    });
    console.log('   ✅ Eliminazione utente test riuscita');
    
    console.log('\n🎉 Tutti i test sono passati! Il database è configurato correttamente.');
    
  } catch (error) {
    console.error('\n❌ Errore durante il test:', error.message);
    
    if (error.code === 'P1001') {
      console.log('\n💡 Suggerimenti:');
      console.log('   • Verifica che DATABASE_URL sia configurato correttamente');
      console.log('   • Controlla che il database sia accessibile');
      console.log('   • Per Neon: verifica che sslmode=require sia presente');
    }
    
    if (error.code === 'P2021') {
      console.log('\n💡 Suggerimenti:');
      console.log('   • Esegui: npx prisma db push');
      console.log('   • Oppure: npx prisma migrate deploy');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Gestione interruzioni
process.on('SIGINT', () => {
  console.log('\n\n👋 Test interrotto dall\'utente');
  process.exit(0);
});

testDatabase().catch(console.error);
