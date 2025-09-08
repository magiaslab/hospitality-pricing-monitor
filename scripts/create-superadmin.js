#!/usr/bin/env node

/**
 * Script per creare utente Super Admin
 * Uso: node scripts/create-superadmin.js
 */

const { PrismaClient } = require('../src/generated/prisma');
const bcrypt = require('bcryptjs');

async function createSuperAdmin() {
  const prisma = new PrismaClient();
  
  console.log('🔧 Creazione utente Super Admin...\n');
  
  try {
    // Connetti al database
    await prisma.$connect();
    console.log('✅ Connessione al database riuscita');
    
    const email = 'cipriani.alessandro@gmail.com';
    const password = 'Martina.2013';
    const name = 'Alessandro Cipriani';
    
    // Verifica se l'utente esiste già
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      console.log('⚠️ Utente già esistente, aggiorno i dati...');
      
      // Aggiorna l'utente esistente
      const hashedPassword = await bcrypt.hash(password, 12);
      
      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          name,
          password: hashedPassword,
          role: 'SUPER_ADMIN'
        }
      });
      
      console.log('✅ Utente aggiornato con successo:');
      console.log(`   📧 Email: ${updatedUser.email}`);
      console.log(`   👤 Nome: ${updatedUser.name}`);
      console.log(`   🔑 Ruolo: ${updatedUser.role}`);
      console.log(`   🔒 Password: ${password} (aggiornata)`);
      
    } else {
      // Crea nuovo utente
      const hashedPassword = await bcrypt.hash(password, 12);
      
      const newUser = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role: 'SUPER_ADMIN'
        }
      });
      
      console.log('✅ Utente Super Admin creato con successo:');
      console.log(`   📧 Email: ${newUser.email}`);
      console.log(`   👤 Nome: ${newUser.name}`);
      console.log(`   🔑 Ruolo: ${newUser.role}`);
      console.log(`   🔒 Password: ${password}`);
      console.log(`   🆔 ID: ${newUser.id}`);
    }
    
    // Verifica totale utenti
    const totalUsers = await prisma.user.count();
    const superAdmins = await prisma.user.count({
      where: { role: 'SUPER_ADMIN' }
    });
    
    console.log(`\n📊 Statistiche utenti:`);
    console.log(`   👥 Totale utenti: ${totalUsers}`);
    console.log(`   👑 Super Admin: ${superAdmins}`);
    
    // Lista tutti gli utenti per verifica
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      },
      orderBy: { role: 'asc' }
    });
    
    console.log(`\n👥 Lista utenti:`);
    allUsers.forEach((user, index) => {
      const roleEmoji = user.role === 'SUPER_ADMIN' ? '👑' : 
                       user.role === 'ADMIN' ? '🔧' :
                       user.role === 'OWNER' ? '🏨' : '👁️';
      console.log(`   ${index + 1}. ${roleEmoji} ${user.email} (${user.role}) - ${user.name || 'N/A'}`);
    });
    
    console.log(`\n🎉 Operazione completata con successo!`);
    console.log(`\n🚀 Ora puoi fare login con:`);
    console.log(`   📧 Email: ${email}`);
    console.log(`   🔒 Password: ${password}`);
    
  } catch (error) {
    console.error('❌ Errore durante la creazione dell\'utente:', error.message);
    
    if (error.code === 'P2002') {
      console.log('💡 L\'utente esiste già. Usa lo script con flag --update per aggiornarlo.');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Gestione interruzioni
process.on('SIGINT', () => {
  console.log('\n\n👋 Operazione interrotta dall\'utente');
  process.exit(0);
});

createSuperAdmin().catch(console.error);
