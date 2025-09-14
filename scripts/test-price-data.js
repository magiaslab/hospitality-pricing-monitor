const { PrismaClient } = require('../src/generated/prisma')

const prisma = new PrismaClient()

async function main() {
  console.log('🧪 Inserimento dati di test per grafici prezzi...')

  try {
    // Trova la prima property con competitor e room types
    const property = await prisma.property.findFirst({
      include: {
        competitors: { where: { active: true } },
        roomTypes: { where: { active: true } }
      }
    })

    if (!property || property.competitors.length === 0 || property.roomTypes.length === 0) {
      console.log('❌ Nessuna property con competitor e room types trovata')
      console.log('   Usa il wizard per creare una property completa prima')
      return
    }

    console.log(`✅ Trovata property: ${property.name}`)
    console.log(`   - Competitor: ${property.competitors.length}`)
    console.log(`   - Room Types: ${property.roomTypes.length}`)

    // Genera dati di prezzo per gli ultimi 14 giorni
    const testData = []
    const today = new Date()

    for (let dayOffset = 14; dayOffset >= 0; dayOffset--) {
      const targetDate = new Date()
      targetDate.setDate(today.getDate() - dayOffset)

      for (const competitor of property.competitors.slice(0, 3)) { // Max 3 competitor
        for (const roomType of property.roomTypes.slice(0, 2)) { // Max 2 room types
          // Genera prezzo base + variazione casuale
          const basePrice = 80 + (Math.random() * 100) // 80-180€
          const variation = (Math.random() - 0.5) * 20 // ±10€
          const finalPrice = Math.max(50, basePrice + variation) // Min 50€

          testData.push({
            propertyId: property.id,
            competitorId: competitor.id,
            roomTypeId: roomType.id,
            targetDate: targetDate,
            price: Math.round(finalPrice * 100) / 100, // 2 decimali
            currency: 'EUR',
            available: Math.random() > 0.1, // 90% disponibile
            source: 'test-data-generator',
            metadata: {
              generatedAt: new Date().toISOString(),
              competitorName: competitor.name,
              roomTypeName: roomType.name,
              priceVariation: Math.round(variation * 100) / 100
            }
          })
        }
      }
    }

    console.log(`📊 Generando ${testData.length} record di prezzo...`)

    // Batch insert
    const batchSize = 100
    for (let i = 0; i < testData.length; i += batchSize) {
      const batch = testData.slice(i, i + batchSize)
      await prisma.priceHistory.createMany({
        data: batch,
        skipDuplicates: true
      })
      console.log(`   Inseriti ${Math.min(i + batchSize, testData.length)}/${testData.length} record`)
    }

    // Statistiche finali
    const stats = await prisma.priceHistory.aggregate({
      where: { propertyId: property.id },
      _count: { _all: true },
      _avg: { price: true },
      _min: { price: true },
      _max: { price: true }
    })

    console.log('\n📈 Statistiche dati inseriti:')
    console.log(`   - Totale record: ${stats._count._all}`)
    console.log(`   - Prezzo medio: €${stats._avg.price?.toFixed(2)}`)
    console.log(`   - Prezzo min: €${stats._min.price}`)
    console.log(`   - Prezzo max: €${stats._max.price}`)

    console.log('\n🎉 Dati di test inseriti con successo!')
    console.log(`🔗 Vai su http://localhost:3000/properties/${property.id} -> Tab "Prezzi & Analytics"`)

  } catch (error) {
    console.error('❌ Errore inserimento dati test:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()