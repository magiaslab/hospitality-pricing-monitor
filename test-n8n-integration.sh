#!/bin/bash

echo "🔗 Test Integrazione n8n MagiasLab ↔ PriceCip"
echo "============================================="

echo ""
echo "1. Test connessione n8n.magiaslab.com:"
curl -I https://n8n.magiaslab.com

echo ""
echo "2. Test connessione pricecip.it:"
curl -I https://pricecip.it

echo ""
echo "3. Test API PriceCip (Health):"
curl -s -H "Authorization: Bearer pricecip_api_secret_2024" \
     https://pricecip.it/api/health | jq '.' 2>/dev/null || echo "JSON parsing failed, raw response above"

echo ""
echo "4. Test API PriceCip (Active Properties):"
curl -s -H "Authorization: Bearer pricecip_api_secret_2024" \
     https://pricecip.it/api/scraping/active-properties | jq '.' 2>/dev/null || echo "JSON parsing failed, raw response above"

echo ""
echo "5. Test Webhook Endpoint:"
curl -s -X POST \
     -H "Authorization: Bearer pricecip_api_secret_2024" \
     -H "Content-Type: application/json" \
     -H "X-Webhook-Secret: pricecip_webhook_secret_2024" \
     -d '{"test": true, "message": "Test connection from n8n"}' \
     https://pricecip.it/api/scraping/webhook/save-price | jq '.' 2>/dev/null || echo "JSON parsing failed, raw response above"

echo ""
echo "✅ Test completato!"
echo ""
echo "🎯 Configurazione n8n:"
echo "Server: https://n8n.magiaslab.com"
echo "Credenziale: HTTP Header Auth"
echo "  - Name: PriceCip API"
echo "  - Header: Authorization"
echo "  - Value: Bearer pricecip_api_secret_2024"
echo ""
echo "🎯 URL da configurare nei nodi n8n:"
echo "- Get Active Properties: https://pricecip.it/api/scraping/active-properties"
echo "- Get Competitors: https://pricecip.it/api/properties/{{id}}/competitors"
echo "- Save Data: https://pricecip.it/api/scraping/webhook/save-price"
