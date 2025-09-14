require('dotenv').config({ path: '.env.local' })

async function testN8nConnection() {
  console.log('🔗 Test connessione server n8n...')

  const baseUrl = process.env.N8N_BASE_URL
  const apiKey = process.env.N8N_API_KEY

  if (!baseUrl || !apiKey) {
    console.log('❌ Variabili d\'ambiente mancanti:')
    console.log(`   N8N_BASE_URL: ${baseUrl ? '✓' : '❌ mancante'}`)
    console.log(`   N8N_API_KEY: ${apiKey ? '✓' : '❌ mancante'}`)
    return
  }

  console.log(`🌐 Server: ${baseUrl}`)
  console.log(`🔑 API Key: ${apiKey.substring(0, 8)}...`)

  try {
    // Test connessione base
    const response = await fetch(`${baseUrl}/api/v1/workflows`, {
      method: 'GET',
      headers: {
        'X-N8N-API-KEY': apiKey,
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      const data = await response.json()
      console.log(`✅ Connessione riuscita!`)
      console.log(`📊 Workflow attivi: ${data.data?.length || 0}`)

      if (data.data && data.data.length > 0) {
        console.log('\n🔄 Workflow trovati:')
        data.data.slice(0, 5).forEach(workflow => {
          console.log(`   - ${workflow.name} (ID: ${workflow.id}) - ${workflow.active ? '🟢 Attivo' : '🔴 Inattivo'}`)
        })
      }

      // Test webhook endpoint della dashboard
      console.log('\n🔗 Test endpoint dashboard...')
      const webhookTest = await fetch('http://localhost:3000/api/webhook/n8n', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          test: true,
          message: 'Test connessione da n8n'
        })
      })

      if (webhookTest.ok) {
        console.log('✅ Endpoint webhook raggiungibile')
      } else {
        console.log('⚠️  Endpoint webhook non raggiungibile (normale se non hai dati validi)')
      }

    } else {
      console.log(`❌ Errore connessione: ${response.status} ${response.statusText}`)
      const error = await response.text()
      console.log(`   Dettagli: ${error}`)
    }

  } catch (error) {
    console.log('❌ Errore di rete:', error.message)
  }
}

testN8nConnection()