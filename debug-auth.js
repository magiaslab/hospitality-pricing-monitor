#!/usr/bin/env node

/**
 * Script per debuggare il problema di autenticazione
 */

const { PrismaClient } = require('./src/generated/prisma');
const bcrypt = require('bcryptjs');

async function debugAuth() {
  const prisma = new PrismaClient();
  
  console.log('🔍 Debug Autenticazione\n');
  
  try {
    await prisma.$connect();
    console.log('✅ Connessione database OK');
    
    // Test credenziali
    const email = 'cipriani.alessandro@gmail.com';
    const password = 'Martina.2013';
    
    console.log(`\n🔍 Verifica utente: ${email}`);
    
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      console.log('❌ Utente non trovato');
      return;
    }
    
    console.log('✅ Utente trovato:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Nome: ${user.name}`);
    console.log(`   Ruolo: ${user.role}`);
    console.log(`   Ha password: ${user.password ? 'Sì' : 'No'}`);
    
    if (user.password) {
      const isValid = await bcrypt.compare(password, user.password);
      console.log(`   Password valida: ${isValid ? '✅ Sì' : '❌ No'}`);
      
      if (!isValid) {
        console.log('\n🔧 Aggiorno password...');
        const hashedPassword = await bcrypt.hash(password, 12);
        await prisma.user.update({
          where: { email },
          data: { password: hashedPassword }
        });
        console.log('✅ Password aggiornata');
      }
    }
    
    // Test variabili d'ambiente
    console.log('\n🔍 Verifica variabili d\'ambiente:');
    console.log(`   NEXTAUTH_URL: ${process.env.NEXTAUTH_URL || '❌ Non impostata'}`);
    console.log(`   NEXTAUTH_SECRET: ${process.env.NEXTAUTH_SECRET ? '✅ Impostata' : '❌ Non impostata'}`);
    console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Impostata' : '❌ Non impostata'}`);
    
  } catch (error) {
    console.error('❌ Errore:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

debugAuth().catch(console.error);
