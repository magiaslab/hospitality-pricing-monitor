const { PrismaClient } = require('./src/generated/prisma')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Crea utente Super Admin
  const hashedPassword = await bcrypt.hash('admin123', 12)
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@pricecip.com' },
    update: {},
    create: {
      email: 'admin@pricecip.com',
      name: 'Super Admin',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
    },
  })

  // Crea utente Owner di test
  const ownerPassword = await bcrypt.hash('owner123', 12)
  const owner = await prisma.user.upsert({
    where: { email: 'owner@pricecip.com' },
    update: {},
    create: {
      email: 'owner@pricecip.com',
      name: 'Hotel Owner',
      password: ownerPassword,
      role: 'OWNER',
    },
  })

  // Crea utente Viewer di test
  const viewerPassword = await bcrypt.hash('viewer123', 12)
  const viewer = await prisma.user.upsert({
    where: { email: 'viewer@pricecip.com' },
    update: {},
    create: {
      email: 'viewer@pricecip.com',
      name: 'Viewer User',
      password: viewerPassword,
      role: 'VIEWER',
    },
  })

  console.log('✅ Utenti creati:')
  console.log('📧 Super Admin: admin@pricecip.com / admin123')
  console.log('📧 Owner: owner@pricecip.com / owner123')
  console.log('📧 Viewer: viewer@pricecip.com / viewer123')

  // Crea una property di esempio
  const property = await prisma.property.create({
    data: {
      name: 'Hotel Bella Vista',
      city: 'Roma',
      country: 'Italia',
      address: 'Via Roma 123, 00100 Roma RM',
      propertyType: 'hotel',
      ownerId: owner.id,
      brandingPrimaryColor: '#ef4444',
      brandingAccentColor: '#f97316',
      theme: 'light',
      defaultTimezone: 'Europe/Rome',
      defaultFrequencyCron: '0 */2 * * *',
      defaultLookaheadDays: 30,
    },
  })

  // Crea room types di esempio
  const roomTypes = await Promise.all([
    prisma.roomType.create({
      data: {
        propertyId: property.id,
        name: 'Camera Singola',
        code: 'SGL',
        capacity: 1,
      },
    }),
    prisma.roomType.create({
      data: {
        propertyId: property.id,
        name: 'Camera Doppia',
        code: 'DBL',
        capacity: 2,
      },
    }),
    prisma.roomType.create({
      data: {
        propertyId: property.id,
        name: 'Suite',
        code: 'STE',
        capacity: 4,
      },
    }),
  ])

  // Crea competitor di esempio
  const competitor = await prisma.competitor.create({
    data: {
      propertyId: property.id,
      name: 'Hotel Competitor',
      baseUrl: 'https://competitor.example.com',
      active: true,
      frequencyCron: '0 */2 * * *',
      timezone: 'Europe/Rome',
    },
  })

  // Crea configurazioni competitor per ogni room type
  await Promise.all(
    roomTypes.map(roomType =>
      prisma.competitorConfig.create({
        data: {
          competitorId: competitor.id,
          roomTypeId: roomType.id,
          priceSelector: '.price-amount',
          dateSelector: '.date-picker',
          currencySelector: '.currency',
          availabilitySelector: '.availability',
          notes: `Configurazione per ${roomType.name}`,
        },
      })
    )
  )

  // Crea alcuni dati di prezzo di esempio
  const today = new Date()
  const priceData = []
  
  for (let i = 0; i < 7; i++) {
    const targetDate = new Date(today)
    targetDate.setDate(today.getDate() + i)
    
    for (const roomType of roomTypes) {
      const basePrice = roomType.code === 'SGL' ? 80 : roomType.code === 'DBL' ? 120 : 200
      const randomVariation = Math.random() * 40 - 20 // +/- 20
      
      priceData.push({
        propertyId: property.id,
        competitorId: competitor.id,
        roomTypeId: roomType.id,
        targetDate: targetDate,
        price: Math.max(50, basePrice + randomVariation),
        currency: 'EUR',
        available: Math.random() > 0.1, // 90% disponibilità
        source: 'seed-script',
      })
    }
  }

  await prisma.priceHistory.createMany({
    data: priceData,
  })

  // Crea accesso per viewer alla property
  await prisma.propertyAccess.create({
    data: {
      userId: viewer.id,
      propertyId: property.id,
      level: 'VIEWER',
      grantedById: superAdmin.id,
    },
  })

  console.log('✅ Property creata: Hotel Bella Vista')
  console.log(`✅ ${roomTypes.length} room types creati`)
  console.log('✅ 1 competitor configurato')
  console.log(`✅ ${priceData.length} dati di prezzo inseriti`)
  console.log('✅ Accessi configurati')
  
  console.log('\n🚀 Database seeded! Puoi ora testare:')
  console.log('1. Login come Super Admin per vedere tutto')
  console.log('2. Login come Owner per vedere la propria struttura')
  console.log('3. Login come Viewer per accesso read-only')
}

main()
  .catch((e) => {
    console.error('❌ Errore durante il seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
