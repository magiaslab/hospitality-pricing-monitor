require('dotenv').config({ path: '.env.local' })

async function testApiEndpoints() {
  console.log('🧪 Test degli endpoint API con le tue credenziali...')

  const apiKey = process.env.N8N_API_KEY
  if (!apiKey) {
    console.log('❌ N8N_API_KEY mancante nel file .env')
    return
  }

  const baseUrl = 'http://localhost:3000'
  console.log(`🌐 Testing su: ${baseUrl}`)

  // Test 1: Active Properties (quello che usa n8n)
  console.log('\n1️⃣ Test /api/scraping/active-properties')
  try {
    const response1 = await fetch(`${baseUrl}/api/scraping/active-properties`, {
      method: 'GET',
      headers: {
        'X-N8N-API-KEY': apiKey,
        'Content-Type': 'application/json'
      }
    })

    if (response1.ok) {
      const data = await response1.json()
      console.log(`✅ Status: ${response1.status}`)
      console.log(`📊 Properties trovate: ${data.properties?.length || 0}`)
      if (data.properties && data.properties.length > 0) {
        console.log(`   Prima property: ${data.properties[0].name}`)
        console.log(`   Competitor: ${data.properties[0].competitorCount || 0}`)
        console.log(`   Room Types: ${data.properties[0].roomTypeCount || 0}`)
      }
    } else {
      console.log(`❌ Status: ${response1.status}`)
      const error = await response1.text()
      console.log(`   Error: ${error}`)
    }
  } catch (error) {
    console.log(`❌ Network Error: ${error.message}`)
  }

  // Test 2: Webhook n8n (quello che riceve i dati)
  console.log('\n2️⃣ Test /api/webhook/n8n (simulazione)')
  try {
    const testPayload = {
      propertyId: "test-property-id",
      competitorId: "test-competitor-id",
      roomTypeId: "test-room-type-id",
      prices: [
        {
          targetDate: new Date(Date.now() + 24*60*60*1000).toISOString(),
          price: 120.50,
          currency: "EUR",
          available: true
        }
      ],
      source: "api-test",
      metadata: {
        testRun: true,
        timestamp: new Date().toISOString()
      }
    }

    const response2 = await fetch(`${baseUrl}/api/webhook/n8n`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPayload)
    })

    if (response2.ok) {
      const data = await response2.json()
      console.log(`✅ Status: ${response2.status}`)
      console.log(`📝 Response: ${data.message || 'Success'}`)
    } else {
      console.log(`❌ Status: ${response2.status}`)
      const error = await response2.text()
      console.log(`   Error: ${error}`)

      // Questo è normale se non hai property/competitor reali
      if (response2.status === 400) {
        console.log('   ℹ️  Questo errore è normale se non hai property/competitor configurati')
      }
    }
  } catch (error) {
    console.log(`❌ Network Error: ${error.message}`)
  }

  // Test 3: Properties standard (per confronto)
  console.log('\n3️⃣ Test /api/properties (endpoint dashboard)')
  try {
    const response3 = await fetch(`${baseUrl}/api/properties`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (response3.ok) {
      const data = await response3.json()
      console.log(`✅ Status: ${response3.status}`)
      console.log(`🏨 Properties in dashboard: ${data.properties?.length || 0}`)
    } else {
      console.log(`❌ Status: ${response3.status} (normale senza auth utente)`)
    }
  } catch (error) {
    console.log(`❌ Network Error: ${error.message}`)
  }

  console.log('\n🎯 Riassunto per n8n:')
  console.log('   • Usa header "X-N8N-API-KEY" per /api/scraping/active-properties')
  console.log('   • Usa header "Authorization: Bearer" per /api/webhook/n8n')
  console.log('   • I tuoi workflow n8n dovrebbero funzionare con queste configurazioni')
}

testApiEndpoints()